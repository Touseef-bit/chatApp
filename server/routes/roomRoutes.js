import express from "express";
import { getRoom , getRooms} from "../controllers/roomController.js";
import auth from "../middleware/authentication.js";

const router = express.Router()

router.get("/room",auth,getRooms)
router.get("/room/:id",auth,getRoom)

export default router