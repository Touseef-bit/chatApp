import mongoose from "mongoose";


const roomSchema = await mongoose.Schema({
    members: [{
        type: mongoose.Types.ObjectId,
        ref: 'user'
    }],
    messages: [{
        type: mongoose.Types.ObjectId,
        ref: 'message'
    }]
})

const roomModel = new mongoose.model('room',roomSchema)

export default roomModel