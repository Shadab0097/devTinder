const express = require('express')
const { passwordEncryption } = require('../utils/validator')
const Admin = require('../models/admin')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const adminAuth = require('../middlewares/adminAuth')
const User = require('../models/user')


const adminRouter = express.Router()


adminRouter.post('/admin/signup', async (req, res, next) => {

    try {
        const adminCount = await Admin.countDocuments()

        if (adminCount > 0) {
            throw new Error('admin is already there')
        }
        next()
    } catch (err) {
        return res.status(400).send("ERROR" + err.message)
    }

}, async (req, res) => {

    try {
        const { firstName, adminEmailId, adminPassword } = req.body

        const encryptPasswordHash = await passwordEncryption(adminPassword, 10)

        const admin = new Admin({
            firstName,
            adminEmailId,
            adminPassword: encryptPasswordHash,
        })

        await admin.save()
        res.json({ message: 'welcome Admin', data: admin })
    } catch (err) {
        res.status(400).send('Error while signingUp' + err.message)
    }
})

adminRouter.post('/admin/login', async (req, res) => {

    try {
        const { adminEmailId, adminPassword } = req.body

        const findAdmin = await Admin.findOne({ adminEmailId: adminEmailId })

        if (!findAdmin) {
            return res.status(404).json({ error: 'Admin not found' })
        }

        const isAdminPasswordValid = await bcrypt.compare(adminPassword, findAdmin.adminPassword)

        if (isAdminPasswordValid) {

            const adminToken = await jwt.sign({ _id: findAdmin._id }, "AdminToken@7229", { expiresIn: '1d' })

            res.cookie('adminToken', adminToken, { expires: new Date(Date.now() + 8 * 3600000) })

            res.json({
                message: 'admin loggedIn succesfully', data: {
                    adminFirstName: findAdmin.firstName,
                    adminEmailId: findAdmin.adminEmailId
                }
            })
        } else {
            return res.status(401).json({ error: 'Invalid password' })
        }

    } catch (err) {

        res.status(400).send('ERROR' + err.message)
    }


})

adminRouter.post('/admin/logout', async (req, res) => {

    res.cookie('adminToken', null, { expires: new Date(Date.now()) })

    res.send('admin logout successfully')
})

adminRouter.get('/admin/getalluser', adminAuth, async (req, res) => {
    try {
        const loggedInAdmin = req.loggedInAdmin
        const allUsers = await User.find({})
        res.json({ allUsers })

    } catch (err) {
        res.status(400).send("ERROR" + err.message)
    }
})

module.exports = adminRouter