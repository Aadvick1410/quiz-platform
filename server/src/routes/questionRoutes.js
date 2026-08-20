import express from 'express';
import { z } from 'zod';
import { getQuestionsByQuizId, createQuestion, updateQuestion, deleteQuestion } from '../controllers/questionController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';

// Use mergeParams so we can access :quizId if mounted from another router
const router = express.Router({ mergeParams: true });

const optionSchema = z.object({
  optionText: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean().optional(),
});

const questionSchema = z.object({
  body: z.object({
    questionText: z.string().min(3, 'Question text is required'),
    marks: z.union([z.string(), z.number()]).optional(),
    explanation: z.string().optional(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
    options: z.array(optionSchema).min(2, 'At least 2 options are required'),
  }),
});

router.use(authenticate);

router.get('/quizzes/:quizId/questions', authorize('ADMIN'), getQuestionsByQuizId);
router.post('/quizzes/:quizId/questions', authorize('ADMIN'), validate(questionSchema), createQuestion);

// For update and delete, the ID in the URL is the question ID
router.put('/questions/:id', authorize('ADMIN'), validate(questionSchema), updateQuestion);
router.delete('/questions/:id', authorize('ADMIN'), deleteQuestion);

export default router;
