import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, Response, UseGuards, Request, UseInterceptors } from '@nestjs/common';
import { Query } from '@nestjs/common/decorators/http/route-params.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Pagination } from 'nestjs-typeorm-paginate';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { hasRoles } from 'src/auth/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { User, UserRole } from '../models/user.interface';
import { UserService } from '../service/user.service';
import { uuid } from 'uuidv4';
import {diskStorage} from 'multer'
import path = require('path');
import { join } from 'path';

export const storage = {storage: diskStorage({
    destination: './uploads/profileimages',
    filename: (req, file, cb) => {
        const parsedPath = path.parse(file.originalname);
        const filename: string = (parsedPath.name || '').replace(/\s/g, "") + uuid() + parsedPath.ext;
        const extension: string = parsedPath.ext;


        cb(null, `${filename}${extension}`)
    }
})}

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

    // localhost:3000/api/users?username=Fel&page=0
    @Get()
    index(@Query('page') page: number = 1,
          @Query('limit') limit: number =10,
          @Query('username') username: string
          ): Observable<Pagination<User>> {
        limit = limit > 100 ? 100: limit;
        console.log(username);

        if(username == null || username == undefined) {
            return this.userService.paginate({page: Number(page), limit: Number(limit), route: 'http://localhost:3000/api/users'});
        } else {
            return this.userService.paginateFilterByUsername(
                {page: Number(page), limit: Number(limit), route: 'http://localhost:3000/api/users'},
                {username}
            )
        }
    
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
    
    @UseGuards(JwtAuthGuard)
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', storage))
    uploadFile(@UploadedFile() file, @Request() req): Observable<Object> {
       const user: User = req.user.user
       console.log(user);

       return this.userService.updateOne(user.id, {profileImage: file.filename}).pipe(
        tap((user: User) => console.log(user)),
        map((user:User) => ({profileImage: user.profileImage}))
       )
    }

    @Get('profile-image/:imagename')
    findProfileImage(@Param('imagename') imagename, @Response() res): Observable<Object> {
        return of(res.sendFile(join(process.cwd(), 'uploads/profileimages/' + imagename)))
    }

}
