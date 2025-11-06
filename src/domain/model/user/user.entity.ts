
export type UserRole = 'admin' | 'user';

export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export class UserEntity implements User {
    constructor(
        public id: string,
        public name: string,
        public email: string,
        public password: string,
        public role: UserRole,
        public isActive: boolean,
        public createdAt: Date,
        public updatedAt: Date
    ) { }

    static create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>): UserEntity {
        return new UserEntity(
            crypto.randomUUID(),
            data.name,
            data.email,
            data.password,
            data.role,
            true,
            new Date(),
            new Date()
        );
    }

    validate(): void {
        if (!this.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            throw new Error('Invalid email format');
        }
        if (this.name.length < 2) {
            throw new Error('Name must be at least 2 characters');
        }
        if (this.password.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }
    }

    toPublic(): Omit<User, 'password'> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...publicUser } = this;
        return publicUser;
    }

    updatePassword(newPassword: string): void {
        if (newPassword.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }
        this.password = newPassword;
        this.updatedAt = new Date();
    }

    deactivate(): void {
        this.isActive = false;
        this.updatedAt = new Date();
    }

    activate(): void {
        this.isActive = true;
        this.updatedAt = new Date();
    }
}