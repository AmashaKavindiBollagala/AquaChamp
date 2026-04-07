{/*

import mongoose from "mongoose"; export const connectDB = async () => { await mongoose.connect('mongodb+srv://amashakav23_db_user:V5kypgjEgWAYqqMD@cluster0.y4e3wr3.mongodb.net/AquaChamp?retryWrites=true&w=majority') .then(() => { console.log('Connected to MongoDB')}) }*/}


import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
      .then(() => {
        console.log('Connected to MongoDB')
      })
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit process on DB connection failure
  }
}