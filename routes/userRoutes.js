const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const SolvedExam = require('../models/SolvedExam');

const router = new express.Router();

function validateRegisterData(data) {
  const errors = {};
  let isValid = true;
  let message = '';
  if (!data || typeof data.password !== 'string' ||
      data.password.trim().length < 4) {
    isValid = false;
    errors.password = 'Password must have at least 4 characters.';
  }

  if (!data || typeof data.firstName !== 'string' ||
      data.firstName.trim().length === 0) {
    isValid = false;
    errors.name = 'Please provide your name.';
  }

  if (!data || typeof data.lastName !== 'string' ||
      data.lastName.trim().length === 0) {
    isValid = false;
    errors.name = 'Please provide your name.';
  }

  if (!isValid) {
    message = 'Check the form for errors.';
  }

  return {
    success: isValid,
    message,
    errors,
  };
}

function validateLoginData(data) {
  const errors = {};
  let isFormValid = true;
  let message = '';

  if (!data || typeof data.email !== 'string' ||
    data.email.trim().length === 0) {
    isFormValid = false;
    errors.email = 'Please provide your email.';
  }

  if (!data || typeof data.password !== 'string' ||
    data.password.trim().length === 0) {
    isFormValid = false;
    errors.password = 'Please provide your password.';
  }

  if (!isFormValid) {
    message = 'Check the form for errors.';
  }

  return {
    success: isFormValid,
    message,
    errors,
  };
}

router.post('/login', (req, res, next) => {
  const validationResult = validateLoginData(req.body);
  if (!validationResult.success) {
    return res.status(200).json({
      success: false,
      message: validationResult.message,
      errors: validationResult.errors,
    });
  }

  return passport.authenticate('local-login', (err, token, userData) => {
    if (err) {
      if (err.name === 'IncorrectCredentialsError') {
        return res.status(200).json({
          success: false,
          message: err.message,
        });
      }

      return res.status(200).json({
        success: false,
        message: err,
      });
    }

    return res.json({
      success: true,
      message: 'You have successfully logged in!',
      token,
      user: userData,
    });
  })(req, res, next);
});

router.post('/register', (req, res, next) => {
  const validationResult = validateRegisterData(req.body);
  if (!validationResult.success) {
    return res.status(200).json({
      success: false,
      message: validationResult.message,
      errors: validationResult.errors,
    });
  }

  return passport.authenticate('local-signup', (err) => {
    if (err) {
      console.log(err),
      res.status(200).json({
        success: false,
        message: err,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'You have successfully signed up!' +
        'Now you should be able to log in.',
    });
  })(req, res, next);
});

router.get('/getUserById/:id', (req, res) => {
  const id = req.params.id;
  // console.log(id)

  User.findById(id).then((user) => {
    const userData = {
      username: user.username,
      fullName: user.firstName + ' ' + user.lastName,
      roles: user.roles,
      registrationDate: user.dateRegistered,
    };
    SolvedExam.find({ solvedBy: id }).then((quizzes) => {
      userData.solvedQuizzes = quizzes;
      res.status(200).json({
        success: true,
        message: `User data loaded!`,
        userData,
      });
    });
  }).catch((err) => {
    console.log(err);
    res.status(500).json({
      success: false,
      message: 'Cannot find quiz with id ' + id,
      errors: err,
    });
  });
});

module.exports = router;
