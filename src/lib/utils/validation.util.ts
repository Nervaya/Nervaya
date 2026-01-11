export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 6) {
        return { valid: false, message: 'Password must be at least 6 characters long' };
    }

    return { valid: true };
}

export function validateName(name: string): boolean {
    return name.trim().length >= 2;
}
