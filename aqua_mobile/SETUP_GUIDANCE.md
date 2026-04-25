# 📱 Mobile App Setup Guide (Flutter)

This is the mobile application for the **Inventory & Finance Management System**.
It connects to the existing backend API.

---

## 🚀 Requirements

* Flutter SDK installed
* Android Studio / VS Code
* Android Emulator or Physical Device

---

## ⚙️ Setup Steps

1. **Clone the repository**

```bash
git clone <repo-url>
cd "Software Project/MobileApp"
```

2. **Install dependencies**

```bash
flutter pub get
```

3. **Configure API Base URL**

Open:

```
lib/services/api_service.dart
```

Set the correct backend URL:

* **Android Emulator:**

```
http://10.0.2.2:5000/api
```

* **Real Device (same WiFi):**

```
http://YOUR_PC_IP:5000/api
```

---

4. **Run the app**

```bash
flutter run
```

---

## ⚠️ Notes

* Backend must be running before starting the app
* Ensure phone & PC are on same network (for real device testing)
* Do NOT use `localhost` in mobile

---

## 👨‍💻 Tech Stack

* Flutter (UI)
* Node.js + Express (Backend)
* PostgreSQL (Database)

---

## 📌 Status

* API connection setup ✅
* Authentication integration in progress

---
