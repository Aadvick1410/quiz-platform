import { prisma } from '../config/db.js';

export const calculateScore = async (attemptId, answersData) => {
  // answersData is an array of { questionId, selectedOptionId }
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: { quiz: { include: { questions: { include: { options: true } } } } },
  });

  if (!attempt) throw new Error('Attempt not found');

  let correctAnswers = 0;
  let incorrectAnswers = 0;
  let unanswered = 0;
  let totalScore = 0;
  let totalPossibleScore = 0;

  const answersToCreate = [];

  for (const question of attempt.quiz.questions) {
    totalPossibleScore += question.marks;
    
    const submittedAnswer = answersData.find(a => a.questionId === question.id);
    const correctOption = question.options.find(o => o.isCorrect);

    if (!submittedAnswer || !submittedAnswer.selectedOptionId) {
      unanswered++;
      answersToCreate.push({
        attemptId,
        questionId: question.id,
        selectedOptionId: null,
        isCorrect: false,
      });
    } else {
      const isCorrect = submittedAnswer.selectedOptionId === correctOption.id;
      if (isCorrect) {
        correctAnswers++;
        totalScore += question.marks;
      } else {
        incorrectAnswers++;
      }
      
      answersToCreate.push({
        attemptId,
        questionId: question.id,
        selectedOptionId: submittedAnswer.selectedOptionId,
        isCorrect,
      });
    }
  }

  const percentage = totalPossibleScore > 0 ? (totalScore / totalPossibleScore) * 100 : 0;
  const status = percentage >= attempt.quiz.passingScore ? 'PASSED' : 'FAILED';
  
  const timeTaken = attempt.startedAt ? Math.floor((new Date() - attempt.startedAt) / 1000) : 0;

  await prisma.$transaction(async (tx) => {
    // Create answer records
    await tx.answer.createMany({ data: answersToCreate });
    
    // Update attempt
    await tx.attempt.update({
      where: { id: attemptId },
      data: {
        score: totalScore,
        percentage,
        correctAnswers,
        incorrectAnswers,
        unanswered,
        timeTaken,
        status,
        completedAt: new Date(),
      },
    });
  });

  return await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: { answers: true },
  });
};
