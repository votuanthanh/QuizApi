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
      .exec(function(error, results) {
        // eslint-disable-next-line max-len
        console.log(results);
        solvedExam.find({ examId: { $in: results.exams }}).then(function(solvedExam) {
          console.log(solvedExam);
        });
      });
  res.render('result');
});

module.exports = router;
