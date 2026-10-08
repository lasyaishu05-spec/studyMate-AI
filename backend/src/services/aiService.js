const OpenAI = require('openai');
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function summarizeNote(content) {
 const response = await client.chat.completions.create({
   model: 'gpt-4o-mini',
   messages: [
     { role: 'system', content: 'Summarize the following note in 3-4 concise sentences.' },
     { role: 'user', content },
   ],
   temperature: 0.3,
 });
 return response.choices[0].message.content;
}

async function generateQuiz(content) {
 const response = await client.chat.completions.create({
   model: 'gpt-4o-mini',
   messages: [
     { role: 'system', content: 'Generate 5 quiz questions (with answers) from the following note. Return as a JSON array of {question, answer}.' },
     { role: 'user', content },
   ],
   temperature: 0.4,
   response_format: { type: 'json_object' },
 });
 return JSON.parse(response.choices[0].message.content);
}

module.exports = { summarizeNote, generateQuiz };