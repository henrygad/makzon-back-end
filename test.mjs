import crypto from "crypto";

export const OTP = (num) => {
  let otp = "";
  const characters = "P1r3Z5q7i9";
  const bytes = crypto.randomBytes(num);

  for (let i = 0; i < num; i++) {
    otp += characters[bytes[i] % characters.length];
  };

  return otp;
};


const t = OTP(4);
console.log(t);