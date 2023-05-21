const express = require('express');
const router = express.Router();
const passport = require('passport');

const homeController = require('../controller/home_controler');

router.get('/',homeController.home);
router.get('/allfriends-and-users',passport.checkAuthentication  ,homeController.all_UsersandFriends);
//for any other routes access


router.use('/user',require('./friends'));
router.use('/user',require('./post'));
router.use('/user',require('./comments'));

router.use('/user',require('./users'));
router.use('/user' , require('./messanger'));

router.use('/auth' , require('./authuser'));
router.use('/likes' , require('./like'));


module.exports = router;