const express = require('express')
const User = require("../models/user")
const { validateSignupData, passwordEncryption } = require('../utils/validator')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const emailExistence = require('email-existence');

const authRouter = express.Router()


authRouter.post("/signup", async (req, res) => {


    try {
        //validate data
        validateSignupData(req)
        const { password, emailId, firstName, lastName } = req.body
        // password encryption
        const passwordHash = await passwordEncryption(password, 10)

        emailExistence.check(emailId, async (error, response) => {
            if (error) {
                res.status(400).send('please use existing email')
                return
            }


            if (response) {
                const user = new User({
                    emailId,
                    firstName,
                    lastName,
                    password: passwordHash
                })


                const savedUser = await user.save()
                const token = jwt.sign({ emailId: savedUser.emailId }, "SHADAB@Tinder$9711", { expiresIn: '1h' })
                // console.log(token)



                const transporter = nodemailer.createTransport({
                    host: 'smtp.hostinger.com',
                    port: 465,
                    secure: true,
                    auth: {
                        user: 'account@devtinder.site',
                        pass: 'Dev@7229.#'
                    }
                })

                const verificationUrl = `http://localhost:2000/verify-email/${token}`

                const mailOption = {
                    from: 'account@devtinder.site',
                    to: emailId,
                    subject: 'Verify Your Email',
                    html: `<p>Please verify your email by clicking <a href="${verificationUrl}">here</a>.</p>`,
                }

                await transporter.sendMail(mailOption)
                res.status(201).json({ message: 'Signup successful! Please verify your email.' });
            }
        })


        // send the cookie back to user

        // res.cookie("token", token, { expires: new Date(Date.now() + 8 * 3600000) })
        // res.json({ message: "User Saves successfully", data: savedUser })

    } catch (err) {
        res.status(400).send("error while signing Up " + err.message)
    }

})

authRouter.get('/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params


        const decodeObj = jwt.verify(token, "SHADAB@Tinder$9711")

        const { emailId } = decodeObj
        const user = await User.findOne({ emailId: emailId })

        if (!user) {
            return res.status(404).send('User not found.');
        }

        if (user.isVerified) {
            return res.status(400).send('Email already verified.');
        }
        user.isVerified = true;
        await user.save();

        res.send('Email verified successfully. You can close this tab now.');

    } catch (err) {
        res.status(400).send("error while Signing Up " + err.message)
    }
})

authRouter.post('/login', async (req, res) => {
    try {
        const { emailId, password } = req.body
        const user = await User.findOne({ emailId: emailId })

        if (!user) {
            throw new Error("invalid Credentials")
        }

        if (!user.isVerified) {
            return res.status(400).send('please verify your Email first')
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