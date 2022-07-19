const validator = require('validator/validator');

module.exports = (email, password) => {
  let errorAsObject = {};

  if (email) {
    if (!validator.isEmail(email)) {
      errorAsObject.email = `please provide valid email`;
    }
  } else {
    errorAsObject.username = `email is missing`;
  }

  if (password) {
    if (!validator.isStrongPassword(password)) {
      errorAsObject.password = `please provide strong password`;
    }
  } else {
    errorAsObject.password = `password is missing`;
  }

  return errorAsObject;
};
