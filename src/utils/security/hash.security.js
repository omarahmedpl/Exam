import bcrypt from "bcrypt";

export const generateHash = async ({ plain = "", saltRounds = process.env.SALT }) => {
  const salt = await bcrypt.genSalt(parseInt(saltRounds)); // Generate salt dynamically
  return bcrypt.hash(plain, salt); // Hash with the generated salt
};

export const compareHash = async ({ plain = "", cipher = "" }) => {
  return bcrypt.compare(plain, cipher); // Compare asynchronously
};
