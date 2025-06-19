import appError from "../utils/appError.js"
import userModel from '../models/userModel.js'
import createToken from "../utils/createToken.js"
import bcrypt from 'bcrypt'

export const signup = async (req, res, next) => {
    const { username, email, password } = req.body
    if (!username || !email || !password) {
        return next(new appError('All fields are required!', 400))
    }
    const existingUser = await userModel.findOne({ email })
    if (existingUser) {
        return next(new appError('User already exist!', 400))
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new userModel({
        username,
        email,
        password: hashedPassword,
    })
    const token = await createToken({ id: newUser._id, username, email })
    newUser.token = token
    await newUser.save()
    return res.status(200).json({
        success: true,
        message: 'User created Successfully!',
        user: {
            username,
            email
        },
        token
    })
}
export const Login = async (req, res, next) => {
    const { email, password } = req.body
    if (!email || !password) {
        return next(new appError('All fields are required!', 400))
    }
    const user = await userModel.findOne({ email })
    if (!user) {
        return next(new appError("User doesn't exist!", 400))
    }
    const comparePassword = await bcrypt.compare(password, user.password)
    if (!comparePassword) {
        return next(new appError("Email or Password is incorrect!", 400))
    }
    return res.status(200).json({
        success: true,
        message: 'Login Successfully!',
        token: user.token  
    })
}