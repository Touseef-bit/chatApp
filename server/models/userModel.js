import mongoose from "mongoose";
// import bcrypt from 'bcrypt'


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        minlength: [5, 'Username should be more than 5 characters!'],
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: [7, 'Password should be more than 5 characters!'],

        trim: true,
    },
    roles:{
        type:String,
        enum:['teacher','student','admin'],
        default:'student'
    },
    token: {
        type: String,
        default: undefined
    }
}, { timestamps: true })


const usermodel = new mongoose.model('user', userSchema)

export default usermodel


// userSchema.pre('save', async function (next) {
//     if (!this.password.isModified()) return null;
//     const hashedPassword = await bcrypt.hash(this.password, 10)
//     this.password = hashedPassword
//     next()
// })