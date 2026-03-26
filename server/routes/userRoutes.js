import express from 'express';
import {signup} from "../controllers/userControllers/signup.js";
import {loginUser} from "../controllers/userControllers/login.js";
import { checkAuth } from '../controllers/userControllers/checkAuth.js';
import { updateProfile } from '../controllers/userControllers/updateProfile.js';
import { protectedRoute } from '../middleware/auth.js';

const userRouter = express.Router();
userRouter.post("/signup", signup);
userRouter.post("/login", loginUser);
userRouter.get("/check", protectedRoute, checkAuth);
userRouter.put("/update-profile", protectedRoute, updateProfile);

export default userRouter;