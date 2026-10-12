import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './api';

const TOKEN_KEY = '@bdangels_auth_token';
const USER_KEY = '@bdangels_auth_user';

let inMemoryToken = null;
let inMemoryUser = null;

export const authState = {
  getToken: () => inMemoryToken,
  getUser: () => inMemoryUser,
  isLoggedIn: () => Boolean(inMemoryToken),
  isAdmin: () => Boolean(inMemoryUser && (inMemoryUser.is_admin || inMemoryUser.role === 'admin' || inMemoryUser.role === 'superadmin')),
  canViewDeals: () => {
    if (!inMemoryToken || !inMemoryUser) return false;
    if (inMemoryUser.is_admin || inMemoryUser.role === 'admin' || inMemoryUser.role === 'superadmin') return true;
    if (inMemoryUser.can_view_paywalled_deals) return true;
    if (inMemoryUser.has_paid_membership) return true;
    if (inMemoryUser.is_approved && inMemoryUser.account_status && inMemoryUser.account_status !== 'free') return true;
    return false;
  },
};

/**
 * Initialize auth state from storage on app load
 */
export async function initAuth() {
  try {
    const [token, userJson] = await Promise.all([
      AsyncStorage.getItem(TOKEN_KEY),
      AsyncStorage.getItem(USER_KEY),
    ]);
    inMemoryToken = token || null;
    inMemoryUser = userJson ? JSON.parse(userJson) : null;
    return { token: inMemoryToken, user: inMemoryUser };
  } catch (err) {
    console.log('Init auth error:', err);
    return { token: null, user: null };
  }
}

/**
 * Save user and token session
 */
export async function saveAuthSession(user, token) {
  try {
    inMemoryToken = token;
    inMemoryUser = user;
    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEY, token),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
    ]);
  } catch (err) {
    console.log('Save auth session error:', err);
  }
}

/**
 * Clear user and token session
 */
export async function clearAuthSession() {
  try {
    inMemoryToken = null;
    inMemoryUser = null;
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ]);
  } catch (err) {
    console.log('Clear auth session error:', err);
  }
}

function getAuthEndpoints() {
  const endpoints = [API_BASE_URL];
  if (API_BASE_URL.includes('bdangels.co')) {
    endpoints.push('http://bdangels.test/api');
  } else if (API_BASE_URL.includes('bdangels.test')) {
    endpoints.push('https://bdangels.co/api');
  }
  return endpoints;
}

/**
 * Login with email and password
 */
export async function loginUser(email, password) {
  const endpoints = getAuthEndpoints();
  let lastErrorMessage = '';
  let lastErrors = null;

  for (const baseUrl of endpoints) {
    try {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          device_name: 'mobile-app',
        }),
      });

      const json = await res.json().catch(() => null);

      if (res.ok && json?.data?.token) {
        const user = json.data.user;
        const token = json.data.token;
        await saveAuthSession(user, token);
        return {
          ok: true,
          user,
          token,
          isAdmin: Boolean(
            user &&
              (user.is_admin ||
                user.role === 'admin' ||
                user.role === 'superadmin')
          ),
          message: json.message || 'Login successful.',
        };
      }

      if (res.status === 422 || res.status === 401 || res.status === 403) {
        return {
          ok: false,
          message: json?.message || 'The provided credentials do not match our records.',
          errors: json?.errors || null,
        };
      }

      // If server returned 500 Server Error
      if (res.status >= 500) {
        lastErrorMessage =
          json?.message === 'Server Error'
            ? 'Authentication server error. Retrying backup connection...'
            : json?.message || 'Server error';
        continue;
      }

      lastErrorMessage = json?.message || `Authentication error (${res.status})`;
      lastErrors = json?.errors || null;
    } catch (err) {
      console.log(`Login attempt at ${baseUrl} failed:`, err);
      lastErrorMessage = 'Network error connecting to login service. Please check your connection.';
    }
  }

  return {
    ok: false,
    message: lastErrorMessage || 'Unable to connect to login service.',
    errors: lastErrors,
  };
}

/**
 * Logout
 */
export async function logoutUser() {
  const token = inMemoryToken;
  try {
    if (token) {
      const endpoints = getAuthEndpoints();
      await fetch(`${endpoints[0]}/auth/logout`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => {});
    }
  } catch (err) {
    console.log('Logout API call notice:', err);
  } finally {
    await clearAuthSession();
  }
}

/**
 * Register a new user account via POST /auth/register
 */
export async function registerUser({
  name,
  email,
  password,
  password_confirmation,
  phone = '',
  gender = 'other',
  primary_country = 'Bangladesh',
}) {
  const endpoints = getAuthEndpoints();
  let lastErrorMessage = '';
  let lastErrors = null;

  for (const baseUrl of endpoints) {
    try {
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          password_confirmation: password_confirmation || password,
          phone: phone.trim() || undefined,
          gender,
          primary_country,
          device_name: 'mobile-app',
        }),
      });

      const json = await res.json().catch(() => null);

      if (res.ok && (json?.data?.token || json?.token)) {
        const user = json?.data?.user || json?.user;
        const token = json?.data?.token || json?.token;
        if (user && token) {
          await saveAuthSession(user, token);
        }
        return {
          ok: true,
          user,
          token,
          message: json?.message || 'Registration successful. Account pending approval.',
        };
      }

      if (res.status === 422) {
        return {
          ok: false,
          message: json?.message || 'Please check the registration details provided.',
          errors: json?.errors || null,
        };
      }

      if (res.status >= 500) {
        lastErrorMessage = 'Authentication server error. Retrying backup connection...';
        continue;
      }

      lastErrorMessage = json?.message || `Registration error (${res.status})`;
      lastErrors = json?.errors || null;
    } catch (err) {
      console.log(`Register attempt at ${baseUrl} failed:`, err);
      lastErrorMessage = 'Network error connecting to registration service. Please check your connection.';
    }
  }

  return {
    ok: false,
    message: lastErrorMessage || 'Unable to connect to registration service.',
    errors: lastErrors,
  };
}
