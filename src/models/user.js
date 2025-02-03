const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        require: true,
        trim: true,
        index: true,
        minLength: 4,
        maxLength: 50
    },
    lastName: {
        type: String,
        trim: true,
        minLength: 4,
        maxLength: 50
    },
    emailId: {
        type: String,
        require: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('email is not valid')
            }
        }
    },
    password: {
        type: String,
        validate(value) {
            if (!validator.isStrongPassword(value)) {
                throw new Error("write a strong password")
            }
        }


    },
    age: {
        type: Number,
        min: 18,
        max: 70
    },
    gender: {
        type: String,
        validate(value) {
            if (!["male", "female", "others"].includes(value)) {
                throw new Error("gender is not valid");

            }
        }
    },
    about: {
        type: String,
        default: "this is about a person",
        trim: true
    },
    photoUrl: {
        type: String,
        default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRA6g9BWr61gs6KYIq3zjFEy36Z8OuOIJQ75A&s",
        validate(value) {
            if (!validator.isURL(value)) {
                throw new Error('photo url is not valid')
            }
        }
    },
    skills: {
        type: [String],
        trim: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isPremium: {
        type: String,
        default: false
    },
    membershipType: {
        type: String,
    }

}, { timestamps: true })

userSchema.methods.getJWT = async function () {

    const user = this
    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" })

    return token
}

userSchema.methods.validatePassword = async function (passwordFromUserINput) {
    const user = this
    passwordHash = user.password
    const isPasswordValid = await bcrypt.compare(passwordFromUserINput, passwordHash)
    return isPasswordValid;
}


module.exports = mongoose.model("User", userSchema)