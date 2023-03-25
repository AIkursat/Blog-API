import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Console } from 'console';
import { map, Observable } from 'rxjs';
import { User } from 'src/user/models/user.interface';
import { UserService } from 'src/user/service/user.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private userService: UserService) {}

  canActivate(context: ExecutionContext): boolean | Observable<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    console.log(request);
    const user = request.user;

    return this.userService.findOne(user.id).pipe(
        map((user: User) => {
            const hasRole = () => roles.indexOf(user.role) > -1
            let hasPermission: boolean = false;
            console.log(hasRole);

            if(hasRole()) {
                console.log('has Role true');
                hasPermission = true;
                return user && hasPermission
            }
        })
    )

    return true;
  }
}