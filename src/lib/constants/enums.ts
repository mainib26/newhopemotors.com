export const USER_ROLES = ['ADMIN', 'SALES', 'VIEWER'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const LEAD_STATUSES = ['NEW', 'CONTACTED', 'APPOINTMENT_SET', 'SHOWED', 'SOLD', 'LOST'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_SOURCES = ['WEBSITE', 'CHAT', 'PHONE', 'WALKIN', 'CARGURUS', 'FACEBOOK'] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const APPOINTMENT_TYPES = ['TEST_DRIVE', 'CONSULTATION', 'FINANCE_REVIEW'] as const;
export type AppointmentType = (typeof APPOINTMENT_TYPES)[number];

export const APPOINTMENT_STATUSES = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'NO_SHOW', 'CANCELLED'] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const FINANCE_STATUSES = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'DENIED'] as const;
export type FinanceStatus = (typeof FINANCE_STATUSES)[number];

export const CHAT_ROLES = ['USER', 'ASSISTANT'] as const;
export type ChatRole = (typeof CHAT_ROLES)[number];
