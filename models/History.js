const mongoose = require('mongoose');

// eslint-disable-next-line new-cap
const HistorySchema = mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  exams: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Exam',
  }],
  dateCreated: { type: mongoose.Schema.Types.Date, default: Date.now },
});

const Exam = mongoose.model('History', HistorySchema);

module.exports = Exam;
