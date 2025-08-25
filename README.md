📧 Asset Approval Email Scanner

This project automates the process of scanning a shared mailbox, checking if all required directors have approved an asset request by replying in the same email conversation, and then extracting structured asset data for storage and reporting.

🚀 Features

Connects to Microsoft Graph API using client_credentials (no user login required).

Fetches Inbox + Sent emails since the last scan (or a given startDate).

Detects approvals by scanning replies in the same conversation thread.

Extracts asset information from the request email (subject, body, etc.).

Stores approvals and assets in MongoDB.

Updates an Excel log of all processed assets.

Runs automatically via cron schedule (default: every Monday at 09:00 AM).

⚙️ How It Works

Email Request Sent

Someone sends an email requesting an asset.

Example: "Please approve Asset X for purchase on 2025-09-01"

Directors Approve

Directors must Reply All within the same conversation thread.

Approval keywords detected:

approve, approved, approuve, ok

Approval Check

The system checks if all required directors (listed in DIRECTOR_EMAILS) have approved.

Extract Asset Info

Once approved, the system extracts details (person, asset_reference, action, date, etc.) using mailService.extractAssetInfo.

Data Storage

Marks the conversation as approved (ApprovedEmail).

Updates/creates the asset in the DB (assetService).

Logs the approval in an Excel trace file.

Scheduled Scans

Runs weekly at the configured cron time (0 9 * * 1 → Monday at 9 AM).

Skips if a previous scan is still running.

🛠️ Tech Stack

Node.js + Express

MongoDB (Mongoose models)

Microsoft Graph API

Axios

Cron jobs (node-cron)

Excel export (via assetService)

📂 Project Structure
controllers/
  mail.controller.js   # Main email scanning logic
models/
  approvedEmail.model.js
  mailboxScan.model.js
services/
  asset.service.js
  mail.service.js
utils/
  fetchManager.js
  graphManager.js
app.js                # Express app init
server.js             # Starts server + cron job

🔑 Environment Variables

Create a .env file with:

AZURE_CLIENT_ID=your_app_id
AZURE_CLIENT_SECRET=your_secret
AZURE_TENANT_ID=your_tenant_id
MAILBOX_USER_EMAIL=sharedmailbox@domain.com
MONGODB_URI=mongodb://localhost:27017/yourdb

▶️ Run Locally
npm install
npm start

📅 Cron Schedule

Current setup:

cron.schedule("0 9 * * 1", () => { ... });


➡️ Runs every Monday at 9 AM.
You can adjust as needed.

✅ Approval Rules

Approvals must be in the same conversation thread.

Directors must use Reply All.

System only accepts replies containing approval keywords (approve, approved, approuve, ok).