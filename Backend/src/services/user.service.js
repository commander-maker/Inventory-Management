// User service - Business logic for user management
import prisma from "../config/db.js";
import bcrypt from "bcryptjs";
import { generatePassword } from "../utils/passwordGenerator.js";
import { sendPasswordEmail } from "./email.service.js";

// Get all users (exclude passwords)
export const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      vehicle: true,
      monthlySales: true,
      joinedDate: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  return users;
};

// Get user by ID
export const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      vehicle: true,
      monthlySales: true,
      joinedDate: true,
      createdAt: true,
      updatedAt: true
    }
  });
  
  if (!user) throw new Error("User not found");
  return user;
};

// Create new user with auto-generated password
export const createUser = async ({ name, email, role, phone, vehicle }) => {
  // Check if user already exists
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new Error("User with this email already exists");

  // Generate random password
  const password = generatePassword(12);
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user in database
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      vehicle: vehicle || null,
      monthlySales: role === 'agent' ? 0 : null,
      joinedDate: new Date()
    }
  });

  // Send password via email (don't fail user creation if email fails)
  try {
    await sendPasswordEmail(email, name, password);
  } catch (error) {
    console.error('Failed to send email:', error);
  }

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return {
    ...userWithoutPassword,
    temporaryPassword: password // Include in response for admin to see
  };
};

// Update user
export const updateUser = async (id, { name, email, role, phone, vehicle, monthlySales }) => {
  // Check if user exists
  const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
  if (!user) throw new Error("User not found");

  // Check if email is being changed and if it's already taken
  if (email && email !== user.email) {
    const emailExists = await prisma.user.findUnique({ where: { email } });
    if (emailExists) throw new Error("Email already in use");
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: parseInt(id) },
    data: {
      name,
      email,
      role,
      phone,
      vehicle: vehicle || null,
      monthlySales: monthlySales !== undefined ? parseFloat(monthlySales) : undefined
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      vehicle: true,
      monthlySales: true,
      joinedDate: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return updatedUser;
};

// Delete user
export const deleteUser = async (id) => {
  const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
  if (!user) throw new Error("User not found");

  // Don't allow deleting admin users (optional safety check)
  // if (user.role === 'admin') throw new Error("Cannot delete admin users");

  await prisma.user.delete({
    where: { id: parseInt(id) }
  });

  return { message: "User deleted successfully" };
};

// Update user password
export const updatePassword = async (userId, oldPassword, newPassword) => {
  const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
  if (!user) throw new Error("User not found");

  // Verify old password
  const isValid = await bcrypt.compare(oldPassword, user.password);
  if (!isValid) throw new Error("Current password is incorrect");

  // Hash and update new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: parseInt(userId) },
    data: { password: hashedPassword }
  });

  return { message: "Password updated successfully" };
};
