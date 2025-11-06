


import { Request, Response, NextFunction } from 'express';
import { UserController } from '@infrastructure/entry-points/api-rest/user';
import {
    CreateUserUseCase,
    GetUserUseCase,
    ListUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase
} from '@domain/usecase/user';
import { ResponseFormatter } from '@infrastructure/helpers';

jest.mock('@domain/usecase/user');
jest.mock('@infrastructure/helpers/logger');
jest.mock('@infrastructure/helpers/response-formatter');

const mockCreateUserUseCase = { execute: jest.fn() } as unknown as CreateUserUseCase;
const mockGetUserUseCase = { execute: jest.fn() } as unknown as GetUserUseCase;
const mockListUsersUseCase = { execute: jest.fn() } as unknown as ListUsersUseCase;
const mockUpdateUserUseCase = { execute: jest.fn() } as unknown as UpdateUserUseCase;
const mockDeleteUserUseCase = { execute: jest.fn() } as unknown as DeleteUserUseCase;


let mockRequest: Partial<Request>;
let mockResponse: Partial<Response>;
const mockNext: NextFunction = jest.fn();

const mockResponseFormatter = {
    created: jest.fn(),
    success: jest.fn(),
    noContent: jest.fn(),
} as unknown as typeof ResponseFormatter;
(ResponseFormatter as unknown as jest.Mock).mockImplementation(() => mockResponseFormatter);


describe('UserController', () => {
    let controller: UserController;

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new UserController(
            mockCreateUserUseCase,
            mockGetUserUseCase,
            mockListUsersUseCase,
            mockUpdateUserUseCase,
            mockDeleteUserUseCase
        );

        mockRequest = { body: {}, params: {}, query: {} };
        mockResponse = {
            status: jest.fn().mockReturnThis(), // Status debe devolver 'this' para encadenar .json()
            json: jest.fn(),
        };
    });

    // --- Create User Tests ---
    describe('create', () => {
        it('should create a user successfully and return 201 status', async () => {
            const mockUserData = { id: '1', email: 'test@example.com', name: 'Test' };
            const mockFormattedResponse = { data: mockUserData };

            (mockCreateUserUseCase.execute as jest.Mock).mockResolvedValue(mockUserData);
            (ResponseFormatter.created as jest.Mock).mockReturnValue(mockFormattedResponse);

            mockRequest.body = { email: 'test@example.com', password: 'pass', name: 'Test' };

            await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith(mockRequest.body);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(mockFormattedResponse);
            expect(ResponseFormatter.created).toHaveBeenCalledWith(mockUserData, 'User created successfully');
        });

        it('should call next function on error during creation', async () => {
            const mockError = new Error('Email already exists');
            (mockCreateUserUseCase.execute as jest.Mock).mockRejectedValue(mockError);

            await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(mockError);
            expect(mockResponse.status).not.toHaveBeenCalled(); // No debe enviar respuesta, solo next()
        });
    });

    // --- Get User By Id Tests ---
    describe('getById', () => {
        it('should get a user successfully and return 200 status', async () => {
            const mockUser = { id: '1', email: 'test@example.com' };
            (mockGetUserUseCase.execute as jest.Mock).mockResolvedValue(mockUser);
            (ResponseFormatter.success as jest.Mock).mockReturnValue({ data: mockUser });

            mockRequest.params = { id: '1' };

            await controller.getById(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockGetUserUseCase.execute).toHaveBeenCalledWith('1');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({ data: mockUser });
        });

        it('should call next function if user is not found (error from use case)', async () => {
            const mockError = new Error('User not found');
            (mockGetUserUseCase.execute as jest.Mock).mockRejectedValue(mockError);

            await controller.getById(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(mockError);
        });
    });

    // --- List Users Tests ---
    describe('list', () => {
        it('should list users with correct filters and return 200 status', async () => {
            const mockUsers = [{ id: '1' }, { id: '2' }];
            (mockListUsersUseCase.execute as jest.Mock).mockResolvedValue(mockUsers);
            (ResponseFormatter.success as jest.Mock).mockReturnValue({ data: mockUsers });

            mockRequest.query = { role: 'user', isActive: 'true' };

            await controller.list(mockRequest as Request, mockResponse as Response, mockNext);

            const expectedFilters = { role: 'user', isActive: true };
            expect(mockListUsersUseCase.execute).toHaveBeenCalledWith(expectedFilters);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({ data: mockUsers });
        });

        it('should correctly parse filters with isActive=false', async () => {
            (mockListUsersUseCase.execute as jest.Mock).mockResolvedValue([]);
            mockRequest.query = { isActive: 'false' };
            await controller.list(mockRequest as Request, mockResponse as Response, mockNext);

            const expectedFilters = { role: undefined, isActive: false };
            expect(mockListUsersUseCase.execute).toHaveBeenCalledWith(expectedFilters);
        });

        it('should call next function on error during listing', async () => {
            const mockError = new Error('DB error');
            (mockListUsersUseCase.execute as jest.Mock).mockRejectedValue(mockError);

            await controller.list(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(mockError);
        });
    });

    // --- Update User Tests ---
    describe('update', () => {
        it('should update a user successfully and return 200 status', async () => {
            const mockUpdatedUser = { id: '1', name: 'Updated Name' };
            (mockUpdateUserUseCase.execute as jest.Mock).mockResolvedValue(mockUpdatedUser);
            (ResponseFormatter.success as jest.Mock).mockReturnValue({ data: mockUpdatedUser });

            mockRequest.params = { id: '1' };
            mockRequest.body = { name: 'Updated Name' };

            await controller.update(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockUpdateUserUseCase.execute).toHaveBeenCalledWith('1', mockRequest.body);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({ data: mockUpdatedUser });
            expect(ResponseFormatter.success).toHaveBeenCalledWith(mockUpdatedUser, 'User updated successfully');
        });

        it('should call next function if user is not found during update', async () => {
            const mockError = new Error('User not found');
            (mockUpdateUserUseCase.execute as jest.Mock).mockRejectedValue(mockError);

            await controller.update(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(mockError);
        });
    });

    // --- Delete User Tests ---
    describe('delete', () => {
        it('should delete a user successfully and return no content status (200 OK with specific body)', async () => {
            (mockDeleteUserUseCase.execute as jest.Mock).mockResolvedValue(undefined);
            (ResponseFormatter.noContent as jest.Mock).mockReturnValue({ message: 'No Content' });

            mockRequest.params = { id: '1' };

            await controller.delete(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockDeleteUserUseCase.execute).toHaveBeenCalledWith('1');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(ResponseFormatter.noContent).toHaveBeenCalled();
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'No Content' });
        });

        it('should call next function if user is not found during deletion', async () => {
            const mockError = new Error('User not found');
            (mockDeleteUserUseCase.execute as jest.Mock).mockRejectedValue(mockError);

            await controller.delete(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(mockError);
        });
    });
});