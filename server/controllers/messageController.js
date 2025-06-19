import appError from "../utils/appError.js"
import messageModel from "../models/messageModel.js"
import roomModel from "../models/roomModel.js"
import userModel from '../models/userModel.js'
import catchAsync from '../utils/catchAsync.js'


export const sendMessage = catchAsync(async (req, res, next) => {
    const recieverId = req.params.id
    const senderId = req.user.id
    const { message } = req.body
    if (!message) {
        return next(new appError('Message is Required!', 400))
    }
    const existingRoom = await roomModel.findOne({
        members: { $all: [senderId, recieverId] }
    })
    const newMessage = new messageModel({
        message,
        senderId,
        recieverId,
    })
    if (existingRoom) {
        existingRoom.messages.push(newMessage);
        await Promise.all([await existingRoom.save(), await newMessage.save()])
    } else {
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
    }
    return res.status(201).json({
        success: true,
        message: "message sent successfully"
    })
})

export const addMembers = catchAsync(async (req, res, next) => {
    const { id } = req.params
    const senderId = req.user.id
    const user = await userModel.findOne({ _id: id })
    if (!user) {
        return next(new appError("User doesn't exist!", 404))
    }
    const existingRoom = await roomModel.findOne({
        members: { $all: [senderId, id] }
    })
    if (existingRoom) {
        return next(new appError("User is already added!", 200))
    } else {
        const room = new roomModel({
            members: [
                senderId,
                user,
            ]
        })
        await room.save()
    }
    return res.status(200).json({
        success: true,
        message: `${user.username} is added!`
    })
})


export const getRooms = catchAsync(async (req, res, next) => {
    const { id } = req.params
    const room = await roomModel.findOne({ _id: id }).populate([
        { path: 'members', select: 'username -_id' },
        {
            path: 'messages',select:'-_id', populate: [{
                path: 'senderId',
                select: 'username -_id'
            }, {
                path: 'recieverId',
                select: 'username -_id'
            }]
        }
    ]).select('-_id')
    console.log(room)
    if (!room) {
        return next(new appError("User is already added!", 200))
    }
    return res.status(200).json({
        success: true,
        room
    })
})