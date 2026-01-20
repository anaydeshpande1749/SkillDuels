import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./All.css";

function Singleresult() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!state) return;

    const { answers, questions } = state;
    let totalScore = 0;

    questions.forEach((q, index) => {
      const userAnswer = answers[index];
      const correctOptionText = q.options[q.correctAnswer];

      if (userAnswer === correctOptionText) {
        totalScore++; // ✅ FIXED
      }
    });

    setScore(totalScore);
  }, [state]);

  if (!state) {
    return <h2>No result data found</h2>;
  }

  return (
    <div className="result-container">
      <div className="result-card">
        <h2>Quiz Result</h2>

        <p className="result-score">
          Score: <b>{score}</b> / {state.questions.length}
        </p>

        <button
          className="result-btn"
          onClick={() => navigate("/dashboard")}
        >
          Go Home
        </button>
      </div>
    </div>
  );
}

export default Singleresult;
