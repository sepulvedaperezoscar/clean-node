

import { UserRepository, FindUsersFilters } from '@domain/model/user/user.repository';
import { User, UserEntity } from '@domain/model/user/user.entity';

/**
 * Caso de uso: Listar Usuarios
 * Permite filtrar por rol y estado activo
 */
export class ListUsersUseCase {
    constructor(private readonly userRepository: UserRepository) { }

    async execute(filters?: FindUsersFilters): Promise<Omit<User, 'password'>[]> {
        const users = await this.userRepository.findAll(filters);

        return users.map(user =>
            new UserEntity(
                user.id,
                user.name,
                user.email,
                user.password,
                user.role,
                user.isActive,
                user.createdAt,
                user.updatedAt
            ).toPublic()
        );
    }
}