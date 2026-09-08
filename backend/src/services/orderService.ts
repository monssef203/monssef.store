import { PrismaClient, OrderStatus, PaymentStatus } from "@prisma/client";
import { OutOfStockError } from "../utils/errors.js";

const prisma = new PrismaClient();

export function nextOrderNumber(): string {
  return "MS-" + String(Date.now()).slice(-6).padStart(6, "0") + "-" + Math.floor(Math.random() * 9000 + 1000);
}

export async function createOrder({
  userId,
  items,
  fullName,
  phone,
  city,
  address,
  email,
  notes,
  shippingLabel,
  country = "MA",
}: {
  userId: string;
  items: Array<{ productId: string }>;
  fullName: string;
  phone: string;
  city: string;
  address: string;
  email?: string;
  notes?: string;
  shippingLabel?: string;
  country?: string;
}) {
  if (!fullName.trim() || fullName.trim().length < 3) {
    throw new Error("fullName must be at least 3 characters");
  }
  if (!phone.trim()) throw new Error("phone is required");
  if (!city.trim()) throw new Error("city is required");
  if (!address.trim() || address.trim().length < 6) {
    throw new Error("address must be at least 6 characters");
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { id: { in: items.map((i) => i.id) } },
    include: { product: true },
  });

  if (cartItems.length === 0) {
    throw new Error("No valid cart items found");
  }

  for (const item of cartItems) {
    const p = item.product;
    if (p.status !== ProductStatus.ACTIVE) {
      throw new Error("One of the products is no longer available");
    }
    if (p.stock < item.quantity) {
      throw new OutOfStockError(p.name, item.quantity, p.stock);
    }
  }

  let subtotal = 0;
  const orderItems: Array<{
    productId: string;
    productName: string;
    slug: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    image: string | null;
  }> = [];

  for (const item of cartItems) {
    const p = item.product;
    const price = p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price;
    const total = price * item.quantity;
    subtotal += total;
    orderItems.push({
      productId: p.id,
      productName: p.name,
      slug: p.slug,
      unitPrice: price,
      quantity: item.quantity,
      totalPrice: total,
      image: p.images.length > 0 ? p.images[0].url : null,
    });
  }

  const shipping = subtotal >= 1500 ? 0 : 30;
  const total = Math.round((subtotal + shipping) * 100) / 100;

  try {
    return await prisma.$transaction(async (tx) => {
      const orderNumber = nextOrderNumber();
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: OrderStatus.PENDING,
          subtotal,
          shipping,
          total,
          notes: notes?.trim() || null,
          paymentStatus: PaymentStatus.PENDING,
          paymentMethod: "COD",
          shippingCost: shipping,
          shippingLabel: shippingLabel?.trim() || null,
          fullName: fullName.trim(),
          phone: phone.trim(),
          city: city.trim(),
          address: address.trim(),
          country,
          email: email?.trim() || null,
        },
      });

      await Promise.all(
        orderItems.map((oi) =>
          tx.orderItem.create({
            data: {
              orderId: order.id,
              productId: oi.productId,
              productName: oi.productName,
              slug: oi.slug,
              unitPrice: oi.unitPrice,
              quantity: oi.quantity,
              totalPrice: oi.totalPrice,
              image: oi.image,
            },
          })
        )
      );

      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({
        where: { id: { in: items.map((i) => i.id) } },
      });

      await tx.payment.create({
        data: {
          orderId: order.id,
          provider: "cod",
          status: PaymentStatus.PENDING,
          amount: total,
        },
      });

      return order;
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error("Unable to create order. Please try again.");
    }
    throw err;
  }
}

export async function getUserOrders(userId: string, options?: { page?: number; limit?: number; status?: string }) {
  const { page = 1, limit = 20, status } = options ?? {};
  const where: any = { userId };
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        items: {
          select: {
            id: true,
            productId: true,
            productName: true,
            slug: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            image: true,
          },
        },
        payment: { select: { id: true, status: true, provider: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    data: orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      subtotal: o.subtotal,
      shipping: o.shipping,
      total: o.total,
      notes: o.notes,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      shippingCost: o.shippingCost,
      shippingLabel: o.shippingLabel,
      customer: {
        fullName: o.fullName,
        phone: o.phone,
        city: o.city,
        address: o.address,
        country: o.country,
        email: o.email,
      },
      items: o.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        productName: i.productName,
        slug: i.slug,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice,
        image: i.image,
      })),
      payment: o.payment
        ? { id: o.payment.id, status: o.payment.status, provider: o.payment.provider }
        : null,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    })),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getOrderById(orderId: string, requestingUserId: string, isAdmin: boolean) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        select: {
          id: true,
          productId: true,
          productName: true,
          slug: true,
          quantity: true,
          unitPrice: true,
          totalPrice: true,
          image: true,
        },
      },
      payment: { select: { id: true, status: true, provider: true } },
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
    },
  });

  if (!order) throw new Error("Order not found");
  if (!isAdmin && order.userId !== requestingUserId) {
    throw new Error("You do not have access to this order");
  }

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    notes: order.notes,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    shippingCost: order.shippingCost,
    shippingLabel: order.shippingLabel,
    customer: {
      fullName: order.fullName,
      phone: order.phone,
      city: order.city,
      address: order.address,
      country: order.country,
      email: order.email,
    },
    items: order.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      productName: i.productName,
      slug: i.slug,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      totalPrice: i.totalPrice,
      image: i.image,
    })),
    payment: order.payment
      ? { id: order.payment.id, status: order.payment.status, provider: order.payment.provider }
      : null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

export async function cancelOrder(orderId: string, userId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");
  if (order.userId !== userId) throw new Error("You cannot cancel this order");
  if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED) {
    throw new Error("This order can no longer be cancelled");
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.CANCELLED },
    include: {
      items: { select: { id: true, productId: true, productName: true, quantity: true, unitPrice: true, totalPrice: true } },
      payment: { select: { id: true, status: true } },
    },
  });
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");

  return prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: {
      items: { select: { id: true, productId: true, productName: true, quantity: true, unitPrice: true, totalPrice: true } },
      payment: { select: { id: true, status: true } },
    },
  });
}

export async function markPaymentPaid(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");
  if (order.paymentStatus === PaymentStatus.PAID) throw new Error("Payment is already marked as paid");

  return prisma.$transaction(async (tx) => {
    await tx.payment.update({ where: { orderId }, data: { status: PaymentStatus.PAID } });
    if (order.status === OrderStatus.PENDING) {
      await tx.order.update({ where: { id: orderId }, data: { status: OrderStatus.CONFIRMED } });
    }
    return tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: { select: { id: true, productId: true, productName: true, quantity: true, unitPrice: true, totalPrice: true } },
        payment: { select: { id: true, status: true } },
      },
    });
  });
}
