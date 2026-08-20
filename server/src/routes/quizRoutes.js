import express from 'express';
import { z } from 'zod';
import { getAllQuizzes, getQuizById, createQuiz, updateQuiz, deleteQuiz, togglePublishStatus } from '../controllers/quizController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const quizSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    categoryId: z.union([z.string(), z.number()]),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
    duration: z.union([z.string(), z.number()]),
    passingScore: z.union([z.string(), z.number()]),
    maxAttempts: z.union([z.string(), z.number()]).optional(),
  }),
});

router.use(authenticate);

// Public (to students)
router.get('/', getAllQuizzes);
router.get('/:id', getQuizById);

// Admin only
router.use(authorize('ADMIN'));
router.post('/', validate(quizSchema), createQuiz);
router.put('/:id', validate(quizSchema), updateQuiz);
router.delete('/:id', deleteQuiz);
router.patch('/:id/publish', togglePublishStatus);

export default router;
