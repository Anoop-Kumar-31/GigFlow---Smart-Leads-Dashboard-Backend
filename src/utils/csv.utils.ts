import { ILeadDocument } from '../types/lead.types';

export const convertLeadsToCSV = (leads: ILeadDocument[]): string => {
  const headers = ['Name', 'Email', 'Status', 'Source', 'Notes', 'Created At'];

  const rows = leads.map((lead) => [
    `"${lead.name}"`,
    `"${lead.email}"`,
    `"${lead.status}"`,
    `"${lead.source}"`,
    `"${lead.notes ?? ''}"`,
    `"${new Date(lead.createdAt).toLocaleDateString()}"`,
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
};
