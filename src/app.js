const express = require("express")
const connectDB = require('./config/database')
const cookieParser = require("cookie-parser")
const app = express()

app.use(express.json())
app.use(cookieParser())


const { authRouter } = require('./router/authenticate')
const { profileRouter } = require('./router/profile')
const { requestRouter } = require('./router/request')


app.use('/', authRouter)
app.use('/', profileRouter)
app.use('/', requestRouter)



connectDB().then(() => {
    console.log('Database connected succesfully')
    app.listen(2000, () => console.log("Server is running"))

}).catch((err) => {
    console.log(err.message + ' DB Error while getting connect')
})
