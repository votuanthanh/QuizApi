const mongoose = require('mongoose');

// eslint-disable-next-line new-cap
const solvedExamSchema = mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.Number,
    ref: 'Quiz',
    required: true,
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  solvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  questions: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Question',
    require: true,
  }],
  correctAnswers: [mongoose.Schema.Types.Number],
  totalQuestions: { type: mongoose.Schema.Types.Number },
  totalCorrectAnswers: mongoose.Schema.Types.Number,
  totalWrongAnswers: mongoose.Schema.Types.Number,
  dateSolved: { type: mongoose.Schema.Types.Date, default: Date.now },
});

const SolvedExam = mongoose.model('SolvedExam', solvedExamSchema);

module.exports = SolvedExam;
