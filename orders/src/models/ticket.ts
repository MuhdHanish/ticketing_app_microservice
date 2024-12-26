import mongoose from "mongoose";
import { Order, OrderStatus } from "./order";

interface ITicketAttrs {
    id?: string;
    title: string;
    price: number;
}

export interface ITicket extends mongoose.Document {
    title: string;
    price: number;
    version: number;
    isReserved: () => Promise<boolean>;
}

interface ITicketModel extends mongoose.Model<ITicket> {
    build(attrs: ITicketAttrs): ITicket;
    findByIdAndVersion(event: { id: string; version: number }): Promise<ITicket | null>;
}

const ticketSchema = new mongoose.Schema<ITicket, ITicketModel>(
    {
        title: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform(_, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            }
        }
    }
);

ticketSchema.set("versionKey", "version");
ticketSchema.pre("save", function (next) {
    this.$where = {
        version: this.get("version") - 1
    };
    next();
})

ticketSchema.methods.isReserved = async function () {
    return !!await Order.findOne({
        ticket: this,
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete
            ]
        }
    });
};

ticketSchema.statics.build = (attrs: ITicketAttrs) => {
    const { id, ...rest } = attrs;
    return new Ticket({
        ...(id && { _id: new mongoose.Types.ObjectId(id) }),
        ...rest
    });
};

ticketSchema.statics.findByIdAndVersion = (event: {
    id: string;
    version: number;
}): Promise<ITicket | null> => {
    return Ticket.findOne({ _id: event.id, version: event.version - 1 });
};

const Ticket = mongoose.model<ITicket, ITicketModel>("Ticket", ticketSchema);

export { Ticket };
