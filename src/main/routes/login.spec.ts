import { hash } from 'bcryptjs';
import request from 'supertest';
import { v4 } from 'uuid';

import { PrismaClient } from '@prisma/client';

import app from '../config/app';

const connection = new PrismaClient();
describe('Login Routes', () => {
  beforeEach(async () => {
    await connection.$disconnect();
  });

  afterEach(async () => {
    await connection.user.deleteMany();
    await connection.$disconnect();
  });
  describe('POST /auth', () => {
    it('Should return 200 on auth', async () => {
      const password = await hash('valid_password', 12);
      const id = v4();
      await connection.user.create({
        data: {
          id,
          email: 'valid_mail@example.com',
          name: 'Example Name',
          username: 'example',
          password,
        },
      });
      await request(app)
        .post('/api/v1/auth')
        .send({
          email: 'valid_mail@example.com',
          password: 'valid_password',
        })
        .expect(200);
    });

    it('Should return 401 if invalid email', async () => {
      await request(app)
        .post('/api/v1/auth')
        .send({
          email: 'invalid_mail@example.com',
          password: 'valid_password',
        })
        .expect(401);
    });

    it('Should return 401 if invalid password', async () => {
      const password = await hash('valid_password', 12);
      const id = v4();
      await connection.user.create({
        data: {
          id,
          email: 'valid_mail@example.com',
          name: 'Example Name',
          username: 'example',
          password,
        },
      });

      await request(app)
        .post('/api/v1/auth')
        .send({
          email: 'valid_mail@example.com',
          password: 'invalid_password',
        })
        .expect(401);
    });
  });

  describe('POST /register', () => {
    it('Should return 200 on register', async () => {
      await request(app)
        .post('/api/v1/register')
        .send({
          email: 'valid_mail@example.com',
          name: 'Example Name',
          username: 'example',
          password: 'valid_password',
        })
        .expect(200);
    });
  });
});
