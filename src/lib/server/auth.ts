export function requireRole(userRole: string | undefined, requiredRole: 'ADMIN' | 'SALES' | 'VIEWER'): boolean {
	const hierarchy = { ADMIN: 3, SALES: 2, VIEWER: 1 } as const;
	if (!userRole) return false;
	return (hierarchy[userRole as keyof typeof hierarchy] || 0) >= hierarchy[requiredRole];
}
