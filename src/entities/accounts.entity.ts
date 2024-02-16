import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { STATUS } from './enums/status.enum'

@Entity({ name: 'accounts' })
export class Accounts {
  @PrimaryGeneratedColumn('uuid')
    id: string

  @Column({ name: 'code', type: 'varchar' })
    code: string

  @Column({ name: 'accounts', type: 'varchar' })
    accounts: string

  @Column({ name: 'status', type: 'varchar', default: STATUS.ACTIVE })
    status: STATUS
}
