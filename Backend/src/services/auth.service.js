// Business logic for authentication
import prisma from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";

export const register = async ({ name, email, password, role, phone }) => {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      phone: phone || ''
    }
  });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const login = async ({ email, password, role }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error("Invalid credentials");
  if (role && user.role.toLowerCase() !== String(role).toLowerCase()) {
    throw new Error(`This account cannot sign in to the ${role} app`);
  }

  const token = generateToken({ 
    id: user.id, 
    email: user.email, 
    role: user.role 
  });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;
  
  return {
    user: userWithoutPassword,
    token
  };
};
