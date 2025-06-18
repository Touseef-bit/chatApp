const sendError = (err, res) => {
    const message = err.message || 'Internal Server Error!'
    const statusCode = err.statusCode || 500
    const status = err.status || 'fail'
    return res.status(statusCode).json({
        success: status,
        message
    })
}

const errorMiddleware = (err, req, res, next) => {
    sendError(err,res)
}

export default errorMiddleware