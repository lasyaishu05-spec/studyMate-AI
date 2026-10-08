const OpenAI = require('openai');

function generateFallbackSummary(content) {
  const clean = (content || '').trim();
  if (!clean) return 'This note has no text to summarize.';

  const sentences = clean
    .split(/(?<=[.?!])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);

  if (sentences.length <= 3) {
    return clean;
  }

  // Pick leading key sentences
  return sentences.slice(0, 4).join(' ');
}

function generateFallbackQuiz(content) {
  const clean = (content || '').trim();
  const sentences = clean
    .split(/(?<=[.?!])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12);

  const questions = [];
  const pool = sentences.slice(0, 5);

  pool.forEach((sentence, idx) => {
    const words = sentence.split(' ');
    const promptSnippet = words.slice(0, Math.min(6, words.length)).join(' ');
    questions.push({
      question: `Key concept check #${idx + 1}: What is addressed in "${promptSnippet}..."?`,
      answer: sentence,
      options: [
        sentence,
        `Alternative configuration for ${promptSnippet}`,
        `Secondary requirement outside this scope`,
        `None of the above`,
      ],
    });
  });

  if (questions.length === 0) {
    questions.push({
      question: 'What is the main topic covered in this study note?',
      answer: clean.slice(0, 60) || 'Core principles',
      options: [
        clean.slice(0, 60) || 'Core principles',
        'Unrelated topic',
        'Background trivia',
        'None of the above',
      ],
    });
  }

  return questions;
}

async function summarizeNote(content) {
  const text = (content || '').trim();
  if (!text) {
    throw { status: 400, message: 'Note content is empty. Please write some notes and save first.' };
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && !apiKey.includes('dummy')) {
      const client = new OpenAI({ apiKey });
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Summarize the following note in 3-4 concise sentences.' },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
      });

      const summaryText = response?.choices?.[0]?.message?.content;
      if (summaryText && summaryText.trim()) {
        return summaryText;
      }
    }
  } catch (err) {
    console.warn(`OpenAI call failed (${err.message || err.code || err}). Using intelligent fallback summary.`);
  }

  // Graceful fallback whenever OpenAI is unavailable, quota is exhausted, or errors occur
  return generateFallbackSummary(text);
}

async function generateQuiz(content) {
  const text = (content || '').trim();
  if (!text) {
    throw { status: 400, message: 'Note content is empty. Please write some notes and save first.' };
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && !apiKey.includes('dummy')) {
      const client = new OpenAI({ apiKey });
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Generate 5 quiz questions (with options and answer) from the note. Return as JSON: {"questions": [{"question": "...", "options": ["..."], "answer": "..."}]}',
          },
          { role: 'user', content: text },
        ],
        temperature: 0.4,
        response_format: { type: 'json_object' },
      });

      const parsed = JSON.parse(response.choices[0].message.content);
      const questions = parsed.questions || parsed;
      if (Array.isArray(questions) && questions.length > 0) {
        return questions;
      }
    }
  } catch (err) {
    console.warn(`OpenAI call failed (${err.message || err.code || err}). Using intelligent fallback quiz.`);
  }

  // Graceful fallback whenever OpenAI is unavailable, quota is exhausted, or errors occur
  return generateFallbackQuiz(text);
}

module.exports = { summarizeNote, generateQuiz };