import { Authentication } from '@/domain/useCases/user/authentication';

export const mockAuthParams = (): Authentication.Params => ({
  email: 'example@email.com',
  password: 'password',
});
