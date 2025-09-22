import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    message: {
      type: String,
    },
    senderId: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
    recieverId: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
    files: [
      {
        url: { type: String, required: true },
        public_id: { type: String }, 
        filename: { type: String }, 
        mimetype: { type: String },
      },
    ],
    voiceMessage:{
      type: mongoose.Types.ObjectId,
      ref: "voice",
    }
  },
  { timestamps: true }
);


const messageModel = new mongoose.model('messages', messageSchema)

export default messageModel