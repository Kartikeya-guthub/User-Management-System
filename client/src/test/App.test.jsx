import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../pages/LoginPage', () => ({ default: () => <div>Login Page</div> }));
vi.mock('../pages/DashboardPage', () => ({ default: () => <div>Dashboard Page</div> }));
vi.mock('../pages/UsersPage', () => ({ default: () => <div>Users Page</div> }));
vi.mock('../pages/UserDetailPage', () => ({ default: () => <div>User Detail Page</div> }));
vi.mock('../pages/EditUserPage', () => ({ default: () => <div>Edit User Page</div> }));
vi.mock('../pages/CreateUserPage', () => ({ default: () => <div>Create User Page</div> }));
vi.mock('../pages/ProfilePage', () => ({ default: () => <div>Profile Page</div> }));

import App from '../App';
import { AuthProvider } from '../context/AuthContext';

const renderApp = (initialEntry = '/dashboard') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  );

describe('Frontend route and role behavior', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('redirects unauthenticated users to login for protected routes', async () => {
    renderApp('/users');
    expect(await screen.findByText('Login Page')).toBeInTheDocument();
  });

  it('blocks normal users from /users route', async () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user', JSON.stringify({ role: 'user', name: 'Regular User' }));

    renderApp('/users');
    expect(await screen.findByText('Dashboard Page')).toBeInTheDocument();
  });

  it('allows admin user to access /users route', async () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user', JSON.stringify({ role: 'admin', name: 'Admin User' }));

    renderApp('/users');
    expect(await screen.findByText('Users Page')).toBeInTheDocument();
  });

  it('restores session from localStorage after refresh-like mount', async () => {
    localStorage.setItem('token', 'persisted-token');
    localStorage.setItem('user', JSON.stringify({ role: 'manager', name: 'Manager User' }));

    renderApp('/dashboard');
    expect(await screen.findByText('Dashboard Page')).toBeInTheDocument();
    expect(screen.getByText('Manager User')).toBeInTheDocument();
  });
});