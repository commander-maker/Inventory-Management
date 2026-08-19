import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true } });
console.log(JSON.stringify(users, null, 2));
await prisma.$disconnect();
