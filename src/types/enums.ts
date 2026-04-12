export const UserRole = {
  ADMIN: 'ADMIN',
  RECEPTIONIST: 'RECEPTIONIST',
  TRAINER: 'TRAINER',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BLOCKED: 'BLOCKED',
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const MembershipStatus = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  FROZEN: 'FROZEN',
  CANCELLED: 'CANCELLED',
} as const;
export type MembershipStatus = (typeof MembershipStatus)[keyof typeof MembershipStatus];

export const PlanStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;
export type PlanStatus = (typeof PlanStatus)[keyof typeof PlanStatus];

export const AccessHours = {
  FULL: 'FULL',
  PEAK: 'PEAK',
} as const;
export type AccessHours = (typeof AccessHours)[keyof typeof AccessHours];

export const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender];

export const SessionStatus = {
  BOOKED: 'BOOKED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
} as const;
export type SessionStatus = (typeof SessionStatus)[keyof typeof SessionStatus];

export const SessionSource = {
  PLAN: 'PLAN',
  PAID: 'PAID',
} as const;
export type SessionSource = (typeof SessionSource)[keyof typeof SessionSource];

export const SlotStatus = {
  AVAILABLE: 'AVAILABLE',
  BOOKED: 'BOOKED',
  BLOCKED: 'BLOCKED',
} as const;
export type SlotStatus = (typeof SlotStatus)[keyof typeof SlotStatus];

export const TrainerSpecialisation = {
  WEIGHT_TRAINING: 'WEIGHT_TRAINING',
  YOGA: 'YOGA',
  CARDIO: 'CARDIO',
  CROSSFIT: 'CROSSFIT',
  GENERAL: 'GENERAL',
} as const;
export type TrainerSpecialisation = (typeof TrainerSpecialisation)[keyof typeof TrainerSpecialisation];

export const PaymentMethod = {
  CASH: 'CASH',
  UPI: 'UPI',
  CARD: 'CARD',
  ONLINE: 'ONLINE',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const TransactionType = {
  NEW: 'NEW',
  RENEW: 'RENEW',
  UPGRADE: 'UPGRADE',
} as const;
export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];
