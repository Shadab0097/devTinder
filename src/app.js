const express = require("express");
const connectDB = require('./config/database');
const cookieParser = require("cookie-parser");
const cors = require('cors');
const app = express();

require("dotenv").config();

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Import routers
const { authRouter } = require('./router/authenticate');
const { profileRouter } = require('./router/profile');
const { requestRouter } = require('./router/request');
const userRouter = require("./router/user");
const adminRouter = require("./router/admin");
const connectionProfileRouter = require('./router/connectionProfile');
const paymentRouter = require("./router/payment");


// Use routers
app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);
app.use('/', adminRouter);
app.use('/', connectionProfileRouter);
app.use('/', paymentRouter);



connectDB().then(() => {
    console.log('Database connected successfully');

    app.listen(process.env.PORT, () => console.log("Server is running on port 2000"));
}).catch((err) => {
    console.log(err.message + ' - DB Error while connecting');
});
