import argon2 from "argon2";

const secret = process.env.ADMIN_HASH_SECRET;
/**
 *
 * @param {string} password
 * @returns {Promise<string>} hashed password
 */
export const hashPassword = async (password) => {
  try {
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 4,
      secret: Buffer.from(secret),
    });
    return hash;
  } catch (error) {
    console.error("Error hashing password: ", error);
    throw new Error("Failed to hash password");
  }
};
/**
 * @param {string} password
 * @param {string} hash
 * @return {Promise<boolean>} true if password is valid, false otherwise
 */
export const verifyPassword = async (password, hash) => {
  try {
    const isValid = await argon2.verify(hash, password);
    return isValid;
  } catch (error) {
    console.error("Error verifying password: ", error);
    throw new Error("Failed to verify password");
  }
};
