

import { CreateUserUseCase, CreateUserCommand } from '@domain/usecase/user/create-user.usecase'; // Ajusta la ruta
import { UserRepository } from '@domain/model/user/user.repository';
import { User, UserEntity } from '@domain/model/user/user.entity';

import * as bcrypt from 'bcrypt';
import { UserRole } from '@domain/model/user/user.entity';

jest.mock('bcrypt');

jest.mock('@domain/model/user/user.entity');

describe('CreateUserUseCase', () => {
    let useCase: CreateUserUseCase;
    let userRepository: UserRepository;
    let userEntityMockInstance: any;

    const mockCommand: CreateUserCommand = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securePassword123',
        role: 'user',
    };

    const mockUserDomain: User = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword', // Usamos este hash mockeado
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockUserPublic = {
        id: '123',
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
            findByEmail: jest.fn().mockResolvedValue(null), // Por defecto, el email no existe
            save: jest.fn().mockResolvedValue(mockUserDomain), // save devuelve el usuario completo mockeado
            findById: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        };

        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

        userEntityMockInstance = {
            ...mockUserDomain,
            validate: jest.fn(),
            toPublic: jest.fn().mockReturnValue(mockUserPublic),
        };

        jest.spyOn(UserEntity, 'create').mockReturnValue(userEntityMockInstance as any);
        jest.spyOn(UserEntity.prototype, 'toPublic').mockReturnValue(mockUserPublic);
        jest.spyOn(UserEntity.prototype, 'validate').mockImplementation(() => { });


        useCase = new CreateUserUseCase(userRepository);
    });

    it('should create a user successfully and return public data', async () => {
        const result = await useCase.execute(mockCommand);

        expect(userRepository.findByEmail).toHaveBeenCalledWith(mockCommand.email);

        expect(bcrypt.hash).toHaveBeenCalledWith(mockCommand.password, 10);

        expect(UserEntity.create).toHaveBeenCalledWith({
            name: mockCommand.name,
            email: mockCommand.email,
            password: 'hashedPassword',
            role: 'user',
        });

        const mockUserInstance = (UserEntity.create as jest.Mock).mock.results[0].value;
        expect(mockUserInstance.validate).toHaveBeenCalled();

        expect(userRepository.save).toHaveBeenCalledWith(expect.objectContaining({
            email: mockCommand.email
        }));

        expect(result).toEqual(mockUserPublic);
        expect(result).not.toHaveProperty('password'); // Asegúrar que la contraseña no se exponga
    });

    it('should throw an error if the email already exists', async () => {

        (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUserDomain);

        await expect(useCase.execute(mockCommand)).rejects.toThrow('Email already exists');

        expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should handle errors during password hashing', async () => {
        const mockError = new Error('Bcrypt failed');
        (bcrypt.hash as jest.Mock).mockRejectedValue(mockError);

        await expect(useCase.execute(mockCommand)).rejects.toThrow('Bcrypt failed');
        expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should throw an error if validation fails', async () => {
        const mockValidationError = new Error('Invalid email format');

        (UserEntity.create as jest.Mock).mockReturnValue({
            validate: jest.fn().mockImplementation(() => { throw mockValidationError; }),
            toPublic: jest.fn(),
            ...mockUserDomain,
        });

        await expect(useCase.execute(mockCommand)).rejects.toThrow('Invalid email format');
        expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should use default role "user" if not specified in command', async () => {
        const commandWithoutRole: CreateUserCommand = {
            ...mockCommand,
            role: undefined // No role provided
        };

        await useCase.execute(commandWithoutRole);

        expect(UserEntity.create).toHaveBeenCalledWith(expect.objectContaining({
            role: 'user', // Expect the default 'user' role
        }));
    });
});
