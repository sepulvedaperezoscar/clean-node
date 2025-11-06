

import { UserRepository } from '@domain/model';

/**
 * Caso de uso: Eliminar Usuario
 */
export class DeleteUserUseCase {
    constructor(private readonly userRepository: UserRepository) { }

    async execute(userId: string): Promise<void> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        await this.userRepository.delete(userId);
    }
}