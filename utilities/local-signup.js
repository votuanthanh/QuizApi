const PassportLocalStrategy = require('passport-local').Strategy;
const encryption = require('./encryption');
const User = require('mongoose').model('User');

module.exports = new PassportLocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  session: false,
  passReqToCallback: true,
}, (req, email, password, done) => {
  const salt = encryption.generateSalt();
  const user = {
    username: email.trim(),
    email: email.trim(),
    hashedPass: encryption.generateHashedPassword(salt, password.trim()),
    salt: salt,
    firstName: req.body.firstName.trim(),
    lastName: req.body.lastName.trim(),
    roles: ['User'],
  };

  User.create(user)
      .then((user) => {
        console.log(`Email successfully registered ${user.email}`);
        return done(null);
      }).catch(() => {
        return done('Email already exists!');
      });
});
