


import { UpdateUserUseCase, UpdateUserCommand } from '@domain/usecase/user/update-user.usecase'; // Ajusta la ruta
import { UserRepository } from '@domain/model/user/user.repository';
import { User, UserEntity, UserRole } from '@domain/model/user/user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UpdateUserUseCase', () => {
    let useCase: UpdateUserUseCase;
    let userRepository: UserRepository;

    const mockUserId = '123';

    const mockExistingUserDomain: User = {
        id: mockUserId,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'oldHashedPassword',
        role: 'user',
        isActive: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
    };

    const mockUpdatedUserDomain: User = {
        ...mockExistingUserDomain,
        name: 'John Updated',
        email: 'updated@example.com',
        password: 'newHashedPassword',
        isActive: false,
    };

    const mockUserPublic = {
        id: mockUserId,
        name: 'John Updated',
        email: 'updated@example.com',
        role: 'user' as UserRole,
        isActive: false,
        createdAt: mockUpdatedUserDomain.createdAt,
        updatedAt: mockUpdatedUserDomain.updatedAt,
    };

    beforeEach(() => {
        jest.clearAllMocks();

        userRepository = {
            findById: jest.fn().mockResolvedValue(mockExistingUserDomain), // Por defecto, encuentra el usuario existente
            findByEmail: jest.fn().mockResolvedValue(null), // Por defecto, el email nuevo no existe
            update: jest.fn().mockResolvedValue(mockUpdatedUserDomain), // Por defecto, update devuelve el usuario actualizado
            save: jest.fn(),
            findAll: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        };

        (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');

        jest.spyOn(UserEntity.prototype, 'toPublic').mockReturnValue(mockUserPublic);

        useCase = new UpdateUserUseCase(userRepository);
    });

    it('should update user data successfully and return public data', async () => {
        const command: UpdateUserCommand = {
            name: 'John Updated',
            email: 'updated@example.com',
            isActive: false
        };

        const result = await useCase.execute(mockUserId, command);

        expect(userRepository.findById).toHaveBeenCalledWith(mockUserId);

        expect(userRepository.findByEmail).toHaveBeenCalledWith(command.email);

        expect(userRepository.update).toHaveBeenCalledWith(mockUserId, expect.objectContaining({
            name: command.name,
            email: command.email,
            isActive: command.isActive,
        }));

        expect(result).toEqual(mockUserPublic);
        expect(result).not.toHaveProperty('password');
    });

    it('should update only the specified fields (partial update)', async () => {
        const command: UpdateUserCommand = {
            name: 'John Updated Name Only'
        };

        await useCase.execute(mockUserId, command);

        expect(userRepository.update).toHaveBeenCalledWith(mockUserId, {
            name: 'John Updated Name Only'
        });

        expect(userRepository.findByEmail).not.toHaveBeenCalled();
    });


    it('should throw an error if the user is not found', async () => {
        (userRepository.findById as jest.Mock).mockResolvedValue(null);

        await expect(useCase.execute('999', {})).rejects.toThrow('User not found');

        expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should throw an error if the new email already exists for another user', async () => {
        const command: UpdateUserCommand = { email: 'existing@example.com' };

        (userRepository.findById as jest.Mock).mockResolvedValue(mockExistingUserDomain);

        const otherUser = { ...mockExistingUserDomain, id: '999', email: 'existing@example.com' };
        (userRepository.findByEmail as jest.Mock).mockResolvedValue(otherUser);

        await expect(useCase.execute(mockUserId, command)).rejects.toThrow('Email already exists');

        expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should hash the password if it is provided in the command', async () => {
        const command: UpdateUserCommand = { password: 'newSecurePassword' };

        await useCase.execute(mockUserId, command);

        expect(bcrypt.hash).toHaveBeenCalledWith(command.password, 10);

        expect(userRepository.update).toHaveBeenCalledWith(mockUserId, expect.objectContaining({
            password: 'newHashedPassword'
        }));
    });

    it('should handle errors during password hashing', async () => {
        const command: UpdateUserCommand = { password: 'newSecurePassword' };
        const mockError = new Error('Bcrypt failed');
        (bcrypt.hash as jest.Mock).mockRejectedValue(mockError);

        await expect(useCase.execute(mockUserId, command)).rejects.toThrow('Bcrypt failed');
        expect(userRepository.update).not.toHaveBeenCalled();
    });
});