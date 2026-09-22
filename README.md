# MockTest PRO — AI Engineering Assessment Studio

An AI-powered technical interview simulator that generates role-calibrated mock tests with MCQ and live DSA coding challenges. Built with React + Node.js + FastAPI + Groq LLM.

---

## 🗂 Project Structure

```
mockTest/
├── client/          # React (Vite + Tailwind) — Frontend
├── server/          # Node.js (Express + MongoDB) — REST API
└── ai_service/      # Python (FastAPI + Groq) — LLM Question Generator
```

---

## ✨ Features

- **AI-Generated Questions** — Role-calibrated MCQ & DSA questions via Groq LLM
- **Live Code Execution** — Monaco Editor with Python, JavaScript, Java, C++ support
- **Pre-Test Ready Screen** — Review assessment details before the timer starts
- **Timed Assessments** — Countdown timer with auto-submit
- **Auto-Grading** — MCQ answer checking + DSA hidden test evaluation
- **Dashboard** — Track all past tests, scores, and completion rate
- **Auth** — JWT-based register / login flow

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- Python ≥ 3.10
- MongoDB Atlas account (or local MongoDB)
- Groq API key

---

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/mockTest.git
cd mockTest
```

---

### 2. AI Service (FastAPI)

```bash
cd ai_service
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your GROQ_API_KEY
uvicorn app.main:app --reload --port 8000
```

---

### 3. Server (Node.js / Express)

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MONGODB_URI and JWT_SECRET
npm run dev
```

---

### 4. Client (React / Vite)

```bash
cd client
npm install
npm run dev
```

Visit `http://localhost:5173`

---

## ⚙️ Environment Variables

| Service | File | Key Variables |
|---------|------|--------------|
| server | `server/.env` | `MONGODB_URI`, `JWT_SECRET`, `AI_SERVICE_URL` |
| ai_service | `ai_service/.env` | `GROQ_API_KEY`, `GROQ_MODEL` |

Copy `.env.example` → `.env` in each folder and fill in the values. **Never commit `.env` files.**

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4, Monaco Editor |
| Backend | Node.js, Express 5, Mongoose, JWT |
| AI Service | FastAPI, Groq SDK |
| Database | MongoDB Atlas |
| Icons | Lucide React |

---

## 📄 License

MIT
