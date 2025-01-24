const { subDays, startOfDay, endOfDay } = require("date-fns")
const ConnectionRequestModel = require('../models/connectionRequest')
const cron = require('cron')
const sendEmail = require('./sendEmail')



cron.schedule("50 19 * * *", async () => {
    try {

        const yesterDay = subDays(new Date(), 0)
        const yesterDayStart = startOfDay(yesterDay)
        const yesterDayEnd = endOfDay(yesterDay)

        const pendingRequests = await ConnectionRequestModel.find({
            status: 'interested',
            createdAt: {
                $gte: yesterDayStart,
                $lt: yesterDayEnd
            }
        }).populate("fromUserId toUserId")

        const listOfEmails = [...new Set(pendingRequests.map(req => req.toUserId.emailId))]

        for (const email of listOfEmails) {
            const res = await sendEmail.run('New Connection Request Pending of ' + email)
        }

    } catch (err) {
        console.log(err.message)
    }
})