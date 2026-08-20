import { prisma } from '../config/db.js';

export const getPlatformAnalytics = async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalQuizzes,
      publishedQuizzes,
      draftQuizzes,
      totalQuestions,
      totalAttempts,
      passedAttempts,
      failedAttempts,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.quiz.count(),
      prisma.quiz.count({ where: { status: 'PUBLISHED' } }),
      prisma.quiz.count({ where: { status: 'DRAFT' } }),
      prisma.question.count(),
      prisma.attempt.count(),
      prisma.attempt.count({ where: { status: 'PASSED' } }),
      prisma.attempt.count({ where: { status: 'FAILED' } }),
    ]);

    // Average score across all completed attempts
    const completedAttempts = await prisma.attempt.findMany({
      where: { status: { in: ['PASSED', 'FAILED'] } },
      select: { percentage: true },
    });

    const averageScore = completedAttempts.length > 0
      ? completedAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / completedAttempts.length
      : 0;

    // Recent attempts for chart (e.g. last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentAttemptsRaw = await prisma.attempt.findMany({
      where: { startedAt: { gte: sevenDaysAgo } },
      select: { startedAt: true, status: true },
    });

    // Group by date
    const attemptsByDate = recentAttemptsRaw.reduce((acc, curr) => {
      const dateStr = curr.startedAt.toISOString().split('T')[0];
      if (!acc[dateStr]) acc[dateStr] = { passed: 0, failed: 0, in_progress: 0, total: 0 };
      
      acc[dateStr].total++;
      if (curr.status === 'PASSED') acc[dateStr].passed++;
      else if (curr.status === 'FAILED') acc[dateStr].failed++;
      else acc[dateStr].in_progress++;
      
      return acc;
    }, {});

    const attemptsChartData = Object.keys(attemptsByDate).sort().map(date => ({
      date,
      ...attemptsByDate[date]
    }));

    // Most popular quizzes
    const popularQuizzes = await prisma.quiz.findMany({
      include: {
        _count: { select: { attempts: true } }
      },
      orderBy: {
        attempts: { _count: 'desc' }
      },
      take: 5,
    });

    const recentStudentAttempts = await prisma.attempt.findMany({
      where: { status: { in: ['PASSED', 'FAILED'] } },
      include: {
        user: { select: { name: true } },
        quiz: { select: { title: true } },
      },
      orderBy: { completedAt: 'desc' },
      take: 6,
    });

    res.json({
      overview: {
        totalStudents,
        totalQuizzes,
        publishedQuizzes,
        draftQuizzes,
        totalQuestions,
        totalAttempts,
        passedAttempts,
        failedAttempts,
        averageScore: averageScore.toFixed(1),
        passRate: totalAttempts > 0 ? ((passedAttempts / totalAttempts) * 100).toFixed(1) : 0,
      },
      charts: {
        attemptsOverTime: attemptsChartData,
        popularQuizzes: popularQuizzes.map(q => ({ name: q.title, attempts: q._count.attempts })),
        recentStudentAttempts: recentStudentAttempts.map(a => ({
          studentName: a.user.name,
          quizName: a.quiz.title,
          status: a.status,
          score: a.percentage.toFixed(0),
          date: a.completedAt
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAttempts = async (req, res, next) => {
  try {
    const attempts = await prisma.attempt.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        quiz: { select: { id: true, title: true, category: { select: { name: true } } } },
      },
      orderBy: { startedAt: 'desc' },
    });
    res.json(attempts);
  } catch (error) {
    next(error);
  }
};

export const getAdminAttemptById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const attempt = await prisma.attempt.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: { select: { id: true, name: true, email: true } },
        quiz: { include: { questions: { include: { options: true } } } },
        answers: true,
      },
    });

    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    res.json(attempt);
  } catch (error) {
    next(error);
  }
};
