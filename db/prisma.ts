import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';

// Sets up WebSocket connections, which enables Neon to use WebSocket communication.
neonConfig.webSocketConstructor = ws;

// Instantiate the adapter correctly
//  (pool is automatically handled with PrismaNeon in prisma 6)
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });

// Initialize Prisma Client with the Neon adapter

// Extends the PrismaClient with a custom result transformer to convert the price and rating fields to strings.
export const prisma = new PrismaClient({ adapter }).$extends({
  result: {
    product: {
      price: {
        compute(product) {
          return product.price.toString();
        },
      },
      rating: {
        compute(product) {
          return product.rating.toString();
        },
      },
    },
    cart: {
      itemsPrice: {
        needs: { itemsPrice: true },
        compute(cart) {
          return cart.itemsPrice.toString();
        },
      },
      shippingPrice: {
        needs: { shippingPrice: true },
        compute(cart) {
          return cart.shippingPrice.toString();
        },
      },
      taxPrice: {
        needs: { taxPrice: true },
        compute(cart) {
          return cart.taxPrice.toString();
        },
      },
      totalPrice: {
        needs: { totalPrice: true },
        compute(cart) {
          return cart.totalPrice.toString();
        },
      },
    },
    // order: {
    //   itemsPrice: {
    //     needs: { itemsPrice: true },
    //     compute(cart) {
    //       return cart.itemsPrice.toString();
    //     },
    //   },
    //   shippingPrice: {
    //     needs: { shippingPrice: true },
    //     compute(cart) {
    //       return cart.shippingPrice.toString();
    //     },
    //   },
    //   taxPrice: {
    //     needs: { taxPrice: true },
    //     compute(cart) {
    //       return cart.taxPrice.toString();
    //     },
    //   },
    //   totalPrice: {
    //     needs: { totalPrice: true },
    //     compute(cart) {
    //       return cart.totalPrice.toString();
    //     },
    //   },
    // },
    // orderItem: {
    //   price: {
    //     compute(cart) {
    //       return cart.price.toString();
    //     },
    //   },
    // },
  },
});
