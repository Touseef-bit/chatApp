import mongoose from "mongoose";


const roomSchema = await mongoose.Schema({
    roomName: {
        type: String,
        minlength: [3, 'Name should be more than 3 characters!'],
        trim: true,
        default: null,
    },
    members: [{
        type: mongoose.Types.ObjectId,
        ref: 'user'
    }],
    messages: [{
        type: mongoose.Types.ObjectId,
        ref: 'messages'
    }],
    profilePicture: {
        url: String,
    },
})

const roomModel = new mongoose.model('room', roomSchema)

export default roomModel