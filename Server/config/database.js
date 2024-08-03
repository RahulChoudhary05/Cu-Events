const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
  mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("DB Connection Successfully!"))
    .catch((error) => {
      console.log("Issue in DB Connection!");
      console.log(error.message);
      //either 0 or 1. 0 means end the process without any kind of failure and 1 means end the process with some failure {exit the Node.js process with a status code of 1 when that file is executed.}.
      process.exit(1);
    });
};