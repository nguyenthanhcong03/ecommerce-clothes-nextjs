import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import connectDB from "./config/dbconnect.js";
import initRoutes from "./routes/index.js";
import cookieParser from "cookie-parser";
import { errorHandler, errorConverter } from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8888;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

import "./cron/cleanUnpaidOrders.js";

initRoutes(app);

app.use(errorConverter);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
