import appError from "../utils/appError.js"
import userModel from '../models/userModel.js'
import createToken from "../utils/createToken.js"

export const signup = async (req, res, next) => {
    const { username, email, password } = req.body
    if (!username || !email || !password) {
        return next(new appError('All fields are required!', 400))
    }
    const existingUser = await userModel.findOne({ email })
    if (existingUser) {
        return next(new appError('User already exist!', 400))
    }
    const newUser = new userModel({
        username,
        email,
        password
    })
    await newUser.save()
    const token = await createToken({ username, email })
    console.log(token)
    return res.status(200).json({
        success: true,
        message: 'User created Successfully!',
        user:{
            username,
            email
        },
        token
    })
}
export const Login = (req, res, next) => {

}
export const Logout = () => {

}