import { Router } from 'express';

import { adaptRoute } from '../adapers/route';
import { makeAddUserController } from '../factories/user/addUser';
import { makeAuthenticationController } from '../factories/user/authentication';

export default (router: Router): void => {
  router.post('/auth', adaptRoute(makeAuthenticationController()));
  router.post('/register', adaptRoute(makeAddUserController()));
};
