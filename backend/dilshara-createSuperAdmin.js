// backend/scripts/dilshara-createSuperAdmin.js
// Run once with:  node --experimental-vm-modules scripts/dilshara-createSuperAdmin.js
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);
import 'dotenv/config';
import mongoose from 'mongoose';
import Admin from './models/dilshara-Admin.js';   //  Admin model, 

await mongoose.connect(process.env.MONGO_URI);

// Remove any existing super admin to avoid duplicates
await Admin.deleteOne({ username: 'superadmin' });

// Create super admin — dilshara-Admin.js pre('save') hook will hash the password
const superAdmin = new Admin({
    firstName: 'Super',
    lastName:  'Admin',
    age:       25,
    email:     'dilsharah6@gmail.com',   // your actual email
    username:  'superadmin',
    password:  'SuperAdmin123!',         // plain text — gets hashed automatically
    roles:     ['SUPER_ADMIN'],
    active:    true
});

await superAdmin.save();

console.log('✅ Super Admin created successfully!');
console.log('   Username: superadmin');
console.log('   Email:    dilsharah6@gmail.com');
console.log('   Password: SuperAdmin123!');
console.log('   Login at: http://localhost:5173/admin-login');

await mongoose.disconnect();