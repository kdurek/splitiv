import { prisma } from '../db';
import { appRouter } from './root';

export const trpcServer = appRouter.createCaller({ prisma });
