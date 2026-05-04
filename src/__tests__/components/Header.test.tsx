import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Header from '@/components/Header';

// Mock next/navigation
vi.mock('next/navigation', () => ({
    usePathname: vi.fn(),
}));

// Mock usePathname to return a specific value
import { usePathname } from 'next/navigation';

describe('Header Component', () => {
    it('renders logo properly', () => {
        // Set pathname to a non-auth page
        (usePathname as any).mockReturnValue('/');
        
        render(<Header />);
        
        const logo = screen.getByRole('img', { name: /HOPE Cafe Logo/i });
        expect(logo).toBeInTheDocument();
    });

    it('renders Partner Login and Join Network links on non-auth pages', () => {
        (usePathname as any).mockReturnValue('/');
        
        render(<Header />);
        
        expect(screen.getByText('Partner Login')).toBeInTheDocument();
        expect(screen.getByText('Join Network')).toBeInTheDocument();
    });

    it('hides Partner Login and Join Network links on auth pages (/login)', () => {
        (usePathname as any).mockReturnValue('/login');
        
        render(<Header />);
        
        expect(screen.queryByText('Partner Login')).not.toBeInTheDocument();
        expect(screen.queryByText('Join Network')).not.toBeInTheDocument();
    });

    it('hides Partner Login and Join Network links on auth pages (/register)', () => {
        (usePathname as any).mockReturnValue('/register');
        
        render(<Header />);
        
        expect(screen.queryByText('Partner Login')).not.toBeInTheDocument();
        expect(screen.queryByText('Join Network')).not.toBeInTheDocument();
    });
});
