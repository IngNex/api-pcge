import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({
  name: 'people'
})
export class Person {
  @PrimaryGeneratedColumn('uuid')
    id: string

  @Column({ name: 'profile', type: 'varchar' })
    profile: string

  @Column({ name: 'induction_date', type: 'datetime' })
    inductionDate: Date

  @Column({ name: 'doc_type', type: 'varchar' })
    docType: string

  @Column({ name: 'doc_num', type: 'varchar' })
    docNum: string

  @Column({ name: 'name', type: 'varchar' })
    name: string

  @Column({ name: 'last_name', type: 'varchar' })
    lastName: string

  @Column({ name: 'company', type: 'varchar' })
    company: string

  @Column({ name: 'credential', type: 'varchar' })
    credential: string

  @Column({ name: 'credential_life', type: 'datetime' })
    credentialLife: Date

  @Column({ name: 'profile_image', type: 'varchar' })
    profileImage: string
}
