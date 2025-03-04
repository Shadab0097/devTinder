const socket = require("socket.io")
const crypto = require("crypto")
const { Chat } = require("../models/chat")
const nodemailer = require('nodemailer')



const getSecretRoomId = ({ userId, targetUserId }) => {
    return crypto.createHash("sha256").update([userId, targetUserId].sort().join("_")).digest("hex")
}



const initializeSocket = (server) => {
    const io = socket(server, {
        cors: {
            origin: "http://localhost:5173"
        },
    });

    io.on("connection", (socket) => {

        socket.on("joinChat", ({ firstName, lastName, userId, targetUserId }) => {
            const roomId = getSecretRoomId(userId, targetUserId)
            // console.log(firstName + "join room" + roomId)
            socket.join(roomId)
        });
        socket.on("sendMessage", async ({ firstName, lastName, userId, targetUserId, text }) => {


            try {
                const roomId = getSecretRoomId(userId, targetUserId)


                //only freinds can send message to each other
                //lastseen
                //limit message when fetching

                let chat = await Chat.findOne({
                    participants: { $all: [userId, targetUserId] }
                });

                if (!chat) {
                    chat = new Chat({
                        participants: [userId, targetUserId],
                        messages: []
                    })
                }

                chat.messages.push({
                    senderId: userId,
                    text
                })

                await chat.save()

                //    const transporter = nodemailer.createTransport({
                //             host: 'smtp.hostinger.com',
                //             port: 465,
                //             secure: true,
                //             auth: {
                //                 user: 'account@devtinder.site',
                //                 pass: process.env.EMAIL_PASS
                //             }
                //         })

                //         const mailOption = {
                //             from: 'account@devtinder.site',
                //             to: emailId,
                //             subject: 'Verify Your Email',
                //             html: ``

                //         }


                io.to(roomId).emit("messageRecieved", { firstName, lastName, text })

            } catch (err) {
                console.log(err)
            }

        });
        socket.on("disconnect", () => { });

    });

}

module.exports = initializeSocket