const axios = require("axios");
require("dotenv").config();

async function Log(stack, level, pkg, message) {
  try {
    const response = await axios.post(
      process.env.LOG_BASE_URL,
      {
        stack,
        level,
        package: pkg,
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (err) {
    console.log(err.response?.data || err.message);
  }
}

module.exports = Log;
