import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { match } from 'assert';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { catchError, from, map, Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from 'src/auth/auth.service';
import { Like } from 'typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { UserEntity } from '../models/user.entity';
import { User, UserRole } from '../models/user.interface';

@Injectable()
export class UserService {


    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>, private authService: AuthService
    ) {}

    create(user: User): Observable<User> {
        return this.authService.hashPassword(user.password).pipe(
            switchMap((passwordHash: string) => {
                const newUser = new UserEntity();
                newUser.name = user.name;
                newUser.username = user.username;
                newUser.email = user.email;
                newUser.password = passwordHash;
                newUser.role = UserRole.USER;

                return from(this.userRepository.save(newUser)).pipe(
                    map((user: User) => {
                        const {password, ...result} = user;
                        return result;
                    }),
                    catchError(err => throwError(err))
                )

            })
    )
    }

    paginate(options: IPaginationOptions): Observable<Pagination<User>> {
      return from(paginate<User>(this.userRepository, options)).pipe(
        map((userspageable: Pagination<User>) => {
            userspageable.items.forEach(function (v) {delete v.password});

            return userspageable;
        })
      )
    }
    
    paginateFilterByUsername(options: IPaginationOptions, user:User): Observable<Pagination<User>>{
        return from(this.userRepository.findAndCount({
            skip: Number(options.page) * Number(options.limit) || 0,
            take: Number(options.limit) || 10,
            order: {id: "ASC"},
            select: ['id', 'name', 'username', 'email', 'role'],
            where: [
                { username: Like(`%${user.username}%`)}
            ]
        })).pipe(
            map(([users, totalUsers]) => {
                const usersPageable: Pagination<User> = {
                    items: users,
                    links: {
                        first: options.route + `?limit=${options.limit}`,
                        previous: options.route + ``,
                        next: options.route + `?limit=${options.limit}&page=${Number(options.page) +1}`,
                        last: options.route + `?limit=${options.limit}&page=${totalUsers / Number(options.page)}`
                    },
                    meta: {
                        currentPage: Number(options.page),
                        itemCount: users.length,
                        itemsPerPage: Number(options.limit),
                        totalItems: totalUsers,
                        totalPages: Math.ceil(totalUsers / Number(options.limit) )
                    }
                };
                return usersPageable;
            })
        )
    }

    findOne(id: number): Observable<User> {
        const options: FindOneOptions<UserEntity> = {
          where: { id },
          relations: ['blogEntries']
        };
        return from(this.userRepository.findOne(options)).pipe(
            map((user: User) => {
                const {password, ...result} = user;
                return result;
            })
        )
      }

    findAll(): Observable<User[]> {
        return from(this.userRepository.find()).pipe(
            map((users: User[]) => {
                users.forEach(function (v) {delete v.password})
                return users;
            })
        )
    }

    deleteOne(id: number): Observable<any> {
        return from(this.userRepository.delete(id))
    }

    updateOne(id: number, user: User): Observable<any> {

        delete user.email;
        delete user.password;
        delete user.role;

        return from(this.userRepository.update(id, user)).pipe(
            switchMap(() => this.findOne(id))
        )
    }

    updateRoleOfUser(id: number, user: User): Observable<any> {
        return from(this.userRepository.update(id, user));
    }

    login(user: User): Observable<string> {

        return this.validateUser(user.email, user.password).pipe(
            switchMap((user: User) => {
                if(user) {
                    return this.authService.generateJWT(user).pipe(map((jwt:string) => jwt));
                } else {
                    return 'Wrong Credentials'
                }
            })
        )


    }

    validateUser(email: string, password: string): Observable<User>{
        return this.findByMail(email).pipe(
            switchMap((user: User) => this.authService.comparePasswords(password, user.password).pipe(
                map((match: boolean) => {
                    if(match){
                        const {password, ...result} = user;
                        return result;
                    } else {
                        throw Error;
                    }
                })
            ))
        )
    }

    findByMail(email:string): Observable<User> {
        const options: FindOneOptions<UserEntity> = {
            where: { email }
        }
        return from(this.userRepository.findOne(options))
    }

}
