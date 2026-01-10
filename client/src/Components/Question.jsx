//this is questions.jsx

import React, { useEffect, useState, useRef } from "react";
import "./Question.css"; // Import the new CSS file

export const demoJavaQuestions = [
  {
    id: 1,
    text: "What is JVM in Java?",
    options: [
      { id: 0, text: "Java Virtual Machine" },
      { id: 1, text: "Java Variable Method" },
      { id: 2, text: "Joint Virtual Model" },
      { id: 3, text: "None of the above" },
    ],
    correctId: 0,
  },
  {
    id: 2,
    text: "Which keyword is used to inherit a class in Java?",
    options: [
      { id: 0, text: "super" },
      { id: 1, text: "extends" },
      { id: 2, text: "inherits" },
      { id: 3, text: "instanceof" },
    ],
    correctId: 1,
  },
  {
    id: 3,
    text: "Which method is the entry point of a Java program?",
    options: [
      { id: 0, text: "start()" },
      { id: 1, text: "main()" },
      { id: 2, text: "run()" },
      { id: 3, text: "init()" },
    ],
    correctId: 1,
  },
];

export default function Questions({
  questions = demoJavaQuestions,
  totalTime = 90,
  onComplete = () => {},
  onAnswer = () => {},
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [quizFinished, setQuizFinished] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) finishQuiz();
  }, [timeLeft]);

  const finishQuiz = () => {
    clearInterval(timerRef.current);
    setQuizFinished(true);
    const score = Object.keys(answers).reduce((sum, qid) => {
      const q = questions.find((x) => x.id === Number(qid));
      return sum + (answers[qid]?.selectedId === q.correctId ? 1 : 0);
    }, 0);
    onComplete({ answers, score, total: questions.length });
  };

  const selectOption = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { selectedId: optionId } }));
    onAnswer({ questionId, selectedId: optionId });
  };

  const current = questions[index];
  const attemptedCount = Object.keys(answers).length;
  const unansweredCount = questions.length - attemptedCount;

  return (
    <div className="questions-page">
      <div className="questions-card">
        {/* Header */}
        <div className="questions-header">
          <h2>
            Question {index + 1} / {questions.length}
          </h2>
          <div className="time-left">
            <div className="small">Time Left</div>
            <div className="large">{formatTime(timeLeft)}</div>
          </div>
        </div>

        {/* Stats */}
        <div className="questions-stats">
          <div>Attempted: {attemptedCount}</div>
          <div>Unanswered: {unansweredCount}</div>
        </div>

        {/* Question */}
        {current && !quizFinished && (
          <div className="question-card">
            <p className="question-text">{current.text}</p>

            <div className="options-grid">
              {current.options.map((opt) => {
                const selected = answers[current.id]?.selectedId === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => selectOption(current.id, opt.id)}
                    className={`option-button ${selected ? "selected" : ""}`}
                  >
                    <div className="option-label">{optLabel(opt.id)}</div>
                    <div>{opt.text}</div>
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="question-nav-buttons">
              <button
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={index === 0}
                className="nav-button prev"
              >
                Previous
              </button>

              <button
                onClick={() => {
                  if (index < questions.length - 1) setIndex((i) => i + 1);
                  else finishQuiz();
                }}
                className="nav-button next"
              >
                {index < questions.length - 1 ? "Next" : "Finish"}
              </button>
            </div>
          </div>
        )}

        {/* Question Navigator */}
        <div className="question-nav">
          {questions.map((q, i) => {
            const attempted = answers[q.id];
            return (
              <button
                key={q.id}
                onClick={() => setIndex(i)}
                className={`${
                  i === index ? "current" : attempted ? "attempted" : "unattempted"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal Finish Screen */}
      {quizFinished && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Quiz Completed!</h2>
            <p>
              Your Score:{" "}
              <span>
                {Object.keys(answers).reduce((sum, qid) => {
                  const q = questions.find((x) => x.id === Number(qid));
                  return sum + (answers[qid]?.selectedId === q.correctId ? 1 : 0);
                }, 0)}{" "}
                / {questions.length}
              </span>
            </p>

            <div className="quiz-review">
              {questions.map((q) => {
                const userAnsId = answers[q.id]?.selectedId;
                const userAttempted = userAnsId !== undefined;
                const correctOpt = q.options.find(
                  (opt) => opt.id === q.correctId
                );
                const userOpt = q.options.find((opt) => opt.id === userAnsId);

                return (
                  <div key={q.id} className="review-card">
                    <p>{q.text}</p>

                    {q.options.map((opt) => {
                      const isCorrect = opt.id === q.correctId;
                      const isChosen = opt.id === userAnsId;

                      let statusClass = "unattempted";
                      if (isCorrect) statusClass = "correct";
                      else if (isChosen) statusClass = "wrong";

                      return (
                        <div
                          key={opt.id}
                          className={`review-option ${statusClass} ${
                            isChosen ? "chosen" : ""
                          }`}
                        >
                          {optLabel(opt.id)}. {opt.text}
                          {isChosen && <span className="tag tag-you"> Your answer</span>}
                          {isCorrect && (
                            <span className="tag tag-correct"> Correct</span>
                          )}
                        </div>
                      );
                    })}

                    {!userAttempted && (
                      <p className="review-note">You did not answer this question.</p>
                    )}

                    {userAttempted && (
                      <p className="review-note">
                        Your answer:{" "}
                        <strong>
                          {userOpt ? `${optLabel(userOpt.id)}. ${userOpt.text}` : "—"}
                        </strong>
                        <br />
                        Correct answer:{" "}
                        <strong>
                          {correctOpt
                            ? `${optLabel(correctOpt.id)}. ${correctOpt.text}`
                            : "—"}
                        </strong>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => window.location.reload()}
              className="restart-button"
            >
              Restart Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions
function formatTime(s) {
  const ss = Math.max(0, s);
  const mm = Math.floor(ss / 60);
  const sec = ss % 60;
  return `${String(mm).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function optLabel(id) {
  if (typeof id === "number") return String.fromCharCode(65 + id);
  return String(id).charAt(0).toUpperCase();
}
