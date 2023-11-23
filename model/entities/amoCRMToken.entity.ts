import { Entity, Column, ObjectIdColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class AmoCRMToken {
  @ObjectIdColumn()
  refresh_token: string; // Use the refresh token as the ID

  @Column({ type: 'varchar' })
  token_type: string;

  @Column({ type: 'int' })
  expires_in: number;

  @Column({ type: 'varchar' })
  access_token: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
