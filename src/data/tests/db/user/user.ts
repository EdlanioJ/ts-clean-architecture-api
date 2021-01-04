import faker from 'faker';

import { UserModel } from '@/data/protocols/db/user/user';

export const mockUserModel = (): UserModel => ({
  id: faker.random.uuid(),
  email: faker.internet.email(),
  name: faker.name.findName(),
  password: faker.internet.password(),
  username: faker.internet.userName(),
});
