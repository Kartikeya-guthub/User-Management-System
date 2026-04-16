import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Navbar from '../components/Navbar';
import { AuthProvider } from '../context/AuthContext';

const renderNavbar = (role) => {
  localStorage.setItem('token', 'test-token');
  localStorage.setItem('user', JSON.stringify({ name: 'Test User', role }));

  return render(
    <MemoryRouter>
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('Navbar role visibility', () => {
  it('shows Users nav for admin', () => {
    renderNavbar('admin');
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('shows Users nav for manager', () => {
    renderNavbar('manager');
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('hides Users nav for normal user', () => {
    renderNavbar('user');
    expect(screen.queryByText('Users')).not.toBeInTheDocument();
  });
});