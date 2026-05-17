import { Document, Types } from 'mongoose';

export enum LeadStatus {
  NEW = 'New',
  CONTACTED = 'Contacted',
  QUALIFIED = 'Qualified',
  LOST = 'Lost',
}

export enum LeadSource {
  WEBSITE = 'Website',
  INSTAGRAM = 'Instagram',
  REFERRAL = 'Referral',
}

export interface ILead {
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILeadDocument extends ILead, Document {
  _id: Types.ObjectId;
}

export interface LeadFilterQuery {
  status?: LeadStatus;
  source?: LeadSource;
  search?: string;
  sortBy?: 'latest' | 'oldest';
  page?: string;
  limit?: string;
}
