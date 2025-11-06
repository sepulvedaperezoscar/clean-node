

import { UserRepository } from '@domain/model/user/user.repository';
import { User, UserEntity } from '@domain/model/user/user.entity';
import * as bcrypt from 'bcrypt';

export interface CreateUserCommand {
    name: string;
    email: string;
    password: string;
    role?: 'admin' | 'user';
}

/**
 * Caso de uso: Crear Usuario
 * Contiene la lógica de negocio para crear un usuario
 * - Valida que el email no exista
 * - Hashea la contraseña
 * - Valida la entidad
 * - Persiste el usuario
 */
export class CreateUserUseCase {
    constructor(private readonly userRepository: UserRepository) { }

    async execute(command: CreateUserCommand): Promise<Omit<User, 'password'>> {

        const existingUser = await this.userRepository.findByEmail(command.email);

        if (existingUser) {
            throw new Error('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(command.password, 10);

        const user = UserEntity.create({
            name: command.name,
            email: command.email,
            password: hashedPassword,
            role: command.role || 'user',
        });

        user.validate();

        const savedUser = await this.userRepository.save(user);

        return new UserEntity(
            savedUser.id,
            savedUser.name,
            savedUser.email,
            savedUser.password,
            savedUser.role,
            savedUser.isActive,
            savedUser.createdAt,
            savedUser.updatedAt
        ).toPublic();
    }
}