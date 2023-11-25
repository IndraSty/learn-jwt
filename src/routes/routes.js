import express from "express";
import userController from "../controller/user-controller.js";
import { checkAuth } from "../middleware/check-auth.js";

export const router = express.Router();

router.post('/api/users', userController.register);
router.post('/api/users/login', userController.login);
router.delete('/api/logout', userController.logout);

router.get('/api/users', checkAuth, userController.get);