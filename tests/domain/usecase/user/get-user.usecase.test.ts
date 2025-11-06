

import { GetUserUseCase } from '@domain/usecase/user/get-user.usecase'; // Ajusta la ruta
import { UserRepository } from '@domain/model/user/user.repository';
import { User, UserEntity, UserRole } from '@domain/model/user/user.entity';

describe('GetUserUseCase', () => {
    let useCase: GetUserUseCase;
    let userRepository: UserRepository;

    const mockUserId = '123';

    const mockUserDomain: User = {
        id: mockUserId,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockUserPublic = {
        id: mockUserId,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user' as UserRole,
        isActive: true,
        createdAt: mockUserDomain.createdAt,
        updatedAt: mockUserDomain.updatedAt,
    };

    beforeEach(() => {
        jest.clearAllMocks();

        userRepository = {
            findById: jest.fn().mockResolvedValue(mockUserDomain), // Por defecto, encuentra el usuario
            findByEmail: jest.fn(),
            save: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        };

        jest.spyOn(UserEntity.prototype, 'toPublic').mockReturnValue(mockUserPublic);

        useCase = new GetUserUseCase(userRepository);
    });

    it('should return the user public data if found', async () => {
        const result = await useCase.execute(mockUserId);

        expect(userRepository.findById).toHaveBeenCalledWith(mockUserId);

        expect(result).toEqual(mockUserPublic);
        expect(result).not.toHaveProperty('password');

    });

    it('should throw an error if the user is not found', async () => {

        (userRepository.findById as jest.Mock).mockResolvedValue(null);

        await expect(useCase.execute('999')).rejects.toThrow('User not found');

        expect(UserEntity.prototype.toPublic).not.toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
        const mockError = new Error('Database connection failed');
        (userRepository.findById as jest.Mock).mockRejectedValue(mockError);

        await expect(useCase.execute(mockUserId)).rejects.toThrow('Database connection failed');
        expect(UserEntity.prototype.toPublic).not.toHaveBeenCalled();
    });
});