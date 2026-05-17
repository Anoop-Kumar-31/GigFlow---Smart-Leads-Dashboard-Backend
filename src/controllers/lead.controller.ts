import { Request, Response, NextFunction } from 'express';
import { leadService } from '../services/lead.service';
import { LeadFilterQuery } from '../types/lead.types';
import { UserRole } from '../types/user.types';
import { sendSuccess, sendPaginated } from '../utils/response.utils';
import { convertLeadsToCSV } from '../utils/csv.utils';

const isAdminUser = (role: UserRole): boolean => role === UserRole.ADMIN;

export const createLead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await leadService.createLead({
      ...req.body,
      createdBy: req.user!.userId,
    });
    sendSuccess(res, lead, 'Lead created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getLeads = async (
  req: Request<object, object, object, LeadFilterQuery>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { leads, pagination } = await leadService.getLeads(
      req.query,
      req.user!.userId,
      isAdminUser(req.user!.role)
    );
    sendPaginated(res, leads, pagination, 'Leads retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await leadService.getLeadById(
      req.params.id,
      req.user!.userId,
      isAdminUser(req.user!.role)
    );
    sendSuccess(res, lead, 'Lead retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await leadService.updateLead(
      req.params.id,
      req.body,
      req.user!.userId,
      isAdminUser(req.user!.role)
    );
    sendSuccess(res, lead, 'Lead updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await leadService.deleteLead(
      req.params.id,
      req.user!.userId,
      isAdminUser(req.user!.role)
    );
    sendSuccess(res, null, 'Lead deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const exportLeadsCSV = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const leads = await leadService.exportLeads(
      req.user!.userId,
      isAdminUser(req.user!.role)
    );

    const csv = convertLeadsToCSV(leads);
    const filename = `leads-export-${Date.now()}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};
