const jwt = require('jsonwebtoken');
const User = require('mongoose').model('User');
const PassportLocalStrategy = require('passport-local').Strategy;

module.exports = new PassportLocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  session: false,
  passReqToCallback: true,
}, (req, inputEmail, password, done) => {
  User.findOne({ email: inputEmail }).then((user) => {
    if (!user || !user.authenticate(password)) {
      return done('Incorect email or password');
    }

    const payload = {
      sub: user._id,
    };

    const token = jwt.sign(payload, 'c9ffcf6087a');
    const data = {
      email: user.email,
      id: user._id,
    };

    console.log('User data:');
    console.log(data);

    return done(null, token, data);
  }).catch((err) => {
    return done(err);
  });
});
