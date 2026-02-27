import mongoose from 'mongoose';


const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: [true, 'Question text is required'],
        trim: true,
    },
    options: {
        type: [String],
        required: true,
        validate: {
            validator: function (arr) {
                return arr.length === 4;
            },
            message: 'Each question must have exactly 4 options',
        },
    },
    correctAnswer: {
        type: String,
        required: [true, 'Correct answer is required'],
        trim: true,
    },
});

const quizSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Quiz title is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
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
        questions: {
            type: [questionSchema],
            validate: {
                validator: function (arr) {
                    return arr.length >= 1;
                },
                message: 'Quiz must have at least 1 question',
            },
        },
        pointsPerQuestion: {
            type: Number,
            default: 10,
        },
        // totalPoints stored directly - no virtual to avoid errors
        totalPoints: {
            type: Number,
            default: 0,
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

// Auto-calculate totalPoints before saving
quizSchema.pre('save', function (next) {
    this.totalPoints = this.questions.length * this.pointsPerQuestion;
    next();
});

export default mongoose.model('Quiz', quizSchema);