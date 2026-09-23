# AquaTrack Pro

AquaTrack Pro is an inventory, delivery, finance, and vehicle-management system with:

- React frontend
- Node.js and Express backend
- PostgreSQL database hosted on Neon
- Flutter mobile application for delivery agents

## Project Structure

```text
Frontend/       React and Vite web application
Backend/        Express API and Prisma database access
aqua_mobile/    Flutter mobile application
docker-compose.yml  Local Docker deployment
```

## Production Deployment

### Frontend: Vercel

The frontend API URL is configured through `VITE_API_URL`.

Vercel environment variable:

```text
VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com/api
```

The variable is read in `Frontend/src/utils/api.js` and is embedded during the Vite build. Redeploy Vercel after changing it.

### Backend: Render

The backend starts with:

```text
npm install
npm start
```

Recommended Render environment variables:

```text
DATABASE_URL=YOUR-NEON-DATABASE-URL
JWT_SECRET=YOUR-STRONG-JWT-SECRET
NODE_ENV=production
EMAIL_USER=YOUR-EMAIL-ADDRESS
EMAIL_PASSWORD=YOUR-EMAIL-APP-PASSWORD
FRONTEND_URL=https://YOUR-VERCEL-DOMAIN.vercel.app
```

Render provides the `PORT` variable automatically. The server listens on `process.env.PORT` in `Backend/src/server.js`.

Useful backend URLs:

```text
https://YOUR-RENDER-SERVICE.onrender.com/
https://YOUR-RENDER-SERVICE.onrender.com/api
https://YOUR-RENDER-SERVICE.onrender.com/api/health
```

### Database: Neon

Prisma reads the database connection from `DATABASE_URL`.

Configuration files:

- `Backend/prisma.config.ts`
- `Backend/prisma/schema.prisma`
- `Backend/src/config/db.js`

Set the Neon connection string only in Render's environment variables and local `Backend/.env`. Never place it in the frontend.

## Local Development

### Backend

```powershell
cd Backend
npm install
npm run dev
```

The local backend normally runs at:

```text
http://localhost:5000
```

### Frontend

```powershell
cd Frontend
npm install
npm run dev
```

The local frontend normally runs at:

```text
http://localhost:5173
```

For local development, `Frontend/.env` can contain:

```text
VITE_API_URL=http://localhost:5000/api
```

### Flutter Mobile App

The Android phone must use the computer's local network IP instead of `localhost`:

```text
http://YOUR-COMPUTER-LAN-IP:5000/api
```

Update the API base URL in `aqua_mobile/lib/services/api_service.dart` and keep the phone and computer on the same Wi-Fi network.

## Docker Compose

Run the local PostgreSQL, backend, and Nginx frontend stack with:

```powershell
docker compose up --build
```

Docker uses a local PostgreSQL database and the Nginx configuration in `Frontend/nginx.conf` proxies `/api` requests to the backend container.

## Security Notes

- Never commit `.env` files.
- Never expose `DATABASE_URL`, `JWT_SECRET`, email passwords, or database credentials in frontend code.
- Rotate any credential that has been exposed publicly.
- Use a strong production JWT secret.
- Use a Gmail App Password or another secure mail provider credential for email delivery.

## Health Check

After deployment, open:

```text
https://YOUR-RENDER-SERVICE.onrender.com/api/health
```

A successful response confirms that the backend is running.
