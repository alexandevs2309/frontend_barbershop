import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';

import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    service = TestBed.inject(UsersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get users list', () => {
    const mockUsers = [{ id: 1, email: 'test@test.com', full_name: 'Test User' }];

    service.getUsers().subscribe(users => {
      expect(users).toEqual(mockUsers);
    });

    const req = httpMock.expectOne(req => req.url.includes('/users/'));
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });

  it('should create user', () => {
    const newUser = { email: 'new@test.com', full_name: 'New User', password: 'password' };
    const mockResponse = { id: 2, ...newUser };

    service.createUser(newUser).subscribe(user => {
      expect(user).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(req => req.url.includes('/users/'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newUser);
    req.flush(mockResponse);
  });

  it('should update user', () => {
    const userId = 1;
    const updateData = { full_name: 'Updated Name' };
    const mockResponse = { id: userId, email: 'test@test.com', ...updateData };

    service.updateUser(userId, updateData).subscribe(user => {
      expect(user).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(req => req.url.includes(`/users/${userId}/`));
    expect(req.request.method).toBe('PATCH');
    req.flush(mockResponse);
  });

  it('should delete user', () => {
    const userId = 1;

    service.deleteUser(userId).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(req => req.url.includes(`/users/${userId}/`));
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
