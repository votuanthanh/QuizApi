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
  correctAnswers: [mongoose.Schema.Types.Number],
  totalQuestions: { type: mongoose.Schema.Types.Number, default: 0 },
  totalCorrectAnswers: { type: mongoose.Schema.Types.Number, default: 0 },
  totalWrongAnswers: { type: mongoose.Schema.Types.Number, default: 0 },
  dateSolved: { type: mongoose.Schema.Types.Date },
  dateCreated: { type: mongoose.Schema.Types.Date, default: Date.now },
});

const Exam = mongoose.model('Exam', ExamSchema);

module.exports = Exam;
