// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	interface Locals {
		validate: import('@lucia-auth/sveltekit').Validate;
        validateUser: import('@lucia-auth/sveltekit').ValidateUser;
        setSession: import('@lucia-auth/sveltekit').SetSession;
        auth: import('lucia').AuthRequest;
	}
	// interface PageData {}
	// interface Error {}
	// interface Platform {}
}

/// <reference types="lucia" />
declare global {
	namespace Lucia {
		type Auth = import("$lib/server/lucia").Auth;
		type DatabaseUserAttributes = {
			email: string;
			email_verified: boolean;
			first_name: string,
			surname: string
		};
		type DatabaseSessionAttributes = {};
	}
}

declare global {
	namespace App {
		interface Locals {
			auth: import("lucia").AuthRequest;
		}
	}
}

// THIS IS IMPORTANT!!!
export {};
