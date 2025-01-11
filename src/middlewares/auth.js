const jwt = require("jsonwebtoken")
const User = require("../models/user")

const userAuth = async (req, res, next) => {
    try { // read the cookie
        const { token } = req.cookies
        if (!token) {
            return res.status(401).send("please login")
        }
        //validate the cookie
        const decodeObj = await jwt.verify(token, process.env.JWT_SECRET)

        //decode the cookie
        const { _id } = decodeObj

        //find the user
        const user = await User.findById(_id)
        if (!user) {
            throw new Error("user Does not Exist")
        }
        req.user = user // we have found the user
        next()
    } catch (err) {
        res.status(410).send("ERROR" + err.message)
    }


}



module.exports = { userAuth }

