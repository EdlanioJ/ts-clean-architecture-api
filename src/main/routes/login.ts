import { Router } from 'express';

import { adaptRoute } from '../adapers/route';
import { makeAddUserController } from '../factories/user/addUser';
import { makeAuthenticationController } from '../factories/user/authentication';
import { makeForgotPasswordController } from '../factories/user/forgotPassword';

export default (router: Router): void => {
  router.post('/auth', adaptRoute(makeAuthenticationController()));
  router.post('/register', adaptRoute(makeAddUserController()));
  router.post('/forgot-password', adaptRoute(makeForgotPasswordController()));
};
