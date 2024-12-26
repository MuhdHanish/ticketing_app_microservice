import mongoose from "mongoose";

interface IPaymentAttrs {
    order: string;
    stripe: string;
}

export interface IPayment extends mongoose.Document {
    order: string;
    stripe: string;
}

interface IPaymentModel extends mongoose.Model<IPayment> {
    build(attrs: IPaymentAttrs): IPayment;
}

const paymentSchema = new mongoose.Schema<IPayment, IPaymentModel>(
    {
        order: {
            type: String,
            required: true,
        },
        stripe: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform(_, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            },
        },
    }
);

paymentSchema.statics.build = (attrs: IPaymentAttrs) => {
    return new Payment(attrs);
};

const Payment = mongoose.model<IPayment, IPaymentModel>("Payment", paymentSchema);

export { Payment };
