import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send(`<p>Welcome to server</p>`);
});

app.listen(port, () => {
  connectDB();
  console.log(`Server running at ${port}`);
});
