import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}
const mongo_url = process.env.MONGO_URL;

import express from "express";
import methodOverride from "method-override";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";

import todosRouter from "./routes/todosRoutes.js";
import userRouter from "./routes/userRoutes.js";

async function main() {
  await mongoose.connect(mongo_url);
}
main()
  .then(() => console.log("connected to db successfully"))
  .catch((err) => console.log(err));

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use(
  cors({
    origin: "https://todo-frontend-j8cw.vercel.app",
    credentials: true,
  })
);

//router
app.use("/todos", todosRouter);
app.use("/", userRouter);

app.listen(3000, () => {
  console.log("listening on port 3000");
});
