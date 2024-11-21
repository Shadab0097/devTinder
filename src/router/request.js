const express = require("express")
const { userAuth } = require("../middlewares/auth")
const ConnectionRequest = require("../models/connectionRequest")
const User = require("../models/user")


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

        res.json({ message: " Connection Request Send succesfully", data })


    } catch (err) {
        res.status(400).send(err.message + "failed while sending connection request")
    }




})

module.exports = { requestRouter }