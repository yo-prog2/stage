const fetchManager = require('../utils/fetchManager');
const graphManager = require('../utils/graphManager');
const assetService = require('../services/asset.service.js');
const mailService = require('../services/mail.service.js');
const ApprovedEmail = require('../models/approvedEmail.model.js'); // Adjust the path if needed
const MailboxScan = require('../models/mailboxScan.model.js'); // import the model

const DIRECTOR_EMAILS = [
  "johndeazz_outlook.com#ext#@johndeazzoutlook.onmicrosoft.com",
  "youssefbelhadj111@gmail.com"
];

const fetchAccessToken = async (req, res, next, scopes) => {
  let accessToken = req.authContext.getCachedTokenForResource("graph.microsoft.com");

  if (!accessToken) {
    const tokenResponse = await req.authContext.acquireToken({
      scopes,
      account: req.authContext.getAccount(),
    })(req, res, next);
    accessToken = tokenResponse.accessToken;
  }

  return accessToken;
};

const fetchRecentEmails = async (accessToken, startDate) => {
  const graphClient = graphManager.getAuthenticatedClient(accessToken);
  const isoStart = startDate.toISOString();

  // Fetch Inbox messages
  const inboxRes = await graphClient
    .api("/me/mailFolders/inbox/messages")
    .filter(`receivedDateTime ge ${isoStart}`)
    .get();

  // Fetch SentItems messages
  const sentRes = await graphClient
    .api("/me/mailFolders/sentitems/messages")
    .filter(`sentDateTime ge ${isoStart}`)
    .get();

  const inboxMessages = inboxRes.value || [];
  const sentMessages = sentRes.value || [];

  // Merge
  const allMessages = [...inboxMessages, ...sentMessages];

  return allMessages;
};


const isAssetApproved = async (accessToken, conversationId) => {
  const graphClient = graphManager.getAuthenticatedClient(accessToken);

  const response = await graphClient
    .api(`/me/messages?$filter=conversationId eq '${conversationId}'&$top=50`)
    .get();

  const threadMessages = response.value || [];
  const approvals = new Set();

  for (const msg of threadMessages) {
    const sender = msg.from?.emailAddress?.address?.toLowerCase();
    const bodyContent = msg.body?.content || "";
    const lowerBody = bodyContent.toLowerCase();

    // ✅ Check approval
    if (
      DIRECTOR_EMAILS.includes(sender) &&
      (lowerBody.includes("i approve") || lowerBody.includes("approved"))
    ) {
      approvals.add(sender);
    }
  }

  const allApproved = DIRECTOR_EMAILS.every(dir => approvals.has(dir.toLowerCase()));
  if (!allApproved) return null; // ❌ Not all approved, stop here

  // ✅ If all approved, check for asset info
  for (const msg of threadMessages) {
    const senderName = msg.from?.emailAddress?.name || "";
    const subject = msg.subject || "";
    const bodyContent = msg.body?.content || "";

    const fullContent = `
    Subject: ${subject}
    From: ${senderName}
    Body:
    ${bodyContent}
    `;
    const extractedStr = await mailService.extractAssetInfo(fullContent);

    if (extractedStr && extractedStr.trim() !== "Not related") {
      try {
        parsedInfo = JSON.parse(extractedStr);
        if (parsedInfo.date === "N/A" || isNaN(new Date(parsedInfo.date).getTime())) {
  parsedInfo.date = null; // or remove it: delete extracte.date;
}

        return parsedInfo; // ✅ Return asset info
        /*return {
  "person": "James NEUTRON",
  "asset_reference": "ABC1234567",
  "action": "return",
  "date": "2025-05-16",
  "status": "intercontrat",
  "site": "CDS-GRDF",
  "team": "BB"
};*/
      } catch (err) {
        console.warn("Failed to parse asset info:", err);
        return null;
      }
    }
  }

  return null; // ✅ All approved, but no asset info found
};



const processAssetRelatedEmails = async (req, res, next) => {
  try {
    //const accessToken = await fetchAccessToken(req, res, next, ["Mail.Read", "Mail.Send"]);
    const authHeader = req.headers.authorization || "";  // Get Authorization header
    const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    // 1️⃣ Load the previous scan time from DB
    const lastScanDoc = await MailboxScan.findOne({});
    const lastScanTime = lastScanDoc?.scanTime || (() => {
      const d = new Date();
      d.setDate(d.getDate() - 3);
      return d;
    })();

    const currentScanTime = new Date();

    /*const startDate = req.body.startDate
      ? new Date(req.body.startDate)
      : (() => {
          const d = new Date();
          d.setDate(d.getDate() - 3);
          return d;
        })();*/
    const messages = await fetchRecentEmails(accessToken, lastScanTime);
    const results = [];
    
    const processedConversations = new Set(); // to track unique conversationIds
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    for (const msg of messages) {
      const convId = msg.conversationId;
      const alreadyApproved = await ApprovedEmail.findOne({ conversationId: convId });
      if (alreadyApproved) continue;
      if (processedConversations.has(convId)) continue;
      processedConversations.add(convId);

      const extractedInfo = await isAssetApproved(accessToken, convId);
      if (extractedInfo==null) continue;
      await assetService.updateExcelTrace(extractedInfo);
      await assetService.updateOrCreateAsset(extractedInfo);
      await ApprovedEmail.create({ conversationId: convId });
      results.push(extractedInfo);

      await sleep(1000);
    }
    // 4️⃣ Update scan time in DB
    await MailboxScan.deleteMany({});
    await MailboxScan.create({ scanTime: currentScanTime });

    await ApprovedEmail.deleteMany({});
    res.json({ approvedAssets: results });
  } catch (err) {
    next(err);
  }
};


module.exports = {
    processAssetRelatedEmails,
    fetchRecentEmails,
    isAssetApproved
};
