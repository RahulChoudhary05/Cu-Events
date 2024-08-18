const mongoose = require("mongoose");
require("dotenv").config();

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DB Connection Successfully!");
  } catch (error) {
    console.error("Issue in DB Connection:");
    console.error(error);
    //either 0 or 1. 0 means end the process without any kind of failure and 1 means end the process with some failure {exit the Node.js process with a status code of 1 when that file is executed.}.
    process.exit(1);
  }
};

module.exports = { connect };
