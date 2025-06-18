import jwt from 'jsonwebtoken'


const createToken = async (payload) => {
    try {
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: 1000 * 60 * 60 * 24
        })
        return token
    } catch (error) {
        console.log(error)
    }
}

export default createToken