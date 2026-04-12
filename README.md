# 💧 AquaChamp  
### 🎮 Gamified Clean Water & Sanitation Learning Platform for Children  

---

## 🌟 Overview  

🎮 **AquaChamp** is a gamified learning application designed to educate children about **clean water, sanitation, and hygiene** through interactive and engaging methods.  

The system integrates four key modules:  
- 📚 Learning Module  
- 📝 Quiz & Assessment System  
- 🏆 Rewards & Leaderboard System  
- 📒 Hygiene Activity Tracker  

✨ By combining education, assessment, motivation, and real-life habit tracking, AquaChamp creates a **complete learning cycle** that promotes:
- Knowledge  
- Behavioral change  
- Continuous improvement  

---

## 📊 Project Status  

⏳ **80% Completed**  
📅 Assignment 01 – Evaluation (2026.02.28)  

---

## 📑 Table of Contents  

- 📌 Project Overview  
- 🛠️ Tech Stack  
- 👥 Team Members & Components  
- 📂 Project Structure  
- ✅ Prerequisites  
- ⚙️ Backend Setup  
- 🎨 Frontend Setup  
- 🗄️ MongoDB Setup  
- 🔐 Environment Variables  
- ▶️ Running the Application  
- 🔑 Authentication  
- 🌐 API Base URL  
- ❗ Error Responses  

---

## 📌 Project Overview  

AquaChamp teaches children about:

- 🧼 Handwashing and personal hygiene  
- 🚰 Safe drinking water  
- 🚽 Toilet and sanitation practices  
- 🗑️ Waste disposal and environmental hygiene  

### 🎯 Learning Methods  

- 🎮 Mini-games and challenges  
- 📝 Quizzes and assessments  
- 🏆 Rewards, badges, and leaderboards  
- 📊 Progress tracking  
- 🔥 Daily login streak system  
- 📒 Hygiene & water tracking  

---

## 🛠️ Tech Stack  

### 🔙 Backend  
- Node.js – Runtime environment  
- Express.js – Web framework  
- MongoDB – Database  
- Mongoose – ODM  
- JWT – Authentication  
- bcryptjs – Password hashing  

### 🎨 Frontend  
- React – UI library  
- Vite – Build tool  
- React Router – Routing  
- Axios – HTTP client  
- Tailwind CSS – Styling  
- Lottie – Animations  

---

## 👥 Team Members & Components  

| Member   | Component | Description |
|----------|----------|------------|
| Amasha   | Daily Activity Tracker | Water usage tracking, activity points |
| Dushani  | Gamification & Rewards | Badges, leaderboard, levels |
| Kaveesha | Lessons & Progress | Lesson management & tracking |
| Dilshara | Games & Assessments | Quizzes, true/false, scoring |

---

## 📂 Project Structure  
AquaChamp/
│
├── server/
│ ├── config/ # Database configuration
│ ├── controllers/ # Route controllers
│ ├── middleware/ # Authentication middleware
│ ├── models/ # Mongoose models
│ ├── routes/ # API routes
│ ├── index.js # Server entry point
│ └── package.json
│
├── client/
│ ├── src/
│ │ ├── components/ # UI components
│ │ ├── pages/ # Page components
│ │ ├── services/ # API calls
│ │ └── main.jsx # Entry point
│ └── package.json
│
└── README.md


---

## ✅ Prerequisites  

Before starting, install:

Node.js (v18+)
npm
MongoDB (v6+)
Git


---

# ⚙️ Backend Setup  

### ➤ Step 1: Navigate  

```bash
cd server
▶️ Running the Application

🔑 Authentication

🌐 API Base URL

❗ Error Responses

📌 Project Overview

AquaChamp teaches children about:

🧼 Handwashing and personal hygiene

🚰 Safe drinking water

🚽 Toilet and sanitation practices

🗑️ Waste disposal and environmental hygiene

Using:

🎮 Mini-games and challenges

📝 Games and assessments

🏆 Rewards, badges, and leaderboards

📊 Progress tracking and lesson completion

🔥 Daily login rewards and streak tracking

📒 Hygiene and water tracker

🛠️ Tech Stack
🔙 Backend

Node.js – Runtime environment

Express.js – Web framework

MongoDB – Database

Mongoose – ODM for MongoDB

JWT – Authentication

bcryptjs – Password hashing

🎨 Frontend

React – UI library

Vite – Build tool

React Router – Routing

Axios – HTTP client

Tailwind CSS – Styling

Lottie – Celebration animations

👥 Team Members & Components
Member	Component	Description
Amasha	Daily Activity Tracker	Water usage tracker, completed activity points, motivational quotes
Dushani	Gamification & Rewards	Badges, leaderboard, daily login points, level system, Lottie animations
Kaveesha	Lessons & Progress Tracking	Lesson management, lesson completion, progress monitoring
Dilshara	Games & Assessments	Educational games, true/false assessments, score and result tracking

✅ Prerequisites

Before you begin, ensure you have the following installed:

🟢 Node.js (v18 or higher)

📦 npm

🗄️ MongoDB (v6 or higher)

🌱 Git

⚙️ Backend Setup
➤ Step 1: Navigate to Server Directory
cd server
➤ Step 2: Install Dependencies
npm install
➤ Step 3: Configure Environment Variables

Create a .env file in the server directory.

➤ Step 4: Start the Server
npm run dev
🎨 Frontend Setup
➤ Step 1: Navigate to Client Directory
cd client
➤ Step 2: Install Dependencies
npm install
➤ Step 3: Environment Variables (Optional)
VITE_API_URL=http://localhost:4000
➤ Step 4: Start the Frontend
npm run dev
🗄️ MongoDB Database Setup
🖥️ Option 1: Local MongoDB
☁️ Option 2: MongoDB Atlas (Cloud)
🔐 Environment Variables
PORT=4000
NODE_ENV=development
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:4000
▶️ Running the Application
🧪 Development Mode
🚀 Production Mode
🔑 Authentication
Authorization: Bearer <your_jwt_token>
🌐 API Base URL
http://localhost:4000
❗ Error Responses
Status	Meaning
400	Bad Request
401	Unauthorized
403	Forbidden
404	Not Found
500	Internal Server Error
{
  "message": "Error description here"
}
