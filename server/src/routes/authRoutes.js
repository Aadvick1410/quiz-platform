import express from 'express';
import { z } from 'zod';
import { register, login, getMe, updateProfile } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', (req, res) => {
  // Logout is handled mostly client-side by removing the JWT token
  res.json({ message: 'Logged out successfully' });
});
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

export default router;
