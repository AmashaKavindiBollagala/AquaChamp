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

## 📄 Project Documentation & Reports

📘 **Testing Report**  
👉 [View PDF](https://drive.google.com/file/d/1QEMajkj1CsFyMwfRUgyy23r1ArlnJQYS/view?usp=sharing)

📘 **Deployment Report**  
👉 [View PDF](https://drive.google.com/file/d/1xqzpU3uFYhK1Lq6dBzTHzUiHdFIg91fh/view?usp=sharing)
---

### 🧪 Includes:
- System Testing Report
- Unit Testing Evidence
- API Testing Results
- Project Documentation

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

### 🧑‍💻 Development Team  
## 👥 Team Members & Components  

> 💡 Core development team responsible for building different modules of AquaChamp

---

### 🧑‍💻 Development Team  

| 👤 Member | 🧩 Component | 📌 Description |
|-----------|-------------|----------------|
| **Amasha Bollagala** | 💧 Daily Activity Tracker | Tracks water usage, daily activities, and rewards activity points |
| **Dushani Naveendhya** | 🏆 Gamification & Rewards | Manages badges, leaderboard system, levels, and motivational rewards |
| **Kaveesha Divyanjali** | 📚 Lesson Management System | Admin Lesson Management Dashboard, Student Lesson Learning Dashboard, progress tracking and completion monitoring |
| **Dilshara Thilakarathna** | 🎮 Games & Assessments | Develops quizzes, true/false games, and score evaluation system |

---

### 🌟 Team Contribution Summary  

- 💧 Real-life water & hygiene tracking  
- 📚 Full lesson lifecycle management (Admin + Student)  
- 🎮 Gamified learning experience  
- 📊 Progress tracking & analytics  
- 🧠 Interactive educational assessments  

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

## ⚙️ Setup Instructions  

---

## 1️⃣ Clone Repository  

```bash
git clone https://github.com/your-username/aquachamp.git
cd aquachamp
````

---

## 🔙 Backend Setup

### 📦 Install Dependencies

```bash
cd server
npm install
```

---

### 🔐 Create `.env` File

```env
PORT=4000
NODE_ENV=development
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
MONGO_URI=your_mongodb_connection
```

---

### ▶️ Run Backend

```bash
npm run dev
```

👉 Server running at:
`http://localhost:4000`

---

## 🎨 Frontend Setup

### 📦 Install Dependencies

```bash
cd client
npm install
```

---

### ▶️ Run Frontend

```bash
npm run dev
```

👉 Client running at:
`http://localhost:5173`

---

## 🗄️ MongoDB Setup

### 🖥️ Local Setup

Start MongoDB server:

```bash
mongod
```

👉 This will start the MongoDB service on default port `27017`.

---

### 📂 Connect to MongoDB

Make sure your backend `.env` file includes:

```env
MONGO_URI=mongodb://localhost:27017/your-database-name
```

---

### ▶️ Check if MongoDB is running

```bash
mongo
```

or

```bash
mongosh
```

---

### ☁️ MongoDB Atlas Setup

* Create cluster
* Copy connection string
* Add to `.env`

---

## 🔐 Environment Variables

```env
PORT=4000
NODE_ENV=development
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
MONGO_URI=your_mongodb_connection
```

---

## ▶️ Running the Application

### 🧪 Development Mode

```bash
npm run dev
```

### 🚀 Production Mode

```bash
npm start
```

---

## 🔑 Authentication

All protected APIs require JWT token:

```http
Authorization: Bearer <your_token>
```

---

## 🌐 API Documentation

### 🔹 Base URL

```
http://localhost:4000
```

---

## 🔑 AUTH APIs

### Register User

```http
POST /auth/register
```

```json
{
  "name": "John",
  "email": "john@example.com",
  "password": "123456"
}
```

---

### Login User

```http
POST /auth/login
```

```json
{
  "email": "john@example.com",
  "password": "123456"
}
```

---

## 👤 USER APIs

| Method | Endpoint       |
| ------ | -------------- |
| GET    | /api/users     |
| GET    | /api/users/:id |
| PUT    | /api/users/:id |
| DELETE | /api/users/:id |

---

## 🏆 GAMIFICATION APIs

| Method | Endpoint    |
| ------ | ----------- |
| GET    | /api/badges |
| POST   | /api/badges |
| GET    | /api/points |
| POST   | /api/points |
| GET    | /api/levels |

---

## 📊 PROGRESS APIs

| Method | Endpoint      |
| ------ | ------------- |
| GET    | /api/progress |
| POST   | /api/progress |

---

## 🎮 GAME & QUIZ APIs

| Method | Endpoint   |
| ------ | ---------- |
| GET    | /api/games |
| GET    | /quizzes   |
| POST   | /quizzes   |
| GET    | /truefalse |
| POST   | /truefalse |

---

## 📚 LESSON APIs

| Method | Endpoint               |
| ------ | ---------------------- |
| GET    | /api/topics            |
| POST   | /api/topics            |
| GET    | /api/subtopics         |
| POST   | /api/subtopics         |
| GET    | /api/kaveesha-miniquiz |

---

## 💧 ACTIVITY APIs

| Method | Endpoint        |
| ------ | --------------- |
| GET    | /api/activities |
| POST   | /api/activities |
| GET    | /api/water      |
| POST   | /api/water      |

---

## 📈 ANALYTICS API

| Method | Endpoint       |
| ------ | -------------- |
| GET    | /api/analytics |

---

## 🔒 SECURITY API

| Method | Endpoint      |
| ------ | ------------- |
| POST   | /api/security |

---

## ❗ Error Handling

```json
{
  "message": "Error occurred"
}
```

| Status Code | Meaning               |
| ----------- | --------------------- |
| 400         | Bad Request           |
| 401         | Unauthorized          |
| 403         | Forbidden             |
| 404         | Not Found             |
| 500         | Internal Server Error |

```

```
## 🌟 Project Highlights

💧 AquaChamp is a modern full-stack platform built to promote **safe water education, learning progress tracking, and gamified engagement**.

It combines:
- 📚 Educational content modules  
- 🎮 Interactive quizzes & games  
- 🏆 Gamification system (points, badges, levels)  
- 📊 Progress tracking & analytics  
- 🔐 Secure authentication system  

---

## 🚀 Built With Passion

This project was developed as part of an academic assignment with a focus on:

✔ Real-world full-stack architecture  
✔ Scalable backend design  
✔ Clean UI/UX experience  
✔ RESTful API development  
✔ Testing and quality assurance  

---

## 👨‍💻 Team & Contribution

All contributors worked collaboratively across:

- 🎨 Frontend Development  
- ⚙️ Backend API Development  
- 🗄️ Database Design  
- 🧪 Testing & QA  
- 📄 Documentation  

---

## 💙 Special Thanks

We would like to thank our instructors and peers for their continuous support, feedback, and guidance throughout this project journey.

---

## 📌 Project Status

🚧 Version: 1.0.0  
✅ Backend: Completed  
✅ Frontend: Completed  
🧪 Testing: Completed  
🚀 Deployment: Ready

---

## ⭐ Final Note

If you like this project, feel free to ⭐ the repository and explore the codebase.

> “Small steps in learning today create big waves of knowledge tomorrow.” 🌊
