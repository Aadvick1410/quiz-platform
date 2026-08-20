import { prisma } from '../config/db.js';

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { quizzes: true } },
      },
    });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    
    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }

    const category = await prisma.category.create({
      data: { name, description },
    });
    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name, description },
    });
    res.json({ message: 'Category updated successfully', category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Prisma will throw if quizzes depend on it because we haven't set cascade delete for category->quizzes
    // So we should check manually to provide a nice error
    const quizzesCount = await prisma.quiz.count({ where: { categoryId: parseInt(id) } });
    if (quizzesCount > 0) {
      return res.status(400).json({ error: 'Cannot delete category because it contains quizzes.' });
    }

    await prisma.category.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};
