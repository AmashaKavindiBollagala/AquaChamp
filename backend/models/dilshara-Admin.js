import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName:  { type: String, required: true },
    email:     { type: String, required: true, unique: true },
    username:  { type: String, required: true, unique: true },
    password:  { type: String, required: true },
    roles:     { type: [String], default: ['Game_ADMIN'] },
    active:    { type: Boolean, default: true }
}, { timestamps: true });

adminSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

export default mongoose.model('Admin', adminSchema);