const express = require('express');
const router = express.Router();

const HR_QUESTIONS = [
  "Welcome to your HR interview! To start, could you tell me a little bit about yourself and your background?",
  "Why are you interested in joining our company specifically?",
  "What would you say is your greatest professional strength?",
  "Can you describe a challenging situation at work and how you handled it?",
  "Where do you see yourself in the next five years?"
];

const TECH_QUESTIONS = [
  "Let's start simple. Can you explain the difference between let, const, and var in JavaScript?",
  "How does the Virtual DOM work in React?",
  "What is a closure in JavaScript?",
  "How would you optimize performance in a React app?",
  "Explain synchronous vs asynchronous programming in Node.js."
];

const FOLLOWUP_QUESTION = "Could you elaborate a bit more on that? I'd like to understand your thought process better.";

// 🧠 Simple answer evaluator (mock intelligence)
function evaluateAnswer(answer) {
  if (!answer) return "weak";

  const length = answer.trim().length;

  if (length < 20) return "weak";
  if (length < 60) return "average";
  return "strong";
}

router.post('/', async (req, res) => {
  try {
    const { message, history, interviewType } = req.body;

    await new Promise(resolve => setTimeout(resolve, 800));

    const questions =
      interviewType === 'Technical' ? TECH_QUESTIONS : HR_QUESTIONS;

    const modelMessages = history
      ? history.filter(h => h.role === 'model')
      : [];

    // Filter out follow-up messages to get true question index
    const actualQuestionsAsked = modelMessages.filter(m => m.content !== FOLLOWUP_QUESTION);
    const currentIndex = actualQuestionsAsked.length;

    let reply = "";

    // 🎯 First question
    if (currentIndex === 0) {
      reply = questions[0];
      return res.json({ reply });
    }

    // Check if the last model message was a follow-up
    const lastModelMessage = modelMessages[modelMessages.length - 1];
    const isReturningFromFollowup = lastModelMessage && lastModelMessage.content === FOLLOWUP_QUESTION;

    // 🧠 Evaluate previous answer (only if it wasn't already a response to a follow-up)
    if (!isReturningFromFollowup) {
      const answerQuality = evaluateAnswer(message);

      // 🔥 Add follow-up if weak
      if (answerQuality === "weak") {
        reply = FOLLOWUP_QUESTION;
        return res.json({ reply });
      }
    }

    // 👍 Move to next question
    if (currentIndex < questions.length) {
      reply = questions[currentIndex];
    } else {
      reply =
        "That brings us to the end of the interview. Thank you for your time! You did well. We'll provide detailed feedback next.";
    }

    res.json({ reply });
  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
