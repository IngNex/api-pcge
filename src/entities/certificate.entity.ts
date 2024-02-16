import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { STATUS } from './enums/status.enum'

@Entity({ name: 'certificates' })
export class Certificate {
  @PrimaryGeneratedColumn('uuid')
    id: string

  @Column({ name: 'full_name', type: 'varchar' })
    fullName: string

  @Column({ name: 'dni', type: 'varchar' })
    dni: string

  @Column({ name: 'area', type: 'varchar' })
    area: string

  @Column({ name: 'course', type: 'varchar' })
    course: string

  @Column({ name: 'mark', type: 'int' })
    mark: number

  @Column({ name: 'company', type: 'varchar' })
    company: string

  @Column({ name: 'modality', type: 'varchar' })
    modality: string

  @Column({ name: 'duration', type: 'varchar' })
    duration: string

  @Column({ name: 'certification', type: 'varchar' })
    certification: string

  @Column({ name: 'validity', type: 'int', default: 12 })
    validity: number

  @Column({ name: 'start_date', type: 'varchar' })
    date: string

  @Column({ name: 'status', type: 'varchar', default: STATUS.ACTIVE })
    status: STATUS
}
