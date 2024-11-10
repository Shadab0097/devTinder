const express = require("express")

const app = express()

app.get("/", (req, res) => {
    res.send("hello Shadab")
});

app.use("/home", (req, res) => {
    res.send("hello from express js Home")
});

app.use("/test", (req, res) => {
    res.send("hello from express js")
});

app.listen(2000, () => console.log("Server is running"))