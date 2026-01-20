// Database connection (Prisma or pg)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
