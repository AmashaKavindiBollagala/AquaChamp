import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        title: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        },
        completed: {
            type: Boolean,
            default: false
        },
        ticket: {
            type: Number,
            unique: true
        }
    },
    { timestamps: true }
);

// Replaces mongoose-sequence plugin
noteSchema.pre('save', async function () {
    if (this.isNew) {
        const lastNote = await mongoose.model('Note').findOne({}, {}, { sort: { ticket: -1 } });
        this.ticket = lastNote ? lastNote.ticket + 1 : 500;
    }
});

export default mongoose.model('Note', noteSchema);