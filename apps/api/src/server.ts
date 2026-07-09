// apps/api/src/server.ts
import express from "express";
import cors from "cors";

import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import healthRoutes from "./routes/health.routes";
import billRoutes from "./routes/bills.routes";
import mpRoutes from "./routes/mp.routes";
import authRoutes from "./routes/auth.routes";
import followRoutes from "./routes/follow.routes";
import billDiffRoutes from "./routes/bill-diff.routes";
import diffSummaryRoutes from "./routes/diff-summary.routes";
import aiReadyBillsRoutes from "./routes/ai-ready-bills.routes";
import notificationRoutes from "./routes/notification.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use(healthRoutes);
app.use("/api", aiReadyBillsRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/mps", mpRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", followRoutes);
app.use("/api/bills", billDiffRoutes);
app.use("/api/bills", diffSummaryRoutes);
app.use("/api", notificationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});