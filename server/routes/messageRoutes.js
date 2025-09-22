import express from "express";
import { addMembers, getRooms, sendfiles, sendMessage, sendMessageInRoom, getUserMessages, sendfilesInRoom, createRoom, uploadProfile } from "../controllers/messageController.js";
import auth from "../middleware/authentication.js";
import upload from '../utils/cloudinary.js'

const router = express.Router()

router.post('/message/:id', auth, upload({
    allowedMimeTypes: ['audio/webm', 'audio/ogg', 'audio/mpeg'],
    maxSizeMB: 10
}), sendMessage)
router.get('/getMessages/:id', auth, getUserMessages)
router.post('/roommessage/:id', auth, upload({
    allowedMimeTypes: ['audio/webm', 'audio/ogg', 'audio/mpeg'],
    maxSizeMB: 10
}), sendMessageInRoom)
router.post('/createRoom', auth, createRoom)
router.post('/addMember/:id', auth, addMembers)
router.get('/getRoom', auth, getRooms)
router.post('/uploadFiles', auth, upload({
    allowedMimeTypes: [
        'image/png', 'image/jpeg', 'image/jpg',
        'application/pdf', 'application/zip',
        'application/msword', 'video/mp4',
        'text/plain', 'application/json',
        'audio/mpeg', 'application/vnd.ms-excel',
    ],
    maxSizeMB: 50,
    maxFiles: 5,
    isMultiple: true,
}), sendfiles)
router.post('/uploadFiles/:id', auth, upload({
    allowedMimeTypes: [
        'image/png', 'image/jpeg', 'image/jpg',
        'application/pdf', 'application/zip',
        'application/msword', 'video/mp4',
        'text/plain', 'application/json',
        'audio/mpeg', 'application/vnd.ms-excel',
    ],
    maxSizeMB: 50,
    maxFiles: 5,
    isMultiple: true,
}), sendfilesInRoom)
// router.post('/uploadRoomProfile', auth, upload.single('roomProfile'), uploadProfile)

export default router