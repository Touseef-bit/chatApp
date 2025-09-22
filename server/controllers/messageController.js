import appError from "../utils/appError.js"
import messageModel from "../models/messageModel.js"
import roomModel from "../models/roomModel.js"
import userModel from '../models/userModel.js'
import catchAsync from '../utils/catchAsync.js'
import voiceModel from '../models/voiceModel.js'



export const sendMessage = catchAsync(async (req, res, next) => {
    const receiverId = req.params.id;
    const senderId = req.user._id;
    const { message } = req.body;

    if (!message && !req.file?.path) {
        return next(new appError("Message or Voice Recording is required!", 400));
    }

    let newMessage;
    let voice;

    if (req.file?.path) {
        voice = new voiceModel({
            voice: { url: req.file.path }
        });
        await voice.save();

        newMessage = new messageModel({
            voiceMessage: voice._id,
            senderId,
            recieverId: receiverId,
        });
    } else if (message) {

        newMessage = new messageModel({
            message,
            senderId,
            recieverId: receiverId,
        });
    }

    let room = await roomModel.findOne({
        members: { $all: [senderId, receiverId], $size: 2 },
    });

    if (room) {
        room.messages.push(newMessage._id);
        await Promise.all([room.save(), newMessage.save()]);
    } else {
        room = new roomModel({
            members: [senderId, receiverId],
            messages: [newMessage._id],
        });
        await Promise.all([room.save(), newMessage.save()]);
    }

    return res.status(201).json({
        success: true,
        message: "Message sent successfully",
        url: voice 
    });
});

export const sendMessageInRoom = catchAsync(async (req, res, next) => {
    const { id } = req.params
    const message = req.body?.message || null;
    const senderId = req.user._id
    const room = await roomModel.findOne({ _id: id })
    let voice;
    let newMessage;
    // const user = await userModel.findOne({ _id: senderId })
    // if (room.members.length > 2) {
    //     if (user.roles !== 'admin') {
    //         return next(new appError("only Admin can Send messages!", 400))
    //     }
    // }
    if (!room) {
        return next(new appError("Room doesn't exist!", 400))
    }
    if (!message && !req.file?.path) {
        return next(new appError("Message or Voice Recording is required!", 400));
    }
    if (req.file?.path) {
        voice = new voiceModel({
            voice: {
                url: req.file.path
            }
        })
        await voice.save();
        newMessage = new messageModel({
            senderId,
            recieverId: null,
            voiceMessage: voice._id
        })
    } else if (message) {
        newMessage = new messageModel({
            senderId,
            recieverId: null,
            message,
        })
    }
    room.messages.push(newMessage)
    await Promise.all([await room.save(), await newMessage.save()])
    return res.status(200).json({
        success: true,
        message: 'message sent successfully!',
        voice:voice
    })
})

export const createRoom = catchAsync(async (req, res, next) => {
    const userToken = req.token;
    const userId = req.user._id.toString()
    let { roomName, userIds } = req.body;

    if (!roomName || !Array.isArray(userIds)) {
        return next(new appError("Room name or userIds are required", 400));
    }

    // const existingRoom = await roomModel.findOne({ roomName })
    userIds = [...userIds, userId];
    console.log(userId, userIds)

    const user = await userModel.findOne({ token: userToken });
    const users = await userModel.find({ _id: { $in: userIds } }).select("username profilePicture")
    // console.log(users)

    // const allMemberIds = Array.from(new Set([...users, users]));

    const room = new roomModel({
        roomName,
        members: users,
    });

    await room.save()

    // user.roles = 'admin'

    await Promise.all([await user.save(), await room.save()])

    return res.status(201).json({
        success: true,
        message: "Room created successfully",
        data: room,
    });
});


export const addMembers = catchAsync(async (req, res, next) => {
    const { id } = req.params
    const userToken = req.token
    const user = await userModel.findOne({ token: userToken })
    if (!user) {
        return next(new appError("User doesn't exist!", 404))
    }
    // if (user.roles !== 'admin') {
    //     return next(new appError("Only admin can add members!", 400))
    // }
    const existingRoom = await roomModel.findOne({
        members: { $all: [senderId, id] }
    })
    if (existingRoom) {
        return next(new appError("User is already added!", 400))
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
    const userToken = req.token;
    const user = await userModel.findOne({ token: userToken })

    const rooms = await roomModel.find({
        members: { $in: [user._id] }
    })
        .populate([
            { path: 'members', select: 'username profilePicture' },
            {
                path: 'messages',
                // select: '',
                populate: [
                    { path: 'senderId', select: 'username profilePicture token -_id' },
                    { path: 'recieverId', select: 'username profilePicture token -_id' },
                    { path: 'voiceMessage' , select:"voice -_id " }
                ]
            }
        ])

    return res.status(200).json({
        success: true,
        rooms: rooms || roomName,
    });
});

export const uploadProfile = catchAsync(async (req, res, next) => {
    const userToken = req.token
    const user = await userModel.findOne({ token: userToken })
    user.profile.url = req.file.path
    await user.save()
})


export const sendfiles = catchAsync(async (req, res, next) => {
    const files = req.files;
    const recieverId = req.body.recieverId || null
    const senderId = req.user._id
    const reciever = await userModel.findOne({ _id: recieverId })
    const existingRoom = await roomModel.findOne({
        members: { $all: [senderId, recieverId] }
    })
    const fileObjects = files.map((file) => ({
        url: file.path,
        public_id: file.filename,
        filename: file.originalname,
        mimetype: file.mimetype,
    }));
    const newMessage = new messageModel({
        senderId,
        recieverId,
        files: fileObjects
    })
    if (existingRoom) {
        existingRoom.messages.push(newMessage._id);
        await Promise.all([await existingRoom.save(), await newMessage.save()])
    }
    else {
        const newRoom = new roomModel({
            members: [senderId, recieverId],
            messages: [newMessage],
            roomName: reciever.username,
        });
        await Promise.all([await newRoom.save(), await newMessage.save()])
    }
    res.status(200).json({ success: true, files: fileObjects });
})

export const sendfilesInRoom = catchAsync(async (req, res, next) => {
    const files = req.files;
    const roomId = req.params.id
    const senderId = req.user._id
    const existingRoom = await roomModel.findOne({ _id: roomId })
    const fileObjects = files.map((file) => ({
        url: file.path,
        public_id: file.filename,
        filename: file.originalname,
        mimetype: file.mimetype,
    }));
    const newMessage = new messageModel({
        senderId,
        files: fileObjects
    })
    existingRoom.messages.push(newMessage._id);
    await Promise.all([await existingRoom.save(), await newMessage.save()])
    res.status(200).json({ success: true, files: fileObjects });
})


export const getUserMessages = catchAsync(async (req, res, next) => {
    const SenderId = req.user._id
    const recieverId = req.params.id

    let room = await roomModel.findOne({
        members: { $all: [SenderId, recieverId], $size: 2 },
    }).populate([
        { path: 'members', select: 'username profilePicture' },
        {
            path: 'messages',
            // select: '',
            populate: [
                { path: 'senderId', select: 'username token -_id' },
                { path: 'recieverId', select: 'username token -_id' }
            ]
        }
    ])

    return res.status(200).json({
        success: true,
        room
    })
})