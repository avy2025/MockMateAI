# MockMate AI – Your Personal Interview Coach

MockMate AI is a clean, modern web application designed to help users practice for HR and Technical interviews using AI-driven mock sessions.

## 🎨 Design Philosophy
MockMate AI features a premium aesthetic with a **Dark Plum (#381932)** and **Light Cream (#FFF3E6)** palette. The interface is minimal, professional, and responsive, ensuring a high-quality experience across all devices.

## 🚀 Tech Stack
- **Frontend**: React (Vite), CSS3, Fetch API
- **Backend**: Node.js, Express, CORS
- **AI Integration**: Mock Interview Logic with automated answer evaluation (length-based)

## ✨ Features
- **Dual Interview Tracks**: Practice specialized questions for HR and Technical roles.
- **Contextual Chat**: A stateful chat system that remembers where you are in the interview.
- **Real-time Feedback**: Sequential mock logic that evaluates answer depth and requests elaboration if responses are too brief.
- **Premium UI**: Smooth transitions, rounded chat bubbles, and a professional layout.

## 🛠️ Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/MockMateAI.git
   cd MockMateAI
   ```

2. **Setup Backend**:
   ```bash
   cd backend
   npm install
   ```

3. **Setup Frontend**:
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the Backend Server**:
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on `http://localhost:5000`.

2. **Start the Frontend Development Server**:
   ```bash
   cd frontend
   npm run dev
   ```
   The application will be available at the port specified in the terminal (usually `http://localhost:5173` or `5174`).

## 🔮 Future Roadmap
- [ ] Direct Google Gemini API integration for dynamic responses.
- [ ] Real-time voice-to-text and text-to-voice support.
- [ ] Interview performance analytics and scoring.

---
Created with ❤️ by Antigravity
