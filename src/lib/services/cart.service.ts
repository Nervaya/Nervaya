import Cart, { ICartItem } from '@/lib/models/cart.model';
import Supplement from '@/lib/models/supplement.model';
import connectDB from '@/lib/db/mongodb';
import { handleError, ValidationError } from '@/lib/utils/error.util';
import { Types } from 'mongoose';
import { ITEM_TYPE, type ItemType } from '@/lib/constants/enums';
import { DRIFT_OFF_SESSION_IMAGE } from '@/lib/constants/driftOff.constants';

export async function getCartByUserId(userId: string) {
  await connectDB();
  try {
    if (!userId || typeof userId !== 'string') {
      throw new ValidationError('Invalid User ID');
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [], totalAmount: 0 });
    }

    // Manually populate Supplement items to handle mixed types gracefully
    const cartObj = JSON.parse(JSON.stringify(cart));
    const supplementIds = cartObj.items
      .filter((i: ICartItem) => i.itemType === ITEM_TYPE.SUPPLEMENT)
      .map((i: ICartItem) => i.itemId);
    const supplements = await Supplement.find({ _id: { $in: supplementIds } }).lean();
    const supplementMap = new Map(supplements.map((s) => [s._id.toString(), s]));

    cartObj.items = cartObj.items.map((item: ICartItem) => {
      if (item.itemType === ITEM_TYPE.SUPPLEMENT) {
        return { ...item, itemId: supplementMap.get(item.itemId?.toString()) || item.itemId };
      }
      return item;
    });

    return cartObj;
  } catch (error) {
    throw handleError(error);
  }
}

export async function addToCart(
  userId: string,
  itemId: string,
  quantity: number,
  itemType: ItemType = ITEM_TYPE.SUPPLEMENT,
  name?: string,
  price?: number,
  image?: string,
) {
  await connectDB();
  try {
    if (!userId || typeof userId !== 'string') {
      throw new ValidationError('Invalid User ID');
    }
    if (quantity < 1) {
      throw new ValidationError('Quantity must be at least 1');
    }

    let finalPrice = price || 0;
    let finalName = name || '';
    // resolvedImage allows us to derive the image server-side without mutating the param
    let resolvedImage: string | undefined = image;

    if (itemType === ITEM_TYPE.SUPPLEMENT) {
      if (!Types.ObjectId.isValid(itemId)) {
        throw new ValidationError('Invalid Supplement ID');
      }
      const supplement = await Supplement.findById(itemId);
      if (!supplement) throw new ValidationError('Supplement not found');
      if (!supplement.isActive) throw new ValidationError('Supplement is not available');
      if (supplement.stock < quantity) throw new ValidationError('Insufficient stock');

      finalPrice = supplement.price;
      finalName = supplement.name;
    } else if (itemType === ITEM_TYPE.DRIFT_OFF) {
      // Deep Rest session has no stock check, but we need price
      if (!finalPrice || finalPrice <= 0) {
        throw new ValidationError('Price is required for Deep Rest items');
      }
      if (!finalName) {
        finalName = 'Deep Rest Session';
      }
      // Always use the canonical thumbnail for Deep Rest items
      resolvedImage = DRIFT_OFF_SESSION_IMAGE;
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [], totalAmount: 0 });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.itemId.toString() === itemId && item.itemType === itemType,
    );

    if (existingItemIndex > -1) {
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;

      if (itemType === ITEM_TYPE.SUPPLEMENT) {
        const supplement = await Supplement.findById(itemId);
        if (supplement && newQuantity > supplement.stock) {
          throw new ValidationError('Insufficient stock');
        }
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      cart.items.push({
        itemType,
        itemId: itemType === ITEM_TYPE.SUPPLEMENT ? new Types.ObjectId(itemId) : itemId,
        quantity,
        price: finalPrice,
        name: finalName,
        ...(resolvedImage ? { image: resolvedImage } : {}),
      });
    }

    await cart.save();
    return await getCartByUserId(userId);
  } catch (error) {
    throw handleError(error);
  }
}

export async function updateCartItem(
  userId: string,
  itemId: string,
  quantity: number,
  itemType: ItemType = ITEM_TYPE.SUPPLEMENT,
) {
  await connectDB();
  try {
    if (!userId || typeof userId !== 'string') throw new ValidationError('Invalid User ID');
    if (quantity < 1) throw new ValidationError('Quantity must be at least 1');

    if (itemType === ITEM_TYPE.SUPPLEMENT) {
      if (!Types.ObjectId.isValid(itemId)) throw new ValidationError('Invalid Supplement ID');
      const supplement = await Supplement.findById(itemId);
      if (!supplement) throw new ValidationError('Supplement not found');
      if (supplement.stock < quantity) throw new ValidationError('Insufficient stock');
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) throw new ValidationError('Cart not found');

    const itemIndex = cart.items.findIndex((item) => item.itemId.toString() === itemId && item.itemType === itemType);

    if (itemIndex === -1) throw new ValidationError('Item not found in cart');

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    return await getCartByUserId(userId);
  } catch (error) {
    throw handleError(error);
  }
}

export async function removeFromCart(userId: string, itemId: string, itemType: ItemType = ITEM_TYPE.SUPPLEMENT) {
  await connectDB();
  try {
    if (!userId) throw new ValidationError('Invalid User ID');

    const cart = await Cart.findOne({ userId });
    if (!cart) throw new ValidationError('Cart not found');

    cart.items = cart.items.filter((item) => !(item.itemId.toString() === itemId && item.itemType === itemType));

    await cart.save();
    return await getCartByUserId(userId);
  } catch (error) {
    throw handleError(error);
  }
}

export async function clearCart(userId: string) {
  await connectDB();
  try {
    if (!userId || typeof userId !== 'string') {
      throw new ValidationError('Invalid User ID');
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new ValidationError('Cart not found');
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
