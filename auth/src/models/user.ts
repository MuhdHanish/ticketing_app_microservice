import mongoose from "mongoose";
import bcrypt from "bcryptjs";

interface IUser extends mongoose.Document {
    email: string;
    password: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

interface IUserModel extends mongoose.Model<IUser> {
    build(attrs: Pick<IUser, "email" | "password">): IUser;
}

const userSchema = new mongoose.Schema<IUser, IUserModel>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(_, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.password;
                delete ret.__v;
            },
        },
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.statics.build = (attrs: Pick<IUser, "email" | "password">) => {
    return new User(attrs);
};

const User = mongoose.model<IUser, IUserModel>("User", userSchema);

export { User };