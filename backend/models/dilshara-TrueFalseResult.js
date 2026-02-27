import mongoose from 'mongoose';


const trueFalseResultSchema = new mongoose.Schema(
    {
        // Links to which TrueFalse statement was answered
        trueFalseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TrueFalse',
            required: [true, 'TrueFalse ID is required'],
        },

        // Which child answered 
        userId: {
            type: String,
            required: [true, 'User ID is required'],
        },

        // the child submit answer
        submittedAnswer: {
            type: String,
            enum: ['true', 'false'],
            required: [true, 'Submitted answer is required'],
        },

        // answer is correct or not
        isCorrect: {
            type: Boolean,
            required: true,
        },

        // points earned
        pointsEarned: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true, 
    }
);

export default mongoose.model('TrueFalseResult', trueFalseResultSchema);