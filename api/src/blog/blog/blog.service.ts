import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, map, Observable, of, switchMap } from 'rxjs';
import slugify from 'slugify';
import { User } from 'src/user/models/user.interface';
import { UserService } from 'src/user/service/user.service';
import { FindOneOptions, Repository } from 'typeorm';
import { BlogEntryEntity } from '../model/blog-entry.entity';
import { BlogEntry } from '../model/blog-entry.interface';

@Injectable()
export class BlogService {

    constructor(
        @InjectRepository(BlogEntryEntity) private readonly blogRepository: Repository<BlogEntryEntity>,
        private userService: UserService
    ) {}
    
    create(user: User, blogEntry: BlogEntry): Observable<BlogEntry> {
        blogEntry.author = user;
        return this.generateSlug(blogEntry.title).pipe(
            switchMap((slug:string) => {
                blogEntry.slug = slug;
                return from(this.blogRepository.save(blogEntry))
            })
        )
    }

    findAll(): Observable<BlogEntry[]> {
        return from(this.blogRepository.find());
    }

    findOne(id: number): Observable<BlogEntry> {
        const options: FindOneOptions<BlogEntryEntity> = {
          where: { id },
          relations: ['author']
        };
        return from(this.blogRepository.findOne(options));
      }
      

  findByUser(userId: number): Observable<BlogEntry[]> {
  return from(
    this.blogRepository.find({
      where: {
        author: {
          id: userId,
        },
      },
      relations: ['author'],
    }),
  ).pipe(map((blogEntries: BlogEntry[]) => blogEntries))
}

    updateOne(id: number, blogEntry: BlogEntry): Observable<BlogEntry> {
        return from(this.blogRepository.update(id, blogEntry)).pipe(
            switchMap(() => this.findOne(id))
        )
    }

    deleteOne(id: number):Observable<any> {
        return from(this.blogRepository.delete(id));
    }

    generateSlug(title: string): Observable<string> {
        return of(slugify(title))
    }

}
