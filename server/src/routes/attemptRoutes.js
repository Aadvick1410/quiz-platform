import express from 'express';
import { z } from 'zod';
import { startQuiz, submitQuiz, getMyAttempts, getAttemptById } from '../controllers/attemptController.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';

// Use mergeParams so we can access :quizId if mounted from another router
const router = express.Router({ mergeParams: true });

const submitSchema = z.object({
  body: z.object({
    attemptId: z.union([z.string(), z.number()]),
    answers: z.array(z.object({
      questionId: z.number(),
      selectedOptionId: z.number().nullable(),
    })),
  }),
});

// Student attempt routes (mounted at /api/quizzes/:quizId and /api/attempts)
router.post('/quizzes/:quizId/start', authenticate, startQuiz);
router.post('/quizzes/:quizId/submit', authenticate, validate(submitSchema), submitQuiz);

router.get('/attempts', authenticate, getMyAttempts);
router.get('/attempts/:id', authenticate, getAttemptById);

export default router;
