const mongoose = require('mongoose');

// eslint-disable-next-line new-cap
const ExamSchema = mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.Number,
    required: true,
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  questions: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Question',
  }],
  dateCreated: { type: mongoose.Schema.Types.Date, default: Date.now },
});

const Exam = mongoose.model('Exam', ExamSchema);

module.exports = Exam;
