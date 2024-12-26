import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface ITicketAttrs {
    title: string;
    price: number;
    user: string;
}

interface ITicket extends mongoose.Document {
    title: string;
    price: number;
    user: string;
    version: number;
    order?: string;
}

interface ITicketModel extends mongoose.Model<ITicket> {
    build(attrs: ITicketAttrs): ITicket;
}

const ticketSchema = new mongoose.Schema<ITicket, ITicketModel>(
    {
        title: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        user: {
            type: String,
            required: true,
        },
        order: {
            type: String,
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

ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin as any);

ticketSchema.statics.build = (attrs: ITicketAttrs) => {
    return new Ticket(attrs);
};

const Ticket = mongoose.model<ITicket, ITicketModel>("Ticket", ticketSchema);

export { Ticket };
