# Environment Files Content

Create these files in your project:

---

## 📁 Backend `.env` file

**Location:** `backend/.env`

**Content:**
```env
# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database (MongoDB)
MONGODB_URI=mongodb://localhost:27017/property-finder

# JWT Authentication (CHANGE THIS!)
JWT_SECRET=your-super-secret-jwt-key-here-min-32-characters

# AI Services (Local Ollama)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
# Optional: customise the concierge tone
# AI_SYSTEM_PROMPT=You are Property Nexus, an AI concierge...

# Optional OpenAI fallback (leave blank if unused)
# OPENAI_API_KEY=

# AWS S3 Configuration (Optional)
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# AWS_S3_BUCKET=
# AWS_REGION=us-east-1

# Environment
NODE_ENV=development
```

---

## 📁 Frontend `.env.local` file

**Location:** `frontend/.env.local`

**Content:**
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

# Map Services (Optional)
NEXT_PUBLIC_MAPBOX_TOKEN=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# AI Services (Optional)
NEXT_PUBLIC_OPENAI_API_KEY=

# Analytics (Optional)
# NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=
```

---

## 🚀 Quick Setup

**Terminal Commands:**

```bash
# Create backend .env
cd backend
@"
PORT=3001
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/property-finder
JWT_SECRET=change-this-to-random-string-minimum-32-chars
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
NODE_ENV=development
"@ | Out-File -FilePath .env -Encoding utf8

# Create frontend .env.local
cd ../frontend
@"
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_OPENAI_API_KEY=
"@ | Out-File -FilePath .env.local -Encoding utf8
```

**Or manually:**

1. Create `backend/.env` file
2. Create `frontend/.env.local` file
3. Copy the content above into each file

---

## ⚙️ Required Configurations

### Minimum for Development:

**Backend:**
- ✅ `JWT_SECRET` - Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

**Frontend:**
- ✅ Already works without API keys (will use mock data)

### Optional but Recommended:

- `OLLAMA_MODEL` / `OLLAMA_BASE_URL` - Configure local LLM provider (defaults to llama3 on localhost)
- `NEXT_PUBLIC_MAPBOX_TOKEN` - For interactive maps
- MongoDB running on localhost:27017

---

## ✅ After Creating Files

1. Update `JWT_SECRET` with a generated value
2. (Optional) Add `OPENAI_API_KEY` if you want AI features
3. (Optional) Add `NEXT_PUBLIC_MAPBOX_TOKEN` for maps
4. Restart your servers

```bash
# Backend
cd backend && npm run start:dev

# Frontend
cd frontend && npm run dev
```

