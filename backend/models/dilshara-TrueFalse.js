import mongoose from 'mongoose';


const trueFalseSchema = new mongoose.Schema(
    {
        statement: {
            type: String,
            required: [true, 'Statement is required'],
            trim: true,
        },

        // Only "true" or "false" allowed
        correctAnswer: {
            type: String,
            enum: ['true', 'false'],
            required: [true, 'Correct answer is required'],
        },

        hint: {
            type: String,
            trim: true,
        },

        // Fixed to Topic 2 for this game
        lessonTopic: {
            type: String,
            default: 'Handwashing and Personal Hygiene',
            enum: [
                'Safe Drinking Water',
                'Handwashing and Personal Hygiene',
                'Toilet and Sanitation Practices',
                'Water-Borne Diseases and Prevention',
                'Water Conservation and Environmental Care'
            ],
            required: [true, 'Lesson topic is required'],
        },

        points: {
            type: Number,
            default: 10,
        },

        active: {
            type: Boolean,
            default: true,
        },

        createdBy: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('TrueFalse', trueFalseSchema);