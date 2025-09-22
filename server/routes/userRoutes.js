import express from "express";
import { getAllUsers, uploadProfile, } from "../controllers/userController.js";
import upload from "../utils/cloudinary.js";
import auth from "../middleware/authentication.js";

const router = express.Router()

router.get('/getAllUser', auth, getAllUsers)
// router.get('/getUser', auth, getUser)
router.post('/uploadProfile', auth, upload({
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
    isMultiple: false,
    // fieldName: 'profile',
  }), uploadProfile)


export default router