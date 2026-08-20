import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding robust demo data...');

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@quizplatform.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@quizplatform.com',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log(`Created admin user: ${admin.email}`);

  // 2. Create Students
  const studentPassword = await bcrypt.hash('Student123!', 10);
  const studentsData = [
    { name: 'Rahul Sharma', email: 'rahul@example.com' },
    { name: 'Priya Patel', email: 'priya@example.com' },
    { name: 'Amit Kumar', email: 'amit@example.com' },
    { name: 'Neha Singh', email: 'neha@example.com' },
    { name: 'Vikram Reddy', email: 'vikram@example.com' }
  ];

  const createdStudents = [];
  for (const s of studentsData) {
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date(Date.now() - (daysAgo * 86400000));
    
    // Using create directly so we can set createdAt
    let student = await prisma.user.findUnique({ where: { email: s.email } });
    if (student) {
        student = await prisma.user.update({
            where: { email: s.email },
            data: { createdAt }
        });
    } else {
        student = await prisma.user.create({
          data: {
            name: s.name,
            email: s.email,
            password: studentPassword,
            role: 'STUDENT',
            status: 'ACTIVE',
            createdAt,
          },
        });
    }
    createdStudents.push(student);
  }
  console.log(`Created ${createdStudents.length} student accounts with randomized dates.`);

  // 3. Create Categories (Subjects)
  const categoriesData = [
    { name: 'HTML', description: 'HyperText Markup Language basics' },
    { name: 'CSS', description: 'Cascading Style Sheets and layouts' },
    { name: 'JavaScript', description: 'Core JS concepts and ES6+' },
    { name: 'React', description: 'React.js component-based library' },
    { name: 'Node.js', description: 'Backend development with Node' },
    { name: 'Python', description: 'Python programming and scripts' },
    { name: 'Java', description: 'Object-Oriented Programming in Java' },
    { name: 'Database', description: 'SQL, NoSQL, and Database Design' },
    { name: 'Computer Networks', description: 'OSI Model, TCP/IP, and Networking' },
    { name: 'Cyber Security', description: 'Security fundamentals and encryption' }
  ];

  const dbCategories = {};
  for (const catData of categoriesData) {
    const category = await prisma.category.upsert({
      where: { name: catData.name },
      update: {},
      create: catData,
    });
    dbCategories[category.name] = category;
  }
  console.log(`Created ${Object.keys(dbCategories).length} categories.`);

  // 4. Create Quizzes and Questions
  const quizzesData = [
    {
      title: 'JavaScript Fundamentals',
      description: 'Test your knowledge of core JavaScript concepts and syntax.',
      categoryName: 'JavaScript',
      difficulty: 'MEDIUM',
      duration: 15,
      passingScore: 60,
      maxAttempts: 3,
      status: 'PUBLISHED',
      questions: [
        {
          text: 'Which keyword is used to declare a constant in JavaScript?',
          marks: 1, explanation: 'const is used to declare variables whose values cannot be reassigned.',
          options: [{ t: 'var', c: false }, { t: 'let', c: false }, { t: 'const', c: true }, { t: 'static', c: false }]
        },
        {
          text: 'What does JSON stand for?',
          marks: 1, explanation: 'JSON stands for JavaScript Object Notation.',
          options: [{ t: 'JavaScript Object Notation', c: true }, { t: 'Java Standard Object Network', c: false }, { t: 'JavaScript Online Node', c: false }, { t: 'Java Syntax Object Notation', c: false }]
        },
        {
          text: 'Which method converts a JSON string into a JavaScript object?',
          marks: 2, explanation: 'JSON.parse() is used to parse a JSON string and construct the JavaScript value or object described by the string.',
          options: [{ t: 'JSON.stringify()', c: false }, { t: 'JSON.parse()', c: true }, { t: 'JSON.convert()', c: false }, { t: 'JSON.object()', c: false }]
        }
      ]
    },
    {
      title: 'React Basics',
      description: 'A beginner quiz covering React hooks and components.',
      categoryName: 'React',
      difficulty: 'EASY',
      duration: 10,
      passingScore: 50,
      maxAttempts: 2,
      status: 'PUBLISHED',
      questions: [
        {
          text: 'Which hook is used to manage state in a functional component?',
          marks: 1, explanation: 'useState is the React Hook that lets you add state to a functional component.',
          options: [{ t: 'useEffect', c: false }, { t: 'useContext', c: false }, { t: 'useReducer', c: false }, { t: 'useState', c: true }]
        },
        {
          text: 'What is JSX?',
          marks: 1, explanation: 'JSX is a syntax extension for JavaScript that looks similar to XML/HTML.',
          options: [{ t: 'A JavaScript testing framework', c: false }, { t: 'A syntax extension for JavaScript', c: true }, { t: 'A state management library', c: false }, { t: 'A build tool for React', c: false }]
        }
      ]
    },
    {
      title: 'Database Architecture',
      description: 'Advanced quiz on SQL databases and indexing.',
      categoryName: 'Database',
      difficulty: 'HARD',
      duration: 20,
      passingScore: 70,
      maxAttempts: 1,
      status: 'PUBLISHED',
      questions: [
        {
          text: 'Which SQL statement is used to extract data from a database?',
          marks: 1, explanation: 'The SELECT statement is used to select data from a database.',
          options: [{ t: 'EXTRACT', c: false }, { t: 'GET', c: false }, { t: 'SELECT', c: true }, { t: 'PULL', c: false }]
        },
        {
          text: 'What is the purpose of a foreign key?',
          marks: 2, explanation: 'A foreign key is a column or group of columns in a relational database table that provides a link between data in two tables.',
          options: [{ t: 'To uniquely identify a row', c: false }, { t: 'To speed up query performance', c: false }, { t: 'To link data between two tables', c: true }, { t: 'To store encrypted passwords', c: false }]
        }
      ]
    }
  ];

  for (const qData of quizzesData) {
    const category = dbCategories[qData.categoryName];
    if (!category) continue;

    // Create quiz
    const quiz = await prisma.quiz.create({
      data: {
        title: qData.title,
        description: qData.description,
        categoryId: category.id,
        difficulty: qData.difficulty,
        duration: qData.duration,
        passingScore: qData.passingScore,
        maxAttempts: qData.maxAttempts,
        status: qData.status,
      },
    });

    // Create questions & options
    for (const q of qData.questions) {
      const question = await prisma.question.create({
        data: {
          quizId: quiz.id,
          questionText: q.text,
          marks: q.marks,
          explanation: q.explanation,
          difficulty: qData.difficulty,
        }
      });

      await prisma.option.createMany({
        data: q.options.map(opt => ({
          questionId: question.id,
          optionText: opt.t,
          isCorrect: opt.c
        }))
      });
    }
    console.log(`Created Quiz: ${qData.title} with ${qData.questions.length} questions.`);
  }

  // 5. Create randomized dummy attempts for the leaderboard and charts
  console.log('Clearing old attempts...');
  await prisma.answer.deleteMany({});
  await prisma.attempt.deleteMany({});

  console.log('Generating randomized dummy quiz attempts...');
  const allQuizzes = await prisma.quiz.findMany({ include: { questions: { include: { options: true } } } });
  
  if (allQuizzes.length > 0 && createdStudents.length > 0) {
    const attemptsToCreate = [];
    
    // Generate about 40 random attempts over the last 7 days
    for (let i = 0; i < 40; i++) {
      const student = createdStudents[Math.floor(Math.random() * createdStudents.length)];
      const quiz = allQuizzes[Math.floor(Math.random() * allQuizzes.length)];
      
      // Random date within last 7 days
      const daysAgo = Math.floor(Math.random() * 7);
      const hoursAgo = Math.floor(Math.random() * 24);
      const startedAt = new Date(Date.now() - (daysAgo * 86400000) - (hoursAgo * 3600000));
      
      // Random time taken (between 1 minute and the quiz duration)
      const maxSeconds = quiz.duration * 60;
      const timeTaken = Math.floor(Math.random() * (maxSeconds - 60) + 60);
      const completedAt = new Date(startedAt.getTime() + (timeTaken * 1000));
      const expiresAt = new Date(startedAt.getTime() + (maxSeconds * 1000));
      
      // Random score logic
      const totalQuestions = quiz.questions.length;
      const correctAnswers = Math.floor(Math.random() * (totalQuestions + 1));
      const incorrectAnswers = totalQuestions - correctAnswers;
      
      // Calculate score based on marks
      let score = 0;
      let totalPossible = 0;
      for (let j = 0; j < totalQuestions; j++) {
        totalPossible += quiz.questions[j].marks;
        if (j < correctAnswers) {
          score += quiz.questions[j].marks;
        }
      }
      
      const percentage = totalPossible > 0 ? (score / totalPossible) * 100 : 0;
      const status = percentage >= quiz.passingScore ? 'PASSED' : 'FAILED';
      
      attemptsToCreate.push({
        quizId: quiz.id,
        userId: student.id,
        score,
        percentage,
        correctAnswers,
        incorrectAnswers,
        unanswered: 0,
        timeTaken,
        status,
        startedAt,
        expiresAt,
        completedAt
      });
    }
    
    await prisma.attempt.createMany({ data: attemptsToCreate });
    console.log(`Successfully generated 40 randomized attempts for chart data!`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
