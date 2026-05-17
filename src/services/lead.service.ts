import { LeadModel } from '../models/Lead.model';
import {
  ILeadDocument,
  LeadFilterQuery,
  LeadStatus,
  LeadSource,
} from '../types/lead.types';
import { PaginationMeta } from '../types/api.types';

type FilterQuery = any;

interface CreateLeadData {
  name: string;
  email: string;
  status?: LeadStatus;
  source: LeadSource;
  notes?: string;
  createdBy: string;
}

interface LeadsResult {
  leads: ILeadDocument[];
  pagination: PaginationMeta;
}

export class LeadService {
  async createLead(data: CreateLeadData): Promise<ILeadDocument> {
    const lead = await LeadModel.create(data);
    return lead;
  }

  async getLeads(
    filters: LeadFilterQuery,
    userId: string,
    isAdmin: boolean
  ): Promise<LeadsResult> {
    const { status, source, search, sortBy, page = '1', limit = '10' } = filters;

    // Build dynamic filter query
    const query: FilterQuery = {};

    // Non-admin users only see their own leads
    if (!isAdmin) {
      query.createdBy = userId;
    }

    if (status) query.status = status;
    if (source) query.source = source;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const sortOrder = sortBy === 'oldest' ? 1 : -1;

    const [leads, totalRecords] = await Promise.all([
      LeadModel.find(query)
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'name email'),
      LeadModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalRecords / limitNum);

    return {
      leads,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalRecords,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    };
  }

  async getLeadById(id: string, userId: string, isAdmin: boolean): Promise<ILeadDocument> {
    const query: FilterQuery = { _id: id };
    if (!isAdmin) query.createdBy = userId;

    const lead = await LeadModel.findOne(query).populate('createdBy', 'name email');
    if (!lead) {
      const error = new Error('Lead not found') as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }
    return lead;
  }

  async updateLead(
    id: string,
    data: Partial<CreateLeadData>,
    userId: string,
    isAdmin: boolean
  ): Promise<ILeadDocument> {
    const query: FilterQuery = { _id: id };
    if (!isAdmin) query.createdBy = userId;

    const lead = await LeadModel.findOneAndUpdate(query, data, {
      new: true,
      runValidators: true,
    });

    if (!lead) {
      const error = new Error('Lead not found or unauthorized') as Error & {
        statusCode: number;
      };
      error.statusCode = 404;
      throw error;
    }
    return lead;
  }

  async deleteLead(id: string, userId: string, isAdmin: boolean): Promise<void> {
    const query: FilterQuery = { _id: id };
    if (!isAdmin) query.createdBy = userId;

    const lead = await LeadModel.findOneAndDelete(query);
    if (!lead) {
      const error = new Error('Lead not found or unauthorized') as Error & {
        statusCode: number;
      };
      error.statusCode = 404;
      throw error;
    }
  }

  async exportLeads(userId: string, isAdmin: boolean): Promise<ILeadDocument[]> {
    const query: FilterQuery = {};
    if (!isAdmin) query.createdBy = userId;
    return LeadModel.find(query).sort({ createdAt: -1 });
  }
}

export const leadService = new LeadService();
