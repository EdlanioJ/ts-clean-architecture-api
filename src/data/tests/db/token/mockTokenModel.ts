import faker from 'faker';

import { TokenModel } from '@/data/protocols/db/token/token';

import { mockUserModel } from '../user/user';

export const mockTokenModel = (): TokenModel => ({
  created_at: new Date(),
  id: faker.random.number(),
  token: faker.random.uuid(),
  user: mockUserModel(),
});
