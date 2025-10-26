import app from "./app";
import dotenv from "dotenv";
import { initializeDB } from "./db/connection";
import http from "http";

dotenv.config();

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

async function startServer() {
    try {
        await initializeDB();

        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
}

startServer();