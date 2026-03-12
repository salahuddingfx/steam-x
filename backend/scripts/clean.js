// backend/scripts/clean.js
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import connectDB from '../config/db.js'
import User from '../models/User.js'

dotenv.config()

const deleteUsers = async () => {
    try {
        await connectDB()

        // ⚠️ সব ইউজার ডিলেট হয়ে যাবে
        await User.deleteMany()
        
        console.log('✅ All Users Removed Successfully!')
        process.exit()
    } catch (error) {
        console.error(`❌ Error: ${error.message}`)
        process.exit(1)
    }
}

deleteUsers()