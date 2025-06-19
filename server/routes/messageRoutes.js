import express from "express";
import { addMembers, getRooms, sendMessage } from "../controllers/messageController.js";
import auth from "../middleware/authentication.js";

const router = express.Router()

router.post('/message/:id',auth,sendMessage)
router.post('/addMember/:id',auth,addMembers)
router.get('/getRoom/:id',auth,getRooms)

export default router