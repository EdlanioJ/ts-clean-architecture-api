import faker from 'faker';

import { AddUserRepositoryParams } from '@/data/protocols/db/user/userRepository';

export const mockAddUserRepositoryParams = (): AddUserRepositoryParams => ({
  email: faker.internet.email(),
  id: faker.random.uuid(),
  name: faker.name.findName(),
  password: faker.random.uuid(),
  username: faker.internet.userName(),
});
