const adminAuth = (req, res, next) => {
    console.log("admin auth checking")
    const token = "xyz"
    const isAdminAutorized = token === "xyz"
    if (!isAdminAutorized) {
        res.status(401).send('unauthorized request')
    } else {
        next()
    }

};

const userAuth = (req, res, next) => {
    console.log("admin auth checking")
    const token = "xyz"
    const isAdminAutorized = token === "xyz"
    if (!isAdminAutorized) {
        res.status(401).send('unauthorized request')
    } else {
        next()
    }

}


module.exports = { adminAuth }
module.exports = userAuth

