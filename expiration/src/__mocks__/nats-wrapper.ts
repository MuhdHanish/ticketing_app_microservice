export const natsWrapper = {
    client: {
        publish: jest.fn().mockImplementation(
            (subject: string, data: any, callback: () => void) => {
                callback();
            }
        )
    }
};