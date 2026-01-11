import bcrypt from 'bcryptjs';
import User from '../models/user.model';
import { generateToken } from '../utils/jwt.util';
import { validateEmail, validatePassword, validateName } from '../utils/validation.util';
import { ValidationError, AuthenticationError } from '../utils/error.util';
import connectDB from '../db/mongodb';

export async function registerUser(email: string, password: string, name: string) {
    await connectDB();

    if (!validateEmail(email)) {
        throw new ValidationError('Invalid email format');
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        throw new ValidationError(passwordValidation.message || 'Invalid password');
    }

    if (!validateName(name)) {
        throw new ValidationError('Name must be at least 2 characters long');
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        throw new ValidationError('User with this email already exists');
    }

    const user = await User.create({
        email: email.toLowerCase(),
        password,
        name,
    });

    const token = generateToken(user._id.toString());

    return {
        user: {
            _id: user._id.toString(),
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        },
        token,
    };
}

export async function loginUser(email: string, password: string) {
    await connectDB();

    if (!validateEmail(email)) {
        throw new ValidationError('Invalid email format');
    }

    if (!password) {
        throw new ValidationError('Password is required');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw new AuthenticationError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new AuthenticationError('Invalid email or password');
    }

    const token = generateToken(user._id.toString());

    return {
        user: {
            _id: user._id.toString(),
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        },
        token,
    };
}
