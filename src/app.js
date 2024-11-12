const express = require("express")

const app = express()

// app.get(/.*fly$/, (req, res) => {
//     res.send("hello Shadab")
// });
app.use("/test", (req, res, next) => {
    // console.log(req.params)
    // res.send("hello Shadab")
    console.log('handler 1')
    next()
},
    [(req, res, next) => {
        // console.log(req.params)
        // res.send("hello Shadab")
        console.log('handler 2')

        next()
    }],
    [(req, res, next) => {
        // console.log(req.params)
        // res.send("hello Shadab")
        console.log('handler 3')

        next()
    }],
    (req, res) => {
        // console.log(req.params)
        console.log('handler 4')

        res.send("hello Shadab 5")
    });

// app.get("/test", (req, res) => {
//     console.log(req.query)
//     res.send("hello Shadab")
// });

// app.post("/test", (req, res) => {
//     console.log(req.body)
//     res.send("data successfuly posted on the server")
// });

// app.delete("/test", (req, res) => {

//     res.send("data successfuly deleted")
// });


app.listen(2000, () => console.log("Server is running"))