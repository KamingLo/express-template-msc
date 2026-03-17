import type { Request, Response } from 'express';
import * as authService from '../services/authService.js';

export const register = async (req: Request, res: Response) => {
  try {
    await authService.registerUser(req.body);
    res.status(201).json({ message: "Berhasil registrasi data baru" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const token = await authService.loginUser(req.body);
    res.status(200).json({ 
      message: "login berhasil", 
      token: token 
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};