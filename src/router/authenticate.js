const express = require('express')
const User = require("../models/user")
const { validateSignupData, passwordEncryption } = require('../utils/validator')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const axios = require('axios')

const authRouter = express.Router()


authRouter.post("/signup", async (req, res) => {


    try {
        //validate data
        validateSignupData(req)
        const { password, emailId, firstName, lastName } = req.body
        // password encryption
        const passwordHash = await passwordEncryption(password, 10)


        // const emailValid = await new Promise((resolve, reject) => {

        //     emailExistence.check(emailId, async (error, response) => {

        //         if (error) {
        //             return res.status(400).send('please use existing email')

        //         }

        //         resolve(response)
        //     })

        //     setTimeout(() => {
        //         reject(new Error('Email validation timeout.'))
        //     }, 5000)
        // })

        const emailValid = await axios
            .get(`https://api.hunter.io/v2/email-verifier?email=${emailId}&api_key=fcd597b6944ea07416425141fc0812310ee5ed21`)

        const emailData = await emailValid.data
        // console.log(emailData)

        if (emailData?.data?.status !== 'accept_all') {
            return res.status(400).send('Invalid or non-existent email. Please use a valid email address.');
        }

        // const savedUser = await user.save()
        const token = jwt.sign({
            emailId,
            firstName,
            lastName,
            password: passwordHash
        }, "SHADAB@Tinder$9711", { expiresIn: '1h' })
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
        // http://localhost:5173/
        const verificationUrl = `api/verify-email/${token}`
        // const verificationUrl = `http://localhost:2000/verify-email/${token}`


        const mailOption = {
            from: 'account@devtinder.site',
            to: emailId,
            subject: 'Verify Your Email',
            html: `
             <div style="max-width: 28rem; width: 100%; background-color:rgb(143, 182, 245); border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); padding: 2rem; text-align: center; font-family: Arial, sans-serif;">
            <div style=" margin: 0 auto 1rem; color: #3b82f6;">
                <h1> 👩🏿‍💻Dev Tinder </h1>
            </div>
            <h1 style="font-size: 1.5rem; font-weight: bold; color: #1f2937; margin-bottom: 0.75rem;">Verify your email</h1>
            <p style="color: #4b5563; margin-bottom: 0.5rem;">We've sent a verification link to:</p>
            <p style="color: #3b82f6; font-weight: 500; margin-bottom: 1rem;">${emailId}</p>
            <p style="font-size: 0.875rem; color: #9ca3af;">Please verify your email by clicking <a href="${verificationUrl}">here</a>.</p>
        </div>
            
`,
        }

        await transporter.sendMail(mailOption)
        res.status(201).json({ message: 'Signup successful! Please verify your email.' });



        // send the cookie back to user

        // res.cookie("token", token, { expires: new Date(Date.now() + 8 * 3600000) })
        // res.json({ message: "User Saves successfully", data: savedUser })

    } catch (err) {
        res.status(400).send(err.message)
    }

})

authRouter.get('/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params


        const decodeObj = jwt.verify(token, "SHADAB@Tinder$9711")

        const { emailId,
            firstName,
            lastName,
            password: passwordHash } = decodeObj

        const existingUser = await User.findOne({ emailId });
        if (existingUser) {
            return res.status(400).send('Email already verified or user already exists.');
        }

        const user = new User({
            emailId,
            firstName,
            lastName,
            password: passwordHash,
            isVerified: true
        })

        await user.save();

        if (!user) {
            return res.status(404).send('User not found.');
        }


        res.send('Email verified successfully. You can close this tab now.');

    } catch (err) {
        res.status(400).send(err.message)
    }
})

authRouter.post('/login', async (req, res) => {
    try {
        const { emailId, password } = req.body
        const user = await User.findOne({ emailId: emailId })

        if (!user) {
            res.status(400).send('User not found or not verified. Please verify your email first.')
            return
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
        res.status(400).send(err.message)
    }
})
authRouter.post('/logout', async (req, res) => {

    res.cookie('token', null, { expires: new Date(Date.now()) })

    res.send('logout successfully')
})

module.exports = { authRouter }