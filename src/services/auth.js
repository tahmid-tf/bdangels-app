import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { API_BASE_URL, getWebBaseUrl } from './api';

const TOKEN_KEY = '@bdangels_auth_token';
const USER_KEY = '@bdangels_auth_user';

let inMemoryToken = null;
let inMemoryUser = null;

export const authState = {
  getToken: () => inMemoryToken,
  getUser: () => inMemoryUser,
  isLoggedIn: () => Boolean(inMemoryToken),
  isAdmin: () => Boolean(inMemoryUser && (inMemoryUser.is_admin || inMemoryUser.role === 'admin' || inMemoryUser.role === 'superadmin')),
  isInvestor: () => Boolean(inMemoryToken && inMemoryUser && (inMemoryUser.is_investor || inMemoryUser.role === 'investor' || !inMemoryUser.is_admin)),
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
    try {
      WebBrowser.dismissAuthSession();
    } catch {
      // ignore
    }
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

/**
 * Submit Investor Membership Application via POST /member/apply (matching /investor/signup on web)
 */
export async function submitInvestorSignup({
  first_name,
  last_name,
  email,
  address,
  phone,
  country_code = '+880',
  primary_country = 'Bangladesh',
  gender = 'male',
  password,
  password_confirmation,
  selected_plan = 'free',
  selected_plan_price = 0,
  organization = '',
  designation = '',
  investment_expertise = 'beginner',
  linkedin = '',
}) {
  const endpoints = getAuthEndpoints();
  let lastErrorMessage = '';
  let lastErrors = null;

  for (const baseUrl of endpoints) {
    try {
      const res = await fetch(`${baseUrl}/member/apply`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          email: email.trim(),
          address: address.trim(),
          phone: phone.trim().replace(/^\+/, ''),
          country_code: country_code.trim(),
          primary_country: primary_country.trim(),
          gender,
          password,
          password_confirmation: password_confirmation || password,
          selected_plan: selected_plan.trim(),
          selected_plan_price: Number(selected_plan_price) || 0,
          organization: organization.trim() || undefined,
          designation: designation.trim() || undefined,
          investment_expertise,
          linkedin: linkedin.trim() || undefined,
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
          requires_payment: Boolean(json?.data?.requires_payment),
          selected_plan: json?.data?.selected_plan || null,
          message: json?.message || 'Membership application submitted successfully.',
        };
      }

      if (res.status === 422) {
        return {
          ok: false,
          message: json?.message || 'Please check the application details provided.',
          errors: json?.errors || null,
        };
      }

      if (res.status >= 500) {
        lastErrorMessage = 'Authentication server error. Retrying backup connection...';
        continue;
      }

      lastErrorMessage = json?.message || `Application error (${res.status})`;
      lastErrors = json?.errors || null;
    } catch (err) {
      console.log(`Investor signup attempt at ${baseUrl} failed:`, err);
      lastErrorMessage = 'Network error connecting to application service. Please check your connection.';
    }
  }

  return {
    ok: false,
    message: lastErrorMessage || 'Unable to connect to application service.',
    errors: lastErrors,
  };
}

/**
 * Parse query params from deep link callback URL
 */
function parseAuthUrlParams(url) {
  const params = {};
  if (!url) return params;

  try {
    const parsed = Linking.parse(url);
    if (parsed.queryParams) {
      Object.assign(params, parsed.queryParams);
    }
  } catch (err) {
    console.log('Linking.parse notice:', err);
  }

  const questionIdx = url.indexOf('?');
  const hashIdx = url.indexOf('#');
  const queryStr = questionIdx !== -1
    ? (hashIdx !== -1 && hashIdx > questionIdx
        ? url.substring(questionIdx + 1, hashIdx)
        : url.substring(questionIdx + 1))
    : '';

  if (queryStr) {
    const pairs = queryStr.split('&');
    for (const pair of pairs) {
      const [k, v] = pair.split('=');
      if (k && !(k in params)) {
        try {
          params[k] = decodeURIComponent(v || '');
        } catch {
          params[k] = v || '';
        }
      }
    }
  }

  return params;
}

/**
 * Parse user payload from Google auth response
 */
function parseUserPayload(rawUser) {
  if (!rawUser) return null;
  if (typeof rawUser === 'object') return rawUser;
  if (typeof rawUser === 'string') {
    try {
      return JSON.parse(decodeURIComponent(rawUser));
    } catch {
      try {
        return JSON.parse(rawUser);
      } catch (e) {
        console.log('Failed to parse user JSON payload:', e);
      }
    }
  }
  return null;
}

/**
 * Perform Google Authentication via browser OAuth session (matching web application flow)
 *
 * @param {object} [options]
 * @param {'login'|'signup'} [options.intent='login']
 * @returns {Promise<{ok: boolean, user?: object, token?: string, isNewUser?: boolean, isAdmin?: boolean, cancelled?: boolean, message?: string}>}
 */
export async function loginWithGoogle({ intent = 'login' } = {}) {
  try {
    try {
      WebBrowser.dismissAuthSession();
    } catch {
      // ignore
    }

    const webBaseUrl = getWebBaseUrl();
    const returnUrl = Linking.createURL('auth/google/callback');

    // Trigger backend Google OAuth with mobile mode, explicit account selection prompt, and cache buster
    const authUrl = `${webBaseUrl}/auth/google/${intent}?mode=mobile&prompt=select_account&_t=${Date.now()}&redirect_uri=${encodeURIComponent(returnUrl)}`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, returnUrl, {
      showInRecents: false,
      preferEphemeralSession: false,
    });

    try {
      WebBrowser.dismissAuthSession();
    } catch {
      // ignore
    }

    if (result.type === 'success' && result.url) {
      const params = parseAuthUrlParams(result.url);

      if (params.error) {
        return {
          ok: false,
          message: params.error,
        };
      }

      const token = params.token;
      const user = parseUserPayload(params.user);

      if (token && user) {
        await saveAuthSession(user, token);
        const isNewUser = params.is_new_user === '1' || params.is_new_user === true;
        return {
          ok: true,
          user,
          token,
          isNewUser,
          isAdmin: Boolean(
            user.is_admin ||
            user.role === 'admin' ||
            user.role === 'superadmin'
          ),
          message: isNewUser
            ? 'Account registered via Google successfully.'
            : 'Google sign-in successful.',
        };
      }

      return {
        ok: false,
        message: 'Could not extract authentication credentials from Google response.',
      };
    }

    if (result.type === 'cancel' || result.type === 'dismiss') {
      return {
        ok: false,
        cancelled: true,
        message: 'Google sign-in was cancelled.',
      };
    }

    return {
      ok: false,
      message: 'Google sign-in was not completed.',
    };
  } catch (err) {
    console.log('Google login exception:', err);
    return {
      ok: false,
      message: err.message || 'Unable to connect to Google authentication service.',
    };
  }
}

/**
 * Authenticate or register directly via POST /auth/google endpoint (for ID token or access token)
 */
export async function loginWithGoogleApi(payload) {
  const endpoints = getAuthEndpoints();
  let lastErrorMessage = '';
  let lastErrors = null;

  for (const baseUrl of endpoints) {
    try {
      const res = await fetch(`${baseUrl}/auth/google`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...payload,
          device_name: payload.device_name || 'mobile-app',
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
          isNewUser: Boolean(json.data.is_new_user),
          isAdmin: Boolean(
            user && (user.is_admin || user.role === 'admin' || user.role === 'superadmin')
          ),
          message: json.message || 'Google sign-in successful.',
        };
      }

      if (res.status === 422 || res.status === 401 || res.status === 403) {
        return {
          ok: false,
          message: json?.message || 'Google authentication could not be verified.',
          errors: json?.errors || null,
        };
      }

      if (res.status >= 500) {
        continue;
      }

      lastErrorMessage = json?.message || `Authentication error (${res.status})`;
      lastErrors = json?.errors || null;
    } catch (err) {
      console.log(`Google API login attempt at ${baseUrl} failed:`, err);
      lastErrorMessage = 'Network error connecting to login service. Please check your connection.';
    }
  }

  return {
    ok: false,
    message: lastErrorMessage || 'Unable to connect to Google authentication service.',
    errors: lastErrors,
  };
}

