import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { router } from "../routes/routes.js";

dotenv.config();

export const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser())
app.use(router);

app.get('/', (req, res) => {
    res.send('Server Running!!')
})




