const mongoose = require('mongoose')

const connectionRequestSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },

    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },

    status: {
        type: String,
        enum: {
            values: ["ignored", "interested", "accepted", "rejectes"],
            message: `{value} is incorrect status type`
        }

    }

},
    { timestamps: true }
);
//compound index

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 })

connectionRequestSchema.pre('save', function (next) {

    if (this.fromUserId.equals(this.toUserId)) {
        throw new Error("cannot send connection request to yourself")
    }
    next()
})

const ConnectionRequestModel = new mongoose.model("ConnectionRequest", connectionRequestSchema)

module.exports = ConnectionRequestModel