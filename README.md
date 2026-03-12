<div align="center">

  <!-- Top Banner -->
  <img src="https://capsule-render.vercel.app/api?type=waving&color=00c6ff&height=250&section=header&text=Stream-X%20Pro&fontSize=80&fontColor=ffffff&desc=Standard%20Online%20Streaming%20Platform&descSize=25&descAlign=50&descAlignY=60" width="100%" alt="Header" />

  <br />
  
  <a href="https://reactjs.org/">
    <img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  </a>
  <a href="https://nodejs.org/">
    <img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  </a>
  <a href="https://www.mongodb.com/">
    <img src="https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  </a>
  <a href="https://socket.io/">
    <img src="https://img.shields.io/badge/Realtime-Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io" />
  </a>
  <a href="https://tailwindcss.com/">
    <img src="https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  </a>

  <br /> <br />

  <h1>🎬 Stream-X: Production Release (RC-1)</h1>
  <p>
    <b>The Ultimate Streaming Solution</b><br> 
    <i>Legal Streaming • Public Domain Archives • Auto-Embed Players • Real-time Sync</i>
  </p>

  <p>
    <a href="#features">Features</a> •
    <a href="#installation">Installation</a> •
    <a href="#structure">Structure</a> •
    <a href="#api">API Documentation</a> •
    <a href="#developer">Developer</a>
  </p>
  
</div>

---

## 🚀 Features

### **🔥 Core Experience**
| Feature | Status | Description |
| :--- | :---: | :--- |
| **Ultra HD Player** | ✅ | Default `autoembed.co` player with multi-source fallback. |
| **Legal Streaming** | ✅ | Integrated `Archive.org` & `Watchmode` APIs for 100% legal content. |
| **Live Sync** | ✅ | `Socket.io` powered real-time library updates across clients. |
| **Smart Auth** | ✅ | Hybrid Login (Legacy Text + Bcrypt Hash Security). |
| **Responsive UI** | ✅ | Glassmorphism design with TailwindCSS. |

### **🛠 Technical Highlights**
*   **Dual-Layer Authentication**: Seamlessly supports old test accounts and new encrypted users.
*   **Microservice Architecture**: Specialized services for `TMDB`, `Archive.org`, and `Watchmode`.
*   **Production Ready**: configured `helmet`, `cors`, and environment isolation.

---

## 🛠 Project Structure

```bash
Stream-X/
├── backend/                  # Server-Side Logic (Node/Express)
│   ├── config/               # Database & Env Config
│   ├── models/               # MongoDB Schemas (User, Watchlist)
│   ├── routes/               # API Endpoints (Auth, Movies, Search)
│   ├── services/             # External Integrations (Archive.org, Watchmode)
│   └── server.js             # Entry Point
├── src/                      # Client-Side Logic (React/Vite)
│   ├── components/           # Reusable UI (Navbar, MovieCard)
│   ├── pages/                # Route Views (Home, Player, Login)
│   ├── services/             # Axios API Bridges
│   └── store/                # Zustand State Management
└── public/                   # Static Assets
```

---

## ⚡ Quick Start

### 1. Prerequisites
*   Node.js v18+
*   MongoDB Atlas URI

### 2. Installation
```bash
# Clone and Install Dependencies
git clone https://github.com/yourusername/stream-x.git
cd Stream-X
npm install
cd backend && npm install
```

### 3. Configuration
Create `backend/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
WATCHMODE_KEY=your_watchmode_api_key
TMDB_API_KEY=your_tmdb_key
```

### 4. Run Production Mode
```bash
# From root directory
npm start
```

---

## 👨‍💻 Developer Profile

<div align="center">
  <img src="https://media.giphy.com/media/qgQUggAC3Pfv687qPC/giphy.gif" width="150" />
  <h3>Developed by Salahuddin</h3>
  <p><i>Full Stack MERN Developer • Creative Coder • API Specialist</i></p>
  
  <a href="https://github.com/">
    <img src="https://img.shields.io/badge/GitHub-Profile-181717?style=social&logo=github" alt="GitHub" />
  </a>
  <a href="https://linkedin.com/">
    <img src="https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=social&logo=linkedin" alt="LinkedIn" />
  </a>
</div>

---

## 🛡 License & Legal

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for full terms.

Stream-X aggregates content metadata from **TMDB**, streams from **Internet Archive** (public domain) and **VidSrc** embeds, and legal provider links from **Watchmode**. Use responsibly and always support official streaming platforms.

---

## 🔒 Security

Found a vulnerability? See [SECURITY.md](SECURITY.md) for responsible disclosure guidelines.

Key protections: bcryptjs hashing · JWT auth · Input validation · Proxy whitelist · `.env` never committed

---

## 🤝 Contributing

Read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

1. Fork → `git checkout -b feat/your-feature` → commit → Pull Request

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=00c6ff&height=150&section=footer&text=Thanks%20for%20Visiting&fontSize=40&fontColor=ffffff" width="100%" />
</div>
