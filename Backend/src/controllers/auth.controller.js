// Logic for authentication routes
import * as AuthService from "../services/auth.service.js";

export const register = async (req, res) => {
  try {
    const data = await AuthService.register(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
