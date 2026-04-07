import mongoose from 'mongoose';



const gameScoreSchema = new mongoose.Schema(
    {
        //what is the game that child played
        gameId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game',
            required: [true, 'Game ID is required'],
        },

        // which child play the game
        userId: {
            type: String,
            required: [true, 'User ID is required'],
        },

        // The score the child got
        score: {
            type: Number,
            required: [true, 'Score is required'],
            min: [0, 'Score cannot be negative'],
        },

        // The max score 
        maxScore: {
            type: Number,
            required: true,
        },

     
        percentage: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true, 
    }
);

export default mongoose.model('GameScore', gameScoreSchema);