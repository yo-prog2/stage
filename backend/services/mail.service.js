const Groq = require("groq-sdk");

const extractAssetInfo = async (email) => {
    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
    });

    const completion = await groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [
            {
                role: "user",
                content: `
        You are a precise data extraction assistant.

Task:
- Determine if the email is about asset management (handling equipment like PCs, badges, phones, etc.).
- If yes, extract these fields and return ONLY a VALID JSON(dont forget opening and closing braces) object with keys exactly as below:

{
  "person": "James NEUTRON",
  "asset_reference": "ABC1234567",
  "action": "return",
  "date": "2025-05-16",
  "status": "intercontrat",
  "site": "CDS-GRDF",
  "team": "BB"
}

- If the email is NOT related to asset management, respond EXACTLY with the string:

Not related

IMPORTANT:
- Read the email body: to extract the fields of the json
-If ANY of these fields:(person, asset_reference, action, date) are not mentioned respond EXACTLY with the string:

Not related

- If the person field is not mentioned put the sender's name.
- Do NOT add any explanations, comments, or formatting.
- Output either the JSON object(with opening and closing braces) or the string Not related.
- Convert any dates to the YYYY-MM-DD format.

Example 1:
Email: "Veuillez noter que spongbob quittera le CDS-GRDF et 16/05/2025. Il sera en intercontrat après cette date. 
Nom du collaborateur : djo
Equipe GRDF concernée : BBf
Date de fin sur la mission : 16/05/2025
Référence du PC GRDF qu'il va rendre : ABC67."

Output:
{
  "person": "James NEUTRON",
  "asset_reference": "ABC1234567",
  "action": "return",
  "date": "2025-05-16",
  "status": "intercontrat",
  "site": "CDS-GRDF",
  "team": "BB"
}

Example 2:
Email: "Meeting on Monday."
Output:
Not related

Now analyze:
Email:
${email}



                `,
            },
        ],
        temperature: 0.1,
    });

    return completion.choices[0].message.content;
};
module.exports = {
    extractAssetInfo
};