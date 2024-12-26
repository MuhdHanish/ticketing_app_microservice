import { body, param } from 'express-validator';

export const validateCreateTicket = [
    body('title')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Title must be at least 3 characters long.'),
    body('price')
        .isFloat({ gt: 0 })
        .withMessage('Price must be greater than 0.')
];

export const validParamId = [
    param('id')
        .isMongoId()
        .withMessage('Invalid ticket id.')
];

export const validateUpdateTicket = [
    ...validParamId,
    ...validateCreateTicket
];