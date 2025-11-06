

import { Request, Response, NextFunction } from 'express';
import {
    CreateUserUseCase,
    GetUserUseCase,
    ListUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
} from '@domain/usecase/user';
import { Logger } from '@infrastructure/helpers';
import { ResponseFormatter } from '@infrastructure/helpers';

export class UserController {
    private logger: Logger;

    constructor(
        private readonly createUserUseCase: CreateUserUseCase,
        private readonly getUserUseCase: GetUserUseCase,
        private readonly listUsersUseCase: ListUsersUseCase,
        private readonly updateUserUseCase: UpdateUserUseCase,
        private readonly deleteUserUseCase: DeleteUserUseCase
    ) {
        this.logger = new Logger('UserController');
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            this.logger.info('Creating new user', { email: req.body.email });

            const user = await this.createUserUseCase.execute(req.body);

            this.logger.info('User created successfully', { userId: user.id });

            res.status(201).json(
                ResponseFormatter.created(user, 'User created successfully')
            );
        } catch (error) {
            this.logger.error('Error creating user', error);
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            this.logger.info('Getting user by id', { userId: id });

            const user = await this.getUserUseCase.execute(id);

            res.status(200).json(ResponseFormatter.success(user));
        } catch (error) {
            this.logger.error('Error getting user', error);
            next(error);
        }
    }

    async list(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filters = {
                role: req.query.role as 'admin' | 'user' | undefined,
                isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
            };

            this.logger.info('Listing users', filters);

            const users = await this.listUsersUseCase.execute(filters);

            res.status(200).json(
                ResponseFormatter.success(users, `Found ${users.length} users`)
            );
        } catch (error) {
            this.logger.error('Error listing users', error);
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            this.logger.info('Updating user', { userId: id });

            const user = await this.updateUserUseCase.execute(id, req.body);

            this.logger.info('User updated successfully', { userId: id });

            res.status(200).json(
                ResponseFormatter.success(user, 'User updated successfully')
            );
        } catch (error) {
            this.logger.error('Error updating user', error);
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            this.logger.info('Deleting user', { userId: id });

            await this.deleteUserUseCase.execute(id);

            this.logger.info('User deleted successfully', { userId: id });

            res.status(200).json(
                ResponseFormatter.noContent()
            );
        } catch (error) {
            this.logger.error('Error deleting user', error);
            next(error);
        }
    }
}