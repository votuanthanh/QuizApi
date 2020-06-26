const mongoose = require('mongoose');

// eslint-disable-next-line new-cap
const questionSchema = mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.String,
    required: true,
  },
  question: {
    type: mongoose.Schema.Types.String,
    required: true,
  },
  image: {
    type: mongoose.Schema.Types.String,
  },
  answers: [mongoose.Schema.Types.String],
  correctAnswer: mongoose.Schema.Types.Number,
  // creatorId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User',
  // },
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
