const express = require('express')
const { userAuth } = require('../middlewares/auth')
const ConnectionRequest = require('../models/connectionRequest')
const User = require('../models/user')

const userRouter = express.Router()

const USER_DATA = ['firstName', 'lastName', 'photoUrl', 'about', 'skills', 'age', 'gender', 'emailId', 'isPremium', 'isOnline']

userRouter.get("/user/request/recieved", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user

        const connectionRequests = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: "interested"
        }).populate("fromUserId", USER_DATA)

        res.json({ message: "data fetched successfully", data: connectionRequests })
    } catch (err) {
        res.status(404).send('Error' + err.message)
    }
})

userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user


        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { toUserId: loggedInUser._id, status: "accepted" },
                { fromUserId: loggedInUser._id, status: "accepted" }

            ]
        }).populate("fromUserId", USER_DATA).populate("toUserId", USER_DATA)

        const data = connectionRequests.map((row) => {
            if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
                return row.toUserId
            }
            return row.fromUserId
        })

        res.json({ data })
    } catch (err) {
        res.json({ message: err.message })
    }
})

userRouter.get("/user/feed", userAuth, async (req, res) => {
    try {

        const loggedInUser = req.user

        const page = parseInt(req.query.page) || 1
        let limit = parseInt(req.query.limit) || 10
        limit = limit > 50 ? 50 : limit
        const skip = (page - 1) * limit

        // finding the request which we have sent
        const connectionRequests = await ConnectionRequest.find({
            $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser.id }]
        }).select('fromUserId toUserId')

        // const unVerifiedUser = await User.find({ isVerified: !isVerified })
        const hideUserfromFeed = new Set()

        connectionRequests.forEach(req => {
            hideUserfromFeed.add(req.fromUserId.toString())
            hideUserfromFeed.add(req.toUserId.toString())
            // hideUserfromFeed.add(unVerifiedUser)


        });

        const users = await User.find({
            $and: [
                { _id: { $nin: Array.from(hideUserfromFeed) } },
                { _id: { $ne: loggedInUser._id } }
            ]
        }).select(USER_DATA).skip(skip).limit(limit)

        res.send(users)


    } catch (err) {
        res.status(400).send("Error" + err.message)
    }
})

userRouter.get("/user/:targetUserId", userAuth, async (req, res) => {
    try {
        const targetId = req.params.targetUserId

        const user = await User.findById({ _id: targetId })

        if (!user) {
            return new Error('user not found')
        }

        res.json(user)
    } catch (err) {
        res.status(400).send("Error" + err.message)

    }

})

module.exports = userRouter