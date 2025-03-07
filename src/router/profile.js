const express = require('express')
const { userAuth } = require("../middlewares/auth")
const { validateEditProfile, validateEditPassword } = require('../utils/validator')
const { validate } = require('../models/user')
const validator = require('validator')
const User = require("../models/user")
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const multer = require('multer')
const path = require('path')
// const app = express();




const otpStore = {};



const profileRouter = express.Router()



profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try {
        const user = req.user
        res.send(user)

    } catch (err) {
        res.status(400).send("ERROR:" + err.message)
    }
})

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/images')

    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
    }

})

const upload = multer({
    storage: storage
})





profileRouter.patch("/profile/edit", upload.single('file'), userAuth, async (req, res) => {
    try {

        if (!validateEditProfile(req)) {
            throw new Error("editing profile is not allowed")
        }

        const loggedInUser = req.user
        Object.keys(req.body).forEach((key) => loggedInUser[key] = req.body[key])

        if (req.file && req.file.filename) {
            loggedInUser.photoUrl = req.file.filename;
        }



        await loggedInUser.save()
        res.json({
            message: `${loggedInUser.firstName} your profile is updated succesfully`,
            data: loggedInUser
        })

    } catch (err) {
        res.status(400).send("ERROR:" + err.message)
    }


})

// profileRouter.patch("/upload", upload.single('file'), userAuth, async (req, res) => {
//     try {

//         const loggedInUser = req.user
//         loggedInUser.photoUrl = String(req.file.filename);
//         await loggedInUser.save()
//         res.json(loggedInUser)
//     } catch (err) {
//         console.log(err)
//     }
// })




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

        if (!findUserByEmail) {
            throw new Error('email is not registered')
        }

        function generateOTP() {
            return Math.floor(1000 + Math.random() * 9000).toString();
        }
        const createOtp = generateOTP()

        otpStore[emailFromUser] = createOtp

        const transporter = nodemailer.createTransport({
            host: 'smtp.hostinger.com',
            port: 465,
            secure: true,
            auth: {
                user: 'support@devtinder.site',
                pass: process.env.EMAIL_PASS
            }
        })

        const mailOption = {
            from: "support@devtinder.site",
            to: emailFromUser,
            subject: "Password Reset OTP",
            html: `<div style="max-width: 28rem; width: 100%; background-color:rgb(184, 208, 246); border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); padding: 2rem; text-align: center; font-family: Arial, sans-serif;">
            <h1 style="font-size: 1.5rem; font-weight: bold; color:rgb(9, 12, 16); margin-bottom: 0.75rem;">One Time Password</h1>
            <p style="color:rgb(57, 76, 103); margin-bottom: 0.5rem;">We've sent a OTP  to:</p>
            <p style="color: #3b82f6; font-weight: 500; margin-bottom: 1rem;">${emailFromUser}</p>
            <p style="font-size: 0.875rem; color: #9ca3af;"> Your OTP for password reset is: ${createOtp}.</p>
        </div>`
        }


        await transporter.sendMail(mailOption)

        res.send("OTP sent to your email. Please verify it to reset password")


    } catch (err) {
        res.status(400).send(err.message)
    }
})

profileRouter.post('/profile/otp/verify', async (req, res) => {
    try {
        const { emailId, otp } = req.body

        const trimOtp = otp.trim()


        // Check if OTP exists and matches
        if (otpStore[emailId] !== trimOtp) {
            throw new Error("Invalid OTP");
        }

        const findUserByEmail = await User.findOne({ emailId });
        if (findUserByEmail.emailId !== emailId) {
            throw new Error('Invalid Email')
        }
        if (!findUserByEmail) {
            throw new Error("User not found");
        }


        const oldPasswordHash = findUserByEmail.password

        // getting new password from user
        const newPassword = req.body.password

        //comparing newPassword with oldPasswordHash
        const comparePassword = await bcrypt.compare(newPassword, oldPasswordHash)


        //throwing error if passwor dis same as before
        if (comparePassword) {
            throw new Error('please write something different now ')
        }

        // validating password if comparePassword is false
        const newPasswordValid = await validateEditPassword(req)



        //changing old password into new password
        findUserByEmail.password = newPasswordValid

        // saving user into dataBase
        await findUserByEmail.save()
        delete otpStore[emailId];

        // logging Out user
        res.cookie('token', null, { expires: new Date(Date.now()) })

        // sending response to user
        res.send("password updated successfully, please login again")

    } catch (err) {
        res.status(400).send(err.message)
    }
})

module.exports = { profileRouter }