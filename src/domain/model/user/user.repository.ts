

import { User } from './user.entity';

export interface UserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findAll(filters?: FindUsersFilters): Promise<User[]>;
    save(user: User): Promise<User>;
    update(id: string, user: Partial<User>): Promise<User>;
    delete(id: string): Promise<void>;
    count(filters?: FindUsersFilters): Promise<number>;
}

export interface FindUsersFilters {
    role?: 'admin' | 'user';
    isActive?: boolean;
}