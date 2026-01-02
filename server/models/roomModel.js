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
    groupAdmin: [{
        type: mongoose.Types.ObjectId,
        ref: 'user'
    }],
    groupDescription: {
        type: String,
        minlength: [3, 'Description should be more than 3 characters!'],
        trim: true,
        default: null,
    },
    onlyAdminsCanAddMembers: {
        type: Boolean,
        default: false,
    },
    onlyAdminsCanRemoveMembers: {
        type: Boolean,
        default: false,
    },
    onlyAdminsCanEditGroupInfo: {
        type: Boolean,
        default: false,
    },
    onlyAdminsCanEditGroupDescription: {
        type: Boolean,
        default: false,
    },
    onlyAdminsCanEditGroupPicture: {
        type: Boolean,
        default: false,
    },
    onlyAdminsCanEditGroupAdmin: {
        type: Boolean,
        default: false,
    },
},{timestamps: true})

const roomModel = new mongoose.model('room', roomSchema)

export default roomModel