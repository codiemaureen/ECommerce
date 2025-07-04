export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Shaggy Rolls';
export const APP_DESCRIPTION = process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'A Modern ecommerce store built with next';
export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000/';
export const LATEST_PRODUCTS_LIMIT = Number(process.env.LATEST_PRODUCTS_LIMIT) || 4;

export const signInDefaultValues = {
 email: '',
 password: ''
}
export const signUpDefaultValues = {
 name: '',
 email: '',
 password: '',
 confirmPassword: ''
}

export const shippingAddressDefaultValues = {
 fullName: '',
 streetAddress: '',
 city: '',
 postalCode: '',
 country: '',
}

export const PAYMENT_METHODS = process.env.PAYMENT_METHODS ? process.env.PAYMENT_METHODS.split(', ') : ['PayPal', 'Stripe', 'CashOnDelivery'];

export const DEFAULT_PAYMENT_METHODS = process.env.DEFAULT_PAYMENT_METHODS || 'PayPal';