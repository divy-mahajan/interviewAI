const express = require('express');
const authRouter = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require("../middlewares/auth.middleware")

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
authRouter.post('/register', authController.registerUserController);

/**
 * @route POST /api/auth/login
 * @description Login a user
 * @access Public
 */
authRouter.post('/login', authController.loginUserController);

/**
 * @route GET & POST /api/auth/logout
 * @description clear token from user cookie and add to blacklist
 * @access public
 */
authRouter.get('/logout', authController.logoutUserController);
authRouter.post('/logout', authController.logoutUserController);

/**
 * @route GET /api/auth/get-me
 * @description get the current logged in user details
 * @access private
 */
authRouter.get('/get-me', authMiddleware.authUser, authController.getMeController)

module.exports = authRouter;