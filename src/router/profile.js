const express = require('express')
const { userAuth } = require("../middlewares/auth")
const { validateEditProfile, validateEditPassword } = require('../utils/validator')
const { validate } = require('../models/user')
const validator = require('validator')



const profileRouter = express.Router()

profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try {
        const user = req.user
        res.send(user)

    } catch (err) {
        res.status(400).send("ERROR:" + err.message)
    }
})

profileRouter.post("/profile/edit", userAuth, async (req, res) => {
    try {

        if (!validateEditProfile(req)) {
            throw new Error("editing password is not allowed")
        }

        const loggedInUser = req.user
        Object.keys(req.body).forEach((key) => loggedInUser[key] = req.body[key])

        await loggedInUser.save()
        res.send(`${loggedInUser.firstName} update succesfull`)

    } catch (err) {
        res.status(400).send("ERROR:" + err.message)
    }

})

profileRouter.post("/profile/forgot/password", userAuth, async (req, res) => {
    try {

        // valiadting new password
        const newPasswordValid = await validateEditPassword(req)

        //getting loggedIn user from userAuth
        const loggedInUser = req.user

        //changing old password into new password
        loggedInUser.password = newPasswordValid

        // saving user into dataBase
        loggedInUser.save()

        // logging Out user
        res.cookie('token', null, { expires: new Date(Date.now()) })

        // sending response to user
        res.send("password updated successfully, please login again")
    } catch (err) {
        res.status(400).send("ERROR:" + err.message)
    }
})

module.exports = { profileRouter }