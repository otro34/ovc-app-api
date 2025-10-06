export interface User {
  id?: number;
  username: string;
  password: string;
  email?: string;
  name?: string;
  role: 'admin' | 'user';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Client {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Contract {
  id?: number;
  correlativeNumber: string;
  clientId: number;
  totalVolume: number;
  attendedVolume: number;
  pendingVolume: number;
  salePrice: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PurchaseOrder {
  id?: number;
  contractId: number;
  volume: number;
  price: number;
  orderDate: Date;
  deliveryDate?: Date;
  status: 'pending' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SystemConfiguration {
  id?: number;
  sessionTimeout: number;
  companyName: string;
  companyLogo?: string;
  currency: string;
  dateFormat: string;
  timeZone: string;
  maxFileSize: number;
  allowedFileTypes: string[];
  backupEnabled: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  emailNotifications: boolean;
  systemMaintenanceMode: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FileData<T> {
  metadata: {
    version: string;
    lastModified: string;
    totalRecords: number;
  };
  data: T[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMetadata;
}
