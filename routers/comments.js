const express = require('express');
const router = express.Router();
const passport = require('passport');
const commentsController = require('../controller/comments_controller');

// Also check User Present or not
router.post('/created',passport.checkAuthentication,commentsController.comment_Create);
router.get('/delete-comment/:id',passport.checkAuthentication,commentsController.destroy_comment);


//for accessing in routes
module.exports = router;