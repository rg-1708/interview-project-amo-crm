import { Entity, Column, ObjectIdColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class AmoCRMInfo {
  @ObjectIdColumn()
  client_id: string;

  @Column({ type: 'varchar' })
  code: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
