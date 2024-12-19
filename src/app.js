const express = require("express")
const connectDB = require('./config/database')
const cookieParser = require("cookie-parser")
const cors = require('cors')
const app = express()

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())


const { authRouter } = require('./router/authenticate')
const { profileRouter } = require('./router/profile')
const { requestRouter } = require('./router/request')
const userRouter = require("./router/user")
const adminRouter = require("./router/admin")
const connectionProfileRouter = require('./router/connectionProfile')


app.use('/', authRouter)
app.use('/', profileRouter)
app.use('/', requestRouter)
app.use('/', userRouter)
app.use('/', adminRouter)
app.use('/', connectionProfileRouter)




connectDB().then(() => {
    console.log('Database connected succesfully')
    app.listen(2000, () => console.log("Server is running"))

}).catch((err) => {
    console.log(err.message + ' DB Error while getting connect')
})
