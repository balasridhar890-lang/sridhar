// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { PrismaClient } from './generated/prisma/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new (PrismaClient as any)({});

export default prisma;
