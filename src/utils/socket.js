const socket = require("socket.io")
const crypto = require("crypto")
const { Chat } = require("../models/chat")
const nodemailer = require('nodemailer')
const User = require("../models/user")



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

        socket.on("joinChat", async ({ firstName, lastName, userId, targetUserId }) => {
            const roomId = getSecretRoomId(userId, targetUserId)
            // console.log(firstName + "join room" + roomId)
            const user = await User.findByIdAndUpdate(userId, {
                socketId: socket.id,
                isOnline: true,
            });

            socket.join(roomId)
        });
        socket.on("sendMessage", async ({ firstName, lastName, userId, targetUserId, text }) => {


            try {
                const roomId = getSecretRoomId(userId, targetUserId)

                const findTargetUser = await User.findOne({ _id: targetUserId })

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

                io.to(roomId).emit("messageRecieved", { firstName, lastName, text })


                if (!findTargetUser.isOnline) {
                    const transporter = nodemailer.createTransport({
                        host: 'smtp.hostinger.com',
                        port: 465,
                        secure: true,
                        auth: {
                            user: 'account@devtinder.site',
                            pass: process.env.EMAIL_PASS
                        }
                    })

                    const mailOption = {
                        from: 'account@devtinder.site',
                        to: findTargetUser.emailId,
                        subject: 'New Message',
                        html: `<h1> ${findTargetUser.firstName} you got a new message from ${firstName} </h1>
                                                 <p> tap to log in to your account </p>
                                <a href="https://devtinder.site/" target="_blank">Click here to log in</a>
                 `

                    }


                    await transporter.sendMail(mailOption)
                }



            } catch (err) {
                console.log(err)
            }

        });
        socket.on("disconnect", async () => {
            try {

                const user = await User.findOneAndUpdate(
                    { socketId: socket.id },
                    { isOnline: false, socketId: null },
                    { new: true }
                );

                if (user) {
                    console.log(`User ${user.firstName} disconnected and is now offline.`);
                } else {
                    console.log("No user found with this socketId.");
                }
            } catch (err) {
                console.log("Error updating user on disconnect:", err);
            }
        });
    });
};



module.exports = initializeSocket