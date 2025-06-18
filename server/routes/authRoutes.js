import express from "express";

const router = express.Router()
import {Login, signup} from '../controllers/authController.js'

router.post('/signup',signup)
router.post('/login',Login)


export default router