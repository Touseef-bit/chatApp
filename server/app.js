import express from 'express'
import dotenv from 'dotenv'
import connectToDb from './utils/Db.js'
import errorMiddleware from './middleware/errorMiddleware.js'
import authRouter from './routes/authRoutes.js'
import cors from 'cors'
import messageRouter from './routes/messageRoutes.js'
import userRouter from './routes/userRoutes.js'
import roomRouter from './routes/roomRoutes.js'
import { app, server } from './server.js'
import https from 'https';
import appError from './utils/appError.js'
import mongoSanitize from 'express-mongo-sanitize'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import xss from 'xss-clean'

dotenv.config({ path: '../.env' })


const PORT = process.env.PORT || 3000

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// const Limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000, // 1 hour
//   message: "Too many requests, please try again after 1 hour",
// })

// app.use(mongoSanitize())
// app.use("/api", Limiter)
app.use(express.json());
// app.use(xss())
app.use(express.urlencoded({ extended: true }));
// app.use(helmet())

app.use('/api', authRouter)
app.use('/api', messageRouter)
app.use('/api', userRouter)
app.use('/api', roomRouter)
// app.all("*", (req, res, next) => {
//   next(new appError(`Can't find ${req.originalUrl} on this server`, 404));
// });


server.listen(PORT,"0.0.0.0", () => {
    connectToDb()
    console.log(`Server connected at port ${PORT}!`)
})
process.on("unhandledRejection", (err) => {
    console.log(err.name, err.message);
    process.exit(1);
});

process.on("uncaughtException", (err) => {
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

process.on("unhandledRejection", (err) => {
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
app.use(errorMiddleware)
