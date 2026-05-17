import { z } from 'zod';
import { LeadSource, LeadStatus } from '../types/lead.types';

export const createLeadSchema = z.object({
  body: z.object({
    name: z
      .string({ message: 'Lead name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(100)
      .trim(),
    email: z
      .string({ message: 'Email is required' })
      .email('Invalid email format'),
    status: z.nativeEnum(LeadStatus).optional(),
    source: z.nativeEnum(LeadSource, {
      message: 'Source is required',
    }),
    notes: z.string().max(500).optional(),
  }),
});

export const updateLeadSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Lead ID is required'),
  }),
  body: z.object({
    name: z.string().min(2).max(100).trim().optional(),
    email: z.string().email('Invalid email format').optional(),
    status: z.nativeEnum(LeadStatus).optional(),
    source: z.nativeEnum(LeadSource).optional(),
    notes: z.string().max(500).optional(),
  }),
});

export const leadQuerySchema = z.object({
  query: z.object({
    status: z.nativeEnum(LeadStatus).optional(),
    source: z.nativeEnum(LeadSource).optional(),
    search: z.string().optional(),
    sortBy: z.enum(['latest', 'oldest']).optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});

export type CreateLeadSchema = z.infer<typeof createLeadSchema>;
export type UpdateLeadSchema = z.infer<typeof updateLeadSchema>;
