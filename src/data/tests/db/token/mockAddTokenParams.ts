import faker from 'faker';

import { AddTokenParams } from '@/data/protocols/db/token/tokenRepository';

export const mockAddTokenParams = (): AddTokenParams => ({
  token: faker.random.uuid(),
  user_id: faker.random.uuid(),
});
