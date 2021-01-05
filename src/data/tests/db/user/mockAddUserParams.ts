import faker from 'faker';

import { AddUser } from '@/domain/useCases/user/addUser';

export const mockAddUserParams = (): AddUser.Params => ({
  email: faker.internet.email(),
  name: faker.name.findName(),
  password: faker.random.alphaNumeric(8),
  username: faker.internet.userName(),
});
