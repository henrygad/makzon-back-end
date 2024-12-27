const hideEmail = (email: string) => {
  // Function to hide user email
  const [username, domain] = email.split("@");
  return `${username.slice(0, 3)}***@${domain}`;
};

export default hideEmail;