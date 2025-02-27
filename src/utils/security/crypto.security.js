import CryptoJS from "crypto-js";

// Encryption function

export const generateCrypto = ({
  plain = "",
  secret = process.env.CRYPTO_SECRET,
}) => {
  return CryptoJS.AES.encrypt(plain, secret).toString();
};

// Decryption function
export const decryptCrypto = ({
  cipher = "",
  secret = process.env.CRYPTO_SECRET,
}) => {
  const bytes = CryptoJS.AES.decrypt(cipher, secret);
  return bytes.toString(CryptoJS.enc.Utf8);
};
