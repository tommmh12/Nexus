export interface Department {
  id: number;
  name: string;
  code?: string;
  description?: string;
  managerId?: number;
  managerName?: string;
  memberCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
