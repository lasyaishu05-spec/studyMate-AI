const { GoogleGenAI } = require('@google/genai');

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

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
    const ai = getAiClient();
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Summarize the following study note in 3-4 concise sentences, highlighting the core principles and key concepts:\n\n${text}`,
      });

      const summaryText = response.text?.trim();
      if (summaryText) {
        return summaryText;
      }
    }
  } catch (err) {
    console.warn(`Gemini AI call error (${err.message || err}). Using fallback summarizer.`);
  }

  return generateFallbackSummary(text);
}

async function generateQuiz(content) {
  const text = (content || '').trim();
  if (!text) {
    throw { status: 400, message: 'Note content is empty. Please write some notes and save first.' };
  }

  try {
    const ai = getAiClient();
    if (ai) {
      const prompt = `Based on the following note, generate 5 multiple choice quiz questions to test understanding.
Return ONLY valid JSON matching this exact structure with no markdown code blocks:
{"questions": [{"question": "Question text?", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Option A"}]}

Note content:
${text}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      let raw = response.text || '';
      // Remove any markdown code fence if present
      raw = raw.replace(/```json/gi, '').replace(/```/g, '').trim();

      const parsed = JSON.parse(raw);
      const questions = parsed.questions || parsed;
      if (Array.isArray(questions) && questions.length > 0) {
        return questions;
      }
    }
  } catch (err) {
    console.warn(`Gemini AI quiz error (${err.message || err}). Using fallback quiz.`);
  }

  return generateFallbackQuiz(text);
}

module.exports = { summarizeNote, generateQuiz };