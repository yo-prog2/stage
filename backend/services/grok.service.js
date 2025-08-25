/*const Groq = require("groq-sdk");

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
- For an email to be considered related to asset managemnt the action and asset_reference must exist in the email otherwise its not
- If the email is NOT related to asset management, respond EXACTLY with the string:

Not related

- If the email is about asset management, extract these fields and return ONLY a VALID JSON(dont forget opening and closing braces) object with keys exactly as below:

{
  "person": "James NEUTRON",
  "asset_reference": "ABC1234567",
  "action": "return",
  "date": "2025-05-16",
  "status": "intercontrat",
  "site": "CDS-GRDF",
  "team": "BB"
}


- Read the email body: to extract the fields of the json
-If you are unable to deduce these fields :(person, asset_reference, action, date) are not mentioned dont respond with the json object instead respond EXACTLY with the string:

Not related

- person field is not any name you find it's the name of the person performing the action over the asset
- Do NOT add any explanations, comments, or formatting.
- Convert any dates to the YYYY-MM-DD format.

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
};*/