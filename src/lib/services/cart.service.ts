import Cart, { ICartItem } from "@/lib/models/cart.model";
import Supplement from "@/lib/models/supplement.model";
import connectDB from "@/lib/db/mongodb";
import { handleError, ValidationError } from "@/lib/utils/error.util";
import { Types } from "mongoose";

export async function getCartByUserId(userId: string) {
  await connectDB();
  try {
    if (!userId || typeof userId !== "string") {
      throw new ValidationError("Invalid User ID");
    }

    let cart = await Cart.findOne({ userId }).populate("items.supplementId");
    if (!cart) {
      cart = await Cart.create({ userId, items: [], totalAmount: 0 });
    }
    return cart;
  } catch (error) {
    throw handleError(error);
  }
}

export async function addToCart(
  userId: string,
  supplementId: string,
  quantity: number,
) {
  await connectDB();
  try {
    if (!userId || typeof userId !== "string") {
      throw new ValidationError("Invalid User ID");
    }
    if (!Types.ObjectId.isValid(supplementId)) {
      throw new ValidationError("Invalid Supplement ID");
    }

    if (quantity < 1) {
      throw new ValidationError("Quantity must be at least 1");
    }

    const supplement = await Supplement.findById(supplementId);
    if (!supplement) {
      throw new ValidationError("Supplement not found");
    }

    if (!supplement.isActive) {
      throw new ValidationError("Supplement is not available");
    }

    if (supplement.stock < quantity) {
      throw new ValidationError("Insufficient stock");
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [], totalAmount: 0 });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.supplementId.toString() === supplementId,
    );

    if (existingItemIndex > -1) {
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (newQuantity > supplement.stock) {
        throw new ValidationError("Insufficient stock");
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      cart.items.push({
        supplementId: new Types.ObjectId(supplementId),
        quantity,
        price: supplement.price,
      });
    }

    await cart.save();
    return await Cart.findById(cart._id).populate("items.supplementId");
  } catch (error) {
    throw handleError(error);
  }
}

export async function updateCartItem(
  userId: string,
  supplementId: string,
  quantity: number,
) {
  await connectDB();
  try {
    if (!userId || typeof userId !== "string") {
      throw new ValidationError("Invalid User ID");
    }
    if (!Types.ObjectId.isValid(supplementId)) {
      throw new ValidationError("Invalid Supplement ID");
    }

    if (quantity < 1) {
      throw new ValidationError("Quantity must be at least 1");
    }

    const supplement = await Supplement.findById(supplementId);
    if (!supplement) {
      throw new ValidationError("Supplement not found");
    }

    if (supplement.stock < quantity) {
      throw new ValidationError("Insufficient stock");
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new ValidationError("Cart not found");
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.supplementId.toString() === supplementId,
    );

    if (itemIndex === -1) {
      throw new ValidationError("Item not found in cart");
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    return await Cart.findById(cart._id).populate("items.supplementId");
  } catch (error) {
    throw handleError(error);
  }
}

export async function removeFromCart(userId: string, supplementId: string) {
  await connectDB();
  try {
    if (
      !Types.ObjectId.isValid(userId) ||
      !Types.ObjectId.isValid(supplementId)
    ) {
      throw new ValidationError("Invalid User ID or Supplement ID");
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new ValidationError("Cart not found");
    }

    cart.items = cart.items.filter(
      (item) => item.supplementId.toString() !== supplementId,
    );

    await cart.save();
    return await Cart.findById(cart._id).populate("items.supplementId");
  } catch (error) {
    throw handleError(error);
  }
}

export async function clearCart(userId: string) {
  await connectDB();
  try {
    if (!userId || typeof userId !== "string") {
      throw new ValidationError("Invalid User ID");
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new ValidationError("Cart not found");
    }

    cart.items = [];
    await cart.save();
    return cart;
  } catch (error) {
    throw handleError(error);
  }
}

export function calculateTotal(items: ICartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}
