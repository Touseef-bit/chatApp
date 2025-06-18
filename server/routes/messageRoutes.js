import express from "express";
import { sendMessage } from "../controllers/messageController.js";
import auth from "../middleware/authentication.js";

const router = express.Router()

router.post('/message/:id',auth,sendMessage)

export default router