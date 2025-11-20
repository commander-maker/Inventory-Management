// Business logic for authentication
import prisma from "../config/db.js";
import bcrypt from "bcryptjs";

export const register = async ({ name, email, password, role }) => {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  return await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role
    }
  });
};
