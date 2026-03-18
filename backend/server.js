require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/database");

connectDB();

app.listen(5000, () => {
  console.log("Server running on port 5000");
});