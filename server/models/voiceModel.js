import mongoose from "mongoose";


const voiceSchema = new mongoose.Schema({
    voice: {
        url: {
            type: String,
            required: true
        },
       
    },
}, { timestamps: true })


const voiceModel = new mongoose.model("voice", voiceSchema)


export default voiceModel