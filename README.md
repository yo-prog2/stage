📧 Asset Approval Email Scanner

This project automates the process of scanning a shared mailbox, checking if all required directors have approved an asset request by replying in the same email conversation, and then extracting structured asset data for storage and reporting.

🔑 Setup
1. Azure app registration

Go to Azure Portal → Azure Active Directory → App registrations → New registration


Supported account types: Select Accounts in this organizational directory only (Single tenant).


Certificates & Secrets:

Go to Certificates & secrets → New client secret.

Copy the secret value (this will be AZURE_CLIENT_SECRET in your .env).

API Permissions:

Go to API permissions → Add a permission → Microsoft Graph → Application permissions.

Add:

Mail.Read


Click Grant admin consent after adding permissions.
2. Environment Variables

Create a .env file in the project root with:

AZURE_CLIENT_ID=your_app_id
AZURE_CLIENT_SECRET=your_secret
AZURE_TENANT_ID=your_tenant_id
MAILBOX_USER_EMAIL=sharedmailbox@domain.com
MONGODB_URI=mongodb://localhost:27017/yourdb

# Comma-separated list of required director emails
DIRECTOR_EMAILS=youssefbelhadj1111@gmail.com,anotherdirector@domain.com

3. Update mail.controller.js

In controllers/mail.controller.js, load the director emails:

const DIRECTOR_EMAILS = [
  "youssefbelhadj1111@gmail.com"
];


This ensures the system checks approvals only from the required directors.

📅 Cron Schedule
cron.schedule("0 */12 * * *", () => { ... });


➡️ Runs every 12 hours.

✅ Approval Rules

Approvals must be in the same conversation thread.

Directors must use Reply All.

System only accepts replies containing:
approve, approved, approuve, ok.
4. Install & Run
npm install
npm start

🚀 Features

Connects to Microsoft Graph API using client_credentials (no user login required).

Fetches Inbox + Sent emails since the last scan (or a given startDate).

Detects approvals by scanning replies in the same conversation thread.

Extracts asset information from the request email (subject, body, etc.).

Stores approvals and assets in MongoDB.

Updates an Excel log of all processed assets (saved under:
AppData\Roaming\AssetManagement\logs inside the current user’s home directory).

Runs automatically via cron schedule (default: every Monday at 09:00 AM).

⚙️ How It Works

Email Request Sent
Example: "Please approve Asset X for purchase on 2025-09-01"

Directors Approve
Must Reply All in the same thread.
Approval keywords: approve, approved, approuve, ok

Approval Check
Confirms all DIRECTOR_EMAILS have approved.

Extract Asset Info
Uses mailService.extractAssetInfo.

Data Storage
Saves approval in DB + Excel log.

Scheduled Scans
Runs weekly (0 9 * * 1).

🛠️ Tech Stack

Node.js + Express

MongoDB (Mongoose models)

Microsoft Graph API

Axios

Cron jobs (node-cron)

Excel export (assetService)

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
