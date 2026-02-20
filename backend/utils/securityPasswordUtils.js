import bcrypt from 'bcrypt';
import 'dotenv/config';

const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;

// Hash a plain password
export const hashPassword = async (plainPassword) => {
    try {
        const hash = await bcrypt.hash(plainPassword, saltRounds);
        return hash;
    } catch (error) {
        throw new Error('Error hashing password: ' + error.message);
    }
};

// Compare plain password with hashed password
export const comparePassword = async (plainPassword, hashedPassword) => {
    try {
        const match = await bcrypt.compare(plainPassword, hashedPassword);
        return match; // true or false
    } catch (error) {
        throw new Error('Error comparing password: ' + error.message);
    }
};
