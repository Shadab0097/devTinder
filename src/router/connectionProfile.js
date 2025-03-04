
const express = require('express')
const { userAuth } = require('../middlewares/auth')
const User = require('../models/user')
const validator = require('validator')


const connectionProfileRouter = express.Router()

// const USER_DATA = ['firstName', 'lastName', 'photoUrl', 'about', 'skills', 'age', 'gender', 'emailId']

connectionProfileRouter.get("/connection/view/profile", userAuth, async (req, res) => {
    try {
        const { emailId } = req.query

        if (!validator.isEmail(emailId)) {
            throw new Error('email is not valid')
        }

        const connectionProfile = await User.findOne({ emailId: emailId })
        // const { firstName, lastName, photoUrl, about, skills, age, gender } = connectionProfile
        if (!connectionProfile) {
            throw new Error('connection profile is not found')
        }

        res.json({
            data: {
                _id: connectionProfile._id,
                firstName: connectionProfile.firstName,
                lastName: connectionProfile.lastName,
                photoUrl: connectionProfile.photoUrl,
                about: connectionProfile.about,
                skills: connectionProfile.skills,
                age: connectionProfile.age,
                gender: connectionProfile.gender,
                isPremium: connectionProfile.isPremium,
            }
        })

    } catch (err) {
        res.status(400).send('ERROR' + err.message)
    }
})

module.exports = connectionProfileRouter