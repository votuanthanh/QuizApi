/* eslint-disable max-len */
const express = require('express');
const authCheck = require('../middleware/auth-check');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Exam = require('../models/Exam');
const History = require('../models/History');
const SolvedExam = require('../models/SolvedExam');
const User = require('../models/User');
const helpers = require('./helpers');
const shuffle = require('../utilities/shuffle');

const AI_ROLE = 'AI';
const DEVELOPER_ROLE = 'DEVELOPER';
const LOGIC_QUIZ = 1;
const CODING_QUIZ = 2;
const ENGLISH_QUIZ = 3;

const router = new express.Router();

/**
 * Validate quiz data
 * @param {*} data Quzi data
 * @return {*} response object
 */
function validateQuizData(data) {
  const errors = {};
  let isValid = true;
  let message = '';

  console.log(data);
  if (!data || typeof data.title !== 'string' || data.title < 3) {
    isValid = false;
    errors.title = 'Title must be more than 2 symbols.';
  }

  if (!isValid) {
    message = 'Check the form for errors.';
  }

  return {
    success: isValid,
    message,
    errors,
  };
}

router.post('/create', authCheck, (req, res) => {
  const quizData = { ...req.body};
  const validationResult = validateQuizData(quizData);
  if (!validationResult.success) {
    return res.status(200).json({
      success: false,
      message: validationResult.message,
      errors: validationResult.errors,
    });
  }
  const quizToAdd = {
    name: quizData.title.trim(),
    description: quizData.description.trim(),
    creatorId: quizData.userId,
  };

  Quiz.create(quizToAdd).then((quiz) => {
    res.status(200).json({
      success: true,
      message: `Quiz ${quiz.name} added!`,
      quiz,
    });
  }).catch((err) => {
    console.log('Error: ' + err);
    return res.status(500).json({
      success: false,
      message: 'Cannot write the quiz in database',
      errors: 'Quiz error',
    });
  });
});

router.post('/createQuestion', authCheck, (req, res) => {
  const questionData = req.body;

  const questionToAdd = {
    quizId: questionData.quizId,
    question: questionData.question,
    answers: questionData.answers,
    shouldShuffle: questionData.shouldShuffle,
  };

  Question.create(questionToAdd).then((question) => {
    const quizId = question.quizId;
    const questionId = question._id;
    Quiz.findByIdAndUpdate(quizId, { $push: { questions: questionId } },
        { upsert: true },
        function(err, doc) {
          if (err) {
            return res.send(500, { error: err });
          }
        });

    res.status(200).json({
      success: true,
      message: `Question ${question.question} added!`,
      data: question,
    });
  }).catch((err) => {
    console.log('Error: ' + err);
    return res.status(500).json({
      success: false,
      message: 'Cannot write the question in database',
      errors: 'Question error',
    });
  });
});

router.post('/addQuestion', authCheck, (req, res) => {
  const questionData = req.body;
  const questionToAdd = {
    quizId: questionData.quizId,
    question: questionData.questionName.trim(),
    answers: questionData.answers,
    image: questionData.image,
    correctAnswer: questionData.correctAnswer,
    creatorId: questionData.userId,
  };

  Question.create(questionToAdd).then((question) => {
    const quizId = question.quizId;
    const questionId = question._id;
    Quiz.findByIdAndUpdate(quizId, { $push: { questions: questionId } },
        { upsert: true },
        function(err, doc) {
          if (err) {
            return res.send(500, { error: err });
          }
        });

    res.status(200).json({
      success: true,
      message: `Question ${question.question} added!`,
      question,
    });
  }).catch((err) => {
    console.log('Error: ' + err);
    return res.status(500).json({
      success: false,
      message: 'Cannot write the qusetion in database',
      errors: 'Question error',
    });
  });
});

router.post('/createExam', authCheck, (req, res) => {
  const user = req.user;
  const { role } = req.body;

  if (!role) {
    return res.status(500).json({
      success: false,
      message: 'The role field was required!',
      errors: 'Create exam error',
    });
  }

  if (role != AI_ROLE && role != DEVELOPER_ROLE) {
    return res.status(500).json({
      success: false,
      message: 'The role field was DEVELOPER | AI!',
      errors: 'Create exam error',
    });
  }

  Quiz.find(role == AI_ROLE ? { _id: { $in: [LOGIC_QUIZ, ENGLISH_QUIZ] } } : {})
      .then(async (quizzes) => {
        const result = {};

        const resultPromise = quizzes.map((quiz) => {
          return Question.find({
            '_id': { $in: quiz.questions },
          }).then((result) => ({ _id: quiz._id, question: result }));
        });

        Promise.all(resultPromise).then((values) => {
          const logicQuiz = values.find((quiz) => quiz._id == LOGIC_QUIZ);
          const codingQuiz = values.find((quiz) => quiz._id == CODING_QUIZ);
          const englishQuiz = values.find((quiz) => quiz._id == ENGLISH_QUIZ);
          const examArray = [];

          if (logicQuiz) {
            result[logicQuiz._id] = { questions: shuffle(logicQuiz.question) };
            examArray.push({
              quizId: logicQuiz._id,
              questions: logicQuiz.question.map((q) => q._id),
              creatorId: user._id,
            });
          }

          if (codingQuiz) {
            result[codingQuiz._id] = { questions: shuffle(codingQuiz.question) };
            examArray.push({
              quizId: codingQuiz._id,
              questions: codingQuiz.question.map((q) => q._id),
              creatorId: user._id,
            });
          }

          if (englishQuiz) {
            result[englishQuiz._id] = { questions: shuffle(englishQuiz.question) };
            examArray.push({
              quizId: englishQuiz._id,
              questions: englishQuiz.question.map((q) => q._id),
              creatorId: user._id,
            });
          }

          Exam.insertMany(examArray).then((examDocs) => {
            const examId = [];
            examDocs.forEach(function(exam) {
              result[exam.quizId].exam = exam;
              examId.push(exam._id);
            });
            History.create({ creatorId: user._id, exams: examId, role }).then(() => {
              res.status(200).json({
                success: true,
                message: `Quizzes loaded!`,
                data: result,
              });
            });
          });
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json({
          success: false,
          message: 'No Quizzes. Care to add some?',
          error: 'Quiz error',
        });
      });
});

router.get('/getQuestions/:id', (req, res) => {
  const id = req.params.id;
  console.log(id);
  Question.find({ quizId: id }).then((questions) => {
    if (!questions) {
      res.status(400).json({ message: 'No Questions. Care to add some?' });
      return;
    }
    console.log(questions);
    res.status(200).json({
      success: true,
      message: `Questions loaded!`,
      questions,
    });
  }).catch((err) => {
    console.log(err);
    res.status(500).json({
      success: false,
      message: 'Cannot find quiz with id ' + id,
      errors: err,
    });
  });
});

router.get('/getQuizById/:id', (req, res) => {
  const id = req.params.id;
  Quiz.findById(id).then((quiz) => {
    User.findById(quiz.creatorId).then((user) => {
      Question.find({ quizId: id }).then((allQuestions) => {
        const creator = user.username;
        res.status(200).json({
          success: true,
          message: `Questions loaded!`,
          allQuestions,
          quiz,
          creator,
        });
      });
    }).catch((err) => {
      res.status(500).json({
        success: false,
        message: 'Cannot find user with id ' + quiz.create,
        errors: err,
      });
    });
  }).catch((err) => {
    console.log(err);
    res.status(500).json({
      success: false,
      message: 'Cannot find quiz with id ' + id,
      errors: err,
    });
  });
});

router.post('/addSolvedExam', authCheck, (req, res) => {
  const quizData = req.body;
  const user = req.user;

  if (quizData.correctAnswers.length != quizData.questions.length) {
    return res.status(500).json({
      success: false,
      message: 'Correct answers not match the question list',
      errors: 'Exam solved error',
    });
  }

  const solvedExam = {
    quizId: quizData.quizId,
    examId: quizData.examId,
    solvedBy: user._id,
    questions: quizData.questions,
    correctAnswers: quizData.correctAnswers,
    dateSolved: new Date(),
  };

  // TODO: validate!
  // eslint-disable-next-line max-len
  helpers.getScores(quizData.questions, quizData.correctAnswers, function(scoreResult) {
    Exam.findByIdAndUpdate(
        solvedExam.examId,
        {
          correctAnswers: solvedExam.correctAnswers,
          dateSolved: solvedExam.dateSolved,
          ...scoreResult,
        },
        function(error) {
          if (error) {
            return res.status(500).json({
              success: false,
              message: 'Cannot write the solved quiz in database',
              errors: 'Quiz solved error',
            });
          }

          res.status(200).json({
            success: true,
            message: `Solved Quiz added!`,
          });
        }
    );
  });
});

router.get('/getQuestionById/:id', (req, res) => {
  const id = req.params.id;
  Question.findById(id).then((question) => {
    const questionData = {
      question: question.question,
      answers: question.answers,
      correctAnswers: question.correctAnswers,
      quizId: question.quizId,
      questionNumber: question.number,
    };
    console.log(question);
    res.status(200).json({
      success: true,
      message: `Question loaded!`,
      questionData,
    });
  }).catch((err) => {
    console.log(err);
    res.status(500).json({
      success: false,
      message: 'Cannot find question with id ' + id,
      errors: err,
    });
  });
});

router.put('/editQuestion/:id', authCheck, (req, res) => {
  const id = req.params.id;
  const questionData = req.body;
  const questionToEdit = {
    quizId: questionData.quizId,
    question: questionData.question.trim(),
    answers: questionData.answers,
    correctAnswers: questionData.correctAnswers,
    number: questionData.questionNumber,
  };
  console.log(questionToEdit);
  Question.findByIdAndUpdate(
      id, questionToEdit,
      { upsert: true },
      function(err, doc) {
        if (err) {
          return res.send(500, { error: err });
        }
        console.log(doc);
        res.status(200).json({
          success: true,
          message: `Question ${questionToEdit.question} edited!`,
          questionToEdit,
        });
      })
      .catch((err) => {
        console.log('Error: ' + err);
        return res.status(500).json({
          success: false,
          message: 'Cannot write the qusetion in database',
          errors: 'Question error',
        });
      });
});

router.delete('/deleteQuestion/:id', authCheck, (req, res) => {
  const id = req.params.id;
  Question.findByIdAndRemove(id, function(err, doc) {
    if (err) {
      return res.send(500, { error: err });
    }
    console.log(doc);
    res.status(200).json({
      success: true,
      message: `Question removed!`,
    });
  }).catch((err) => {
    console.log('Error: ' + err);
    return res.status(500).json({
      success: false,
      message: 'Cannot delete the question in database',
      errors: 'Question error',
    });
  });
});

router.delete('/deleteQuiz/:id', authCheck, (req, res) => {
  const id = req.params.id;
  Quiz.findByIdAndRemove(id, function(err, doc) {
    if (err) {
      return res.send(500, { error: err });
    }
    const questionsId = doc.questions;
    for (const id of questionsId) {
      Question.findByIdAndRemove(id, function(err, doc) {
        if (err) {
          return res.send(500, { error: err });
        }
        console.log(doc._id + ' was removed');
      });
    }
    res.status(200).json({
      success: true,
      message: `Quiz removed!`,
    });
  });
});

router.get('/getMostRecent', (req, res) => {
  Quiz.find()
      .sort({ dataCreated: -1 })
      .limit(3)
      .then((mostRecentQuizzes) => {
        Quiz.count({}, function(err, quizzesCount) {
          if (err) {
            console.log(err);
            return;
          }

          SolvedExam.count({}, function(err, solvedQuizzesCount) {
            if (err) {
              console.log(err);
              return;
            }

            Question.count({}, function(err, questionsCount) {
              if (err) {
                console.log(err);
                return;
              }

              User.count({}, function(err, usersCount) {
                if (err) {
                  console.log(err);
                  return;
                }

                const result = {
                  quizzes: mostRecentQuizzes,
                  totalQuizzes: quizzesCount,
                  totalSolvedQuizzes: solvedQuizzesCount,
                  totalQuestions: questionsCount,
                  totalUsers: usersCount,
                };

                res.status(200).json({
                  success: true,
                  message: 'Info loaded!',
                  data: result,
                });
              });
            });
          });
        });
      });
});

module.exports = router;
