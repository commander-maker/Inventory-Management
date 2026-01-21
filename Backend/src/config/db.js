// Database connection (Prisma or pg)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Test database connection
(async () => {
  try {
    await prisma.$connect();
    console.log('Database Connected...');
  } catch (error) {
    console.error('Database Connection Error:', error.message);
  }
})();

export default prisma;
