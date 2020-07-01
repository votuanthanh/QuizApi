/* eslint-disable camelcase */
/* eslint-disable max-len */
const fs = require('fs');
const User = require('./models/User');
const Quiz = require('./models/Quiz');
const Question = require('./models/Question');
const env = process.env.NODE_ENV || 'development';
const settings = require('./config/settings')[env];
require('./config/database')(settings);

const LIST_USER_PATH_1 = './data/07_03_2020_users.json';
const LIST_USER_PATH_2 = './data/07_06_2020_users.json';
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

async function seedUser(userPath, date) {
  // October 13, 2014
  const users = fs.readFileSync(userPath, 'utf8');
  const jsonUsers = JSON.parse(users);

  const listUser = [];
  for (const user of jsonUsers) {
    listUser.push({
      'fullName': user.fullName,
      'email': user.email,
      'phoneNumber': user.phoneNumber,
      'schedule': new Date(`${date} ${user.schedule}:00`).toString(),
    });
  }

  User.insertMany(listUser, function(error) {
    if (error) {
      console.error(error);
    } else {
      console.log('SEED USER WAS SUCCESSFUL: ', date);
    }
  });
}

(async () => {
  try {
    await User.deleteMany({});
    await Quiz.deleteMany({});
    await Question.deleteMany({});

    User.seedAdminUser();
    seedUser(LIST_USER_PATH_1, 'July 03, 2020');
    seedUser(LIST_USER_PATH_2, 'July 06, 2020');

    seedQuiz(LOGIC_QUIZ_PATH);
    seedQuiz(CODING_QUIZ_PATH);
    seedQuiz(ENGLISH_QUIZ_PATH);

    // mongoose.connection.close();
  } catch (error) {
    console.error(error);
    mongoose.connection.close();
  }
})();
