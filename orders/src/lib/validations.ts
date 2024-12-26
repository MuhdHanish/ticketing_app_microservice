import { body, param } from 'express-validator';

export const validateCreateOrder = [
    body('ticket')
        .isMongoId()
        .withMessage('Invalid ticket.')
];

export const validParamId = [
    param('id')
        .isMongoId()
        .withMessage('Invalid ticket id.')
];