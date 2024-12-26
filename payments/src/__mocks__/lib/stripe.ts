export const stripe = {
    paymentIntents: {
        create: jest.fn().mockImplementation(
            (data: any, callback: () => void) => {
                callback();
            }
        )
    }
}