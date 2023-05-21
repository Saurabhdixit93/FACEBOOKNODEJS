const express = require('express');
const router = express.Router();
const passwordResetController = require('../controller/authUsers');




router.get('/passwor-reset-form', passwordResetController.showForgotPassword);

// Route to send a password reset email
router.post('/forgot-password/', passwordResetController.forgotPassword);
// Route to handle a password reset link
router.get('/reset-password/:token', passwordResetController.handleResetPasswordLink);

// Route to handle a password reset form submission
router.post('/reset-password/', passwordResetController.resetPassword);

module.exports = router;