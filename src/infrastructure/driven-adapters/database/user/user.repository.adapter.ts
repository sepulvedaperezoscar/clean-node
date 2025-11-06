

import { Repository } from 'typeorm';

import { UserRepository, FindUsersFilters } from '@domain/model/user';
import { User } from '@domain/model/user';

import { AppDataSource } from '@application/config/datasource';

import { UserORM } from './user.entity.orm';
import { UserMapper } from './user.mapper';


export class UserRepositoryAdapter implements UserRepository {
    private repository: Repository<UserORM>;

    constructor() {
        this.repository = AppDataSource.getRepository(UserORM);
    }

    async findById(id: string): Promise<User | null> {
        try {
            const userORM = await this.repository.findOne({ where: { id } });
            return userORM ? UserMapper.toDomain(userORM) : null;
        } catch (error) {
            console.error('Error finding user by id:', error);
            throw new Error(`Failed to find user: ${error}`);
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        try {
            const userORM = await this.repository.findOne({ where: { email } });
            return userORM ? UserMapper.toDomain(userORM) : null;
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw new Error(`Failed to find user: ${error}`);
        }
    }

    async findAll(filters?: FindUsersFilters): Promise<User[]> {
        try {
            const queryBuilder = this.repository.createQueryBuilder('user');

            if (filters?.role) {
                queryBuilder.andWhere('user.role = :role', { role: filters.role });
            }

            if (filters?.isActive !== undefined) {
                queryBuilder.andWhere('user.isActive = :isActive', { isActive: filters.isActive });
            }

            queryBuilder.orderBy('user.createdAt', 'DESC');

            const usersORM = await queryBuilder.getMany();
            return UserMapper.toDomainList(usersORM);
        } catch (error) {
            console.error('Error finding all users:', error);
            throw new Error(`Failed to find users: ${error}`);
        }
    }

    async save(user: User): Promise<User> {
        try {
            const userORM = UserMapper.toORM(user);
            const savedUserORM = await this.repository.save(userORM);
            return UserMapper.toDomain(savedUserORM);
        } catch (error: any) {
            console.error('Error saving user:', error);

            // Manejar error de email duplicado
            if (error.code === '23505') {
                throw new Error('Email already exists');
            }

            throw new Error(`Failed to save user: ${error.message}`);
        }
    }

    async update(id: string, userData: Partial<User>): Promise<User> {
        try {
            const userORM = await this.repository.findOne({ where: { id } });

            if (!userORM) {
                throw new Error('User not found');
            }

            const updatedUserORM = UserMapper.updateORM(userORM, userData);
            const savedUserORM = await this.repository.save(updatedUserORM);

            return UserMapper.toDomain(savedUserORM);
        } catch (error: any) {
            console.error('Error updating user:', error);

            if (error.message === 'User not found') {
                throw error;
            }

            if (error.code === '23505') {
                throw new Error('Email already exists');
            }

            throw new Error(`Failed to update user: ${error.message}`);
        }
    }

    async delete(id: string): Promise<void> {
        try {
            const result = await this.repository.delete(id);

            if (result.affected === 0) {
                throw new Error('User not found');
            }
        } catch (error: any) {
            console.error('Error deleting user:', error);

            if (error.message === 'User not found') {
                throw error;
            }

            throw new Error(`Failed to delete user: ${error.message}`);
        }
    }

    async count(filters?: FindUsersFilters): Promise<number> {
        try {
            const queryBuilder = this.repository.createQueryBuilder('user');

            if (filters?.role) {
                queryBuilder.andWhere('user.role = :role', { role: filters.role });
            }

            if (filters?.isActive !== undefined) {
                queryBuilder.andWhere('user.isActive = :isActive', { isActive: filters.isActive });
            }

            return await queryBuilder.getCount();
        } catch (error) {
            console.error('Error counting users:', error);
            throw new Error(`Failed to count users: ${error}`);
        }
    }
}