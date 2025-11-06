


import { DeleteUserUseCase } from '@domain/usecase/user/delete-user.usecase';
import { UserRepository } from '@domain/model/user/user.repository';
import { User } from '@domain/model/user/user.entity';

describe('DeleteUserUseCase', () => {
    let useCase: DeleteUserUseCase;
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

    beforeEach(() => {
        jest.clearAllMocks();

        userRepository = {
            findById: jest.fn().mockResolvedValue(mockUserDomain), // Por defecto, encuentra el usuario
            delete: jest.fn().mockResolvedValue(undefined), // Por defecto, la eliminación es exitosa
            findByEmail: jest.fn(),
            save: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
        };

        useCase = new DeleteUserUseCase(userRepository);
    });

    it('should delete a user successfully when found', async () => {

        await expect(useCase.execute(mockUserId)).resolves.toBeUndefined();

        expect(userRepository.findById).toHaveBeenCalledWith(mockUserId);

        expect(userRepository.delete).toHaveBeenCalledWith(mockUserId);
    });

    it('should throw an error if the user is not found', async () => {

        (userRepository.findById as jest.Mock).mockResolvedValue(null);

        await expect(useCase.execute('999')).rejects.toThrow('User not found');

        expect(userRepository.delete).not.toHaveBeenCalled();
    });

    it('should handle repository errors during the initial findById', async () => {
        const mockError = new Error('Database connection failed');
        (userRepository.findById as jest.Mock).mockRejectedValue(mockError);

        await expect(useCase.execute(mockUserId)).rejects.toThrow('Database connection failed');
        expect(userRepository.delete).not.toHaveBeenCalled();
    });

    it('should handle repository errors during the delete operation', async () => {
        const mockError = new Error('Permission denied to delete');
        (userRepository.delete as jest.Mock).mockRejectedValue(mockError);

        await expect(useCase.execute(mockUserId)).rejects.toThrow('Permission denied to delete');
        expect(userRepository.findById).toHaveBeenCalledWith(mockUserId);
    });
});