const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const memberRoutes = require("./routes/memberRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());

app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("MongoDB Connected");

  app.listen(5000, () => {
    console.log("Server Running On Port 5000");
  });
})
.catch((err) => console.log(err));
