import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import passport from 'passport';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { defaultLimiter } from './middleware/rateLimiter';
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import petsRoutes from './modules/pets/pets.routes';
import healthRoutes from './modules/health/health.routes';
import remindersRoutes from './modules/reminders/reminders.routes';
import weightRoutes from './modules/weight/weight.routes';
import communityRoutes from './modules/community/community.routes';
import statsRoutes from './modules/stats/stats.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(defaultLimiter);
app.use(passport.initialize());

// Uploaded files are meant to be embedded by the frontend (a different origin in
// dev, or a CDN in prod), so relax Helmet's strict same-origin CORP for this path only.
app.use(
  '/uploads',
  (_req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(path.resolve(env.UPLOAD_DIR))
);

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/pets', petsRoutes);
app.use('/api/pets/:petId/health', healthRoutes);
app.use('/api/pets/:petId/reminders', remindersRoutes);
app.use('/api/pets/:petId/weight', weightRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/stats', statsRoutes);

app.use(errorHandler);

export default app;
