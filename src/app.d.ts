import type { Session, SupabaseClient } from '@supabase/supabase-js';

/// <reference types="@sveltejs/kit" />
/// <reference types="@sveltejs/adapter-cloudflare" />

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient;
			session: Session | null;
			user: {
				id: string;
				email: string;
				name: string;
				role: 'ADMIN' | 'SALES' | 'VIEWER';
			} | null;
		}
		interface Platform {
			env: {
				HYPERDRIVE: Hyperdrive;
			};
			context: {
				waitUntil(promise: Promise<unknown>): void;
			};
			caches: CacheStorage & { default: Cache };
		}
	}
}

export {};
