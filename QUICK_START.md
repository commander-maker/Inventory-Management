# 🚀 Quick Start - User Management System

## Start Servers

```bash
# Terminal 1 - Backend
cd Backend
npm run dev
# ✅ Backend running on port 5000

# Terminal 2 - Frontend  
cd Frontend
npm run dev
# ✅ Frontend on http://localhost:3000
```

## Create First Admin

**Using Postman/Thunder Client:**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@aquatrack.com",
  "password": "Admin@123",
  "role": "admin",
  "phone": "+91 98765 00000"
}
```

## Login & Test

1. **Open:** http://localhost:3000/login
2. **Login:**
   - Email: `admin@aquatrack.com`
   - Password: `Admin@123`
3. **Go to Users** (sidebar)
4. **Click "Add User"**
5. **Fill form and submit**
6. **See auto-generated password in alert!** ✨

---

## Quick Tests

### ✅ Login Works
- Correct credentials → Redirect to Finance
- Wrong credentials → Error message

### ✅ User Management Works
- **Create:** Shows password alert → User in list
- **Edit:** Click Edit → Make changes → Saves
- **Delete:** Click Delete → Confirm → Removed
- **Search:** Type name/email → Filters instantly

### ✅ Email Works (Optional)
1. Update `Backend/.env`:
   ```
   EMAIL_USER="your@gmail.com"
   EMAIL_PASSWORD="app-password"
   ```
2. Restart backend
3. Create user with YOUR email
4. Check inbox! 📧

---

## Files to Check

- **Backend:** Backend/src/services/user.service.js
- **Frontend:** Frontend/src/pages/User/User_management.jsx
- **API Docs:** Backend/API_DOCUMENTATION.md
- **Full Guide:** Backend/IMPLEMENTATION_GUIDE.md

---

## Need Help?

**Error?** → Check browser console (F12)
**Not working?** → Verify backend is running
**Email fails?** → User creation still works!

**You're all set!** 🎉
