const express = require("express")
const adminAuth = require("./middlewares/auth")
const userAuth = require("./middlewares/auth")


console.log(adminAuth)

const app = express()

// app.get(/.*fly$/, (req, res) => {
//     res.send("hello Shadab")
// });
// app.use("/test", (req, res, next) => {
//     // console.log(req.params)
//     // res.send("hello Shadab")
//     console.log('handler 1')
//     next()
// },
//     [(req, res, next) => {
//         // console.log(req.params)
//         // res.send("hello Shadab")
//         console.log('handler 2')

//         next()
//     }],
//     [(req, res, next) => {
//         // console.log(req.params)
//         // res.send("hello Shadab")
//         console.log('handler 3')

//         next()
//     }],
//     (req, res, next) => {
//         // console.log(req.params)
//         console.log('handler 4')
//         next()
//         res.send("hello Shadab 5")
//     });

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

app.use("/admin", adminAuth)

app.get("/admin/getAllData", (req, res) => {
    res.send("user data sent")
})

app.get("/admin/deleteUser", (req, res) => {
    res.send("user deleted")
})

app.get("/user", userAuth, (req, res) => {
    res.send("user succesfully sent")
})




// app.use("/", (req, res, next) => {
//     const admin = true
//     if (admin) {
//         res.status(401).send("unauthorized")
//     } else {
//         next()
//     }
//     // res.send("home")
// })

// app.use("/about", (req, res) => {
//     res.send("about")
// })

// app.use("/contact", (req, res) => {
//     res.send("contact")
// })

app.listen(2000, () => console.log("Server is running"))