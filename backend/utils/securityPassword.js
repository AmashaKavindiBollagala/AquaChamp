// utils/securityPassword.js
import bcrypt from "bcryptjs";
import { validatePasswordStrength } from "./securityValidatePassword.js";

// check password strength and throw error if weak
export const checkPasswordStrength = (password) => {
  const error = validatePasswordStrength(password);
  if (error) throw new Error(error);
};

// hash new password
export const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// compare plain password with hashed password
export const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};