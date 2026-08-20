import { prisma } from '../config/db.js';

export const getAllQuizzes = async (req, res, next) => {
  try {
    const { category, difficulty, search } = req.query;
    
    let where = {};
    
    // Students only see published quizzes
    if (req.user.role === 'STUDENT') {
      where.status = 'PUBLISHED';
    }

    if (category) where.categoryId = parseInt(category);
    if (difficulty) where.difficulty = difficulty;
    if (search) {
      where.title = { contains: search };
    }

    const quizzes = await prisma.quiz.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { questions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(quizzes);
  } catch (error) {
    next(error);
  }
};

export const getQuizById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    let where = { id: parseInt(id) };
    if (req.user.role === 'STUDENT') {
      where.status = 'PUBLISHED';
    }

    const quiz = await prisma.quiz.findFirst({
      where,
      include: {
        category: true,
        _count: { select: { questions: true } },
      },
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (error) {
    next(error);
  }
};

export const createQuiz = async (req, res, next) => {
  try {
    const { title, description, categoryId, difficulty, duration, passingScore, maxAttempts } = req.body;
    
    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        categoryId: parseInt(categoryId),
        difficulty,
        duration: parseInt(duration),
        passingScore: parseInt(passingScore),
        maxAttempts: parseInt(maxAttempts),
      },
    });
    res.status(201).json({ message: 'Quiz created successfully', quiz });
  } catch (error) {
    next(error);
  }
};

export const updateQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    if (data.categoryId) data.categoryId = parseInt(data.categoryId);
    if (data.duration) data.duration = parseInt(data.duration);
    if (data.passingScore) data.passingScore = parseInt(data.passingScore);
    if (data.maxAttempts) data.maxAttempts = parseInt(data.maxAttempts);

    const quiz = await prisma.quiz.update({
      where: { id: parseInt(id) },
      data,
    });
    res.json({ message: 'Quiz updated successfully', quiz });
  } catch (error) {
    next(error);
  }
};

export const deleteQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.quiz.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const togglePublishStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['DRAFT', 'PUBLISHED', 'UNPUBLISHED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const quiz = await prisma.quiz.update({
      where: { id: parseInt(id) },
      data: { status },
    });
    res.json({ message: `Quiz status updated to ${status}`, quiz });
  } catch (error) {
    next(error);
  }
};
