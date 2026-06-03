/// <reference types="jest" />
import { prisma } from '../src/utils/prisma';

// Mock nodemailer
jest.mock('nodemailer', () => {
  return {
    createTransport: jest.fn().mockReturnValue({
      sendMail: jest.fn().mockResolvedValue({ messageId: 'mock-id' })
    })
  };
});

// Set timeout to 30s to avoid hook timeouts on slow DBs
jest.setTimeout(30000);

afterAll(async () => {
  await prisma.$disconnect();
});


