const sendError = (err, res) => {
    const message = err.message
    const statusCode = err.statusCode
    const status = err.status

    return res.status(statusCode).json({
        success: status,
        message
    })
}

const errorMiddleware = (err, req, res, next) => {
    sendError(err,res)
}

export default errorMiddleware