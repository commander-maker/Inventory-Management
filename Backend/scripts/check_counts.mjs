import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
try {
  const [users, inventory, customers, deliveries, income, expense, recentTransactions] = await Promise.all([
    prisma.user.count(),
    prisma.inventory.count(),
    prisma.customer.count(),
    prisma.deliveryAssignment.count(),
    prisma.income.count(),
    prisma.expense.count(),
    prisma.recentTransaction.count(),
  ]);
  console.log({ users, inventory, customers, deliveries, income, expense, recentTransactions });
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
