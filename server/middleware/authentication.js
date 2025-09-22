import appError from "../utils/appError.js"
import dotenv from "dotenv"
import jwt from 'jsonwebtoken'
import usermodel from "../models/userModel.js"
dotenv.config()

const auth = async(req, res, next) => {
    let token;
    const {authorization} = req.headers
    if(authorization && authorization.startsWith('Bearer')){
        token = authorization.split(" ")[1]
    }
    if(!token){
        return next(new appError('Login first!',401))
    }
    let decoded = jwt.verify(token,process.env.JWT_SECRET)
    req.user = await usermodel.findOne({username:decoded.username}).select('+token')
    if(!req.user.token.includes(token)){
        return next(new appError('Not Authorized!',401))
    }
    req.token = req.user.token
    next()
}

export default auth