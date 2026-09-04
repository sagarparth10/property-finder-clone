# How to Use OpenAI API Key Safely

## ⚠️ Important Security Rule

**NEVER expose your OpenAI API key to the frontend/browser!**

## 🔒 Correct Setup

### Backend (Use the key here)
**File:** `backend/.env`
```env
OPENAI_API_KEY=sk-your-actual-key-here
```

### Frontend (Leave empty or don't use)
**File:** `frontend/.env.local`
```env
NEXT_PUBLIC_OPENAI_API_KEY=  # Leave EMPTY or don't add it
```

## 🏗️ How It Should Work

```
Frontend (Browser)
   ↓
Calls /api/v1/ai/chat endpoint
   ↓
Backend (Server)
   ↓
Uses OPENAI_API_KEY securely
   ↓
Calls OpenAI API
   ↓
Returns response to Frontend
```

## ✅ Correct Architecture

### 1. Frontend Calls Backend API

**Frontend code:**
```typescript
// src/utils/api.ts
await axios.post('http://localhost:3001/api/v1/ai/chat', {
  message: userMessage
});
```

### 2. Backend Uses OpenAI Key

**Backend code:**
```typescript
// backend/src/modules/ai/ai.service.ts
const response = await this.openai.chat.completions.create({
  apiKey: process.env.OPENAI_API_KEY, // ✅ Secret
  model: 'gpt-4',
  messages: [...]
});
```

## ❌ What NOT to Do

### DON'T: Use key in frontend

```typescript
// ❌ NEVER DO THIS
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  headers: {
    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}` // ❌ EXPOSED!
  }
});
```

## 📝 Setup Summary

### Step 1: Get ONE OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create ONE key
3. Copy it

### Step 2: Add to BACKEND only

**`backend/.env`:**
```env
OPENAI_API_KEY=sk-proj-your-key-here
```

### Step 3: DON'T add to Frontend

**`frontend/.env.local`:**
```env
# Leave NEXT_PUBLIC_OPENAI_API_KEY empty or remove it
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🎯 Why This Architecture?

1. **Security**: API key stays on server
2. **Control**: You can rate limit, log, modify requests
3. **Cost Control**: Track usage, add caching
4. **Best Practice**: Server-side API keys only

## ✅ Current Project Setup

Your project is already set up correctly:

- ✅ Backend uses `OPENAI_API_KEY` from `.env`
- ✅ Frontend calls backend API (not OpenAI directly)
- ✅ AI service is in backend module

## 🔍 Verify Your Setup

### Check backend controller:

```typescript
// backend/src/modules/ai/ai.controller.ts
async chat(@Body() body: { message: string }) {
  return this.aiService.chat(body.message); // ✅ Uses backend key
}
```

### Check frontend API client:

```typescript
// frontend/src/utils/api.ts
export const aiAPI = {
  chat: async (message: string) => {
    return apiClient.post('/ai/chat', { message }); // ✅ Calls backend
  }
};
```

---

## 📊 Summary

| Component | Has Key? | Usage |
|-----------|----------|-------|
| Backend | ✅ Yes | Calls OpenAI API |
| Frontend | ❌ No | Calls backend API |

**One key, used on backend only!**

