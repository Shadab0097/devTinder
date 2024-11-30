const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({
    firstName: {
        type: String,
        require: true,
        trim: true
    },

    adminEmailId: {
        type: String,
        require: true,
        unique: true,

    },
    adminPassword: {
        type: String,
        require: true
    }
})


module.exports = mongoose.model('admin', adminSchema)