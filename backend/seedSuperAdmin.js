import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/dushani-User.js';

await mongoose.connect(process.env.MONGO_URI);

const salt = await bcrypt.genSalt(10);
const hashed = await bcrypt.hash('SuperAdmin123!', salt);

const admin = new User({
  firstName: 'Super',
  lastName: 'Admin',
  age: 25,
  email: 'superadmin@aquachamp.com',
  username: 'superadmin',
  password: hashed,
  roles: ['SUPER_ADMIN'],
  active: true
});

await admin.save({ validateBeforeSave: false });

console.log('Super admin created!');
await mongoose.disconnect();