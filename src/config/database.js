const mongoose = require("mongoose")

const connectDB = async () => {
    await mongoose.connect('mongodb+srv://shadabkhan:mDAkxVw5Vl38uWcn@namastenode.vebwc.mongodb.net/devTinder')
}

module.exports = connectDB


