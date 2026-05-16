const { z } = require('zod');

const itemSchema = z.object({
  name: z.string().min(1, 'Item name required'),
  quantity: z.number().int().positive('Quantity must be positive'),
  unitPrice: z.number().positive('Unit price must be positive'),
});

const createOrderSchema = z.object({
  storeId: z.number().int().positive('Store ID is required'),
  customer: z.string().min(1, 'Customer name required').default('Walk-in Customer'),
  items: z.array(itemSchema).min(1, 'At least one item is required'),
  notes: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['PLACED', 'PREPARING', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED']),
  notes: z.string().optional(),
});

module.exports = { createOrderSchema, updateStatusSchema };
