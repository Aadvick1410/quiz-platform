import { prisma } from '../config/db.js';
import { calculateScore } from '../services/attemptService.js';

export const startQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(quizId) },
      include: { questions: { include: { options: { select: { id: true, optionText: true } } } } },
    });

    if (!quiz || quiz.status !== 'PUBLISHED') {
      return res.status(404).json({ error: 'Quiz not found or not published' });
    }

    const previousAttempts = await prisma.attempt.count({
      where: { quizId: parseInt(quizId), userId },
    });

    if (previousAttempts >= quiz.maxAttempts) {
      return res.status(403).json({ error: 'Maximum attempts reached for this quiz' });
    }

    // Check if there's an ongoing attempt
    const ongoing = await prisma.attempt.findFirst({
      where: { quizId: parseInt(quizId), userId, status: 'IN_PROGRESS' },
    });

    if (ongoing) {
      // Check if it's expired
      if (new Date() > ongoing.expiresAt) {
        // mark it expired/failed
        await prisma.attempt.update({
          where: { id: ongoing.id },
          data: { status: 'FAILED', completedAt: new Date() },
        });
      } else {
        return res.json({ message: 'Resuming quiz', attemptId: ongoing.id, expiresAt: ongoing.expiresAt, questions: quiz.questions });
      }
    }

    const durationSeconds = quiz.duration * 60;
    const expiresAt = new Date(Date.now() + durationSeconds * 1000);

    const attempt = await prisma.attempt.create({
      data: {
        quizId: parseInt(quizId),
        userId,
        expiresAt,
      },
    });

    res.status(201).json({ message: 'Quiz started', attemptId: attempt.id, expiresAt, questions: quiz.questions });
  } catch (error) {
    next(error);
  }
};

export const submitQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { attemptId, answers } = req.body;
    const userId = req.user.id;

    const attempt = await prisma.attempt.findUnique({ where: { id: parseInt(attemptId) } });
    if (!attempt || attempt.userId !== userId || attempt.quizId !== parseInt(quizId)) {
      return res.status(403).json({ error: 'Invalid attempt' });
    }

    if (attempt.status !== 'IN_PROGRESS') {
      return res.status(400).json({ error: 'Quiz already submitted' });
    }

    const GRACE_PERIOD_MS = 10000; // 10 seconds
    if (new Date() > new Date(attempt.expiresAt.getTime() + GRACE_PERIOD_MS)) {
      // Expired
      await prisma.attempt.update({
        where: { id: attempt.id },
        data: { status: 'FAILED', completedAt: new Date() },
      });
      return res.status(400).json({ error: 'Time limit exceeded. Quiz auto-failed.' });
    }

    const result = await calculateScore(attempt.id, answers);
    res.json({ message: 'Quiz submitted successfully', result });
  } catch (error) {
    next(error);
  }
};

export const getMyAttempts = async (req, res, next) => {
  try {
    const attempts = await prisma.attempt.findMany({
      where: { userId: req.user.id },
      include: { quiz: { select: { title: true, category: { select: { name: true } } } } },
      orderBy: { startedAt: 'desc' },
    });
    res.json(attempts);
  } catch (error) {
    next(error);
  }
};

export const getAttemptById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const attempt = await prisma.attempt.findUnique({
      where: { id: parseInt(id) },
      include: {
        quiz: { include: { questions: { include: { options: true } } } },
        answers: true,
      },
    });

    if (!attempt || (attempt.userId !== req.user.id && req.user.role !== 'ADMIN')) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    res.json(attempt);
  } catch (error) {
    next(error);
  }
};
