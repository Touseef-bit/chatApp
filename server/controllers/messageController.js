import appError from "../utils/appError.js"
import messageModel from "../models/messageModel.js"
import roomModel from "../models/roomModel.js"


export const sendMessage = async (req, res, next) => {
    const recieverId = req.params.id
    const senderId = req.user.id
    const { message } = req.body
    const existingRoom = await roomModel.findOne({
        members: { $all: [senderId, recieverId] }
    })
    const newMessage = new messageModel({
        message,
        senderId,
        recieverId,
    })
    if (existingRoom) {
        await existingRoom.messages.push(newMessage)
    }
    const newRoom = new roomModel({
        members: [
            senderId,
            recieverId,
        ],
        messages: [
            newMessage,
        ]
    })
    await Promise.all([await newRoom.save(), await newMessage.save()])
    return res.status(201).json({
        success: true,
        message: "message sent successfully"
    })
}