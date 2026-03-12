// Database Configuration
import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        // Options to avoid deprecation warnings and handle timeouts
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, 
            socketTimeoutMS: 45000, 
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI, options)

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
    } catch (error) {
        console.error(`❌ Error: ${error.message}`)
        // If critical failure, exit
        // process.exit(1) 
    }
}

export default connectDB