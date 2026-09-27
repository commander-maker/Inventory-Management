// Database connection (Prisma or pg)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const connectWithRetry = async (attempt = 1) => {
  try {
    await prisma.$connect();
    console.log('Database Connected...');
  } catch (error) {
    const maxAttempts = 5;

    if (attempt >= maxAttempts) {
      console.error(`Database Connection Error after ${maxAttempts} attempts:`, error.message);
      return;
    }

    const delay = Math.min(attempt * 2000, 8000);
    console.error(`Database connection attempt ${attempt} failed. Retrying in ${delay / 1000}s...`);
    setTimeout(() => connectWithRetry(attempt + 1), delay);
  }
};

connectWithRetry();

export default prisma;
