// App entry point (port listener)
import 'dotenv/config';
import app from "./app.js";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

// Keep the process alive
server.on('listening', () => {
  console.log('Server is listening and ready to accept connections');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Prevent the process from exiting
process.stdin.resume();
