const express = require('express');
const controller = require('../controllers/users.controller');
const tokenMiddleware = require('../middleware/auth-token');
const router = express.Router();

router.get('/', controller.all);
router.get('/view/:id', controller.view);
router.delete('/delete/:id', tokenMiddleware, controller.delete);
router.patch('/update/:id', tokenMiddleware, controller.update);
router.patch('/follow/:id', tokenMiddleware, controller.follow);

module.exports = router;
