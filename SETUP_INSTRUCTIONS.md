# 🚀 How to Run the Property Finder Clone App

## Step-by-Step Setup Instructions

### 1. Install Prerequisites

Make sure you have these installed:

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Install MongoDB (if not installed)
# Download from: https://www.mongodb.com/try/download/community
```

### 2. Install Dependencies

Open two terminals:

**Terminal 1 - Install Frontend:**
```bash
cd frontend
npm install
```

**Terminal 2 - Install Backend:**
```bash
cd backend
npm install
```

### 3. Create Environment Files

**Create `frontend/.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

**Create `backend/.env`:**
```env
PORT=3001
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/property-finder
JWT_SECRET=your-super-secret-jwt-key-change-in-production
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
NODE_ENV=development
```

### 4. Start MongoDB & Ollama

**MongoDB (Windows):**
```bash
# Open MongoDB as a service or run:
mongod
```

**MacOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Ollama (local LLM runtime):**
```bash
# Install from https://ollama.com/download (if not already installed)
ollama serve

# In a separate terminal, pull and run a model (example: llama3)
ollama pull llama3
ollama run llama3
```
Ensure `OLLAMA_MODEL` matches the model name you pulled.

### 5. Run the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run start:dev
```

You should see:
```
🚀 Server running on http://localhost:3001
📚 Swagger docs available at http://localhost:3001/api
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- Local:        http://localhost:3000
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api

### Optional: API & Token Integrations

- **Mapbox Token** – https://account.mapbox.com/access-tokens/
- **(Optional) OpenAI Key** – Only needed if you plan to switch the AI provider away from Ollama. Add `OPENAI_API_KEY` to `backend/.env` if required.

## Optional: Get API Keys

### OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Sign up/Login
3. Create a new secret key
4. Add to both `.env` files

### Mapbox Token
1. Go to https://account.mapbox.com/access-tokens/
2. Create a new token
3. Add to `frontend/.env.local`

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000 or 3001
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

### MongoDB Not Starting
```bash
# Check if MongoDB is running
mongosh
# or
mongo

# If not, manually start:
mongod --dbpath=/path/to/data
```

### Module Not Found
```bash
# Clean install
cd frontend && rm -rf node_modules package-lock.json && npm install
cd ../backend && rm -rf node_modules package-lock.json && npm install
```

### TypeScript Errors
```bash
# Generate type definitions
cd frontend && npm run type-check
```

## Development Commands

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run linter
```

### Backend
```bash
npm run start:dev    # Start with hot reload
npm run build        # Build for production
npm run start:prod   # Start production
npm test             # Run tests
```

## Quick Start (Copy & Paste)

```bash
# 1. Install dependencies
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# 2. Start MongoDB (in separate terminal)
mongod

# 3. Start backend (Terminal 1)
cd backend && npm run start:dev

# 4. Start frontend (Terminal 2)
cd frontend && npm run dev

# 5. Open browser
# http://localhost:3000
```

## Need Help?

- 📚 See `docs/SETUP.md` for detailed setup
- 📖 Read `README.md` for project overview
- 🏗️ Check `docs/ARCHITECTURE.md` for system design

