

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { UserORM } from './user.entity.orm';


@Entity('products')
@Index(['category'])
@Index(['userId'])
export class ProductORM {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'text' })
    description!: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price!: number;

    @Column({ type: 'integer', default: 0 })
    stock!: number;

    @Column({ type: 'varchar', length: 100 })
    category!: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId!: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    // Relación con usuario
    @ManyToOne(() => UserORM, user => user.products, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: UserORM;
}