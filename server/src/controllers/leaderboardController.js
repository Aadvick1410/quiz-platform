import { prisma } from '../config/db.js';

export const getLeaderboard = async (req, res, next) => {
  try {
    const { category } = req.query;

    let where = { status: 'PASSED' };
    if (category) {
      where.quiz = { categoryId: parseInt(category) };
    }

    const attempts = await prisma.attempt.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    // Aggregate by user
    const userStats = {};
    for (const attempt of attempts) {
      if (!userStats[attempt.userId]) {
        userStats[attempt.userId] = {
          user: attempt.user,
          totalScore: 0,
          totalPercentage: 0,
          quizzesPassed: 0,
        };
      }
      userStats[attempt.userId].totalScore += attempt.score;
      userStats[attempt.userId].totalPercentage += attempt.percentage;
      userStats[attempt.userId].quizzesPassed += 1;
    }

    const leaderboard = Object.values(userStats).map(stat => ({
      ...stat,
      averageScore: stat.totalPercentage / stat.quizzesPassed,
    }));

    // Rank by average score, then quizzes passed
    leaderboard.sort((a, b) => {
      if (b.averageScore === a.averageScore) {
        return b.quizzesPassed - a.quizzesPassed;
      }
      return b.averageScore - a.averageScore;
    });

    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
};
