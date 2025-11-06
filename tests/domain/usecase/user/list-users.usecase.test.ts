

import { ListUsersUseCase } from '@domain/usecase/user/list-users.usecase'; // Ajusta la ruta
import { UserRepository, FindUsersFilters } from '@domain/model/user/user.repository';
import { User, UserEntity, UserRole } from '@domain/model/user/user.entity';

describe('ListUsersUseCase', () => {
    let useCase: ListUsersUseCase;
    let userRepository: UserRepository;

    const mockUserDomain: User = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockUserPublic = {
        id: '1',
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
            findAll: jest.fn().mockResolvedValue([mockUserDomain]),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        };

        jest.spyOn(UserEntity.prototype, 'toPublic').mockReturnValue(mockUserPublic);

        useCase = new ListUsersUseCase(userRepository);
    });

    it('should return a list of public user data when no filters are provided', async () => {
        const result = await useCase.execute();

        expect(userRepository.findAll).toHaveBeenCalledWith(undefined);

        expect(result).toEqual([mockUserPublic]);
        expect(result[0]).not.toHaveProperty('password');

        expect(UserEntity.prototype.toPublic).toHaveBeenCalledTimes(1);
    });

    it('should pass filters to the repository when provided', async () => {
        const filters: FindUsersFilters = { role: 'admin', isActive: false };

        await useCase.execute(filters);

        expect(userRepository.findAll).toHaveBeenCalledWith(filters);
    });

    it('should return an empty array if no users are found', async () => {

        (userRepository.findAll as jest.Mock).mockResolvedValue([]);

        const result = await useCase.execute();

        expect(result).toEqual([]);
        expect(UserEntity.prototype.toPublic).not.toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
        const mockError = new Error('Database connection failed');
        (userRepository.findAll as jest.Mock).mockRejectedValue(mockError);

        await expect(useCase.execute()).rejects.toThrow('Database connection failed');
        expect(UserEntity.prototype.toPublic).not.toHaveBeenCalled();
    });
});