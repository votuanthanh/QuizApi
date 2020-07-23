const express = require('express');
const moment = require('moment');
const History = require('../models/History');
const User = require('../models/User');
const formatMinutes = require('../utilities/formatMinutes')

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
          const duration = result.duration && result.duration >= 0 ? result.duration : 0;
          let totalCorrect = 0;
          let totalQuestion = 0;
          result.exams.forEach(function(ex) {
            exam[ex.quizId] = ex.totalCorrectAnswers + '/' + ex.totalQuestions;
            totalCorrect += ex.totalCorrectAnswers;
            totalQuestion += ex.totalQuestions;
          });
          if (totalCorrect != 0 && totalQuestion != 0) {
            const user =  result.creatorId;
            history.push({
              exam,
              role: result.role,
              duration: formatMinutes(duration),
              completionDate: result.dateCreated ? moment(result.dateCreated).format('DD/MM/YYYY HH:mm') : '',
              registeredDate: user.schedule ? moment(user.schedule).format('DD/MM/YYYY HH:mm') : '',
              user,
              totalCorrect,
              lastResult: totalCorrect + '/' + totalQuestion,
            });
          }
        });
        history.sort(function(a, b) {
          return b.totalCorrect - a.totalCorrect;
        });
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
