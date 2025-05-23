import app from "./app";
import "dotenv/config";
import connectDB from "./config/db.config";
import fs from "fs";
import https from "https";

const PORT = process.env.PORT || 5000;

connectDB(() => {
  if (process.env.NODE_ENV === "local_https") {
    
    const options = {
      key: fs.readFileSync("../makzon-back/certs/localhost-key.pem"),
      cert: fs.readFileSync("../makzon-back/certs/localhost-cert.pem"),
    };

    https.createServer(options, app).listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(
        `Server current running on local end point: ${process.env.DOMAIN_NAME}`
      );
    });

  } else {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(
        `Server current running on hosting end point: ${process.env.DOMAIN_NAME}`
      );
    });
  }
});

