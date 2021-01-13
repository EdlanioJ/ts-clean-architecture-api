import { Router } from 'express';

import { adaptRoute } from '../adapers/route';
import { makeAuthenticationController } from '../factories/user/authentication';

export default (router: Router): void => {
  router.post('/auth', adaptRoute(makeAuthenticationController()));
};
