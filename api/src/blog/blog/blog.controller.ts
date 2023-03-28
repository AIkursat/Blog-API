import { Body, Controller, Post, Request } from '@nestjs/common';
import { Observable } from 'rxjs';
import { BlogEntry } from '../model/blog-entry.interface';
import { BlogService } from './blog.service';

@Controller('blog')
export class BlogController {

    constructor(private blogService: BlogService) {}


    @Post()
    create(@Body()blogEntry: BlogEntry, @Request() req): Observable<BlogEntry> {
        const user = req.user.user
        return this.blogService.create(user, blogEntry)
    }


}
