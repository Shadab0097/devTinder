const express = require('express')
const { userAuth } = require("../middlewares/auth")
const { validateEditProfile, validateEditPassword } = require('../utils/validator')
const { validate } = require('../models/user')
const validator = require('validator')
const User = require("../models/user")
const bcrypt = require('bcrypt')





const profileRouter = express.Router()

profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try {
        const user = req.user
        console.log(user)
        res.send(user)

    } catch (err) {
        res.status(400).send("ERROR:" + err.message)
    }
})

profileRouter.post("/profile/edit", userAuth, async (req, res) => {
    try {

        if (!validateEditProfile(req)) {
            throw new Error("editing profile is not allowed")
        }

        const loggedInUser = req.user
        Object.keys(req.body).forEach((key) => loggedInUser[key] = req.body[key])

        await loggedInUser.save()
        res.send(`${loggedInUser.firstName} your profile is updated succesfully`)

    } catch (err) {
        res.status(400).send("ERROR:" + err.message)
    }

})

profileRouter.post("/profile/forgot/password", async (req, res) => {
    try {
        //is valid Email

        const emailFromUser = req.body.emailId
        // const newPassword = req.body.password
        // console.log(isValidEmail, newPassword)
        if (!validator.isEmail(emailFromUser)) {
            throw new Error('email is not valid')
        }

        // find the user if he present in db

        const findUserByEmail = await User.findOne({ emailId: emailFromUser })
        console.log(findUserByEmail)

        if (!findUserByEmail) {
            throw new Error('email is not registered')
        }
        const oldPasswordHash = findUserByEmail.password

        // getting new password from user
        const newPassword = req.body.password

        //comparing newPassword with oldPasswordHash
        const comparePassword = await bcrypt.compare(newPassword, oldPasswordHash)

        //throwing error if passwor dis same as before
        if (comparePassword) {
            throw new Error('please write something different now That you can remember ')
        }

        // validating password if comparePassword is false
        const newPasswordValid = await validateEditPassword(req)

        //changing old password into new password
        findUserByEmail.password = newPasswordValid

        // saving user into dataBase
        await findUserByEmail.save()

        // logging Out user
        res.cookie('token', null, { expires: new Date(Date.now()) })

        // sending response to user
        res.send("password updated successfully, please login again")
    } catch (err) {
        res.status(400).send("ERROR:" + err.message)
    }
})

module.exports = { profileRouter }