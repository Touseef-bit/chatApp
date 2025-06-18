import mongoose from "mongoose";
import bcrypt from 'bcrypt'


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        min: 5,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        min: 7,
        trim: true,
    },
}, { timestamps: true })


const usermodel = new mongoose.model('user', userSchema)

export default usermodel


userSchema.pre('save', async function (next) {
    if (!this.password.isModified()) return null;
    const hashedPassword = await bcrypt.hash(this.password, 10)
    this.password = hashedPassword
    next()
})