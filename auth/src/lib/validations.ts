import { body } from 'express-validator';

export const validateEmailPassword = [
    body('email')
        .isEmail()
        .withMessage('Invalid email address.')
        .normalizeEmail(),
    body('password')
        .trim()
        .isLength({ min: 8, max: 20 })
        .withMessage('Password must be between 8 and 20 characters long.')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character.'),
];