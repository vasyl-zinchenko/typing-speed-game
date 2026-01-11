# Type Quest - Typing Speed Game

A multiplayer typing speed game built with TypeScript, Express, Socket.io, and Vite.

## 🚀 Quick Start

### Development

```bash
npm install
npm run dev
```

Open **`http://localhost:5173/`** in your browser.

### Production

```bash
npm install
npm run build
npm start
```

Open **`http://localhost:3333/`** in your browser.

## 📁 Project Structure

```
├── client/          # Frontend (Vite + TypeScript)
│   ├── src/         # TypeScript source files
│   └── *.html       # HTML pages
├── server/          # Backend (Express + Socket.io)
├── public/          # Static assets (styles, images)
└── dist/            # Production build output
```

## 🛠️ Scripts

| Command                | Description                                 |
| ---------------------- | ------------------------------------------- |
| `npm run dev`          | Start development servers (client + server) |
| `npm run build`        | Build for production                        |
| `npm start`            | Start production server                     |
| `npm run format:check` | Check code formatting                       |
| `npm run format:fix`   | Fix code formatting                         |

## 🎮 How to Play

1. Enter your username on the login page
2. Create a new room or join an existing one
3. Click "READY" when you're ready to play
4. Type the displayed text as fast as you can!
5. First player to finish wins

## 🔧 Technologies

- **Frontend**: TypeScript, Vite, HTML, CSS
- **Backend**: Node.js, Express, Socket.io
- **Build**: Vite, TypeScript Compiler
