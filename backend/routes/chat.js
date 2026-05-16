const express = require('express');
const router = express.Router();

const HR_QUESTIONS = [
  "Welcome to your HR interview! To start, could you tell me a little bit about yourself and your background?",
  "That's interesting. Why are you interested in joining our company specifically?",
  "What would you say is your greatest professional strength, and how has it helped you in your career?",
  "Can you describe a challenging situation at work and how you handled it?",
  "Where do you see yourself professionally in the next five years?",
  "Thank you for sharing that. Do you have any questions for me before we conclude?"
];

const TECH_QUESTIONS = [
  "Hello! Ready for your technical interview? Let's start. Can you explain the difference between 'let', 'const', and 'var' in JavaScript?",
  "Good. Now, how does the Virtual DOM work in React, and why is it beneficial?",
  "Can you explain what a closure is in JavaScript and provide a use case for it?",
  "Great. How would you optimize the performance of a React application that is rendering a large list of items?",
  "What is the difference between synchronous and asynchronous programming, and how do you handle async operations in Node.js?",
  "That covers our technical questions. Is there any specific technical topic you'd like to discuss or any questions you have for me?"
];

router.post('/', async (req, res) => {
  try {
    const { message, history, interviewType } = req.body;
    
    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const questions = interviewType === 'Technical' ? TECH_QUESTIONS : HR_QUESTIONS;
    
    // Determine which question to ask based on history length
    // History includes { role: 'user' | 'model', content: string }
    // We only count model messages to find the next question
    const modelMessages = history ? history.filter(h => h.role === 'model') : [];
    const nextQuestionIndex = modelMessages.length;

    let reply = "";
    if (nextQuestionIndex < questions.length) {
      reply = questions[nextQuestionIndex];
    } else {
      reply = "Thank you for your time! We've completed the mock interview. You did a great job!";
    }

    res.json({ reply });
  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
