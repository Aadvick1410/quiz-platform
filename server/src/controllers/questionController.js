import { prisma } from '../config/db.js';

export const getQuestionsByQuizId = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    
    // Students only get questions if they are in an active attempt (this is handled differently, usually in attemptController)
    // For admin, return all questions with options
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const questions = await prisma.question.findMany({
      where: { quizId: parseInt(quizId) },
      include: {
        options: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json(questions);
  } catch (error) {
    next(error);
  }
};

export const createQuestion = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { questionText, marks, explanation, difficulty, options } = req.body;

    // options should be an array of { optionText, isCorrect }
    if (!options || options.length < 2) {
      return res.status(400).json({ error: 'Question must have at least 2 options' });
    }
    
    const correctCount = options.filter(o => o.isCorrect).length;
    if (correctCount !== 1) {
      return res.status(400).json({ error: 'Question must have exactly one correct option' });
    }

    const question = await prisma.question.create({
      data: {
        quizId: parseInt(quizId),
        questionText,
        marks: marks ? parseInt(marks) : 1,
        explanation,
        difficulty,
        options: {
          create: options.map(o => ({
            optionText: o.optionText,
            isCorrect: o.isCorrect || false,
          })),
        },
      },
      include: { options: true },
    });

    res.status(201).json({ message: 'Question created successfully', question });
  } catch (error) {
    next(error);
  }
};

export const updateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { questionText, marks, explanation, difficulty, options } = req.body;

    // Since updating options can involve adding/removing, a simple way is to delete old options and recreate
    // Or update existing if we pass option IDs. For simplicity, we delete all and recreate.
    
    if (!options || options.length < 2) {
      return res.status(400).json({ error: 'Question must have at least 2 options' });
    }

    const correctCount = options.filter(o => o.isCorrect).length;
    if (correctCount !== 1) {
      return res.status(400).json({ error: 'Question must have exactly one correct option' });
    }

    await prisma.$transaction(async (tx) => {
      // Delete existing options
      await tx.option.deleteMany({ where: { questionId: parseInt(id) } });
      
      // Update question and create new options
      await tx.question.update({
        where: { id: parseInt(id) },
        data: {
          questionText,
          marks: marks ? parseInt(marks) : undefined,
          explanation,
          difficulty,
          options: {
            create: options.map(o => ({
              optionText: o.optionText,
              isCorrect: o.isCorrect || false,
            })),
          },
        },
      });
    });

    res.json({ message: 'Question updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.question.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    next(error);
  }
};
