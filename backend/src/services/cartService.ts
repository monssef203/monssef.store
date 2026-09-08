import { PrismaClient, ProductStatus } from "@prisma/client";
import { OutOfStockError } from "../utils/errors.js";

const prisma = new PrismaClient();

export interface CartItemPayload {
  productId: string;
  quantity: number;
  variantValue?: string;
  variantPrice?: number;
}

export async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }
  return cart;
}

export async function getUserCart(userId: string) {
  const cart = await getOrCreateCart(userId);
  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: { product: true },
  });

  const cartItems = items.map((item) => {
    const product = item.product;
    const price = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;
    const images = product.images.length > 0 ? product.images[0].url : null;
    return {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        discountPrice: product.discountPrice,
        price: price,
        stock: product.stock,
        status: product.status,
        isFeatured: product.isFeatured,
        images: product.images.map((i) => ({ url: i.url, alt: i.alt })),
        image: images,
        rating: product.rating,
        reviewCount: product.reviewCount,
      },
    };
  });

  const subtotal = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const shipping = subtotal >= 1500 ? 0 : 30;

  return {
    id: cart.id,
    userId: cart.userId,
    items: cartItems,
    subtotal,
    shipping,
    total: subtotal + shipping,
    itemCount: cartItems.reduce((sum, i) => sum + i.quantity, 0),
    updatedAt: cart.updatedAt,
  };
}

export async function addToCart(userId: string, payload: CartItemPayload) {
  if (payload.quantity < 1 || !Number.isInteger(payload.quantity)) {
    throw new Error("Quantity must be at least 1");
  }
  if (payload.quantity > 99) {
    throw new Error("Maximum quantity per item is 99");
  }

  const product = await prisma.product.findUnique({ where: { id: payload.productId } });
  if (!product || product.status !== ProductStatus.ACTIVE) {
    throw new Error("Product not found");
  }

  const available = product.stock;
  if (available <= 0) {
    throw new OutOfStockError(product.name, payload.quantity, 0);
  }

  const cart = await getOrCreateCart(userId);
  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId: payload.productId } },
  });

  let newQuantity: number;
  if (existing) {
    newQuantity = existing.quantity + payload.quantity;
  } else {
    newQuantity = payload.quantity;
  }

  if (newQuantity > available) {
    throw new OutOfStockError(product.name, newQuantity, available);
  }

  if (newQuantity > 99) {
    throw new Error("Maximum quantity per item is 99");
  }

  if (existing) {
    await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: newQuantity } });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId: payload.productId, quantity: newQuantity },
    });
  }

  return getUserCart(userId);
}

export async function updateCartItem(userId: string, itemId: string, quantity: number) {
  if (quantity <= 0) {
    return removeCartItem(userId, itemId);
  }
  if (!Number.isInteger(quantity) || quantity > 99) {
    throw new Error("Quantity must be between 1 and 99");
  }

  const cart = await getOrCreateCart(userId);
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
    include: { product: true },
  });

  if (!item) throw new Error("Cart item not found");

  const available = item.product.stock;
  if (quantity > available) {
    throw new OutOfStockError(item.product.name, quantity, available);
  }

  await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  return getUserCart(userId);
}

export async function removeCartItem(userId: string, itemId: string) {
  const cart = await getOrCreateCart(userId);
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
  });

  if (!item) throw new Error("Cart item not found");

  await prisma.cartItem.delete({ where: { id: itemId } });
  return getUserCart(userId);
}

export async function clearCart(userId: string) {
  const cart = await getOrCreateCart(userId);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  return getUserCart(userId);
}

export async function mergeGuestCart(userId: string, guestItems: Array<{ productId: string; quantity: number }>) {
  const cart = await getOrCreateCart(userId);

  for (const guest of guestItems) {
    if (guest.quantity < 1) continue;

    const product = await prisma.product.findUnique({ where: { id: guest.productId } });
    if (!product || product.status !== ProductStatus.ACTIVE) continue;

    const existing = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId: guest.productId } },
    });

    const combined = (existing?.quantity ?? 0) + guest.quantity;
    const available = product.stock;
    const finalQty = Math.min(combined, available, 99);

    if (finalQty < 1) continue;

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: finalQty },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId: guest.productId, quantity: finalQty },
      });
    }
  }

  return getUserCart(userId);
}
