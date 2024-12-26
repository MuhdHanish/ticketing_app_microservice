import mongoose from "mongoose";
import { OrderStatus } from "@hanishdev-ticketing/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { ITicket } from "./ticket";

interface IOrderAttrs {
    status: OrderStatus;
    expiresAt: Date;
    user: string;
    ticket: ITicket;
}

interface IOrder extends mongoose.Document {
    status: OrderStatus;
    expiresAt: Date;
    user: string;
    version: number;
    ticket: ITicket;
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
        status: {
            type: String,
            required: true,
            enum: Object.values(OrderStatus),
            default: OrderStatus.Created,
        },
        expiresAt: {
            type: mongoose.Schema.Types.Date,
        },
        ticket: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ticket",
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
    return new Order(attrs);
};

const Order = mongoose.model<IOrder, IOrderModel>("Order", orderSchema);

export { Order, OrderStatus };
