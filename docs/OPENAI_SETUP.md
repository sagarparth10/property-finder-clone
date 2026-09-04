# 🔑 How to Get OpenAI API Key

## Step-by-Step Guide

### 1. Sign Up / Login

1. Go to: **https://platform.openai.com/**
2. Click **Sign up** (or **Log in** if you have an account)
3. Use your email or Google/Microsoft account

### 2. Add Payment Method

**Do you need a subscription?**
- ❌ **NO subscription required**
- ✅ **You pay for what you use** (pay-as-you-go)
- 💰 **Free credits provided**: $5 or $18 free credits for new accounts
- 📊 **Usage is tracked in dollars spent** (not credits)

**Steps:**
1. Click on your profile icon (top right)
2. Go to **Settings**
3. Click **Billing**
4. Click **Add payment method**
5. Add your credit/debit card
6. Set usage limits (optional but recommended)

**⚠️ Important**: Enable usage limits to prevent unexpected charges!

### 3. Create API Key

1. Go to: **https://platform.openai.com/api-keys**
2. Click **Create new secret key**
3. Give it a name (e.g., "Property Finder Dev")
4. Click **Create secret key**
5. **⚠️ Copy the key immediately** - you won't see it again!

**Example key format:**
```
sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

### 4. Add to Your Project

**Backend (`backend/.env`):**
```env
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_OPENAI_API_KEY=sk-proj-your-actual-key-here
```

---

## 💰 OpenAI Pricing (as of 2024)

### GPT-4 Turbo:
- **Input**: $10 per 1M tokens (~$0.01 per 1000 tokens)
- **Output**: $30 per 1M tokens (~$0.03 per 1000 tokens)

### GPT-3.5 Turbo (cheaper option):
- **Input**: $0.50 per 1M tokens
- **Output**: $1.50 per 1M tokens

### Typical Usage in Property Finder:
- **AI Avatar chat**: ~2,000 tokens per conversation
- **Property recommendations**: ~5,000 tokens per query
- **Cost**: ~$0.10-0.30 per 100 conversations

**Example monthly cost for Property Finder:**
- 1,000 AI conversations/month = **$1-3**
- 10,000 conversations/month = **$10-30**

---

## 🎁 Free Credits

### For New Users:
- ✅ **$5 free credits** on some accounts
- ✅ **$18 free credits** on others (depends on region)

### How to Check Your Balance:
1. Go to: **https://platform.openai.com/usage**
2. See current usage and remaining credits

### Free Credits Are Sufficient For:
- ✅ Testing the application
- ✅ Development work
- ✅ Small-scale demos
- ✅ Learning purposes
- ❌ Not for production with high traffic

---

## 🔧 Setup Usage Limits (Highly Recommended!)

**Why?** To prevent unexpected charges.

1. Go to **https://platform.openai.com/account/billing/limits**
2. Set **Soft limit**: $5 (warns you at this amount)
3. Set **Hard limit**: $10 (stops API calls at this amount)
4. Enable **Email notifications**

This way, you'll never be surprised by charges!

---

## 💡 Tips to Minimize Costs

### 1. Use GPT-3.5 for Development
```typescript
// In ai.service.ts, change:
model: 'gpt-3.5-turbo'  // Much cheaper than GPT-4
```

### 2. Cache Responses
```typescript
// Store common queries
const cache = new Map();
```

### 3. Optimize Prompts
- Be specific in your prompts
- Set `max_tokens` limit
- Use `temperature: 0` for consistent responses

### 4. Monitor Usage
- Check usage daily at https://platform.openai.com/usage
- Set up billing alerts
- Review which features cost the most

---

## 🧪 Test Your API Key

Once you've added your key, test it:

```bash
# Using curl
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Or test in your app:
```typescript
// In your code
const response = await this.openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

---

## 🔒 Security Best Practices

1. ✅ **Never commit API keys to Git** (already gitignored)
2. ✅ **Use different keys** for dev/staging/production
3. ✅ **Rotate keys regularly** (every 3-6 months)
4. ✅ **Set hard usage limits**
5. ✅ **Monitor usage daily**
6. ❌ **Don't share keys** publicly
7. ❌ **Don't hardcode in frontend** (use backend)

---

## 📊 How OpenAI Billing Works

### Billing Cycle:
- **Invoice date**: Monthly on the day you signed up
- **Auto-charge**: At end of billing cycle
- **Minimum charge**: $0 (no minimum)

### Payment Methods:
- ✅ Credit/Debit cards
- ✅ Wire transfer (enterprise)
- ✅ PayPal (some regions)

### Pricing Examples:

| Usage | GPT-4 Cost | GPT-3.5 Cost |
|-------|------------|--------------|
| 1,000 messages | $0.20 | $0.05 |
| 10,000 messages | $2.00 | $0.50 |
| 100,000 messages | $20.00 | $5.00 |

---

## 🆓 Free Alternatives (If You Don't Want to Pay)

### 1. Run Without AI Features
Your app will work without OpenAI, just without:
- ❌ AI Avatar chat
- ❌ AI property recommendations
- ❌ Auto-generated descriptions

### 2. Use Local Models (Advanced)
- **Ollama**: Run LLMs locally (free but slow)
- **Hugging Face**: Some free models
- Requires powerful hardware

### 3. Mock AI Responses (For Development)
```typescript
// Mock response for development
if (!OPENAI_API_KEY) {
  return "This is a mock AI response for development.";
}
```

---

## 📞 Support

- **OpenAI Docs**: https://platform.openai.com/docs
- **Community**: https://community.openai.com/
- **Pricing Calculator**: https://openai.com/pricing
- **Status**: https://status.openai.com/

---

## ✅ Quick Checklist

- [ ] Created OpenAI account
- [ ] Added payment method
- [ ] Set usage limits ($5 soft, $10 hard)
- [ ] Generated API key
- [ ] Added to `backend/.env`
- [ ] Added to `frontend/.env.local`
- [ ] Tested API connection
- [ ] Monitoring usage daily

**You're all set!** 🚀

