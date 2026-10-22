import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const settings = sqliteTable('settings',{key:text('key').primaryKey(),value:text('value').notNull()});
export const menuOverrides = sqliteTable('menu_overrides',{id:text('id').primaryKey(),value:text('value').notNull()});
export const orders = sqliteTable('orders',{
 id:text('id').primaryKey(),reference:text('reference').notNull(),tokenHash:text('token_hash').notNull(),idempotency:text('idempotency').notNull().unique(),
 name:text('name').notNull(),phone:text('phone').notNull(),fulfillment:text('fulfillment').notNull(),address:text('address').notNull(),point:text('point'),zone:text('zone'),notes:text('notes').notNull(),
 lines:text('lines').notNull(),subtotal:integer('subtotal').notNull(),fee:integer('fee').notNull(),total:integer('total').notNull(),
 activePaymentId:text('active_payment_id'),status:text('status').notNull().default('pending'),payment:text('payment').notNull().default('pending'),created:text('created').notNull(),updated:text('updated').notNull()
});
export const payments = sqliteTable('payments',{
 id:text('id').primaryKey(),orderId:text('order_id').notNull().references(()=>orders.id),checkoutId:text('checkout_id').unique(),phone:text('phone').notNull(),amount:integer('amount').notNull(),state:text('state').notNull(),receipt:text('receipt').unique(),event:text('event'),created:text('created').notNull(),updated:text('updated').notNull()
});
export const orderHistory=sqliteTable('order_history',{id:text('id').primaryKey(),orderId:text('order_id').notNull().references(()=>orders.id),status:text('status').notNull(),actor:text('actor').notNull(),created:text('created').notNull()});
export const rateLimits=sqliteTable('rate_limits',{key:text('key').primaryKey(),count:integer('count').notNull(),expires:integer('expires').notNull()});
