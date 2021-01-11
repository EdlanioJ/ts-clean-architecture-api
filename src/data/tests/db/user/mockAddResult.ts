import faker from 'faker';

import { AddUser } from '@/domain/useCases/user/addUser';

export const mockAddResult = (): AddUser.Result => ({
  id: faker.random.uuid(),
  email: faker.internet.email(),
  name: faker.name.findName(),
  password: faker.random.uuid(),
  username: faker.internet.userName(),
});
