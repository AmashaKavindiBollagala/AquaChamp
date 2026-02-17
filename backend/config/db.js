import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://amashakav23_db_user:V5kypgjEgWAYqqMD@cluster0.y4e3wr3.mongodb.net/AquaChamp?retryWrites=true&w=majority')
        .then(() => { console.log('Connected to MongoDB')})

}