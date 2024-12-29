import crypto from "crypto";


// Function to genenerate unique otp
export const OTP = (num: number) => {
  let otp = "";
  const characters = "P1r3Z5q7i9";
  const bytes = crypto.randomBytes(num);

  for (let i = 0; i < num; i++) {
    otp += characters[bytes[i] % characters.length];
  }
  return otp;
};

export default OTP;
