import { useState } from 'react';
import { noteApi } from '../api';
import { Sparkles, HelpCircle, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function AIPanel({ notebookId, noteId, content, onBeforeAi }) {
  const [summary, setSummary] = useState(null);
  const [summarizeLoading, setSummarizeLoading] = useState(false);
  const [summarizeError, setSummarizeError] = useState(null);

  const [quizQuestions, setQuizQuestions] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState(null);

  const [revealedAnswers, setRevealedAnswers] = useState({});

  async function handleSummarize() {
    setSummarizeLoading(true);
    setSummarizeError(null);
    try {
      if (onBeforeAi) await onBeforeAi();
      const data = await noteApi.summarize(notebookId, noteId, { content });
      setSummary(data.summary);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Could not generate a summary — try again.';
      setSummarizeError(msg);
    } finally {
      setSummarizeLoading(false);
    }
  }

  async function handleQuiz() {
    setQuizLoading(true);
    setQuizError(null);
    setRevealedAnswers({});
    try {
      if (onBeforeAi) await onBeforeAi();
      const data = await noteApi.quiz(notebookId, noteId, { content });
      setQuizQuestions(data.questions || []);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Could not generate a quiz — try again.';
      setQuizError(msg);
    } finally {
      setQuizLoading(false);
    }
  }

  const toggleReveal = (idx) => {
    setRevealedAnswers((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <div className="ai-panel-wrapper">
      <div className="ai-panel-header">
        <div className="ai-badge">
          <Sparkles size={16} />
          <span>StudyMate AI Assistant</span>
        </div>
        <div className="ai-actions">
          <button
            className="btn-ai"
            onClick={handleSummarize}
            disabled={summarizeLoading || quizLoading}
          >
            {summarizeLoading ? (
              <>
                <Loader2 size={16} className="spinner" />
                <span>Summarizing...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Summarize</span>
              </>
            )}
          </button>

          <button
            className="btn-ai-quiz"
            onClick={handleQuiz}
            disabled={summarizeLoading || quizLoading}
          >
            {quizLoading ? (
              <>
                <Loader2 size={16} className="spinner" />
                <span>Generating Quiz...</span>
              </>
            ) : (
              <>
                <HelpCircle size={16} />
                <span>Generate Quiz</span>
              </>
            )}
          </button>
        </div>
      </div>

      {summarizeError && (
        <div className="error-banner small" role="alert">
          <AlertCircle size={16} />
          <span>{summarizeError}</span>
        </div>
      )}

      {quizError && (
        <div className="error-banner small" role="alert">
          <AlertCircle size={16} />
          <span>{quizError}</span>
        </div>
      )}

      {/* Summary View with data-testid="summary" */}
      {summary && (
        <div className="ai-result-box" data-testid="summary">
          <h4>Key Summary</h4>
          <p className="summary-text">{summary}</p>
        </div>
      )}

      {/* Quiz View with Reveal toggle per question */}
      {quizQuestions && (
        <div className="ai-result-box quiz-container">
          <h4>Practice Quiz ({quizQuestions.length} Questions)</h4>
          <div className="quiz-list">
            {quizQuestions.map((q, idx) => (
              <div key={idx} className="quiz-item">
                <p className="quiz-prompt">
                  <strong>Q{idx + 1}:</strong> {q.question || q.prompt}
                </p>

                {q.options && Array.isArray(q.options) && (
                  <ul className="quiz-options-list">
                    {q.options.map((opt, oIdx) => (
                      <li key={oIdx}>{opt}</li>
                    ))}
                  </ul>
                )}

                <div className="quiz-answer-section">
                  <button
                    type="button"
                    className="btn-secondary small"
                    onClick={() => toggleReveal(idx)}
                  >
                    {revealedAnswers[idx] ? (
                      <>
                        <EyeOff size={14} />
                        <span>Hide Answer</span>
                      </>
                    ) : (
                      <>
                        <Eye size={14} />
                        <span>Reveal</span>
                      </>
                    )}
                  </button>

                  {revealedAnswers[idx] && (
                    <div className="revealed-answer">
                      <strong>Correct Answer:</strong>{' '}
                      <span>{q.answer || q.correctAnswer || 'See notes'}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
