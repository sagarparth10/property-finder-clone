# How to Create a JWT Secret Key

A JWT (JSON Web Token) secret is used to sign and verify authentication tokens. It should be:
- **Random**: Use cryptographically secure random generation
- **Long**: At least 32 characters (64+ recommended)
- **Secret**: Never commit to version control (already in .gitignore)

---

## Method 1: Generate Using Node.js (Recommended)

Run this command in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Output example:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2
```

Copy this entire string as your JWT_SECRET.

---

## Method 2: Generate Using OpenSSL

If you have OpenSSL installed:

```bash
openssl rand -hex 64
```

---

## Method 3: Generate Using PowerShell (Windows)

Run this in PowerShell:

```powershell
$bytes = New-Object Byte[] 64
[System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
[System.BitConverter]::ToString($bytes).Replace("-", "").ToLower()
```

---

## Method 4: Online Generator (If needed)

You can use online tools like:
- **https://randomkeygen.com/**
- **https://www.uuidgenerator.net/**

Generate a 64-character random string.

---

## How to Use in Your Project

### For Development (backend/.env):

```env
JWT_SECRET=your-generated-secret-key-here-minimum-32-characters
```

### Example:

```env
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2
```

---

## Quick Setup Script

Create a file `generate-jwt-secret.js` in your backend folder:

```javascript
const crypto = require('crypto');

const secret = crypto.randomBytes(64).toString('hex');
console.log('\n🔑 Your JWT Secret Key:\n');
console.log(secret);
console.log('\n✅ Add this to your .env file as:');
console.log(`JWT_SECRET=${secret}\n`);
```

Then run:
```bash
node generate-jwt-secret.js
```

---

## Security Best Practices

1. ✅ **Use a long secret** (64+ characters)
2. ✅ **Keep it in .env file** (already gitignored)
3. ✅ **Use different secrets** for dev/staging/production
4. ✅ **Never commit secrets** to git
5. ❌ **Don't use simple strings** like "secret" or "password"

---

## Example Setup

After generating your secret:

1. Open `backend/.env` file
2. Add your generated key:

```env
# .env file
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2
```

3. Save the file
4. Restart your backend server

---

## Verify It's Working

After setting up your JWT_SECRET, test authentication:

```bash
# Try to login via API
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

You should receive a JWT token if authentication succeeds.

