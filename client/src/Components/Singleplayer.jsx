import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Duel.css";

function Singleplayer() {
  const { category } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);

  const [quizStarted, setQuizStarted] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const [totalTimer, setTotalTimer] = useState(0);
  const [questionTimer, setQuestionTimer] = useState(0);

  const [answers, setAnswers] = useState({});
  const [lockedQuestions, setLockedQuestions] = useState({});
  const [questionTimeLeft, setQuestionTimeLeft] = useState({});
  const [quizFinished, setQuizFinished] = useState(false);

  const [categoryId, setCategoryId] = useState("");
  const [timePerQuestion, setTimePerQuestion] = useState(0);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

  /* ---------- FETCH CATEGORY META ---------- */
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/categories/by-name/${category}`)
      .then((res) => {
        setCategoryId(res.data.categoryId);
        setTimePerQuestion(res.data.timePerQuestion);
        console.log("CategoryId:", res.data.categoryId);
        console.log("Time per question:", res.data.timePerQuestion);
      })
      .catch((err) => console.error(err));
  }, [category]);

  /* ---------- COUNTDOWN ---------- */
  useEffect(() => {
    if (quizStarted || !categoryId) return;

    const timer = setInterval(() => {
      setCountdown((p) => {
        if (p === 1) {
          clearInterval(timer);
          startQuiz();
          return 0;
        }
        return p - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, categoryId]);

  /* ---------- START QUIZ ---------- */
  const startQuiz = async () => {
    if (!categoryId) return;

    setQuizStarted(true);

    const res = await axios.get(
      `${API_BASE_URL}/quiz/by-category/${categoryId}`
    );

    const qs = res.data;
    console.log(qs)
    setQuestions(qs);

    const timeMap = {};
    qs.forEach((_, i) => {
      timeMap[i] = timePerQuestion;
    });

    setQuestionTimeLeft(timeMap);
    setQuestionTimer(timePerQuestion);
    setTotalTimer(timePerQuestion * qs.length);
  };

  /* ---------- TOTAL TIMER ---------- */
  useEffect(() => {
    if (!quizStarted) return;

    const t = setInterval(() => {
      setTotalTimer((p) => {
        if (p <= 1) {
          clearInterval(t);
          submitQuiz();
          return 0;
        }
        return p - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [quizStarted]);

  /* ---------- QUESTION TIMER ---------- */
  useEffect(() => {
    if (!quizStarted || !questions.length) return;

    setQuestionTimer(questionTimeLeft[currentQ]);

    const t = setInterval(() => {
      setQuestionTimer((p) => {
        if (p <= 1) {
          clearInterval(t);
          setLockedQuestions((x) => ({ ...x, [currentQ]: true }));
          setQuestionTimeLeft((x) => ({ ...x, [currentQ]: 0 }));
          return 0;
        }
        setQuestionTimeLeft((x) => ({ ...x, [currentQ]: p - 1 }));
        return p - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [currentQ, quizStarted, questions]);

  const submitQuiz = () => {
    if (quizFinished) return;
    setQuizFinished(true);
  };

  useEffect(() => {
    if (quizFinished) {
      navigate("/singleplayer-result", {
        state: { answers, questions }
      });
    }
  }, [quizFinished, answers, navigate, questions]);

  return (
    <div className="duel-container">
      {!quizStarted && (
        <h2 className="countdown">
          Quiz starts in: {countdown}
        </h2>
      )}

      {quizStarted && questions.length > 0 && (
        <>
          <div className="total-timer-box">
            Total Time Left: {totalTimer}s
          </div>

          <div className="question-card">
            <h3 className="question-title">
              Q{currentQ + 1}: {questions[currentQ].question}
            </h3>

            <p className="question-timer">
              Question Time Left: {questionTimer}s
            </p>

            <div className="options-container">
              {questions[currentQ].options.map((opt, idx) => (
                <button
                  key={idx}
                  disabled={lockedQuestions[currentQ]}
                  className={`option-btn ${
                    answers[currentQ] === opt ? "option-selected" : ""
                  }`}
                  onClick={() =>
                    setAnswers((p) => ({ ...p, [currentQ]: opt }))
                  }
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="nav-buttons">
              {currentQ > 0 && (
                <button
                  className="prev-btn"
                  onClick={() => setCurrentQ(currentQ - 1)}
                >
                  Previous
                </button>
              )}

              {currentQ < questions.length - 1 && (
                <button
                  className="next-btn"
                  onClick={() => setCurrentQ(currentQ + 1)}
                >
                  Next
                </button>
              )}
            </div>
          </div>

          <button className="submit-btn" onClick={submitQuiz}>
            Submit
          </button>
        </>
      )}
    </div>
  );
}

export default Singleplayer;