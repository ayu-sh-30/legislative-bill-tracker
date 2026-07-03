import express from 'express';
import cors from 'cors';

import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import healthRoutes from './routes/health.routes';


const app = express();


// Middleware
app.use(cors());
app.use(express.json());

app.use(healthRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, ()=>{
    console.log(`Server is running on port ${env.PORT}`);
})