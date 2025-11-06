

import { UserRepository } from '@domain/model/user/user.repository';
import { User, UserEntity } from '@domain/model/user/user.entity';
import * as bcrypt from 'bcrypt';

export interface UpdateUserCommand {
    name?: string;
    email?: string;
    password?: string;
    role?: 'admin' | 'user';
    isActive?: boolean;
}

/**
 * Caso de uso: Actualizar Usuario
 */
export class UpdateUserUseCase {
    constructor(private readonly userRepository: UserRepository) { }

    async execute(userId: string, command: UpdateUserCommand): Promise<Omit<User, 'password'>> {

        const existingUser = await this.userRepository.findById(userId);

        if (!existingUser) {
            throw new Error('User not found');
        }

        if (command.email && command.email !== existingUser.email) {
            const userWithEmail = await this.userRepository.findByEmail(command.email);
            if (userWithEmail) {
                throw new Error('Email already exists');
            }
        }

        const updateData: Partial<User> = {};

        if (command.name) updateData.name = command.name;
        if (command.email) updateData.email = command.email;
        if (command.role) updateData.role = command.role;
        if (command.isActive !== undefined) updateData.isActive = command.isActive;

        if (command.password) {
            updateData.password = await bcrypt.hash(command.password, 10);
        }

        const updatedUser = await this.userRepository.update(userId, updateData);

        return new UserEntity(
            updatedUser.id,
            updatedUser.name,
            updatedUser.email,
            updatedUser.password,
            updatedUser.role,
            updatedUser.isActive,
            updatedUser.createdAt,
            updatedUser.updatedAt
        ).toPublic();
    }
}