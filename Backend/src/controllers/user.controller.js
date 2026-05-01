// User controller - Handle user management requests
import * as UserService from "../services/user.service.js";
import fs from 'fs';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await UserService.getAllUsers();
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

// Create new user
export const createUser = async (req, res) => {
  try {
    const user = await UserService.createUser(req.body);
    res.status(201).json({
      success: true,
      message: "User created successfully. Password sent to email.",
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const user = await UserService.updateUser(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const result = await UserService.deleteUser(req.params.id);
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update password
export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const result = await UserService.updatePassword(req.user.id, oldPassword, newPassword);
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Upload avatar for agent
export const uploadAvatar = async (req, res) => {
  try {
    // Only agents can upload avatars
    if (req.user.role !== 'agent') {
      return res.status(403).json({
        success: false,
        message: 'Only agents can upload profile pictures'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Update user avatar in database
    const result = await UserService.updateAvatar(req.user.id, req.file);
    
    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: result
    });
  } catch (error) {
    // Clean up uploaded file if database update fails
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
