const express = require('express');
const router = express.Router();
const passport = require('passport');
const chatController = require('../controller/chat_engine_controller');

// Routes for chatting
router.get('/chat',passport.checkAuthentication ,chatController.getChats);
router.post('/chat/create',passport.checkAuthentication, chatController.createChat);
router.post('/chat/send',passport.checkAuthentication, chatController.sendMessage);

module.exports = router;