import express from 'express';
import cors from 'cors';

import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import healthRoutes from './routes/health.routes';
import billRoutes from './routes/bills.routes';
import mpRoutes from './routes/mp.routes';
import authRouets from './routes/auth.routes';
import followRoutes from './routes/follow.routes';

const app = express();


// Middleware
app.use(cors());
app.use(express.json());

app.use(healthRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/mps", mpRoutes);
app.use("/api/auth", authRouets);
app.use("/api", followRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, ()=>{
    console.log(`Server is running on port ${env.PORT}`);
})