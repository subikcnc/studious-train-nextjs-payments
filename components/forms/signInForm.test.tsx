import { test, expect} from 'vitest'
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from './signInForm';
// import '@testing-library/jest-dom';

test('shows validation errors for invalid email', async () => {
    const user = userEvent.setup(); // To simulate real user interactions
    render(<ContactForm />);

    await user.type(screen.getByPlaceholderText(/enter email/i), 'invalid-email');

    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
})