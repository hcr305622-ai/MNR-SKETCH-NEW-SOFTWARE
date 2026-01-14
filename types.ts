export enum Gender {
  GENTS = 'GENTS',
  LADIES = 'LADIES',
}

export enum SketchStatus {
  PROCESSING = 'PROCESSING',
  DELIVERED = 'DELIVERED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  HALF = 'HALF PAYMENT',
  COMPLETE = 'COMPLETE PAYMENT',
}

export enum ProductionUnit {
  HAFIZ_SAHIB = 'HAFIZ SAHIB',
  RANA_PLAZA = 'RANA PLAZA',
  MNR_PRODUCTION = 'MNR PRODUCTION',
}

export interface Sketch {
  id: string;
  orderNumber: string;
  importDate: string; // ISO string
  exportDate: string; // ISO string
  gender: Gender;
  status: SketchStatus;
  designerName: string;
  paymentStatus: PaymentStatus;
  paymentAmount?: string;
  productionUnit: ProductionUnit;
  processingItems?: string; // New Field
  completedItems?: string;  // New Field
  createdAt: number;
}

export type ViewFilter = 
  | 'ALL'
  | 'PROCESSING'
  | 'DELIVERED'
  | 'DESIGNER'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_HALF'
  | 'PAYMENT_COMPLETE'
  | 'PROD_HAFIZ'
  | 'PROD_RANA'
  | 'PROD_MNR';

export const PASSWORD_SECRET = "shani8765";