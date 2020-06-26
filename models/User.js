const mongoose = require('mongoose');
const encryption = require('../utilities/encryption');

function getRequiredPropMsg(prop) {
  return `${prop} is required!`;
}

const userSchema = new mongoose.Schema({
  email: {
    type: mongoose.Schema.Types.String,
    required: getRequiredPropMsg('Email'),
    unique: true,
  },
  hashedPass: {
    type: mongoose.Schema.Types.String,
    required: getRequiredPropMsg('Password'),
  },
  phoneNumber: {
    type: mongoose.Schema.Types.String,
  },
  salt: {
    type: mongoose.Schema.Types.String,
    required: true,
  },
  firstName: {
    type: mongoose.Schema.Types.String,
    required: getRequiredPropMsg('First Name'),
  },
  lastName: {
    type: mongoose.Schema.Types.String,
    required: getRequiredPropMsg('Last Name'),
  },
  role: mongoose.Schema.Types.String,
  active: { type: mongoose.Schema.Types.Boolean, default: false },
  solvedExams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SolvedExam',
  }],
  dateRegistered: {
    type: mongoose.Schema.Types.Date,
    default: Date.now,
  },
});

userSchema.method({
  authenticate: function(password) {
    const newPass = encryption.generateHashedPassword(this.salt, password);

    if (newPass === this.hashedPass) {
      return true;
    }

    console.log('Invalid password!');
    return false;
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;

module.exports.seedAdminUser = () => {
  User.find({ email: 'admin@gmail.com' }).then((users) => {
    if (users.length > 0) {
      return;
    }

    const salt = encryption.generateSalt();
    const hashedPass = encryption.generateHashedPassword(salt, '123456');

    User.create({
      email: 'admin@gmail.com',
      hashedPass: hashedPass,
      salt: salt,
      firstName: 'Admin',
      lastName: 'Orient',
      role: 'Admin',
      active: true,
    }).then((admin) => {
      console.log(`Admin: ${admin.email} seeded successfully`);
    });
  });
};
