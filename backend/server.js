

/*const main = require("./app");

(async () => {
    const app = await main();
    const SERVER_PORT = process.env.PORT || 4000;
    app.listen(SERVER_PORT, () => console.log(`Msal Node Auth Code Sample app listening on port ${SERVER_PORT}!`));
})();*/
const main = require("./app"); // your express app init function
const cron = require("node-cron");
const { processAssetRelatedEmails } = require("./controllers/mail.controller");

(async () => {
  const app = await main();

  // Start server
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });

  // Schedule the automatic email scan
 let isRunning = false;
//every monday at 9am
cron.schedule("0 */12 * * *", async () => {
  if (isRunning) {
    console.log("Previous scan still running — skipping this cycle.");
    return;
  }
  isRunning = true;

  console.log(`[${new Date().toISOString()}] Running scheduled mailbox scan...`);
  try {
    const results = await processAssetRelatedEmails();
    console.log("Scan completed. Approved assets:", results.length);
  } catch (err) {
    console.error("Scheduled scan failed:", err);
  } finally {
    isRunning = false;
  }
});

})();
