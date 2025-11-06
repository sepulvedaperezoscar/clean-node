

import { Repository, SelectQueryBuilder, DeleteResult } from 'typeorm';

import { UserORM } from '@infrastructure/driven-adapters/database/user';
import { UserMapper } from '@infrastructure/driven-adapters/database/user';
import { UserRepositoryAdapter } from '@infrastructure/driven-adapters/database/user';

import { User } from '@domain/model/user/user.entity';
import { FindUsersFilters } from '@domain/model/user/user.repository';

import { AppDataSource } from '@application/config/datasource';


// Mockea las dependencias que el setup.ts no gestiona globalmente
jest.mock('@application/config/datasource');
jest.mock('@infrastructure/driven-adapters/database/user/user.mapper');

const mockRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
} as unknown as Repository<UserORM>;

const mockQueryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getCount: jest.fn(),
} as unknown as SelectQueryBuilder<UserORM>;

const mockUserDomain: User = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    password: 'hashedpassword',
};

const mockUserORM: UserORM = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    password: 'hashedpassword',
    products: [],
};

// Configura los mappers para devolver los datos de prueba
(UserMapper.toDomain as jest.Mock).mockReturnValue(mockUserDomain);
(UserMapper.toDomainList as jest.Mock).mockReturnValue([mockUserDomain]);
(UserMapper.toORM as jest.Mock).mockReturnValue(mockUserORM);
(UserMapper.updateORM as jest.Mock).mockReturnValue(mockUserORM);

// --- Tests ---

describe('UserRepositoryAdapter', () => {
    let adapter: UserRepositoryAdapter;

    beforeEach(() => {
        jest.clearAllMocks();
        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
        (mockRepository.createQueryBuilder as jest.Mock).mockReturnValue(mockQueryBuilder);
        adapter = new UserRepositoryAdapter();
    });

    it('should be defined', () => {
        expect(adapter).toBeDefined();
    });

    describe('findById', () => {
        it('should return a user if found', async () => {
            mockRepository.findOne = jest.fn().mockResolvedValue(mockUserORM);
            const result = await adapter.findById('1');
            expect(result).toEqual(mockUserDomain);
            expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
        });

        it('should return null if user not found', async () => {
            mockRepository.findOne = jest.fn().mockResolvedValue(null);
            const result = await adapter.findById('99');
            expect(result).toBeNull();
        });

        it('should handle repository findOne throwing an unexpected error', async () => {
            const mockError = new Error('Network failure');
            (mockRepository.findOne as jest.Mock).mockRejectedValue(mockError);

            await expect(adapter.findById('1')).rejects.toThrow('Failed to find user: Error: Network failure');
            expect(console.error).toHaveBeenCalled(); // Verifica que el error fue logueado
        });

    });

    describe('findByEmail', () => {
        it('should return a user if found by email', async () => {
            mockRepository.findOne = jest.fn().mockResolvedValue(mockUserORM);
            const result = await adapter.findByEmail('test@example.com');
            expect(result).toEqual(mockUserDomain);
        });

        it('should handle repository findOne throwing an unexpected error by email', async () => {
            const mockError = new Error('DB connection lost');
            (mockRepository.findOne as jest.Mock).mockRejectedValue(mockError);

            await expect(adapter.findByEmail('test@example.com')).rejects.toThrow('Failed to find user: Error: DB connection lost');
        });
    });

    describe('findAll', () => {
        it('should return all users without filters', async () => {
            (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue([mockUserORM]);
            const result = await adapter.findAll();
            expect(result).toEqual([mockUserDomain]);
        });

        it('should apply role filter', async () => {
            (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue([mockUserORM]);
            const filters: FindUsersFilters = { role: 'admin' };
            await adapter.findAll(filters);
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('user.role = :role', { role: 'admin' });
        });

        it('should apply both role and isActive filters simultaneously', async () => {
            (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue([mockUserORM]);
            const filters: FindUsersFilters = { role: 'user', isActive: true };

            await adapter.findAll(filters);

            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('user.role = :role', { role: 'user' });
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('user.isActive = :isActive', { isActive: true });
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(2);
        });

        it('should return an empty array if no users match filters', async () => {
            (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue([]); // Devuelve array vacío
            (UserMapper.toDomainList as jest.Mock).mockReturnValue([]);

            const filters: FindUsersFilters = { role: undefined };
            const result = await adapter.findAll(filters);

            expect(result).toEqual([]);
        });

        it('should handle database errors during findAll', async () => {
            const mockError = new Error('Timeout error');
            (mockQueryBuilder.getMany as jest.Mock).mockRejectedValue(mockError);

            await expect(adapter.findAll()).rejects.toThrow('Failed to find users: Error: Timeout error');
        });
    });

    describe('save', () => {
        it('should save a user and return the domain entity', async () => {
            mockRepository.save = jest.fn().mockResolvedValue(mockUserORM);
            const result = await adapter.save(mockUserDomain);
            expect(result).toEqual(mockUserDomain);
        });

        it('should throw an error for duplicate email (code 23505)', async () => {
            const mockError = new Error('Duplicate key value violates unique constraint') as any;
            mockError.code = '23505';
            mockRepository.save = jest.fn().mockRejectedValue(mockError);
            await expect(adapter.save(mockUserDomain)).rejects.toThrow('Email already exists');
        });

        it('should handle generic database errors not related to unique constraints', async () => {
            const mockError = new Error('Connection pool exhausted');
            (mockRepository.save as jest.Mock).mockRejectedValue(mockError);

            await expect(adapter.save(mockUserDomain)).rejects.toThrow('Failed to save user: Connection pool exhausted');
        });

        it('should verify UserMapper.toDomain is called with the saved ORM entity', async () => {
            (mockRepository.save as jest.Mock).mockResolvedValue(mockUserORM);

            await adapter.save(mockUserDomain);

            expect(UserMapper.toDomain).toHaveBeenCalledWith(mockUserORM);
        });
    });

    describe('delete', () => {
        it('should delete a user successfully', async () => {
            const mockDeleteResult: DeleteResult = { affected: 1, raw: {} };
            mockRepository.delete = jest.fn().mockResolvedValue(mockDeleteResult);
            await expect(adapter.delete('1')).resolves.toBeUndefined();
        });

        it('should throw "User not found" if no rows are affected', async () => {
            const mockDeleteResult: DeleteResult = { affected: 0, raw: {} };
            mockRepository.delete = jest.fn().mockResolvedValue(mockDeleteResult);
            await expect(adapter.delete('99')).rejects.toThrow('User not found');
        });
    });

    describe('update', () => {
        it('should update a user and return the updated domain entity', async () => {
            (mockRepository.findOne as jest.Mock).mockResolvedValue(mockUserORM);
            (mockRepository.save as jest.Mock).mockResolvedValue(mockUserORM);
            const updateData = { email: 'newemail@example.com' };

            const result = await adapter.update('1', updateData);

            expect(result).toEqual(mockUserDomain);
            expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
            expect(UserMapper.updateORM).toHaveBeenCalledWith(mockUserORM, updateData);
            expect(mockRepository.save).toHaveBeenCalledWith(mockUserORM);
        });

        it('should throw "User not found" if user does not exist during update', async () => {
            // Configura findOne para que devuelva null (usuario no encontrado)
            (mockRepository.findOne as jest.Mock).mockResolvedValue(null);

            await expect(adapter.update('99', {})).rejects.toThrow('User not found');
            expect(mockRepository.save).not.toHaveBeenCalled(); // No se debería intentar guardar
        });

        it('should throw an error for duplicate email during update (code 23505)', async () => {
            (mockRepository.findOne as jest.Mock).mockResolvedValue(mockUserORM);

            const mockError = new Error('Duplicate key value violates unique constraint') as any;
            mockError.code = '23505';

            (mockRepository.save as jest.Mock).mockRejectedValue(mockError);

            await expect(adapter.update('1', { email: 'existing@example.com' })).rejects.toThrow('Email already exists');
        });

        it('should throw a generic error on other database failures during update', async () => {
            (mockRepository.findOne as jest.Mock).mockResolvedValue(mockUserORM);
            const mockError = new Error('Connection lost');

            (mockRepository.save as jest.Mock).mockRejectedValue(mockError);

            await expect(adapter.update('1', {})).rejects.toThrow('Failed to update user: Connection lost');
        });
    });

    describe('count', () => {
        it('should return the total count of users without filters', async () => {
            (mockQueryBuilder.getCount as jest.Mock).mockResolvedValue(10);

            const result = await adapter.count();

            expect(result).toBe(10);
            expect(mockRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
            expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
        });

        it('should return the count applying role filter', async () => {
            (mockQueryBuilder.getCount as jest.Mock).mockResolvedValue(5);
            const filters: FindUsersFilters = { role: 'admin' };

            const result = await adapter.count(filters);

            expect(result).toBe(5);
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('user.role = :role', { role: 'admin' });
        });

        it('should return the count applying isActive filter', async () => {
            (mockQueryBuilder.getCount as jest.Mock).mockResolvedValue(2);
            const filters = { isActive: false };

            const result = await adapter.count(filters);

            expect(result).toBe(2);
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('user.isActive = :isActive', { isActive: false });
        });

        it('should throw an error on database failure during count', async () => {
            const mockError = new Error('DB count error');
            (mockQueryBuilder.getCount as jest.Mock).mockRejectedValue(mockError);

            await expect(adapter.count({})).rejects.toThrow('Failed to count users: Error: DB count error');
        });
    });

});