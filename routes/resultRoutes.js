const express = require('express');
const History = require('../models/History');
const User = require('../models/User');

const router = new express.Router();

router.get('/result', (req, res) => {
  History.find()
      .populate('creatorId')
      .populate('exams')
      .sort({schedule: 1})
      .exec(function(error, results) {
      // eslint-disable-next-line max-len
        const history = [];
        results.forEach(function(result) {
          const exam = {};
          let totalCorrect = 0;
          let totalQuestion = 0;
          result.exams.forEach(function(ex) {
            exam[ex.quizId] = ex.totalCorrectAnswers + '/' + ex.totalQuestions;
            totalCorrect += ex.totalCorrectAnswers;
            totalQuestion += ex.totalQuestions;
          });
          history.push({
            exam,
            role: result.role,
            user: result.creatorId,
            lastResult: totalCorrect + '/' + totalQuestion,
          });
        });
        console.log(history);
        res.render('result', { results: history });
      });
});

router.get('/users', (req, res) => {
  User.find({ email: { $not: /admin@gmail.com/ } })
      .sort({ firstName: 1 })
      .exec(function(error, users) {
        res.render('users', { users });
      });
});


module.exports = router;
