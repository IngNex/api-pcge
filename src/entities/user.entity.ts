import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import * as argon2 from 'argon2'
import { UserRole } from './enums/role.enum'

@Entity({
  name: 'users'
})
export class User {
  @PrimaryGeneratedColumn('uuid')
    id: string

  @Column({ unique: true, type: 'varchar' })
    username: string

  @Column({ length: 100, type: 'varchar' })
    password: string

  @Column({ name: 'role', type: 'varchar', default: UserRole.USER })
    role: UserRole

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword (): Promise<void> {
    this.password = await argon2.hash(this.password)
  }

  async comparePassword (attempt: string): Promise<Boolean> {
    return await argon2.verify(this.password, attempt)
  }
}
