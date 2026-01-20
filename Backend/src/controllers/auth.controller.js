// Logic for authentication routes
import * as AuthService from "../services/auth.service.js";

export const register = async (req, res) => {
  try {
    const data = await AuthService.register(req.body);
    res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

export const login = async (req, res) => {
  try {
    const data = await AuthService.login(req.body);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(401).json({ 
      success: false,
      message: error.message 
    });
  }
};
