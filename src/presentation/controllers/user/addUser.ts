import { AddUser } from '@/domain/useCases/user/addUser';
import { forbidden, ok, serverError } from '@/presentation/helpers/http/http';
import { Controller } from '@/presentation/protocols/controller';
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http';

export class AddUserController implements Controller {
  constructor(private readonly addUser: AddUser) {}

  async handle(
    httpRequest: HttpRequest
  ): Promise<HttpResponse<AddUser.Result>> {
    try {
      const { email, name, password, username } = httpRequest.body;

      const httpResponse = await this.addUser.add({
        email,
        name,
        password,
        username,
      });

      return ok(httpResponse);
    } catch (error) {
      if (error.name === 'ParamInUseError') {
        return forbidden(error);
      }
      return serverError(error);
    }
  }
}
