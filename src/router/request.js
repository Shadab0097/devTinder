const express = require("express")
const { userAuth } = require("../middlewares/auth")
const ConnectionRequest = require("../models/connectionRequest")
const User = require("../models/user")
const nodemailer = require('nodemailer')


const requestRouter = express.Router()

requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id
        const toUserId = req.params.toUserId
        const status = req.params.status

        const connectionRequestUser = new ConnectionRequest({
            fromUserId,
            toUserId,
            status,
        });

        const allowedStatus = ["interested", "ignored"]

        if (!allowedStatus.includes(status)) {

            return res.status(400).send('invalid status type')

        }

        const toUser = await User.findById(toUserId)

        if (!toUser) {
            return res.status(404).send('user Not found')
        }


        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId },

            ]
        })

        if (existingConnectionRequest) {
            return res.status(400).send('request already existed')
        }

        const data = await connectionRequestUser.save()

        res.json({ message: req.user.firstName + ' ' + status + ' ' + toUser.firstName, data })

        const transporter = nodemailer.createTransport({
            host: 'smtp.hostinger.com',
            port: 465,
            secure: true,
            auth: {
                user: 'connectionrequest@devtinder.site',
                pass: process.env.EMAIL_PASS
            }
        })

        const mailOption = {
            from: 'connectionrequest@devtinder.site',
            to: toUser.emailId,
            subject: 'Connection Request',
            html: ` <div style="max-width: 600px; margin: 20px auto; font-family: Arial, sans-serif; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
    <!-- Header -->
    <div style="background: #4338ca; color: white; padding: 20px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">Dev Tinder</h1>
   
      <h1 style="margin: 0; font-size: 20px;">Connection Request</h1>
    </div>

    <!-- Profile Section -->
    <div style="padding: 30px; text-align: center;">
      <img src=${req.user.photoUrl} alt="Profile Picture" style="width: 100px; height: 100px; border-radius: 50%; border: 3px solid #4338ca; margin-bottom: 20px;">
      <h2 style="color: #1f2937; margin: 0 0 15px;">New Connection Request!</h2>
      <p style="color: #4b5563; margin: 0 0 20px;">${req.user.firstName} would like to connect with you</p>
      <p style="font-style: italic; background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 0 0 20px;">"Let's connect and explore potential opportunities!"</p>
      
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
        <p style="margin: 0 0 5px;">© 2024 Dev Tinder</p>
        <p style="margin: 0;">You received this email because you're registered on our platform</p>
      </div>
    </div>
  </div>`
        }

        if (status === 'interested') {
            await transporter.sendMail(mailOption)
        }




    } catch (err) {
        res.status(400).send(err.message + "failed while sending connection request")
    }




})

requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {

    try {
        const loggedInUser = req.user
        const { status, requestId } = req.params

        const allowedStatus = ["accepted", "rejected"]

        if (!allowedStatus.includes(status)) {
            return res.status(400).send("invalid request Status")

        }

        const connectionRequestFind = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "interested"
        })

        if (!connectionRequestFind) {
            return res.status(404).send("connectionRequest not found")
        }

        connectionRequestFind.status = status

        const data = await connectionRequestFind.save()

        res.json({ message: "connection request" + status, data })
    } catch (err) {
        res.status(400).send('Error' + err.message)
    }

})

module.exports = { requestRouter }