

import { UserRepository } from '../../model/user/user.repository';
import { User, UserEntity } from '../../model/user/user.entity';
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
        // 1. Verificar que el email no exista
        const existingUser = await this.userRepository.findByEmail(command.email);

        if (existingUser) {
            throw new Error('Email already exists');
        }

        // 2. Hashear la contraseña
        const hashedPassword = await bcrypt.hash(command.password, 10);

        // 3. Crear la entidad de dominio
        const user = UserEntity.create({
            name: command.name,
            email: command.email,
            password: hashedPassword,
            role: command.role || 'user',
        });

        // 4. Validar la entidad
        user.validate();

        // 5. Persistir en el repositorio
        const savedUser = await this.userRepository.save(user);

        // 6. Retornar sin la contraseña
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