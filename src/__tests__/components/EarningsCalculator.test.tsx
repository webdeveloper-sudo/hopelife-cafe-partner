import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EarningsCalculator from '@/components/EarningsCalculator';

describe('EarningsCalculator Component', () => {
    it('renders the calculator with default values', () => {
        render(<EarningsCalculator initialCommission={7.5} />);
        
        // Default guests is 20, default bill is 1200, commission is 7.5
        // Calculation: 20 * 1200 * (7.5 / 100) = 1800
        expect(screen.getByText('₹1,800')).toBeInTheDocument();
        expect(screen.getByText('20')).toBeInTheDocument(); // Guests
        expect(screen.getByText('₹1200')).toBeInTheDocument(); // Avg Bill
        expect(screen.getByText('7.5%')).toBeInTheDocument(); // Commission
    });

    it('updates estimated earnings when guest slider changes', () => {
        render(<EarningsCalculator initialCommission={10} />);
        
        // Find the guests slider
        const sliders = screen.getAllByRole('slider');
        const guestsSlider = sliders[0];
        
        // Change guests to 50
        fireEvent.change(guestsSlider, { target: { value: '50' } });
        
        // New calculation: 50 * 1200 * 10% = 6000
        expect(screen.getByText('₹6,000')).toBeInTheDocument();
    });

    it('updates estimated earnings when average bill slider changes', () => {
        render(<EarningsCalculator initialCommission={10} />);
        
        // Find the avg bill slider
        const sliders = screen.getAllByRole('slider');
        const avgBillSlider = sliders[1];
        
        // Change avg bill to 2000
        fireEvent.change(avgBillSlider, { target: { value: '2000' } });
        
        // New calculation: 20 (default guests) * 2000 * 10% = 4000
        expect(screen.getByText('₹4,000')).toBeInTheDocument();
    });

    it('updates estimated earnings when commission slider changes', () => {
        render(<EarningsCalculator initialCommission={10} />);
        
        // Find the commission slider
        const sliders = screen.getAllByRole('slider');
        const commissionSlider = sliders[2];
        
        // Change commission to 15%
        fireEvent.change(commissionSlider, { target: { value: '15' } });
        
        // New calculation: 20 (default guests) * 1200 (default bill) * 15% = 3600
        expect(screen.getByText('₹3,600')).toBeInTheDocument();
    });
});
