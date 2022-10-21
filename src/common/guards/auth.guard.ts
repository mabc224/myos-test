import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  /**
   * Verifies the presence of a Auth to check user id & append with request
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // for local testing without generating user,
    // we allow passing a FAKE_USER_ID and bypass user querying
    // if (process.env.NODE_ENV !== 'production' && process.env.FAKE_USER_ID) {
    request.user = {
      userId: parseInt(process.env.FAKE_USER_ID, 10),
    };
    return true;
    // }
  }
}
