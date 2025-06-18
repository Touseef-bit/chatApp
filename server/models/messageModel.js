import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
    message: {
        type: String,
        required: [true, 'Message is required!']
    },
    senderId: {
        type: mongoose.Types.ObjectId,
        ref: 'user'
    },
    recieverId: {
        type: mongoose.Types.ObjectId,
        ref: 'user'
    },
}, { timestamps: true })

const messageModel = new mongoose.model('message',messageSchema)

export default messageModel