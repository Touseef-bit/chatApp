import express from 'express'
import dotenv from 'dotenv'
import connectToDb from './utils/Db.js'
import errorMiddleware from './middleware/errorMiddleware.js'
import authRouter from './routes/authRoutes.js'
import cors from 'cors'
import messageRouter from './routes/messageRoutes.js'
dotenv.config()

const app = express()

const PORT = process.env.PORT || 3000

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', authRouter)
app.use('/api', messageRouter)

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.listen(PORT, () => {
    connectToDb()
    console.log('Server connected!')
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
