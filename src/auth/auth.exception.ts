import { HttpException, HttpExceptionOptions } from '@nestjs/common';

export class AuthenticationException extends HttpException {
  constructor(
    response: string | Record<string, any>,
    status: number,
    options?: HttpExceptionOptions,
  ) {
    super(response, status, options);
  }

  static invalidToken() {
    return new AuthenticationException('Invalid token', 401, {
      description: 'Invalid token',
    });
  }

  static tokenExpired() {
    return new AuthenticationException('Token expired', 401, {
      description: 'Token expired',
    });
  }

  static invalidPassword() {
    return new AuthenticationException('Invalid password', 401, {
      description: 'Invalid password',
    });
  }

  static userNotFound() {
    return new AuthenticationException('User not found', 404, {
      description: 'User not found',
    });
  }

  static notAuthorized() {
    return new AuthenticationException('Not authorized', 401, {
      description: 'Not authorized',
    });
  }
}
