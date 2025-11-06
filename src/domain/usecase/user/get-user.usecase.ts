

import { UserRepository } from '@domain/model/user';
import { User, UserEntity } from '@domain/model/user';

/**
 * Caso de uso: Obtener Usuario por ID
 */
export class GetUserUseCase {
    constructor(private readonly userRepository: UserRepository) { }

    async execute(userId: string): Promise<Omit<User, 'password'>> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        return new UserEntity(
            user.id,
            user.name,
            user.email,
            user.password,
            user.role,
            user.isActive,
            user.createdAt,
            user.updatedAt
        ).toPublic();
    }
}