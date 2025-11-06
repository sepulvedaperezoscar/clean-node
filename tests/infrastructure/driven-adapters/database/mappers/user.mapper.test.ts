


import { UserMapper } from '@infrastructure/driven-adapters/database/user';
import { UserORM } from '@infrastructure/driven-adapters/database/user';

import { User } from '@domain/model/user/user.entity';

describe('UserMapper', () => {

    const mockUserORM: UserORM = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword123',
        role: 'user',
        isActive: true,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
        products: [], // Ignorado en estos tests
    };

    const mockUserDomain: User = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword123',
        role: 'user',
        isActive: true,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
    };

    describe('toDomain', () => {
        it('should map a UserORM entity to a domain User entity', () => {
            const domainUser = UserMapper.toDomain(mockUserORM);

            expect(domainUser).toEqual(mockUserDomain);
            expect(domainUser.password).toBe(mockUserORM.password);
            expect(domainUser.createdAt).toBeInstanceOf(Date);
        });
    });

    describe('toORM', () => {
        it('should map a domain User entity to a UserORM entity', () => {
            const ormUser = UserMapper.toORM(mockUserDomain);

            expect(ormUser).toEqual(mockUserORM);
            expect(ormUser.password).toBe(mockUserDomain.password);
            expect(ormUser.createdAt).toBeInstanceOf(Date);
        });
    });

    describe('toDomainList', () => {
        it('should map an array of UserORM entities to an array of domain User entities', () => {
            const ormList = [mockUserORM, { ...mockUserORM, id: '2', email: 'test2@example.com' }];
            const domainListExpected = [mockUserDomain, { ...mockUserDomain, id: '2', email: 'test2@example.com' }];

            const domainList = UserMapper.toDomainList(ormList);

            expect(domainList).toEqual(domainListExpected);
            expect(domainList.length).toBe(2);
        });

        it('should return an empty array if given an empty array', () => {
            const domainList = UserMapper.toDomainList([]);
            expect(domainList).toEqual([]);
        });
    });

    describe('updateORM', () => {
        it('should update an existing ORM entity with partial domain data', () => {
            const existingORM: UserORM = { ...mockUserORM };
            const updateData: Partial<User> = { email: 'updated@example.com', isActive: false };

            const updatedORM = UserMapper.updateORM(existingORM, updateData);

            expect(updatedORM.email).toBe('updated@example.com');
            expect(updatedORM.isActive).toBe(false);
            expect(updatedORM.id).toBe(existingORM.id); // ID should remain unchanged
        });
    });
});
