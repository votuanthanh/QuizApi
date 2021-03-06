const express = require('express');
const env = process.env.NODE_ENV || 'development';
const userRoutes = require('./routes/userRoutes');
const quizRoutes = require('./routes/quizRoutes');
const showRoutes = require('./routes/resultRoutes');

// Setup MongoDB connection
const settings = require('./config/settings')[env];
require('./config/database')(settings);

// Setup express
const app = express();
require('./config/express')(app);
require('./config/passport')();

// Import server-routes
// require('./config/routes')(app)
app.get('/', function(req, res) {
  res.render('index');
});

app.use('/auth', userRoutes);
app.use('/quiz', quizRoutes);
app.use('/show', showRoutes);

app.listen(settings.port, () => {
  console.log(`Node.js server running on port ${settings.port}, env: ${env}`);
});
