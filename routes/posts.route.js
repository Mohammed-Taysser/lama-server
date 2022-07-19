const express = require('express');
const controller = require('../controllers/posts.controller');
const tokenMiddleware = require('../middleware/auth-token');
const router = express.Router();

router.get('/', controller.all);
router.get('/timeline', tokenMiddleware, controller.timeline);
router.post('/create', tokenMiddleware, controller.create);
router.get('/view/:id', controller.view);
router.delete('/delete/:id', tokenMiddleware, controller.delete);
router.patch('/update/:id', tokenMiddleware, controller.update);
router.patch('/like/:id', tokenMiddleware, controller.like);

module.exports = router;
