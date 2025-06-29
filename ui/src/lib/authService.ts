import { Auth0Client, createAuth0Client, type User } from '@auth0/auth0-spa-js';
import { writable, get } from 'svelte/store';

export const isAuthenticated = writable(false);
export const user = writable<User | undefined>(undefined);
export const popupOpen = writable(false);
export const error = writable<any>(null);

const config = {
	domain: import.meta.env.VITE_AUTH0_DOMAIN || 'neontowel.eu.auth0.com',
	clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || ''
};

async function createClient() {
	const auth0Client = await createAuth0Client({
		domain: config.domain,
		clientId: config.clientId,
		authorizationParams: {
			redirect_uri: window.location.origin + '/callback',
			scope: 'openid profile email offline_access',
			audience: 'https://api.lumikko.app'
		},
		useRefreshTokens: true,
		cacheLocation: 'localstorage'
	});

	return auth0Client;
}

let auth0Client: Auth0Client | undefined;
let clientPromise: Promise<Auth0Client> | undefined;

async function getClient(): Promise<Auth0Client> {
	if (auth0Client) return auth0Client;
	
	if (!clientPromise) {
		clientPromise = createClient();
	}
	
	auth0Client = await clientPromise;
	return auth0Client;
}

export const auth = {
	loginWithRedirect: async () => {
		const client = await getClient();
		await client.loginWithRedirect();
	},
	clearStorage: () => {
		// Clear all Auth0 related localStorage entries
		const authKeys = Object.keys(localStorage).filter(key => key.includes('auth0') || key.includes('@@auth0'));
		authKeys.forEach(key => localStorage.removeItem(key));
		isAuthenticated.set(false);
		user.set(undefined);
	},
	getAccessToken: async () => {
		try {
			const client = await getClient();
			const token = await client.getTokenSilently({
				authorizationParams: {
					audience: 'https://api.lumikko.app'
				}
			});
			return token;
		} catch (e) {
			console.error('AuthService: Failed to get access token:', e);
			throw e;
		}
	},
	logout: async () => {
		const client = await getClient();
		await client.logout({
			logoutParams: {
				returnTo: window.location.origin
			}
		});
		isAuthenticated.set(false);
		user.set(undefined);
	},
	handleRedirectCallback: async () => {
		const client = await getClient();
		try {
			popupOpen.set(true);
			const result = await client.handleRedirectCallback();
			
			// Force a check to ensure tokens are properly stored
			await new Promise(resolve => setTimeout(resolve, 100));
			
			const u = await client.getUser();
			
			// Verify we can get a token (this will confirm refresh token is working)
			try {
				await client.getTokenSilently({
					authorizationParams: {
						audience: 'https://api.lumikko.app'
					}
				});
			} catch (tokenError) {
				console.warn("AuthService: Could not get token after callback:", tokenError);
			}
			
			user.set(u);
			isAuthenticated.set(true);
			error.set(null); // Clear any previous errors
			
			return result;
		} catch (e) {
			console.error('Auth0 handleRedirectCallback error:', e);
			error.set(e);
			isAuthenticated.set(false);
			user.set(undefined);
			throw e; // Re-throw so the callback page can handle it
		} finally {
			popupOpen.set(false);
		}
	},
	checkSession: async () => {
		try {
			const client = await getClient();
			
			// First check if user is already authenticated
			const isAuth = await client.isAuthenticated();
			
			if (isAuth) {
				// User is authenticated, get user info
				const u = await client.getUser();
				isAuthenticated.set(true);
				user.set(u);
				return;
			}
			
			// User is not authenticated, try to get token silently (using refresh token)
			try {
				const token = await client.getTokenSilently({
					authorizationParams: {
						audience: 'https://api.lumikko.app'
					}
				});
				
				// If we got a token, get the user
				const u = await client.getUser();
				isAuthenticated.set(!!u);
				user.set(u);
			} catch (silentError) {
				// No valid session or refresh token available
				isAuthenticated.set(false);
				user.set(undefined);
			}
		} catch (e) {
			console.error("AuthService: checkSession error:", e);
			// User is not logged in
			isAuthenticated.set(false);
			user.set(undefined);
		}
	}
}; 