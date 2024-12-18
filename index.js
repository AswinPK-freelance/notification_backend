import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import routerMiddleware from './middleware/router.middleware.js'; // Correct spelling
import { setupSocketIO } from './socket/index.js';


dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

app.set('io', io);

app.use(cors({ origin: '*' }));
app.use(express.json());

routerMiddleware(app);
setupSocketIO(io);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
