import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { Query } from '@nestjs/common/decorators/http/route-params.decorator';
import { Pagination } from 'nestjs-typeorm-paginate/dist/pagination';
import { catchError, map, Observable, of } from 'rxjs';
import { hasRoles } from 'src/auth/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { User, UserRole } from '../models/user.interface';
import { UserService } from '../service/user.service';

@Controller('users')
export class UserController {

    constructor(private userService: UserService) {}

    @Post()
    create(@Body() user: User): Observable<User | Object> {
        return this.userService.create(user).pipe(
            map((user: User) => user),
            catchError(err => of({ error: err.message }))
        );
    }

    @Post('login')
    login(@Body() user: User): Observable<Object> {
        return this.userService.login(user).pipe(
            map((jwt:string) => {
                return {access_token: jwt};
            })
        )
    }

    @Get()
    index(@Query('page') page: number = 1, @Query('limit') limit: number =10): Observable<Pagination<User>> {
        limit = limit > 100 ? 100: limit;
        return this.userService.paginate({page: Number(page), limit: Number(limit), route:'http://localhost:3000/users'})
    }

    @Get(':id')
    findOne(@Param()params): Observable<User> {
       return this.userService.findOne(params.id);
    }
    @hasRoles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get()
    findAll(): Observable<User[]> {
        return this.userService.findAll()
    }

    @Delete(':id')
    deleteOne(@Param('id')id: string): Observable<any> {
      return this.userService.deleteOne(Number(id));
    }

    @Put(':id')
    updateOne(@Param('id') id: string, @Body() user:User) {
        return this.userService.updateOne(Number(id),user)
    }

    @hasRoles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put(':id/role')
    updateRoleOfUser(@Param('id') id:string, @Body() user: User): Observable<User>{
        return this.userService.updateRoleOfUser(Number(id), user)
    }

}
