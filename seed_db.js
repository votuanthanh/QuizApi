/* eslint-disable max-len */
const fs = require('fs');
const User = require('./models/User');
const Quiz = require('./models/Quiz');
const Question = require('./models/Question');
const env = process.env.NODE_ENV || 'development';
const settings = require('./config/settings')[env];
require('./config/database')(settings);

const USERS_PATH = './data/users.json';
const LOGIC_QUIZ_PATH = './data/logicQuiz.json';
const CODING_QUIZ_PATH = './data/codingQuiz.json';
const ENGLISH_QUIZ_PATH = './data/englishQuiz.json';

async function seedQuiz(quizPath) {
  const logicQuiz = fs.readFileSync(quizPath, 'utf8');
  const jsonQuiz = JSON.parse(logicQuiz);
  const questions = jsonQuiz.questions;

  const questionId = [];
  for (const question of questions) {
    const questionDocument = await Question.create({ quizId: jsonQuiz._id, ...question});
    questionId.push(questionDocument._id);
  }

  return Quiz.create({
    _id: jsonQuiz._id,
    name: jsonQuiz.name,
    description: jsonQuiz.description,
    questions: questionId,
  });
}

(async () => {
  try {
    await User.deleteMany({});
    await Quiz.deleteMany({});
    await Question.deleteMany({});

    const users = fs.readFileSync(USERS_PATH, 'utf8');
    const jsonUsers = JSON.parse(users);

    User.seedAdminUser();
    User.insertMany(jsonUsers);

    seedQuiz(LOGIC_QUIZ_PATH);
    seedQuiz(CODING_QUIZ_PATH);
    seedQuiz(ENGLISH_QUIZ_PATH);

    // mongoose.connection.close();
  } catch (error) {
    console.error(error);
    mongoose.connection.close();
  }
})();
