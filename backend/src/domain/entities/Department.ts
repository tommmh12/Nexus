export interface Department {
  id: string;
  name: string;
  code?: string;
  description?: string;
  managerId?: string;
  managerName?: string;
  memberCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
