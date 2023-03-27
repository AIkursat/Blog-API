import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { BlogEntryEntity } from './model/blog-entry.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([BlogEntryEntity]),
        AuthModule,
        UserModule
    ]
})
export class BlogModule {}
