import express from "express";
import dotenv from "dotenv";
import routes from "./routes";
import cors from 'cors';

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
}));

app.use(express.json());
app.use("/", routes);

export default app;
