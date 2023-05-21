const express = require('express');
const router = express.Router();
const passport = require('passport');

const messangerController = require('../controller/messanger_controller');

router.get('/messanger' , passport.checkAuthentication ,messangerController.messanger); 

module.exports = router;