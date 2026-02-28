import { AllExceptionsFilter } from './all-exceptions.filter';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockHttpAdapterHost: HttpAdapterHost;
  let mockHttpAdapter: any;
  let mockArgumentsHost: ArgumentsHost;
  let mockResponse: any;
  let mockRequest: any;

  beforeEach(() => {
    mockHttpAdapter = {
      getRequestUrl: jest.fn().mockReturnValue('/test-path'),
      reply: jest.fn(),
    };
    mockHttpAdapterHost = {
      httpAdapter: mockHttpAdapter,
    } as any;
    filter = new AllExceptionsFilter(mockHttpAdapterHost);

    mockResponse = {
      statusCode: 200,
    };
    mockRequest = {};
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnThis(),
      getResponse: jest.fn().mockReturnValue(mockResponse),
      getRequest: jest.fn().mockReturnValue(mockRequest),
    } as any;
  });

  it('should format HttpException correctly', () => {
    const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
    filter.catch(exception, mockArgumentsHost);

    expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
      mockResponse,
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Test error',
        data: null,
        path: '/test-path',
      }),
      HttpStatus.BAD_REQUEST,
    );
  });

  it('should format generic Error correctly', () => {
    const exception = new Error('Unexpected error');
    filter.catch(exception, mockArgumentsHost);

    expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
      mockResponse,
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Unexpected error',
        data: null,
      }),
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  });

  it('should handle validation errors (array of messages)', () => {
    const exceptionResponse = {
      message: ['error 1', 'error 2'],
      error: 'Bad Request',
      statusCode: 400,
    };
    const exception = new HttpException(
      exceptionResponse,
      HttpStatus.BAD_REQUEST,
    );
    filter.catch(exception, mockArgumentsHost);

    expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
      mockResponse,
      expect.objectContaining({
        statusCode: 400,
        message: 'error 1', // Should take the first one
      }),
      HttpStatus.BAD_REQUEST,
    );
  });
});
