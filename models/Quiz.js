const mongoose = require('mongoose');

// eslint-disable-next-line new-cap
const quizSchema = mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.Number,
    required: true,
  },
  name: {
    type: mongoose.Schema.Types.String,
    required: true,
  },
  // creatorId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User',
  //   required: true,
  // },
  description: {
    type: mongoose.Schema.Types.String,
    required: true,
  },
  questions: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Question',
  }],
  dateCreated: { type: mongoose.Schema.Types.Date, default: Date.now },
});

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
