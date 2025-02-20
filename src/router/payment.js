const express = require('express')
const { userAuth } = require('../middlewares/auth')
const paymentRouter = express.Router()
const razorpayInstance = require("../utils/razorpay")
const { errorMonitor } = require('nodemailer/lib/xoauth2')
const Payment = require("../models/paymentCollection")
const { membershipAmount } = require('../utils/constants')
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils')
const User = require('../models/user')



paymentRouter.post("/payment/create", userAuth, async (req, res) => {
    try {


        const { membershipType } = req.body
        const { firstName, lastName, emailId } = req.user
        const order = await razorpayInstance.orders.create({
            amount: membershipAmount[membershipType] * 100,
            currency: "INR",
            receipt: "receipt#1",
            notes: {
                firstName,
                lastName,
                emailId,
                membershipType: membershipType
            },

        })


        //save it in database
        console.log(order)
        const payment = new Payment({
            userId: req.user._id,
            orderId: order.id,
            status: order.status,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt,
            notes: order.notes,
        })

        const savedPayment = await payment.save()

        // retrun order details to frontend
        res.json({ ...savedPayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID })

    } catch (err) {
        console.log(errorMonitor)
        return res.status(500).json({ msg: err.message })

    }
})

paymentRouter.post('/payment/webhook', async (req, res) => {
    try {
        const webhookSignature = req.get("X-Razorpay-Signature");
        console.log("webhook Signature ", webhookSignature)

        const isWebhookValid = validateWebhookSignature(JSON.stringify(req.body), webhookSignature, process.env.RAZORPAY_WEBHOOK_SECRET)

        if (!isWebhookValid) {
            return res.status(400).json({ msg: "Webhook Signature is not Valid" })

        }

        const paymentDetails = req.body.payload.payment.entity
        const payment = await Payment.findOne({ orderId: paymentDetails.order_id })
        payment.status = paymentDetails.status

        await payment.save();

        const user = await User.findOne({ _id: payment.userId })

        // Check if payment is successful or failed
        if (paymentDetails.status === "captured") { // Success
            user.isPremium = true;
            user.membershipType = payment.notes.membershipType;
            await user.save()
        } else { // Failure or any other status
            user.isPremium = false;
            user.membershipType = null;
        }

        return res.status(200).json({ msg: "Webhook recieved Successfully" })

    } catch (err) {
        return res.status(500).json({ msg: err.message })
    }
})

paymentRouter.get("/premium/verify", userAuth, async (req, res) => {
    const user = req.user.toJSON()

    if (user.isPremium) {

        return res.json({ ...user })
    }
    return res.json({ ...user })

})

module.exports = paymentRouter