import mongoose from 'mongoose';


const quizResultSchema = new mongoose.Schema(
    {
        // Which quiz was taken
        quizId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quiz',
            required: [true, 'Quiz ID is required'],
        },

        // Which child took the quiz 
        userId: {
            type: String,
            required: [true, 'User ID is required'],
        },

        // The answers the child submitted
       
        submittedAnswers: [
            {
                questionIndex: { type: Number, required: true },
                selectedAnswer: { type: String, required: true },
            },
        ],

        // How many questions they got correct
        correctCount: {
            type: Number,
            default: 0,
        },

        // Total score (correctCount * pointsPerQuestion)
        score: {
            type: Number,
            default: 0,
        },

        // Maximum possible score for this quiz
        maxScore: {
            type: Number,
        },

        // Percentage score
        percentage: {
            type: Number,
        },

        // Pass or fail (pass = 60% or above)
        passed: {
            type: Boolean,
        },
    },
    {
        timestamps: true, 
    }
);

export default mongoose.model('QuizResult', quizResultSchema);