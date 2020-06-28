const express = require('express');
const History = require('../models/History');
const solvedExam = require('../models/SolvedExam');
const User = require('../models/User');

const router = new express.Router();

router.get('/result', (req, res) => {
  // History.find().then((histories) => {
  //   console.log(histories);
  // });
  // History.aggregate([{
  //   $lookup: {
  //     from: 'users',
  //     localField: 'creatorId',
  //     foreignField: '_id',
  //     as: 'user',
  //   },
  // }]).exec(function(error, results) {
  //   console.log(results[0].user);
  //   console.log(error);
  // });
  History.find()
      .populate('creatorId')
      .populate('exams')
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
            user: result.creatorId,
            lastResult: totalCorrect + '/' + totalQuestion,
          });
        });
        console.log(history);
        res.render('result', { results: history });
      });
});

module.exports = router;
