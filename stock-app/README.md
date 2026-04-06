# 📊 Stock Dashboard App

A real-time stock dashboard built using **Angular + Node.js WebSocket**, supporting both **mock data** and **live API fallback**.

---

## 🚀 Features

- 📡 Real-time stock updates using WebSocket
- 🔁 Automatic fallback to mock data if API fails
- 📈 Trend detection (Up 🔼 / Down 🔽 / Same ➖)
- 🎨 Dynamic UI color updates (Green / Red / Grey)
- 🔘 Toggle ON/OFF for each stock
- 📱 Responsive design (Mobile + Desktop)

---

## 🛠️ Tech Stack

- **Frontend:** Angular
- **Backend:** Node.js (WebSocket)
- **Language:** TypeScript, JavaScript
- **Styling:** CSS

---

## 📁 Project Structure
stock-app/
│
├── src/app/ # Angular app
├── server/ # Node WebSocket server
├── README.md

## ⚙️ Setup Instructions

### Run app - backend
cd stock-app/server
npm install
node server.js

### Run app - frontend
cd stock-app
npm install
npm start

### Run app - backend
cd server
npm install
node server.js

### 🔹Clone Repository

```bash
git clone <your-repo-url>
cd stock-app

```
-----
## Data Flow
WebSocket Server → Angular Service → Component → UI

* Backend pushes stock data every few seconds
* Angular service listens via WebSocket
* Component updates UI with trend + color