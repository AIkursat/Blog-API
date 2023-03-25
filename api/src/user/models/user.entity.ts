import{ Entity, PrimaryGeneratedColumn, Column, BeforeInsert} from 'typeorm'


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

    @Column({nullable: true})
    password: string;

    @BeforeInsert()
    emailToLowerCase() {
        this.email = this.email.toLowerCase();
    }
}