const generatedUserName = (name: string) => {
  // Generate random username
  const getName = name.trim().replace(/\s/g, "");
  const loop = getName.length;
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let userName = getName + "_";

  for (let i = 0; i < loop; i++) {
    const randomNumber = Math.floor(Math.random() * characters.length);
    userName += characters[randomNumber];
  }

  return userName;
};


export default generatedUserName;