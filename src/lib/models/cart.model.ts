import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICartItem {
  supplementId: Types.ObjectId;
  quantity: number;
  price: number;
}

export interface ICart extends Document {
  userId: string;
  items: ICartItem[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    supplementId: {
      type: Schema.Types.ObjectId,
      ref: "Supplement",
      required: [true, "Supplement ID is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be non-negative"],
    },
  },
  { _id: false },
);

const cartSchema = new Schema<ICart>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      unique: true,
      index: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: [0, "Total amount must be non-negative"],
    },
  },
  {
    timestamps: true,
  },
);

cartSchema.pre("save", function () {
  this.totalAmount = this.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
});

const Cart: Model<ICart> =
  mongoose.models.Cart || mongoose.model<ICart>("Cart", cartSchema);

export default Cart;
