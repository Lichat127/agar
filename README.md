# **Agar.io Clone** 🎮✨

A simplified *Agar.io* clone built with **React** for the front-end and **Node.js** (with Socket.io) for the back-end. This project uses a mono-repo structure to manage both the client and server efficiently.

---

## **Table of Contents** 📚
1. [Introduction](#introduction)
2. [Technologies](#technologies)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Getting Started](#getting-started)

---

## **Introduction** 🌟
This is a simplified implementation of *Agar.io*, enabling multiple players to connect to a shared map, move around, and interact in real time. The main player is controlled via the mouse and grows by consuming food.

---

## **Technologies** 💻
- **Frontend:**
  - React
  - Socket.io-client (for real-time communication)

- **Backend:**
  - Node.js
  - Express (HTTP server)
  - Socket.io (WebSocket communication)

---

## **Prerequisites** ✅
- Node.js (v16 or higher)
- npm (v8 or higher)

## **Installation** ⚙️

1. Clone the repository:
```bash
git clone https://github.com/your-username/my-agario-clone.git
cd my-agario-clone
```

2. Install dependencies:

Backend:
```bash
cd backend
npm install
```
Frontend:
```bash
cd ../frontend
npm install
```

## **Getting Started** 🚀
```bash
npm start
```

The backend will run on http://localhost:3000 by default.

## **Test the Connection**
- Open the React application in your browser.
- Move your mouse to control the main player.
- Check the backend terminal to verify that data is being received in real time.

