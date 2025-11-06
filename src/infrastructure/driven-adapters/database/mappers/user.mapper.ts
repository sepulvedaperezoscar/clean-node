

import { User } from '@domain/model/user/user.entity';
import { UserORM } from '../entities/user.entity.orm';


export class UserMapper {

    static toDomain(ormEntity: UserORM): User {
        return {
            id: ormEntity.id,
            name: ormEntity.name,
            email: ormEntity.email,
            password: ormEntity.password,
            role: ormEntity.role,
            isActive: ormEntity.isActive,
            createdAt: ormEntity.createdAt,
            updatedAt: ormEntity.updatedAt,
        };
    }

    static toORM(domainEntity: User): UserORM {
        const ormEntity = new UserORM();
        ormEntity.id = domainEntity.id;
        ormEntity.name = domainEntity.name;
        ormEntity.email = domainEntity.email;
        ormEntity.password = domainEntity.password;
        ormEntity.role = domainEntity.role;
        ormEntity.isActive = domainEntity.isActive;
        ormEntity.createdAt = domainEntity.createdAt;
        ormEntity.updatedAt = domainEntity.updatedAt;
        return ormEntity;
    }

    static toDomainList(ormEntities: UserORM[]): User[] {
        return ormEntities.map(entity => this.toDomain(entity));
    }

    static updateORM(ormEntity: UserORM, domainData: Partial<User>): UserORM {
        if (domainData.name !== undefined) ormEntity.name = domainData.name;
        if (domainData.email !== undefined) ormEntity.email = domainData.email;
        if (domainData.password !== undefined) ormEntity.password = domainData.password;
        if (domainData.role !== undefined) ormEntity.role = domainData.role;
        if (domainData.isActive !== undefined) ormEntity.isActive = domainData.isActive;
        ormEntity.updatedAt = new Date();
        return ormEntity;
    }
}