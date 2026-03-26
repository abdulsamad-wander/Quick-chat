import express from 'express';
import { protectedRoute } from '../middleware/auth.js';
import {getUserForSideBar} from "../controllers/messageControllers/getUserForSideBar.js";
import { getMessages } from '../controllers/messageControllers/getMessages.js';
import { markMessageAsSeen } from '../controllers/messageControllers/markMessageAsSeen.js';
import { sendMessage } from '../controllers/messageControllers/sendMessage.js';

const messageRouter = express.Router();

messageRouter.get("/users", protectedRoute, getUserForSideBar);
messageRouter.get("/:id", protectedRoute, getMessages);
messageRouter.put("/mark/:id", protectedRoute, markMessageAsSeen);
messageRouter.post("/send/:id", protectedRoute, sendMessage);

export default messageRouter;