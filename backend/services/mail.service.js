const { spawn } = require("child_process");

const extractAssetInfo = (email) => {
  return new Promise((resolve, reject) => {
    const prompt = `
You are an email parser.

Instructions:
1. Only respond if the email clearly contains all four fields: person, action, asset_reference, and date (YYYY-MM-DD). Otherwise respond exactly with: Not related
2. Always output valid JSON with the following keys: 
   {"person":"", "asset_reference":"", "action":"", "date":"", "status":"", "site":"", "team":""}
3. Optional fields (status, site, team) can be empty if not found.
4. Normalize dates to YYYY-MM-DD format.
5. If the email mentions leaving, returning, or end of mission, always set "action":"return".
6. Extract the site if the email contains "site de X" or similar patterns.
7. Extract the team if the email contains "Equipe concernée : Y" or similar patterns.
8. Extract values exactly as they appear, no guesses.
9. No extra text, explanations, or line breaks inside JSON values.

Example input:
Email: Merci de noter que Youssef Belhadj Ahmed quittera le site de PARIS-LAB le 05/09/2025. Nom de la collaboratrice : Youssef Belhadj Ahmed Equipe concernée : R&D Date de fin sur la mission : 05/09/2025 Référence du téléphone à retourner : TEL44552 Cordialement

Example output:
{"person":"Youssef Belhadj Ahmed","asset_reference":"TEL44552","action":"return","date":"2025-09-05","status":"","site":"PARIS-LAB","team":"R&D"}

Now analyze the following email and respond only with the JSON or "Not related":

Email:
${email}
    `;

    const child = spawn("ollama", ["run", "deepseek-r1:7b"]);

    let output = "";
    let error = "";

    child.stdout.on("data", (data) => {
      output += data.toString();
    });

    child.stderr.on("data", (data) => {
      error += data.toString();
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(error));
      } else {
        const cleaned = cleanLLMOutput(output);
        resolve(cleaned);
      }
    });

    child.stdin.write(prompt);
    child.stdin.end();
  });
};

function cleanLLMOutput(text) {
  // Remove <think>...</think>
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, "");
  // Remove triple backticks and language hints
  text = text.replace(/```[a-z]*\n?/gi, "").replace(/```/g, "");
  // Extract first JSON object
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0].trim() : text.trim();
}

module.exports = { extractAssetInfo };
