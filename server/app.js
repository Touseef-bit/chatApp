import express from 'express'
import dotenv from 'dotenv'
import connectToDb from './utils/Db.js'
import errorMiddleware from './middleware/errorMiddleware.js'
import authRouter from './routes/authRoutes.js'
dotenv.config()

const app = express()

const PORT = process.env.PORT || 3000

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',authRouter)


app.listen(PORT, () => {
    connectToDb()
    console.log('Server connected!')
})

app.use(errorMiddleware)
