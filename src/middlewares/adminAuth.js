const jwt = require("jsonwebtoken")
const Admin = require("../models/admin")


const adminAuth = async (req, res, next) => {

    try {

        const { adminToken } = req.cookies
        if (!adminToken) {
            throw new Error('invalid credentils Admin')
        }

        const decodeAdminObj = await jwt.verify(adminToken, "AdminToken@7229")

        const { _id } = decodeAdminObj

        const loggedInAdmin = await Admin.findById({ _id })

        if (!loggedInAdmin) {
            throw new Error('admin not found')
        }

        req.loggedInAdmin = loggedInAdmin

        next()
    } catch (err) {
        res.status(400).send('ERROR' + err.message)
    }

}

module.exports = adminAuth