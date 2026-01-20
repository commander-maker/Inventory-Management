# AquaTrack Backend API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication Endpoints

### 1. Login
**POST** `/auth/login`

Request Body:
```json
{
  "email": "admin@aquatrack.com",
  "password": "your-password"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@aquatrack.com",
      "role": "admin",
      "phone": "+91 98765 00000"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Register (Manual - for testing)
**POST** `/auth/register`

Request Body:
```json
{
  "name": "Test Admin",
  "email": "test@aquatrack.com",
  "password": "Test@123",
  "role": "admin",
  "phone": "+91 98765 00000"
}
```

---

## User Management Endpoints
**Note:** All user endpoints require authentication. Include token in headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### 1. Get All Users
**GET** `/users`

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Admin User",
      "email": "admin@aquatrack.com",
      "role": "admin",
      "phone": "+91 98765 00000",
      "vehicle": null,
      "monthlySales": null,
      "joinedDate": "2024-03-15T00:00:00.000Z"
    }
  ]
}
```

### 2. Get User By ID
**GET** `/users/:id`

Example: `/users/1`

### 3. Create New User (Admin adds user)
**POST** `/users`

Request Body:
```json
{
  "name": "Rajesh Kumar",
  "email": "rajesh@aquatrack.com",
  "role": "agent",
  "phone": "+91 98765 43210",
  "vehicle": "GJ-01-AB-1234"
}
```

Response:
```json
{
  "success": true,
  "message": "User created successfully. Password sent to email.",
  "data": {
    "id": 2,
    "name": "Rajesh Kumar",
    "email": "rajesh@aquatrack.com",
    "role": "agent",
    "phone": "+91 98765 43210",
    "vehicle": "GJ-01-AB-1234",
    "temporaryPassword": "aB3$xYz9Kp2!"
  }
}
```

**Note:** The `temporaryPassword` is returned in the response so the admin can see it. It's also sent to the user's email automatically.

### 4. Update User
**PUT** `/users/:id`

Request Body (all fields optional):
```json
{
  "name": "Rajesh Kumar Updated",
  "email": "rajesh.new@aquatrack.com",
  "role": "agent",
  "phone": "+91 98765 99999",
  "vehicle": "GJ-01-CD-5678",
  "monthlySales": 125000.50
}
```

### 5. Delete User
**DELETE** `/users/:id`

Response:
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### 6. Update Password (User changes their own password)
**PUT** `/users/password/update`

Request Body:
```json
{
  "oldPassword": "aB3$xYz9Kp2!",
  "newPassword": "MyNewSecure@Pass123"
}
```

---

## Testing the API

### Using Postman or Thunder Client:

1. **First, create an admin user:**
```
POST http://localhost:5000/api/auth/register
Body: {
  "name": "Admin User",
  "email": "admin@aquatrack.com",
  "password": "Admin@123",
  "role": "admin",
  "phone": "+91 98765 00000"
}
```

2. **Login to get token:**
```
POST http://localhost:5000/api/auth/login
Body: {
  "email": "admin@aquatrack.com",
  "password": "Admin@123"
}
```

3. **Copy the token from response**

4. **Test creating a user (add token to headers):**
```
POST http://localhost:5000/api/users
Headers: {
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
Body: {
  "name": "Test Agent",
  "email": "agent@test.com",
  "role": "agent",
  "phone": "+91 98765 11111",
  "vehicle": "GJ-01-AB-1234"
}
```

---

## Email Configuration

To enable email sending:

1. **For Gmail:**
   - Go to https://myaccount.google.com/apppasswords
   - Create an App Password
   - Update `.env` file:
     ```
     EMAIL_USER="your-email@gmail.com"
     EMAIL_PASSWORD="your-16-digit-app-password"
     ```

2. **For Other Email Services:**
   - Update `src/services/email.service.js`
   - Change the `service` field to your provider
   - Or use custom SMTP settings

---

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error message here"
}
```

Common status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Server Error
