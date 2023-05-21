const express = require('express');
const router = express.Router();
const passport = require('passport');
const postsController = require('../controller/posts_controller');

// Also check User Present or not
router.post('/create-post',passport.checkAuthentication,postsController.post_Create);

router.get('/delete-post-comment/:id' , passport.checkAuthentication , postsController.destroy_post_comment );
//for accessing in routes
module.exports = router;