# Micro-Mentor AI

Micro-Mentor AI is a web application that provides quick, AI-generated advice based on user-submitted challenges. It helps users get instant guidance in various areas of life, such as productivity, business, and personal growth.

## 🚀 Live Demo
Check out the live app here: [Micro-Mentor AI](https://micro-mentor.netlify.app/)

## 📌 Features
- Users can enter a challenge or problem and receive AI-generated advice.
- AI-generated responses powered by Google's Gemini API.
- Simple, clean, and responsive user interface.
- Deployed backend and frontend using **Render** and **Netlify**.

## 🛠️ Tech Stack
**Frontend:**
- HTML, CSS, JavaScript
- Hosted on **Netlify**

**Backend:**
- Node.js, Express.js
- AI integration using **Google's Gemini API**
- Hosted on **Render**

## ⚡ How to Run Locally
Follow these steps to run the project on your local machine.

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/patrickthe1/micro-mentor-ai.git
cd micro-mentor-ai
```

### 2️⃣ Install Dependencies
For backend:
```bash
cd backend
npm install
```
For frontend (if needed):
```bash
cd frontend
npm install
```

### 3️⃣ Set Up Environment Variables
Create a `.env` file in the `backend` folder and add your API key:
```env
PORT=5000
GOOGLE_GEMINI_API_KEY=your_api_key_here
```

### 4️⃣ Run the Backend Server
```bash
cd backend
npm start
```
The server should start on `http://localhost:5000`.

### 5️⃣ Open the Frontend
Simply open the `index.html` file in your browser or use a local server.

## 🌍 API Endpoints
### POST `/api/advice`
**Request Body:**
```json
{
  "challenge": "I want to be more productive."
}
```
**Response:**
```json
{
  "advice": "Focus on deep work sessions, eliminate distractions, and set clear goals."
}
```

## 🤝 Contributing
Want to improve Micro-Mentor AI? Feel free to fork this repo, make changes, and submit a pull request!

## 📝 License
This project is open-source and available under the MIT License.

---
Developed with passion by **Patrick Mugisha** 🚀

