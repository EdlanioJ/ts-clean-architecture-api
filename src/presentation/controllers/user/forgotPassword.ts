import { ForgotPassword } from '@/domain/useCases/user/forgotPassword';
import {
  noContent,
  serverError,
  unauthorized,
} from '@/presentation/helpers/http/http';
import { Controller } from '@/presentation/protocols/controller';
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http';

export class ForgotPasswordController implements Controller {
  constructor(private readonly forgotPassword: ForgotPassword) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { email } = httpRequest.body;
      await this.forgotPassword.add(email);

      return noContent();
    } catch (error) {
      if (error.name === 'UnauthorizedError') {
        return unauthorized(error);
      }
      return serverError(error);
    }
  }
}
