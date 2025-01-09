const express = require("express");
const connectDB = require('./config/database');
const cookieParser = require("cookie-parser");
const cors = require('cors');
const path = require('path')

const app = express();

app.use(cors({
    origin: 'https://devtinder.site',
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

// Use routers
app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);
app.use('/', adminRouter);
app.use('/', connectionProfileRouter);

// Serve static files from React's build folder
app.use(express.static(path.join(__dirname, "build")));

// Catch-all route for React frontend
app.use((req, res) => {
    res.sendFile(path.resolve(__dirname, "build", "index.html"));
});

connectDB().then(() => {
    console.log('Database connected successfully');

    app.listen(2000, () => console.log("Server is running on port 2000"));
}).catch((err) => {
    console.log(err.message + ' - DB Error while connecting');
});
