const axios = require("axios");
const fetchManager = require("../utils/fetchManager");
const graphManager = require("../utils/graphManager");
const assetService = require("../services/asset.service.js");
const mailService = require("../services/mail.service.js");
const ApprovedEmail = require("../models/approvedEmail.model.js");
const MailboxScan = require("../models/mailboxScan.model.js");

const DIRECTOR_EMAILS = [
  "youssefbelhadj1111@gmail.com"
];

/**
 * Fetch access token via client_credentials (no user sign-in required)
 */
async function fetchAccessToken() {
  const params = new URLSearchParams();
  params.append("client_id", process.env.AZURE_CLIENT_ID);
  params.append("client_secret", process.env.AZURE_CLIENT_SECRET);
  params.append("scope", "https://graph.microsoft.com/.default");
  params.append("grant_type", "client_credentials");

  const res = await axios.post(
    `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`,
    params,
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  return res.data.access_token;
}

/**
 * Fetch recent inbox + sent items emails since startDate
 */
const fetchRecentEmails = async (accessToken, startDate) => {
  const userEmail = process.env.MAILBOX_USER_EMAIL; // e.g. "user@domain.com"
  const encodedEmail = encodeURIComponent(userEmail);
  const graphClient = graphManager.getAuthenticatedClient(accessToken);
  const isoStart = startDate.toISOString();

  // helper to get all pages
  const fetchAllPages = async (path, filterField) => {
    let allMessages = [];
    let res = await graphClient
      .api(path)
      .filter(`${filterField} ge ${isoStart}`)
      .orderby(`${filterField} asc`)
      .top(50) // page size
      .get();

    allMessages.push(...(res.value || []));

    // follow pagination
    while (res["@odata.nextLink"]) {
      res = await graphClient.api(res["@odata.nextLink"]).get();
      allMessages.push(...(res.value || []));
    }
    return allMessages;
  };

  const inboxMessages = await fetchAllPages(
    `/users/${encodedEmail}/mailFolders/inbox/messages`,
    "receivedDateTime"
  );

  const sentMessages = await fetchAllPages(
    `/users/${encodedEmail}/mailFolders/sentitems/messages`,
    "sentDateTime"
  );

  return [...inboxMessages, ...sentMessages];
};


/**
 * Check if all directors approved + extract asset info
 */
const isAssetApproved = async (accessToken, conversationId) => {
  const userEmail = process.env.MAILBOX_USER_EMAIL; // e.g. "user@domain.com"
  const encodedEmail = encodeURIComponent(userEmail);
  function stripHtml(html) {
    return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  }

  const graphClient = graphManager.getAuthenticatedClient(accessToken);

  const response = await graphClient
    .api(`/users/${encodedEmail}/messages?$filter=conversationId eq '${conversationId}'&$top=50`)
    .get();

  const threadMessages = response.value || [];
  const approvals = new Set();

  for (const msg of threadMessages) {
    const sender = msg.from?.emailAddress?.address?.toLowerCase();
    const bodyContent = msg.body?.content || "";
    const lowerBody = bodyContent.toLowerCase();

    if (
      DIRECTOR_EMAILS.includes(sender) &&
      (lowerBody.includes("approve") || lowerBody.includes("approved")|| lowerBody.includes("approuve")|| lowerBody.includes("ok"))
    ) {
      approvals.add(sender);
    }
  }

  const allApproved = DIRECTOR_EMAILS.every((dir) =>
    approvals.has(dir.toLowerCase())
  );
  if (!allApproved) return null;

  // ✅ Extract asset info
  for (const msg of threadMessages) {
    const senderName = msg.from?.emailAddress?.name || "";
    const subject = msg.subject || "";
    const bodyContent = msg.body?.content || "";
    const lowerBody = bodyContent.toLowerCase();
    if(lowerBody.includes("approve") || lowerBody.includes("approved")|| lowerBody.includes("approuve")|| lowerBody.includes("ok")) continue;
    console.log("email:", stripHtml(bodyContent));

    const fullContent = `
      Subject: ${subject}
      From: ${senderName}
      Body:
      ${bodyContent}
    `;
    const cleanEmail = fullContent
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ')  // collapse multiple spaces
  .trim();
    const extractedStr = await mailService.extractAssetInfo(cleanEmail);

    if (extractedStr && extractedStr.trim() !== "Not related") {
      try {
        const parsedInfo = JSON.parse(extractedStr);
        if (
          parsedInfo.date === "N/A" ||
          isNaN(new Date(parsedInfo.date).getTime())
        ) {
          parsedInfo.date = null;
        }
        return parsedInfo;
      } catch (err) {
        console.warn("Failed to parse asset info:", err);
        return null;
      }
    }
  }

  return null;
};

/**
 * Main scanning function — works both as Express handler and standalone
 */
async function processAssetRelatedEmails(req = {}, res = null, next = null) {
  try {
    const accessToken = await fetchAccessToken();

    // Determine the start time for fetching emails
    let lastScanDoc = null;
    let lastScanTimeUsed = false;

    let fetchStartTime;
    if (req.body?.startDate) {
      fetchStartTime = new Date(req.body.startDate);
    } else {
      lastScanDoc = await MailboxScan.findOne({});
      fetchStartTime =
        lastScanDoc?.scanTime ||
        (() => {
          const d = new Date();
          d.setDate(d.getDate() - 30);
          return d;
        })();
      lastScanTimeUsed = true; // Only update DB if we used lastScanTime
    }

    const messages = await fetchRecentEmails(accessToken, fetchStartTime);
    const currentScanTime = new Date();

    const results = [];
    const processedConversations = new Set();
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    for (const msg of messages) {
      const convId = msg.conversationId;
      if (!convId || processedConversations.has(convId)) continue;

      const alreadyApproved = await ApprovedEmail.findOne({
        conversationId: convId,
      });
      if (alreadyApproved) continue;

      processedConversations.add(convId);

      const extractedInfo = await isAssetApproved(accessToken, convId);
      if (!extractedInfo) continue;
      console.log(extractedInfo);
      await assetService.updateExcelTrace(extractedInfo);
      await assetService.updateOrCreateAsset(extractedInfo);
      await ApprovedEmail.create({ conversationId: convId });

      results.push(extractedInfo);
      await sleep(1000);
    }
      //await ApprovedEmail.deleteMany({});

    // Only update MailboxScan if lastScanTime was used
    if (lastScanTimeUsed) {
      await MailboxScan.deleteMany({});
      await MailboxScan.create({ scanTime: currentScanTime });
    }

    if (res) res.json({ approvedAssets: results });
    return results;
  } catch (err) {
    if (next) next(err);
    else throw err;
  }
}

module.exports = {
  processAssetRelatedEmails,
  fetchRecentEmails,
  isAssetApproved,
  fetchAccessToken,
};
