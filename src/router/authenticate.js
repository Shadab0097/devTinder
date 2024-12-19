const express = require('express')
const User = require("../models/user")
const { validateSignupData, passwordEncryption } = require('../utils/validator')

const authRouter = express.Router()


authRouter.post("/signup", async (req, res) => {


    try {
        //validate data
        validateSignupData(req)
        const { password, emailId, firstName, lastName } = req.body
        // password encryption
        const passwordHash = await passwordEncryption(password, 10)

        const user = new User({
            emailId,
            firstName,
            lastName,
            password: passwordHash
        })
        const savedUser = await user.save()
        const token = await savedUser.getJWT()

        // send the cookie back to user

        res.cookie("token", token, { expires: new Date(Date.now() + 8 * 3600000) })
        res.json({ message: "User Saves successfully", data: savedUser })

    } catch (err) {
        res.status(400).send("error while signing Up " + err.message)
    }

})

authRouter.post('/login', async (req, res) => {
    try {
        const { emailId, password } = req.body
        const user = await User.findOne({ emailId: emailId })

        if (!user) {
            throw new Error("invalid Credentials")
        }

        const isPasswordValid = await user.validatePassword(password)

        if (isPasswordValid) {
            // create a cookie

            const token = await user.getJWT()

            // send the cookie back to user
            res.cookie("token", token, { expires: new Date(Date.now() + 8 * 3600000) })
            res.send(user)
        } else {
            throw new Error("invalid Credentials")
        }
    } catch (err) {
        res.status(400).send("error while Login " + err.message)
    }
})
authRouter.post('/logout', async (req, res) => {

    res.cookie('token', null, { expires: new Date(Date.now()) })

    res.send('logout successfully')
})

module.exports = { authRouter }