const { execFile } = require('child_process');
const path = require('path');

const extractAssetInfo = (email) => {
  return new Promise((resolve, reject) => {
    const prompt = `
You are a precise asset management data extraction assistant.

Task:
- Determine if the email is about asset management (handling equipment like PCs, badges, phones, etc.).
- If yes, extract these fields and return ONLY a JSON object with keys exactly as below (including lowercase keys):

{
  "person": string or null,
  "asset_reference": string or null,
  "action": string or null,
  "date": string in ISO format YYYY-MM-DD or null
}

Rules:
- If the email says the sender is RETURNING an asset (words like "return", "returning", "returned"), then the "person" property MUST BE null (because the asset is being given back).
- If the email says the sender is REQUESTING or ALLOCATING an asset, then "person" is the name of the person receiving the asset, or the sender if no other person mentioned.
- Always convert dates to ISO format (YYYY-MM-DD).
- If the email is NOT about asset management, output EXACTLY: Not related
- DO NOT output explanations, only the JSON or the string Not related.

Examples:

Email: "James returns PC ABC1234567 on 2025-05-16."
Output:
{
  "person": null,
  "asset_reference": "PC ABC1234567",
  "action": "return",
  "date": "2025-05-16"
}

Email: "Please allocate laptop REF12345 to Alice on 2025-07-28."
Output:
{
  "person": "Alice",
  "asset_reference": "laptop REF12345",
  "action": "allocate",
  "date": "2025-07-28"
}

Email: "Requesting a new phone for myself."
Output:
{
  "person": "sender",
  "asset_reference": "phone",
  "action": "allocate",
  "date": null
}

Email: "Random meeting notes."
Output:
Not related

Now analyze:
Email:
${email}

`;

    // Run 'ollama run llama3-8b' and pass the prompt as stdin
    const ollama = execFile('ollama', ['run', 'llama3-8b'], (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      if (stderr) {
        // sometimes stderr is used for warnings; you can log it if needed
        console.warn('Ollama stderr:', stderr);
      }
      resolve(stdout.trim());
    });

    // Write prompt to stdin
    ollama.stdin.write(prompt);
    ollama.stdin.end();
  });
};

module.exports = {
  extractAssetInfo
};
