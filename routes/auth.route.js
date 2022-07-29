const express = require('express');
const controller = require('../controllers/auth.controller');
const loginValidation = require('../validations/login.validate');
const registerValidation = require('../validations/register.validate');

const router = express.Router();

router.post('/register', registerValidation, controller.register);
router.post('/login', loginValidation, controller.login);

module.exports = router;
