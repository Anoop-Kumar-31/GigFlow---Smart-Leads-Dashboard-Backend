import { Router } from 'express';
import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  exportLeadsCSV,
} from '../controllers/lead.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createLeadSchema,
  updateLeadSchema,
  leadQuerySchema,
} from '../validators/lead.validator';
import { UserRole } from '../types/user.types';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', validate(leadQuerySchema), getLeads);
router.get('/export/csv', exportLeadsCSV);
router.get('/:id', getLeadById);
router.post('/', validate(createLeadSchema), createLead);
router.put('/:id', validate(updateLeadSchema), updateLead);

// Only admins can delete leads
router.delete('/:id', authorize(UserRole.ADMIN), deleteLead);

export default router;
