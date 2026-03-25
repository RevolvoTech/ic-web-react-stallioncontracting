export interface ContactType {
  id: number | string;
  firstname: string;
  lastname: string;
  image: string;
  department: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  frequentlycontacted: boolean;
  starred: boolean;
  deleted: boolean;
  status?: 'lead' | 'active' | 'inactive' | 'archived';
  customerType?: 'individual' | 'business';
  source?: string;
  ownerOrgId?: string | null;
  tags?: string[];
}
