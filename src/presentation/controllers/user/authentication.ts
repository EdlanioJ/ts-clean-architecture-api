import { Authentication } from '@/domain/useCases/user/authentication';
import {
  ok,
  serverError,
  unauthorized,
} from '@/presentation/helpers/http/http';
import { Controller } from '@/presentation/protocols/controller';
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http';

export class AuthenticationController implements Controller {
  constructor(private readonly authentication: Authentication) {}

  async handle(
    httpRequest: HttpRequest
  ): Promise<HttpResponse<Authentication.Result>> {
    try {
      const { email, password } = httpRequest.body;
      const httpResponse = await this.authentication.auth({ email, password });

      return ok(httpResponse);
    } catch (error) {
      if (error.name === 'UnauthorizedError') {
        return unauthorized(error);
      }
      return serverError(error);
    }
  }
}
