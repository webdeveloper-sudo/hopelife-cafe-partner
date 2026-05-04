import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FAQ from '@/components/FAQ';

describe('FAQ Component', () => {
    it('renders the FAQ component with questions', () => {
        render(<FAQ />);
        
        // Check if the questions are rendered
        expect(screen.getByText('How do I get paid?')).toBeInTheDocument();
        expect(screen.getByText('Is there a limit to how much I can earn?')).toBeInTheDocument();
    });

    it('opens the first FAQ item by default', () => {
        render(<FAQ />);
        
        // The first answer should be visible
        expect(screen.getByText(/Payouts are processed every Monday/i)).toBeInTheDocument();
    });

    it('toggles an FAQ item when clicked', async () => {
        render(<FAQ />);
        
        // Click the second question
        const secondQuestion = screen.getByText('Is there a limit to how much I can earn?');
        fireEvent.click(secondQuestion);
        
        // Wait for the animation/state change to show the answer
        await waitFor(() => {
            expect(screen.getByText(/No. There is absolutely no cap on your earnings./i)).toBeInTheDocument();
        });
        
        // Click again to close it
        fireEvent.click(secondQuestion);
        
        // The answer should not be in the document (or should be hidden)
        await waitFor(() => {
            expect(screen.queryByText(/No. There is absolutely no cap on your earnings./i)).not.toBeInTheDocument();
        });
    });
});
