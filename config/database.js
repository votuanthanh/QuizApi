const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

const seedData = () => {
  const readQuiz = fs.readFileSync('../data/logicQuiz.json', 'utf8');
  const jsonContent = JSON.parse(readQuiz);
  console.log(jsonContent);
}

// Mongoose promise is deprecated so use node.js global promise
mongoose.Promise = global.Promise;

module.exports = (settings) => {
  mongoose.connect(settings.db);
  console.log(`Trying to connect to ${settings.db}`);

  const db = mongoose.connection;

  db.once('open', (err) => {
    if (err) {
      throw err;
    }

    console.log('MongoDb is ready!');
  });

  db.on('error', (err) => {
    console.log(`Database error: ${err}`);
  });
};
