import mongoose from "mongoose";
import { OrderStatus } from "@hanishdev-ticketing/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface IOrderAttrs {
    id: string;
    status: OrderStatus;
    user: string;
    version: number;
    price: number;
}

export interface IOrder extends mongoose.Document {
    status: OrderStatus;
    user: string;
    version: number;
    price: number;
}

interface IOrderModel extends mongoose.Model<IOrder> {
    build(attrs: IOrderAttrs): IOrder;
}

const orderSchema = new mongoose.Schema<IOrder, IOrderModel>(
    {
        user: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: Object.values(OrderStatus),
        },
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

orderSchema.set("versionKey", "version");
orderSchema.plugin(updateIfCurrentPlugin as any);

orderSchema.statics.build = (attrs: IOrderAttrs) => {
    const { id, ...rest } = attrs;
    return new Order({
        ...(id && { _id: new mongoose.Types.ObjectId(id) }),
        ...rest,
    });
};

const Order = mongoose.model<IOrder, IOrderModel>("Order", orderSchema);

export { Order, OrderStatus };
