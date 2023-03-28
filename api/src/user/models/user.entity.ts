import { BlogEntryEntity } from 'src/blog/model/blog-entry.entity';
import{ Entity, PrimaryGeneratedColumn, Column, BeforeInsert, OneToMany} from 'typeorm'
import { UserRole } from './user.interface';


@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name:string;

    @Column({unique:true})
    username:string;

    @Column({nullable: true})
    email: string;

    @Column({select: false})
    password: string;

    @Column({type: 'enum', enum: UserRole, default: UserRole.USER})
    role: UserRole;

    @Column({nullable: true})
    profileImage: string;

    @OneToMany(type => BlogEntryEntity, blogEntryEntity => blogEntryEntity.author)
    blogEntries: BlogEntryEntity[];

    @BeforeInsert()
    emailToLowerCase() {
        this.email = this.email.toLowerCase();
    }
}