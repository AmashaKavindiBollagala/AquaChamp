import mongoose from 'mongoose';

// store the games

const gameSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Game title is required'],
            trim: true,
        },

        description: {
            type: String,
            required: [true, 'Game description is required'],
            trim: true,
        },

        // Which lesson the game/quiz have
        
        lessonTopic: {
            type: String,
            enum: [
                'Safe Drinking Water',
                'Handwashing and Personal Hygiene',
                'Toilet and Sanitation Practices',
                'Water-Borne Diseases and Prevention',
                'Water Conservation and Environmental Care'
            ],
            required: [true, 'Lesson topic is required'],
        },

        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'easy',
        },

        // The maximum score user can get (student/children)
        maxScore: {
            type: Number,
            required: [true, 'Max score is required'],
            min: [1, 'Max score must be at least 1'],
        },

        // deactivate the game if admin wants
        active: {
            type: Boolean,
            default: true,
        },

        // the person who create the game
        createdBy: {
            type: String,
        },
    },
    {
        timestamps: true, // auto adds createdAt and updatedAt
    }
);

export default mongoose.model('Game', gameSchema);