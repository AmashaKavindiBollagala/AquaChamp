import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

await mongoose.connect('mongodb+srv://amashakav23_db_user:V5kypgjEgWAYqqMD@cluster0.y4e3wr3.mongodb.net/AquaChamp?retryWrites=true&w=majority');

console.log('Connected to MongoDB');

const users = [
    { username: 'dilshara_admin', password: 'Dilshara@123' },
    { username: 'dushani_admin', password: 'Dushani@123' },
    { username: 'amasha_admin', password: 'Amasha@123' },
    { username: 'kaveesha_admin', password: 'Kaveesha@123' },
];

for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    await mongoose.connection.collection('users').updateOne(
        { username: u.username },
        { $set: { password: hash } }
    );
    console.log(`✅ Reset: ${u.username} → ${u.password}`);
}

console.log('All done!');
process.exit();