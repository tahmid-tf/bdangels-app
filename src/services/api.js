import { Platform, Linking } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as WebBrowser from 'expo-web-browser';
import { normalizeImageUrl } from '../utils/imageResolver';

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '');
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2/api';
  }
  // Web & iOS simulator: bdangels.test resolves via hosts / Laragon
  return 'http://bdangels.test/api';
};

export const API_BASE_URL = getBaseUrl();

/**
 * Web portal base URL (defaults to https://bdangels.co)
 */
export const getWebBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/api\/?$/, '');
  }
  return 'https://bdangels.co';
};

/**
 * Upgrade / Checkout payment page URL
 */
export const getUpgradePayUrl = (planSlug = '') => {
  const base = getWebBaseUrl();
  return `${base}/upgrade/pay${planSlug ? `?plan=${encodeURIComponent(planSlug)}` : ''}`;
};

/**
 * Open upgrade checkout payment flow in-app browser or native browser
 */
export const openCheckoutPage = async (planSlug = '') => {
  const url = getUpgradePayUrl(planSlug);
  try {
    await WebBrowser.openBrowserAsync(url, {
      toolbarColor: '#005A36',
      controlsColor: '#FFFFFF',
      showTitle: true,
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    });
  } catch (err) {
    console.log('WebBrowser open notice, falling back to Linking:', err);
    Linking.openURL(url).catch((linkErr) => console.log('Linking error:', linkErr));
  }
};

/**
 * Submit Membership Checkout via POST /api/checkout
 */
export async function submitCheckout(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/checkout`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    return {
      ok: res.ok,
      status: res.status,
      data: json.data || json,
      message: json.message || '',
      errors: json.errors || null,
    };
  } catch (err) {
    console.log('Checkout submission network error:', err);
    return {
      ok: false,
      status: 0,
      message: 'Network error connecting to payment server. Please check your connection.',
      errors: null,
    };
  }
}

/**
 * Check transaction status for a membership order reference
 */
export async function checkCheckoutStatus(reference) {
  try {
    const res = await fetch(`${API_BASE_URL}/checkout/status/${encodeURIComponent(reference)}`, {
      headers: {
        Accept: 'application/json',
      },
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || json;
    }
  } catch (err) {
    console.log('Checkout status check error:', err);
  }
  return null;
}

/**
 * =========================================================================
 * ADMIN API ENDPOINTS
 * =========================================================================
 */

/**
 * Internal helper to fetch admin resources with fallback support
 */
async function fetchAdminWithFallback(endpointPath, token, fetchOptions = {}) {
  const endpoints = [API_BASE_URL];
  if (API_BASE_URL.includes('bdangels.co')) {
    endpoints.push('http://bdangels.test/api');
  } else if (API_BASE_URL.includes('bdangels.test')) {
    endpoints.push('https://bdangels.co/api');
  }

  const cleanPath = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;
  const headers = {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(fetchOptions.headers || {}),
  };

  let lastRes = null;
  for (const base of endpoints) {
    try {
      const res = await fetch(`${base}${cleanPath}`, {
        ...fetchOptions,
        headers,
      });
      lastRes = res;
      if (res.ok) {
        return res;
      }
      if (res.status >= 400 && res.status < 500) {
        return res;
      }
    } catch (err) {
      console.log(`Admin request at ${base}${cleanPath} failed:`, err.message);
    }
  }

  return lastRes;
}

/**
 * Fetch Admin Dashboard metrics & charts from GET /api/admin/dashboard
 */
export async function fetchAdminDashboard(token) {
  try {
    const res = await fetchAdminWithFallback('/admin/dashboard', token);
    if (res && res.ok) {
      const json = await res.json();
      return json.data || json;
    }
  } catch (err) {
    console.log('Admin dashboard fetch error:', err);
  }
  return null;
}

/**
 * Fetch Admin Members list with pagination and filters from GET /api/admin/members
 */
export async function fetchAdminMembers(
  token,
  { search = '', status = '', page = 1, per_page = 15, role = '', account_status = '' } = {}
) {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'all') {
      params.append('status', status === 'pending' ? 'pending_approval' : status);
    }
    if (page) params.append('page', String(page));
    if (per_page) params.append('per_page', String(per_page));
    if (role) params.append('role', role);
    if (account_status) params.append('account_status', account_status);

    const res = await fetchAdminWithFallback(`/admin/members?${params.toString()}`, token);
    if (res && res.ok) {
      const json = await res.json();
      return json; // Contains json.data (Laravel paginator) and json.counts
    }
  } catch (err) {
    console.log('Admin members fetch error:', err);
  }
  return null;
}

/**
 * Approve a member via POST /api/admin/members/{userId}/approve
 */
export async function approveAdminMember(token, userId) {
  try {
    const res = await fetchAdminWithFallback(`/admin/members/${userId}/approve`, token, {
      method: 'POST',
    });
    if (res) {
      const json = await res.json();
      return { ok: res.ok, data: json.data || null, message: json.message || '' };
    }
  } catch (err) {
    console.log('Admin approve member error:', err);
  }
  return { ok: false, message: 'Could not approve member.' };
}

/**
 * Update member account status tier (free, core, advanced, institutional) via PATCH /api/admin/members/{userId}/status
 */
export async function updateAdminMemberStatus(token, userId, { account_status, status, mode } = {}) {
  try {
    const body = {};
    if (account_status) body.account_status = account_status;
    if (status) body.status = status;
    if (mode) body.mode = mode;

    const res = await fetchAdminWithFallback(`/admin/members/${userId}/status`, token, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res) {
      const json = await res.json();
      return { ok: res.ok, data: json.data || null, message: json.message || '' };
    }
  } catch (err) {
    console.log('Admin update status error:', err);
  }
  return { ok: false, message: 'Could not update status tier.' };
}

/**
 * Update member mode (active / inactive) via PATCH /api/admin/members/{userId}/mode
 */
export async function updateAdminMemberMode(token, userId, mode) {
  try {
    const res = await fetchAdminWithFallback(`/admin/members/${userId}/mode`, token, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: mode }),
    });
    if (res) {
      const json = await res.json();
      return { ok: res.ok, data: json.data || null, message: json.message || '' };
    }
  } catch (err) {
    console.log('Admin update mode error:', err);
  }
  return { ok: false, message: 'Could not update member mode.' };
}

/**
 * Create a new member via POST /api/admin/members
 */
export async function createAdminMember(token, memberData) {
  try {
    const res = await fetchAdminWithFallback('/admin/members', token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberData),
    });
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        data: json.data || null,
        message: json.message || '',
        errors: json.errors || null,
      };
    }
  } catch (err) {
    console.log('Admin create member error:', err);
  }
  return { ok: false, message: 'Could not create member.' };
}

/**
 * Update member full details via POST /api/admin/members/{userId}
 */
export async function updateAdminMember(token, userId, memberData) {
  try {
    const res = await fetchAdminWithFallback(`/admin/members/${userId}`, token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberData),
    });
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        data: json.data || null,
        message: json.message || '',
        errors: json.errors || null,
      };
    }
  } catch (err) {
    console.log('Admin update member error:', err);
  }
  return { ok: false, message: 'Could not update member details.' };
}

/**
 * Delete a member via DELETE /api/admin/members/{userId}
 */
export async function deleteAdminMember(token, userId) {
  try {
    const res = await fetchAdminWithFallback(`/admin/members/${userId}`, token, {
      method: 'DELETE',
    });
    if (res) {
      const json = await res.json();
      return { ok: res.ok, message: json.message || 'Member removed successfully.' };
    }
  } catch (err) {
    console.log('Admin delete member error:', err);
  }
  return { ok: false, message: 'Could not delete member.' };
}

/**
 * Verify member email via POST /api/admin/members/{userId}/verify-email
 */
export async function verifyAdminMemberEmail(token, userId) {
  try {
    const res = await fetchAdminWithFallback(`/admin/members/${userId}/verify-email`, token, {
      method: 'POST',
    });
    if (res) {
      const json = await res.json();
      return { ok: res.ok, data: json.data || null, message: json.message || '' };
    }
  } catch (err) {
    console.log('Admin verify email error:', err);
  }
  return { ok: false, message: 'Could not verify member email.' };
}

/**
 * Fetch Admin Deals list from GET /api/admin/deals
 */
export async function fetchAdminDeals(token, { type = '', status = '', search = '', per_page = 50, page = 1 } = {}) {
  try {
    const params = new URLSearchParams();
    if (type && type !== 'all') params.append('type', type);
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);
    if (per_page) params.append('per_page', String(per_page));
    if (page) params.append('page', String(page));

    const res = await fetchAdminWithFallback(`/admin/deals?${params.toString()}`, token);
    if (res && res.ok) {
      const json = await res.json();
      const rawData = json.data;
      const dealsArray = Array.isArray(rawData?.data)
        ? rawData.data
        : (Array.isArray(rawData) ? rawData : (Array.isArray(json) ? json : []));
      return {
        data: dealsArray,
        counts: json.counts || null,
        meta: rawData?.current_page ? {
          current_page: rawData.current_page,
          last_page: rawData.last_page,
          per_page: rawData.per_page,
          total: rawData.total,
        } : null,
      };
    }
  } catch (err) {
    console.log('Admin deals fetch error:', err);
  }
  return { data: [], counts: null, meta: null };
}

/**
 * Fetch Single Deal Details from GET /api/admin/deals/{id}
 */
export async function fetchAdminDeal(token, id) {
  try {
    const res = await fetchAdminWithFallback(`/admin/deals/${id}`, token);
    if (res && res.ok) {
      const json = await res.json();
      return {
        ok: true,
        data: json.data || json,
      };
    }
  } catch (err) {
    console.log('Admin deal details fetch error:', err);
  }
  return { ok: false, message: 'Could not load deal details.' };
}

/**
 * Create a new deal via POST /api/admin/deals
 * Supports JSON or FormData (with company_logo, company_cover, gallery)
 */
export async function createAdminDeal(token, payload) {
  try {
    const isFormData = payload instanceof FormData;
    const options = {
      method: 'POST',
    };

    if (isFormData) {
      options.body = payload;
    } else {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(payload);
    }

    const res = await fetchAdminWithFallback('/admin/deals', token, options);
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        data: json.data || null,
        message: json.message || (res.ok ? 'Deal created successfully.' : 'Failed to create deal.'),
        errors: json.errors || null,
      };
    }
  } catch (err) {
    console.log('Admin create deal error:', err);
  }
  return { ok: false, message: 'Could not connect to server.' };
}

/**
 * Update an existing deal via POST /api/admin/deals/{id}
 * Supports JSON or FormData (with company_logo, company_cover, gallery)
 */
export async function updateAdminDeal(token, id, payload) {
  try {
    const isFormData = payload instanceof FormData;
    const options = {
      method: 'POST',
    };

    if (isFormData) {
      options.body = payload;
    } else {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(payload);
    }

    const res = await fetchAdminWithFallback(`/admin/deals/${id}`, token, options);
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        data: json.data || null,
        message: json.message || (res.ok ? 'Deal updated successfully.' : 'Failed to update deal.'),
        errors: json.errors || null,
      };
    }
  } catch (err) {
    console.log('Admin update deal error:', err);
  }
  return { ok: false, message: 'Could not connect to server.' };
}

/**
 * Delete a deal via DELETE /api/admin/deals/{id}
 */
export async function deleteAdminDeal(token, id) {
  try {
    const res = await fetchAdminWithFallback(`/admin/deals/${id}`, token, {
      method: 'DELETE',
    });
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        message: json.message || (res.ok ? 'Deal deleted successfully.' : 'Failed to delete deal.'),
      };
    }
  } catch (err) {
    console.log('Admin delete deal error:', err);
  }
  return { ok: false, message: 'Could not delete deal.' };
}

/**
 * Fetch member activity (interested, invest, review, commits) via GET /api/admin/deals/{id}/member-activity
 */
export async function fetchAdminDealMemberActivity(token, dealId) {
  try {
    const res = await fetchAdminWithFallback(`/admin/deals/${dealId}/member-activity`, token);
    if (res && res.ok) {
      const json = await res.json();
      return {
        ok: true,
        data: json.data || json,
      };
    }
  } catch (err) {
    console.log('Admin deal member activity fetch error:', err);
  }
  return { ok: false, message: 'Could not load deal member activity.' };
}

/**
 * Toggle viewed status for an investment via POST /api/admin/deals/{dealId}/member-activity/investments/{investmentId}/toggle-viewed
 */
export async function toggleAdminDealInvestmentViewed(token, dealId, investmentId) {
  try {
    const res = await fetchAdminWithFallback(
      `/admin/deals/${dealId}/member-activity/investments/${investmentId}/toggle-viewed`,
      token,
      { method: 'POST' }
    );
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        data: json.data || null,
        message: json.message || 'Updated viewed status.',
      };
    }
  } catch (err) {
    console.log('Toggle viewed error:', err);
  }
  return { ok: false, message: 'Could not toggle viewed status.' };
}

/**
 * Mark all interested members as viewed for a deal via POST /api/admin/deals/{dealId}/member-activity/mark-all-viewed
 */
export async function markAllAdminDealInvestmentsViewed(token, dealId) {
  try {
    const res = await fetchAdminWithFallback(
      `/admin/deals/${dealId}/member-activity/mark-all-viewed`,
      token,
      { method: 'POST' }
    );
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        data: json.data || null,
        message: json.message || 'All activity marked as viewed.',
      };
    }
  } catch (err) {
    console.log('Mark all viewed error:', err);
  }
  return { ok: false, message: 'Could not mark all as viewed.' };
}

/**
 * Fetch Founder Pitch Submissions from GET /api/admin/founder-pitches
 */
export async function fetchAdminFounderPitches(token) {
  try {
    const res = await fetchAdminWithFallback('/admin/founder-pitches', token);
    if (res && res.ok) {
      const json = await res.json();
      return json.data || json;
    }
  } catch (err) {
    console.log('Admin founder pitches fetch error:', err);
  }
  return null;
}

/**
 * Fetch Angel Academy Applications from GET /api/admin/angel-academy-applications
 */
export async function fetchAdminAngelAcademy(token) {
  try {
    const res = await fetchAdminWithFallback('/admin/angel-academy-applications', token);
    if (res && res.ok) {
      const json = await res.json();
      return json.data || json;
    }
  } catch (err) {
    console.log('Admin angel academy fetch error:', err);
  }
  return null;
}

/**
 * Fetch Admin Notifications from GET /api/admin/notifications
 */
export async function fetchAdminNotifications(token) {
  try {
    const res = await fetchAdminWithFallback('/admin/notifications', token);
    if (res && res.ok) {
      const json = await res.json();
      return json.data || json;
    }
  } catch (err) {
    console.log('Admin notifications fetch error:', err);
  }
  return null;
}

/**
 * Mark all notifications as viewed via POST /api/admin/notifications/mark-all-viewed
 */
export async function markAdminNotificationsViewed(token) {
  try {
    const res = await fetchAdminWithFallback('/admin/notifications/mark-all-viewed', token, {
      method: 'POST',
    });
    return Boolean(res && res.ok);
  } catch (err) {
    console.log('Mark notifications viewed error:', err);
    return false;
  }
}

/**
 * Fetch Subscriptions list & tiers from GET /api/admin/subscriptions
 */
export async function fetchAdminSubscriptions(token) {
  try {
    const res = await fetchAdminWithFallback('/admin/subscriptions', token);
    if (res && res.ok) {
      const json = await res.json();
      return json.data || json;
    }
  } catch (err) {
    console.log('Admin subscriptions fetch error:', err);
  }
  return null;
}

/**
 * Fetch Investor Investments from GET /api/admin/investor-investments
 */
export async function fetchAdminInvestorInvestments(token) {
  try {
    const res = await fetchAdminWithFallback('/admin/investor-investments', token);
    if (res && res.ok) {
      const json = await res.json();
      return json.data || json;
    }
  } catch (err) {
    console.log('Admin investor investments fetch error:', err);
  }
  return null;
}

/**
 * Fetch BAN Wealth Orders from GET /api/admin/ban-wealth-orders
 */
export async function fetchAdminBanWealthOrders(token) {
  try {
    const res = await fetchAdminWithFallback('/admin/ban-wealth-orders', token);
    if (res && res.ok) {
      const json = await res.json();
      return json.data || json;
    }
  } catch (err) {
    console.log('Admin BAN wealth orders fetch error:', err);
  }
  return null;
}

/**
 * Fetch Admin Blogs list from GET /api/admin/blogs
 */
export async function fetchAdminBlogs(
  token,
  { status = '', search = '', page = 1, per_page = 15 } = {}
) {
  try {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);
    if (page) params.append('page', String(page));
    if (per_page) params.append('per_page', String(per_page));

    const path = `/admin/blogs${params.toString() ? '?' + params.toString() : ''}`;
    const res = await fetchAdminWithFallback(path, token);
    if (res && res.ok) {
      const json = await res.json();
      return json;
    }
  } catch (err) {
    console.log('Admin blogs fetch error:', err);
  }
  return null;
}

/**
 * Fetch single Admin Blog by ID from GET /api/admin/blogs/{id}
 */
export async function fetchAdminBlog(token, blogId) {
  try {
    const res = await fetchAdminWithFallback(`/admin/blogs/${blogId}`, token);
    if (res && res.ok) {
      const json = await res.json();
      return json.data || json;
    }
  } catch (err) {
    console.log('Admin blog show error:', err);
  }
  return null;
}

/**
 * Create new blog post via POST /api/admin/blogs
 */
export async function createAdminBlog(token, blogData) {
  try {
    const res = await fetchAdminWithFallback('/admin/blogs', token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blogData),
    });
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        data: json.data || null,
        message: json.message || '',
        errors: json.errors || null,
      };
    }
  } catch (err) {
    console.log('Admin create blog error:', err);
  }
  return { ok: false, message: 'Could not create blog post.' };
}

/**
 * Update blog post via POST /api/admin/blogs/{id}
 */
export async function updateAdminBlog(token, blogId, blogData) {
  try {
    const res = await fetchAdminWithFallback(`/admin/blogs/${blogId}`, token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blogData),
    });
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        data: json.data || null,
        message: json.message || '',
        errors: json.errors || null,
      };
    }
  } catch (err) {
    console.log('Admin update blog error:', err);
  }
  return { ok: false, message: 'Could not update blog post.' };
}

/**
 * Toggle/Update blog status via PATCH /api/admin/blogs/{id}/status
 */
export async function updateAdminBlogStatus(token, blogId, status) {
  try {
    const res = await fetchAdminWithFallback(`/admin/blogs/${blogId}/status`, token, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        data: json.data || null,
        message: json.message || '',
      };
    }
  } catch (err) {
    console.log('Admin update blog status error:', err);
  }
  return { ok: false, message: 'Could not update blog status.' };
}

/**
 * Delete blog post via DELETE /api/admin/blogs/{id}
 */
export async function deleteAdminBlog(token, blogId) {
  try {
    const res = await fetchAdminWithFallback(`/admin/blogs/${blogId}`, token, {
      method: 'DELETE',
    });
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        message: json.message || 'Blog post deleted successfully.',
      };
    }
  } catch (err) {
    console.log('Admin delete blog error:', err);
  }
  return { ok: false, message: 'Could not delete blog post.' };
}

/**
 * Fetch Paginated Admin Publications from GET /api/admin/publications
 */
export async function fetchAdminPublications(
  token,
  { status = '', search = '', page = 1, per_page = 15 } = {}
) {
  try {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);
    if (page) params.append('page', String(page));
    if (per_page) params.append('per_page', String(per_page));

    const path = `/admin/publications${params.toString() ? '?' + params.toString() : ''}`;
    const res = await fetchAdminWithFallback(path, token);
    if (res && res.ok) {
      const json = await res.json();
      return json;
    }
  } catch (err) {
    console.log('Admin publications fetch error:', err);
  }
  return null;
}

/**
 * Fetch single Admin Publication by ID from GET /api/admin/publications/{id}
 */
export async function fetchAdminPublication(token, publicationId) {
  try {
    const res = await fetchAdminWithFallback(`/admin/publications/${publicationId}`, token);
    if (res && res.ok) {
      const json = await res.json();
      return json.data || json;
    }
  } catch (err) {
    console.log('Admin publication show error:', err);
  }
  return null;
}

/**
 * Create new publication via POST /api/admin/publications
 */
export async function createAdminPublication(token, publicationData) {
  const { pdfFile, ...fields } = publicationData;
  const targetUrl = `${API_BASE_URL}/admin/publications`;

  if (Platform.OS !== 'web' && pdfFile?.uri) {
    try {
      const uploadRes = await FileSystem.uploadAsync(targetUrl, pdfFile.uri, {
        fieldName: 'pdf',
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        mimeType: pdfFile.mimeType || 'application/pdf',
        parameters: {
          title: fields.title,
          category: fields.category,
          excerpt: fields.excerpt || '',
          status: fields.status || 'published',
          ...(fields.published_at ? { published_at: fields.published_at } : {}),
          ...(fields.pdf_original_name ? { pdf_original_name: fields.pdf_original_name } : {}),
          ...(fields.pdf_path ? { pdf_path: fields.pdf_path } : {}),
        },
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      let json = {};
      try {
        json = JSON.parse(uploadRes.body);
      } catch {
        json = { message: uploadRes.body };
      }

      return {
        ok: uploadRes.status >= 200 && uploadRes.status < 300,
        data: json.data || null,
        message: json.message || '',
        errors: json.errors || null,
      };
    } catch (err) {
      console.log('FileSystem publication upload error, trying FormData fallback:', err);
    }
  }

  // Web or fallback with FormData if file is attached
  if (pdfFile) {
    try {
      const formData = new FormData();
      formData.append('title', fields.title);
      formData.append('category', fields.category);
      formData.append('excerpt', fields.excerpt || '');
      formData.append('status', fields.status || 'published');
      if (fields.published_at) formData.append('published_at', fields.published_at);
      if (fields.pdf_original_name) formData.append('pdf_original_name', fields.pdf_original_name);
      if (fields.pdf_path) formData.append('pdf_path', fields.pdf_path);

      if (pdfFile instanceof Blob || (typeof File !== 'undefined' && pdfFile instanceof File)) {
        formData.append('pdf', pdfFile, pdfFile.name || 'document.pdf');
      } else if (pdfFile.file) {
        formData.append('pdf', pdfFile.file, pdfFile.name || 'document.pdf');
      } else if (pdfFile.uri) {
        try {
          const fileRes = await fetch(pdfFile.uri);
          const blob = await fileRes.blob();
          formData.append('pdf', blob, pdfFile.name || 'document.pdf');
        } catch {
          formData.append('pdf', {
            uri: pdfFile.uri,
            name: pdfFile.name || 'document.pdf',
            type: pdfFile.mimeType || 'application/pdf',
          });
        }
      }

      const res = await fetchAdminWithFallback('/admin/publications', token, {
        method: 'POST',
        body: formData,
      });

      if (res) {
        const json = await res.json();
        return {
          ok: res.ok,
          data: json.data || null,
          message: json.message || '',
          errors: json.errors || null,
        };
      }
    } catch (err) {
      console.log('FormData publication upload error:', err);
    }
  }

  // Pure JSON if no file object
  try {
    const res = await fetchAdminWithFallback('/admin/publications', token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    });
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        data: json.data || null,
        message: json.message || '',
        errors: json.errors || null,
      };
    }
  } catch (err) {
    console.log('Admin create publication error:', err);
  }
  return { ok: false, message: 'Could not create publication.' };
}

/**
 * Update publication via POST/PUT /api/admin/publications/{id}
 */
export async function updateAdminPublication(token, publicationId, publicationData) {
  const { pdfFile, ...fields } = publicationData;
  const targetUrl = `${API_BASE_URL}/admin/publications/${publicationId}`;

  if (Platform.OS !== 'web' && pdfFile?.uri) {
    try {
      const uploadRes = await FileSystem.uploadAsync(targetUrl, pdfFile.uri, {
        fieldName: 'pdf',
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        mimeType: pdfFile.mimeType || 'application/pdf',
        parameters: {
          title: fields.title,
          category: fields.category,
          excerpt: fields.excerpt || '',
          status: fields.status || 'published',
          ...(fields.published_at ? { published_at: fields.published_at } : {}),
          ...(fields.pdf_original_name ? { pdf_original_name: fields.pdf_original_name } : {}),
          ...(fields.pdf_path ? { pdf_path: fields.pdf_path } : {}),
        },
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      let json = {};
      try {
        json = JSON.parse(uploadRes.body);
      } catch {
        json = { message: uploadRes.body };
      }

      return {
        ok: uploadRes.status >= 200 && uploadRes.status < 300,
        data: json.data || null,
        message: json.message || '',
        errors: json.errors || null,
      };
    } catch (err) {
      console.log('FileSystem publication update error, trying FormData fallback:', err);
    }
  }

  // Web or fallback with FormData if file is attached
  if (pdfFile) {
    try {
      const formData = new FormData();
      formData.append('title', fields.title);
      formData.append('category', fields.category);
      formData.append('excerpt', fields.excerpt || '');
      formData.append('status', fields.status || 'published');
      if (fields.published_at) formData.append('published_at', fields.published_at);
      if (fields.pdf_original_name) formData.append('pdf_original_name', fields.pdf_original_name);
      if (fields.pdf_path) formData.append('pdf_path', fields.pdf_path);

      if (pdfFile instanceof Blob || (typeof File !== 'undefined' && pdfFile instanceof File)) {
        formData.append('pdf', pdfFile, pdfFile.name || 'document.pdf');
      } else if (pdfFile.file) {
        formData.append('pdf', pdfFile.file, pdfFile.name || 'document.pdf');
      } else if (pdfFile.uri) {
        try {
          const fileRes = await fetch(pdfFile.uri);
          const blob = await fileRes.blob();
          formData.append('pdf', blob, pdfFile.name || 'document.pdf');
        } catch {
          formData.append('pdf', {
            uri: pdfFile.uri,
            name: pdfFile.name || 'document.pdf',
            type: pdfFile.mimeType || 'application/pdf',
          });
        }
      }

      const res = await fetchAdminWithFallback(`/admin/publications/${publicationId}`, token, {
        method: 'POST',
        body: formData,
      });

      if (res) {
        const json = await res.json();
        return {
          ok: res.ok,
          data: json.data || null,
          message: json.message || '',
          errors: json.errors || null,
        };
      }
    } catch (err) {
      console.log('FormData publication update error:', err);
    }
  }

  // Pure JSON update if no file is being changed
  try {
    const res = await fetchAdminWithFallback(`/admin/publications/${publicationId}`, token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    });
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        data: json.data || null,
        message: json.message || '',
        errors: json.errors || null,
      };
    }
  } catch (err) {
    console.log('Admin update publication error:', err);
  }
  return { ok: false, message: 'Could not update publication.' };
}

/**
 * Toggle/Update publication status via PATCH /api/admin/publications/{id}/status
 */
export async function updateAdminPublicationStatus(token, publicationId, status) {
  try {
    const res = await fetchAdminWithFallback(`/admin/publications/${publicationId}/status`, token, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        data: json.data || null,
        message: json.message || '',
      };
    }
  } catch (err) {
    console.log('Admin update publication status error:', err);
  }
  return { ok: false, message: 'Could not update publication status.' };
}

/**
 * Delete publication via DELETE /api/admin/publications/{id}
 */
export async function deleteAdminPublication(token, publicationId) {
  try {
    const res = await fetchAdminWithFallback(`/admin/publications/${publicationId}`, token, {
      method: 'DELETE',
    });
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        message: json.message || 'Publication deleted successfully.',
      };
    }
  } catch (err) {
    console.log('Admin delete publication error:', err);
  }
  return { ok: false, message: 'Could not delete publication.' };
}

/**
 * Fetch Landing Page Stats from GET /api/admin/landing-page-stats
 */
export async function fetchAdminLandingPageStats(token) {
  try {
    const res = await fetchAdminWithFallback('/admin/landing-page-stats', token);
    if (res && res.ok) {
      const json = await res.json();
      const list = json.data || json;
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    }
  } catch (err) {
    console.log('Admin landing page stats fetch error:', err);
  }
  // Curated default fallback if server is unreachable
  return [
    { id: 1, value: '500+', label: 'Angel\ninvestors', sort_order: 1 },
    { id: 2, value: '$12M+', label: 'Capital facilitated', sort_order: 2 },
    { id: 3, value: '51', label: 'Portfolio companies', sort_order: 3 },
  ];
}

/**
 * Update Landing Page Stats via PUT/POST /api/admin/landing-page-stats
 */
export async function updateAdminLandingPageStats(token, statsArray) {
  try {
    const res = await fetchAdminWithFallback('/admin/landing-page-stats', token, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stats: statsArray }),
    });
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        data: json.data || null,
        message: json.message || '',
        errors: json.errors || null,
      };
    }
  } catch (err) {
    console.log('Admin update landing page stats error:', err);
  }
  return { ok: false, message: 'Could not update landing page stats.' };
}

/**
 * Fetch Landing Program Cards from GET /api/admin/landing-program-cards
 */
export async function fetchAdminLandingProgramCards(token) {
  try {
    const res = await fetchAdminWithFallback('/admin/landing-program-cards', token);
    if (res && res.ok) {
      const json = await res.json();
      const list = json.data || (Array.isArray(json) ? json : []);
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    }
  } catch (err) {
    console.log('Admin landing program cards fetch error:', err);
  }
  return FALLBACK_HOME_DATA.landing_programs || [];
}

/**
 * Create a new Landing Program Card via POST /api/admin/landing-program-cards
 */
export async function createAdminLandingProgramCard(token, cardData) {
  try {
    const res = await fetchAdminWithFallback('/admin/landing-program-cards', token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cardData),
    });
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        data: json.data || null,
        message: json.message || '',
        errors: json.errors || null,
      };
    }
  } catch (err) {
    console.log('Admin create landing program card error:', err);
  }
  return { ok: false, message: 'Could not create program card.' };
}

/**
 * Update an existing Landing Program Card via PUT/POST /api/admin/landing-program-cards/:id
 */
export async function updateAdminLandingProgramCard(token, cardId, cardData) {
  try {
    const res = await fetchAdminWithFallback(`/admin/landing-program-cards/${cardId}`, token, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cardData),
    });
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        data: json.data || null,
        message: json.message || '',
        errors: json.errors || null,
      };
    }
  } catch (err) {
    console.log('Admin update landing program card error:', err);
  }
  return { ok: false, message: 'Could not update program card.' };
}

/**
 * Delete a Landing Program Card via DELETE /api/admin/landing-program-cards/:id
 */
export async function deleteAdminLandingProgramCard(token, cardId) {
  try {
    const res = await fetchAdminWithFallback(`/admin/landing-program-cards/${cardId}`, token, {
      method: 'DELETE',
    });
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        message: json.message || 'Program card deleted successfully.',
      };
    }
  } catch (err) {
    console.log('Admin delete landing program card error:', err);
  }
  return { ok: false, message: 'Could not delete program card.' };
}

/**
 * Fetch Homepage Selected Portfolios from GET /api/admin/homepage-portfolios
 */
export async function fetchAdminHomepagePortfolios(token) {
  try {
    const res = await fetchAdminWithFallback('/admin/homepage-portfolios', token);
    if (res && res.ok) {
      const json = await res.json();
      return json.data || json || [];
    }
  } catch (err) {
    console.log('Admin homepage portfolios fetch error:', err);
  }
  return null;
}

/**
 * Add a deal to Homepage Portfolios via POST /api/admin/homepage-portfolios
 */
export async function addAdminHomepagePortfolio(token, dealId) {
  try {
    const res = await fetchAdminWithFallback('/admin/homepage-portfolios', token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deal_id: Number(dealId) }),
    });
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        data: json.data || null,
        message: json.message || (res.ok ? 'Portfolio added to homepage.' : 'Failed to add portfolio.'),
        errors: json.errors || null,
      };
    }
  } catch (err) {
    console.log('Admin add homepage portfolio error:', err);
  }
  return { ok: false, message: 'Could not connect to server.' };
}

/**
 * Reorder Homepage Portfolios via PUT /api/admin/homepage-portfolios/reorder
 */
export async function reorderAdminHomepagePortfolios(token, orderArray) {
  try {
    const res = await fetchAdminWithFallback('/admin/homepage-portfolios/reorder', token, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: orderArray }),
    });
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        data: json.data || null,
        message: json.message || 'Order updated successfully.',
      };
    }
  } catch (err) {
    console.log('Admin reorder homepage portfolios error:', err);
  }
  return { ok: false, message: 'Could not update portfolio order.' };
}

/**
 * Delete a Homepage Portfolio via DELETE /api/admin/homepage-portfolios/:id
 */
export async function deleteAdminHomepagePortfolio(token, portfolioId) {
  try {
    const res = await fetchAdminWithFallback(`/admin/homepage-portfolios/${portfolioId}`, token, {
      method: 'DELETE',
    });
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        message: json.message || 'Portfolio removed from homepage.',
      };
    }
  } catch (err) {
    console.log('Admin delete homepage portfolio error:', err);
  }
  return { ok: false, message: 'Could not remove portfolio from homepage.' };
}

/**
 * Sync / Batch update Homepage Portfolios via POST /api/admin/homepage-portfolios/sync
 */
export async function syncAdminHomepagePortfolios(token, dealIdsArray) {
  try {
    const res = await fetchAdminWithFallback('/admin/homepage-portfolios/sync', token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deal_ids: dealIdsArray }),
    });
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        data: json.data || null,
        message: json.message || 'Homepage selections updated.',
      };
    }
  } catch (err) {
    console.log('Admin sync homepage portfolios error:', err);
  }
  return { ok: false, message: 'Could not sync homepage portfolios.' };
}

/**
 * Fetch Team About Section from GET /api/admin/team-about-section
 */
export async function fetchAdminTeamAboutSection(token) {
  try {
    const res = await fetchAdminWithFallback('/admin/team-about-section', token);
    if (res && res.ok) {
      const json = await res.json();
      return json.data || json || null;
    }
  } catch (err) {
    console.log('Admin team about section fetch error:', err);
  }
  return null;
}

/**
 * Update Team About Section via PUT/POST /api/admin/team-about-section
 * Supports JSON payload or FormData (for uploading new section photo)
 */
export async function updateAdminTeamAboutSection(token, payload) {
  try {
    const isFormData = payload instanceof FormData;
    const options = {
      method: 'POST',
    };

    if (isFormData) {
      options.body = payload;
    } else {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(payload);
    }

    const res = await fetchAdminWithFallback('/admin/team-about-section', token, options);
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        data: json.data || null,
        message: json.message || (res.ok ? 'Team About section updated.' : 'Failed to update section.'),
        errors: json.errors || null,
      };
    }
  } catch (err) {
    console.log('Admin update team about section error:', err);
  }
  return { ok: false, message: 'Could not connect to server.' };
}

/**
 * Fetch Admin Events with filters & pagination from GET /api/admin/events
 */
export async function fetchAdminEvents(
  token,
  { search = '', type = '', landing = '', page = 1, per_page = 20 } = {}
) {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (type && type !== 'all') params.append('type', type);
    if (landing && landing !== 'all') params.append('landing', landing);
    if (page) params.append('page', String(page));
    if (per_page) params.append('per_page', String(per_page));

    const res = await fetchAdminWithFallback(`/admin/events?${params.toString()}`, token);
    if (res && res.ok) {
      const json = await res.json();
      return json; // Contains json.data (paginator) and json.counts
    }
  } catch (err) {
    console.log('Admin events fetch error:', err);
  }
  return null;
}

/**
 * Fetch single event details via GET /api/admin/events/{id}
 */
export async function fetchAdminEvent(token, id) {
  try {
    const res = await fetchAdminWithFallback(`/admin/events/${id}`, token);
    if (res && res.ok) {
      const json = await res.json();
      return json.data || json || null;
    }
  } catch (err) {
    console.log('Admin single event fetch error:', err);
  }
  return null;
}

/**
 * Create a new event via POST /api/admin/events
 * Supports JSON or FormData (when banner_image is provided)
 */
export async function createAdminEvent(token, payload) {
  try {
    const isFormData = payload instanceof FormData;
    const options = {
      method: 'POST',
    };

    if (isFormData) {
      options.body = payload;
    } else {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(payload);
    }

    const res = await fetchAdminWithFallback('/admin/events', token, options);
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        data: json.data || null,
        message: json.message || (res.ok ? 'Event created successfully.' : 'Failed to create event.'),
        errors: json.errors || null,
      };
    }
  } catch (err) {
    console.log('Admin create event error:', err);
  }
  return { ok: false, message: 'Could not connect to server.' };
}

/**
 * Update an existing event via POST /api/admin/events/{id}
 * Supports JSON or FormData (when replacing banner_image)
 */
export async function updateAdminEvent(token, id, payload) {
  try {
    const isFormData = payload instanceof FormData;
    const options = {
      method: 'POST',
    };

    if (isFormData) {
      options.body = payload;
    } else {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(payload);
    }

    const res = await fetchAdminWithFallback(`/admin/events/${id}`, token, options);
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        data: json.data || null,
        message: json.message || (res.ok ? 'Event updated successfully.' : 'Failed to update event.'),
        errors: json.errors || null,
      };
    }
  } catch (err) {
    console.log('Admin update event error:', err);
  }
  return { ok: false, message: 'Could not connect to server.' };
}

/**
 * Delete an event via DELETE /api/admin/events/{id}
 */
export async function deleteAdminEvent(token, id) {
  try {
    const res = await fetchAdminWithFallback(`/admin/events/${id}`, token, {
      method: 'DELETE',
    });
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        message: json.message || 'Event deleted successfully.',
      };
    }
  } catch (err) {
    console.log('Admin delete event error:', err);
  }
  return { ok: false, message: 'Could not delete event.' };
}

/**
 * Fetch list of Startup Services via GET /api/admin/startup-services
 */
export async function fetchAdminStartupServices(token) {
  try {
    const res = await fetchAdminWithFallback('/admin/startup-services', token, {
      method: 'GET',
    });
    if (res) {
      const json = await res.json();
      if (res.ok && json.data) {
        return {
          ok: true,
          data: Array.isArray(json.data) ? json.data : [],
        };
      }
      return {
        ok: false,
        data: [],
        message: json.message || 'Failed to load startup services.',
      };
    }
  } catch (err) {
    console.log('Admin fetch startup services error:', err);
  }
  return { ok: false, data: [], message: 'Could not connect to server.' };
}

/**
 * Fetch single startup service details via GET /api/admin/startup-services/{id}
 */
export async function fetchAdminStartupService(token, id) {
  try {
    const res = await fetchAdminWithFallback(`/admin/startup-services/${id}`, token, {
      method: 'GET',
    });
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        data: json.data || null,
        message: json.message || '',
      };
    }
  } catch (err) {
    console.log('Admin fetch startup service error:', err);
  }
  return { ok: false, data: null, message: 'Could not connect to server.' };
}

/**
 * Create a new startup service via POST /api/admin/startup-services
 */
export async function createAdminStartupService(token, payload) {
  try {
    const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
    const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
    const body = isFormData ? payload : JSON.stringify(payload);

    const res = await fetchAdminWithFallback('/admin/startup-services', token, {
      method: 'POST',
      headers,
      body,
    });
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        data: json.data || null,
        message: json.message || (res.ok ? 'Startup service created successfully.' : 'Failed to create startup service.'),
        errors: json.errors || null,
      };
    }
  } catch (err) {
    console.log('Admin create startup service error:', err);
  }
  return { ok: false, message: 'Could not connect to server.' };
}

/**
 * Update a startup service via POST /api/admin/startup-services/{id}
 */
export async function updateAdminStartupService(token, id, payload) {
  try {
    const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
    const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
    const body = isFormData ? payload : JSON.stringify(payload);

    const res = await fetchAdminWithFallback(`/admin/startup-services/${id}`, token, {
      method: 'POST',
      headers,
      body,
    });
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        data: json.data || null,
        message: json.message || (res.ok ? 'Startup service updated successfully.' : 'Failed to update startup service.'),
        errors: json.errors || null,
      };
    }
  } catch (err) {
    console.log('Admin update startup service error:', err);
  }
  return { ok: false, message: 'Could not connect to server.' };
}

/**
 * Reorder startup services via POST /api/admin/startup-services/reorder
 */
export async function reorderAdminStartupServices(token, orderIds) {
  try {
    const res = await fetchAdminWithFallback('/admin/startup-services/reorder', token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: orderIds }),
    });
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        message: json.message || 'Startup services reordered successfully.',
      };
    }
  } catch (err) {
    console.log('Admin reorder startup services error:', err);
  }
  return { ok: false, message: 'Could not connect to server.' };
}

/**
 * Delete a startup service via DELETE /api/admin/startup-services/{id}
 */
export async function deleteAdminStartupService(token, id) {
  try {
    const res = await fetchAdminWithFallback(`/admin/startup-services/${id}`, token, {
      method: 'DELETE',
    });
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        message: json.message || 'Startup service deleted successfully.',
      };
    }
  } catch (err) {
    console.log('Admin delete startup service error:', err);
  }
  return { ok: false, message: 'Could not delete startup service.' };
}

/**
 * Fetch Team Members via GET /api/admin/team-members
 */
export async function fetchAdminTeamMembers(token, options = {}) {
  try {
    const { section, search } = options;
    const params = new URLSearchParams();
    if (section && section !== 'all') params.append('section', section);
    if (search) params.append('search', search);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetchAdminWithFallback(`/admin/team-members${qs}`, token, {
      method: 'GET',
    });
    if (res) {
      const json = await res.json();
      if (res.ok && json.data) {
        return {
          ok: true,
          data: json.data.members || (Array.isArray(json.data) ? json.data : []),
          management: json.data.management || [],
          governing_board: json.data.governing_board || [],
          counts: json.data.counts || { all: 0, management: 0, governing_board: 0 },
        };
      }
      return {
        ok: false,
        data: [],
        management: [],
        governing_board: [],
        counts: { all: 0, management: 0, governing_board: 0 },
        message: json.message || 'Failed to load team members.',
      };
    }
  } catch (err) {
    console.log('Admin fetch team members error:', err);
  }
  return {
    ok: false,
    data: [],
    management: [],
    governing_board: [],
    counts: { all: 0, management: 0, governing_board: 0 },
    message: 'Could not connect to server.',
  };
}

/**
 * Fetch single team member via GET /api/admin/team-members/{id}
 */
export async function fetchAdminTeamMember(token, id) {
  try {
    const res = await fetchAdminWithFallback(`/admin/team-members/${id}`, token, {
      method: 'GET',
    });
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        data: json.data || null,
        message: json.message || '',
      };
    }
  } catch (err) {
    console.log('Admin fetch team member error:', err);
  }
  return { ok: false, data: null, message: 'Could not connect to server.' };
}

/**
 * Create team member via POST /api/admin/team-members
 */
export async function createAdminTeamMember(token, payload) {
  try {
    const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
    const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
    const body = isFormData ? payload : JSON.stringify(payload);

    const res = await fetchAdminWithFallback('/admin/team-members', token, {
      method: 'POST',
      headers,
      body,
    });
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        data: json.data || null,
        message: json.message || (res.ok ? 'Team member created successfully.' : 'Failed to create team member.'),
        errors: json.errors || null,
      };
    }
  } catch (err) {
    console.log('Admin create team member error:', err);
  }
  return { ok: false, message: 'Could not connect to server.' };
}

/**
 * Update team member via POST /api/admin/team-members/{id}
 */
export async function updateAdminTeamMember(token, id, payload) {
  try {
    const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
    const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
    const body = isFormData ? payload : JSON.stringify(payload);

    const res = await fetchAdminWithFallback(`/admin/team-members/${id}`, token, {
      method: 'POST',
      headers,
      body,
    });
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        data: json.data || null,
        message: json.message || (res.ok ? 'Team member updated successfully.' : 'Failed to update team member.'),
        errors: json.errors || null,
      };
    }
  } catch (err) {
    console.log('Admin update team member error:', err);
  }
  return { ok: false, message: 'Could not connect to server.' };
}

/**
 * Reorder team members via POST /api/admin/team-members/reorder
 */
export async function reorderAdminTeamMembers(token, orderIds) {
  try {
    const res = await fetchAdminWithFallback('/admin/team-members/reorder', token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: orderIds }),
    });
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        message: json.message || 'Team members reordered successfully.',
      };
    }
  } catch (err) {
    console.log('Admin reorder team members error:', err);
  }
  return { ok: false, message: 'Could not connect to server.' };
}

/**
 * Delete team member via DELETE /api/admin/team-members/{id}
 */
export async function deleteAdminTeamMember(token, id) {
  try {
    const res = await fetchAdminWithFallback(`/admin/team-members/${id}`, token, {
      method: 'DELETE',
    });
    if (res) {
      const json = await res.json();
      return {
        ok: res.ok,
        message: json.message || 'Team member deleted successfully.',
      };
    }
  } catch (err) {
    console.log('Admin delete team member error:', err);
  }
  return { ok: false, message: 'Could not delete team member.' };
}


// Embedded fallback data directly from live Laravel backend for 100% resilient rendering
export const FALLBACK_HOME_DATA = {
  landing_stats: [
    { id: 1, value: '500+', label: 'Angel Investors', sort_order: 1 },
    { id: 2, value: '$11.5M+', label: 'Capital Facilitated', sort_order: 2 },
    { id: 3, value: '54+', label: 'Portfolio Companies', sort_order: 3 },
  ],
  landing_programs: [
    {
      id: 1,
      title: 'BWIN',
      badge: 'Initiative',
      description: 'Building a more diverse pipeline of investors and entrepreneurs across Bangladesh.',
      link_url: '/bwin',
      link_label: 'Explore BWIN',
      theme: 'blush',
    },
    {
      id: 2,
      title: 'Angel Academy',
      badge: 'Education',
      description: 'Practical learning for aspiring and active angels—from first principles to investment committee.',
      link_url: '/angel-academy',
      link_label: 'Learn More',
      theme: 'dark',
    },
    {
      id: 4,
      title: 'Services',
      badge: 'Advisory',
      description: 'Empowering founders with the strategic guidance, resources, and connections they need to build and scale successful ventures.',
      link_url: '/startups',
      link_label: 'View Services',
      theme: 'mint',
      dropdown_items: {
        label: 'View Services',
        items: [
          { title: 'Founder Services', link: '/startups#our-services' },
          { title: 'Legal Services', link: '/startups#our-services' },
          { title: 'Deckvue (AI Due Diligence)', link: '/deckvue' },
        ],
      },
    },
  ],
  membership_tiers: [
    {
      id: 1,
      name: 'Core',
      slug: 'core',
      price_yearly: 399,
      price_formatted: '$399.00',
      is_highlighted: false,
      sort_order: 1,
      features_included: [
        'Complete deal access',
        'Data room access (with approval)',
        'Active deal participation',
        'Investment capabilities',
      ],
      features_excluded: [
        'Portfolio monitoring',
        'Full access to dataroom',
        'Full access of deal flows & showcases',
      ],
    },
    {
      id: 2,
      name: 'Advanced',
      slug: 'advanced',
      price_yearly: 599,
      price_formatted: '$599.00',
      is_highlighted: true,
      sort_order: 2,
      features_included: [
        'Complete Deal Access',
        'Full Access to Data Room',
        'Active Deal Participation',
        'Investment Capabilities',
        'Portfolio Monitoring',
        'Full access of Deal Flows & Showcases',
      ],
      features_excluded: [],
    },
    {
      id: 3,
      name: 'Institutional',
      slug: 'institutional',
      price_yearly: 999,
      price_formatted: '$999.00',
      is_highlighted: false,
      sort_order: 3,
      features_included: [
        'Complete Deal Access',
        'Full Access to Data Room',
        'Active Deal Participation',
        'Investment Capabilities',
        'Portfolio Monitoring',
        'Full access of Deal Flows & Showcases',
        '3-4 Additional Account access',
      ],
      features_excluded: [],
    },
  ],
  portfolio_deals: [
    {
      id: 36,
      title: 'Pathao',
      slug: 'pathao',
      sector: 'Mobility / Fintech',
      description: '2 & 4 Wheel ride-hailing, eCommerce logistics, food delivery, fintech (BNPL & e-Wallet)',
    },
    {
      id: 37,
      title: 'Priyoshop',
      slug: 'priyoshop',
      sector: 'B2B E-commerce',
      description: 'B2B Marketplace that connects retailers, manufacturers, suppliers, and distributors',
    },
    {
      id: 56,
      title: 'Jatri',
      slug: 'jatri',
      sector: 'TransportTech',
      description: 'Live bus tracking platform and transit ticketing automation across Dhaka',
    },
    {
      id: 43,
      title: 'Apon Well-being',
      slug: 'apon-well-being',
      sector: 'RetailTech',
      description: 'Pioneering retail q-commerce network for industrial workers in Bangladesh',
    },
    {
      id: 40,
      title: 'airwrk',
      slug: 'airwrk',
      sector: 'HRTech / Talent',
      description: 'Invite-only marketplace for tech talents getting access to remote jobs globally',
    },
    {
      id: 49,
      title: 'Bongo',
      slug: 'bongo',
      sector: 'MediaTech / OTT',
      description: 'OTT platform for Southeast Asian content, focusing on Bangla digital entertainment',
    },
    {
      id: 59,
      title: 'Praava Health',
      slug: 'praava-health',
      sector: 'Healthtech',
      description: 'Integrated pharmacy, outpatient clinic, and laboratory diagnostics for urban consumers',
    },
    {
      id: 46,
      title: 'MyAlice',
      slug: 'myalice',
      sector: 'SaaS / AI Chat',
      description: 'Chatbot aggregation across social media and communications channels for e-commerce',
    },
  ],
  team_members: [
    {
      id: 1,
      name: 'Ivy Huq Russell',
      title: 'CEO',
      linkedin_url: 'https://www.linkedin.com/in/ivy-huq-russell-417487/',
      photo_url: 'https://bdangels.co/storage/142/ivy.png',
    },
    {
      id: 2,
      name: 'Zaaim Zakir',
      title: 'Lead Deals Analyst',
      linkedin_url: 'https://www.linkedin.com/in/zaaim-zakir/',
      photo_url: 'https://bdangels.co/storage/143/Zaaim.JPG',
    },
    {
      id: 3,
      name: 'Rifat Ara Bonnhy',
      title: 'Strategic Partnerships Lead',
      linkedin_url: 'https://www.linkedin.com/in/bonnhy/',
      photo_url: 'https://bdangels.co/storage/142/ivy.png',
    },
    {
      id: 4,
      name: 'Nadim Abrar',
      title: 'Operations Analyst',
      linkedin_url: 'https://www.linkedin.com/in/nadim-abrar-26087721a/',
      photo_url: 'https://bdangels.co/storage/411/805958663_18195183343381467_1520729070359709064_n.jpg',
    },
    {
      id: 6,
      name: 'Prajna Paromita',
      title: 'Growth Analyst',
      linkedin_url: null,
      photo_url: 'https://bdangels.co/storage/147/Prajna.JPG',
    },
    {
      id: 7,
      name: 'Arham Ahmed',
      title: 'Seasonal Analyst',
      linkedin_url: 'https://www.linkedin.com/in/rhmhmd/',
      photo_url: 'https://bdangels.co/storage/428/WhatsApp-Image-2026-09-27-at-4.44.25%E2%80%AFPM.jpeg',
    },
    {
      id: 15,
      name: 'Tahmid Ferdous',
      title: 'Tech Analyst & Developer',
      linkedin_url: 'https://www.linkedin.com/in/tahmid-ferdous-7a66b8134/',
      photo_url: 'https://bdangels.co/storage/385/332877023_584876316897240_5530818755757307599_n.jpg',
    },
  ],
  landing_events: [
    {
      id: 2,
      title: 'BAN October Showcase',
      slug: 'ban-october-showcase',
      type: 'event',
      location: 'Online',
      date: '2026-10-10',
      time: '8:00 PM – 10:00 PM BST',
      description: 'Bangladesh Angels Network invites you to our upcoming Virtual Showcase, bringing together a curated cohort of high-potential startups to pitch directly to our community of investors and ecosystem partners.',
      cta_link: 'https://luma.com/udyjysop',
    },
  ],
  faqs: [
    {
      question: 'Who can invest with BAN?',
      paragraphs: [
        'BAN members are typically high-net-worth individuals, angel investors, family offices, and institutions with an interest in backing Bangladesh-linked startups.',
        'Bangladesh does not currently have an equivalent statutory definition of an accredited investor.',
        'BAN investment documents, including term sheets and shareholders agreements, are prepared within the applicable framework of the Companies Act, 1994.',
      ],
      bullets: [
        'Ordinary shares generally provide common ownership and voting rights.',
        'Convertible preference shares may include liquidation preference and anti-dilution protections.',
        'Investors may receive board director or observer representation for strategic guidance and oversight.',
        'A shareholders agreement defines governance and the rights and responsibilities of founders and investors.',
      ],
    },
    {
      question: 'How do you see exits happening in this sector?',
      paragraphs: [
        "Exit opportunities depend heavily on the company's jurisdiction and growth path. Some companies may redomicile to markets such as Singapore to access international capital, strategic buyers, and higher valuations.",
      ],
      bullets: [
        'A regional technology company may acquire or invest in the business to enter Bangladesh.',
        'An international venture-capital firm may provide liquidity to early investors during later rounds.',
        'A local conglomerate may invest in the company and purchase shares from early angels.',
        'An eligible company may eventually seek a public listing, including through the Dhaka Stock Exchange SME platform.',
      ],
      note: 'Exit timing and liquidity are never guaranteed, and not every company will be suitable for each route.',
    },
    {
      question: 'What is my security?',
      paragraphs: [
        'Startup investing is highly risky and there is no guarantee that invested capital will be returned.',
        'BAN focuses on the quality of the investment process: initial team screening, mentoring and observation, governing-board input, investor calls, structured data rooms, legal and financial due diligence, and tranche-based funding.',
      ],
    },
    {
      question: 'How does an NRB or foreigner invest and repatriate the money?',
      paragraphs: [
        "The recommended route is a direct bank-to-bank transfer from the investor's overseas account to the investee company's Bangladesh bank account, clearly designated as an equity investment. This creates the documentary trail required for share issuance and future repatriation.",
        'After receiving the funds, the local bank issues an encashment certificate. Unofficial channels such as hundi should never be used.',
      ],
      bullets: [
        'Capital gains up to BDT 10 crore may be repatriated without direct central-bank approval, subject to current documentation.',
        'Proceeds from listed shares may be handled through a Non-Resident Investors Taka Account (NITA).',
        'Investors remain responsible for reporting foreign shareholdings and gains in their home jurisdiction.',
      ],
    },
    {
      question: 'Are startups registered in the US, and do syndicates issue K-1 tax forms for US investors?',
      paragraphs: [
        'Most BAN portfolio companies have historically been registered in Bangladesh or Singapore. Delaware and US incorporation is becoming more common for SaaS businesses.',
        'When a US SPV is used, BAN explains ongoing administration and any applicable K-1 tax reporting before the deal proceeds.',
      ],
    },
  ],
};

const fetchWithTimeout = async (url, options = {}, timeout = 6000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export const FALLBACK_GOVERNING_BOARD = [
  {
    id: 9,
    name: 'Sajid Rahman',
    title: 'Chief Executive',
    subtitle: 'Telenor Health AS',
    linkedin_url: 'https://www.linkedin.com/in/rahmansajid/',
    photo_url: 'https://bdangels.co/storage/150/sajid.png',
  },
  {
    id: 10,
    name: 'Samad Miraly',
    title: 'Co Founder',
    subtitle: 'Startup Dhaka',
    linkedin_url: 'https://www.linkedin.com/in/miraly/',
    photo_url: 'https://bdangels.co/storage/151/samad.png',
  },
  {
    id: 11,
    name: 'Minhaz Anwar',
    title: 'Chief Storyteller',
    subtitle: 'Better Stories',
    linkedin_url: 'https://www.linkedin.com/in/minhazanwar/',
    photo_url: 'https://bdangels.co/storage/152/minhaz.png',
  },
  {
    id: 12,
    name: 'Tina Jabeen',
    title: 'Investment Advisor',
    subtitle: 'Startup Bangladesh',
    linkedin_url: 'https://www.linkedin.com/in/tinajabeen/',
    photo_url: 'https://bdangels.co/storage/153/tina.png',
  },
  {
    id: 13,
    name: 'Sanchayan Chakraborty',
    title: 'Partner',
    subtitle: 'Aavishkaar Capital',
    linkedin_url: 'https://www.linkedin.com/in/sanchayan-chakraborty-5353105/',
    photo_url: 'https://bdangels.co/storage/154/sanchayan.png',
  },
];

/**
 * Fetch combined homepage bundle from /api/home and /api/team with robust fallback
 */
export async function fetchHomePageData() {
  try {
    const [homeRes, teamRes] = await Promise.allSettled([
      fetchWithTimeout(`${API_BASE_URL}/home`, { headers: { Accept: 'application/json' } }, 7000),
      fetchWithTimeout(`${API_BASE_URL}/team`, { headers: { Accept: 'application/json' } }, 7000),
    ]);

    let homeData = null;
    if (homeRes.status === 'fulfilled' && homeRes.value.ok) {
      const json = await homeRes.value.json();
      homeData = json.data || json;
    }

    let teamData = null;
    if (teamRes.status === 'fulfilled' && teamRes.value.ok) {
      const json = await teamRes.value.json();
      teamData = json.data || json;
    }

    // Resolve team members: prefer dedicated /team endpoint management array, then /home, then fallback
    let resolvedTeam = FALLBACK_HOME_DATA.team_members;
    if (teamData?.management && Array.isArray(teamData.management) && teamData.management.length > 0) {
      resolvedTeam = sanitizeTeam(teamData.management);
    } else if (homeData?.team_members && Array.isArray(homeData.team_members) && homeData.team_members.length > 0) {
      resolvedTeam = sanitizeTeam(homeData.team_members);
    }

    if (homeData) {
      return {
        stats: normalizeStats(homeData.landing_stats),
        programs: (homeData.landing_programs && homeData.landing_programs.length > 0)
          ? homeData.landing_programs
          : FALLBACK_HOME_DATA.landing_programs,
        membershipTiers: (homeData.membership_tiers && homeData.membership_tiers.length > 0)
          ? homeData.membership_tiers
          : FALLBACK_HOME_DATA.membership_tiers,
        portfolioDeals: (homeData.portfolio_deals && homeData.portfolio_deals.length > 0)
          ? sanitizeDeals(homeData.portfolio_deals)
          : FALLBACK_HOME_DATA.portfolio_deals,
        teamMembers: resolvedTeam,
        events: (homeData.landing_events && homeData.landing_events.length > 0)
          ? sanitizeEvents(homeData.landing_events)
          : FALLBACK_HOME_DATA.landing_events,
        faqs: (homeData.faqs && homeData.faqs.length > 0)
          ? homeData.faqs
          : FALLBACK_HOME_DATA.faqs,
      };
    }

    // Even if /home timed out, if /team succeeded, return team members immediately!
    return {
      stats: FALLBACK_HOME_DATA.landing_stats,
      programs: FALLBACK_HOME_DATA.landing_programs,
      membershipTiers: FALLBACK_HOME_DATA.membership_tiers,
      portfolioDeals: FALLBACK_HOME_DATA.portfolio_deals,
      teamMembers: resolvedTeam,
      events: FALLBACK_HOME_DATA.landing_events,
      faqs: FALLBACK_HOME_DATA.faqs,
    };
  } catch (err) {
    console.log('[API] /home network note:', err.message);
  }

  return {
    stats: FALLBACK_HOME_DATA.landing_stats,
    programs: FALLBACK_HOME_DATA.landing_programs,
    membershipTiers: FALLBACK_HOME_DATA.membership_tiers,
    portfolioDeals: FALLBACK_HOME_DATA.portfolio_deals,
    teamMembers: FALLBACK_HOME_DATA.team_members,
    events: FALLBACK_HOME_DATA.landing_events,
    faqs: FALLBACK_HOME_DATA.faqs,
  };
}

function sanitizeDeals(deals) {
  return deals.map((d) => ({
    ...d,
    logo_url: normalizeImageUrl(d.logo_url),
    cover_url: normalizeImageUrl(d.cover_url),
  }));
}

function sanitizeTeam(team) {
  return team.map((m) => ({
    ...m,
    photo_url: normalizeImageUrl(m.photo_url),
  }));
}

function sanitizeEvents(events) {
  return events.map((e) => ({
    ...e,
    banner_url: normalizeImageUrl(e.banner_url),
  }));
}

function normalizeStats(stats) {
  if (!stats || !stats.length) return FALLBACK_HOME_DATA.landing_stats;
  return stats.map((s, idx) => {
    const val = s.value || s.stat_value;
    const lbl = s.label || s.stat_label;
    if (val && lbl) {
      return { id: s.id || idx, value: val, label: lbl.replace(/\r\n/g, ' ') };
    }
    return FALLBACK_HOME_DATA.landing_stats[idx] || s;
  });
}

/**
 * Submit founder pitch deck to POST /api/pitch
 */
export async function submitFounderPitch({ email, oneLine, file }) {
  const targetUrl = `${API_BASE_URL}/pitch`;

  // 1. Native platform (Android / iOS): Use FileSystem.uploadAsync
  // This bypasses React Native C++ FormDataPart restrictions completely and streams natively via OkHttp / NSURLSession.
  if (Platform.OS !== 'web' && file?.uri) {
    try {
      const uploadRes = await FileSystem.uploadAsync(targetUrl, file.uri, {
        fieldName: 'pitch_deck',
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        mimeType: file.mimeType || 'application/pdf',
        parameters: {
          contact_email: email,
          one_line: oneLine,
        },
        headers: {
          Accept: 'application/json',
        },
      });

      let json = {};
      try {
        json = JSON.parse(uploadRes.body);
      } catch {
        json = { message: uploadRes.body };
      }

      if (uploadRes.status >= 200 && uploadRes.status < 300) {
        return json;
      }

      const errorMsg =
        json?.message ||
        (json?.errors ? Object.values(json.errors).flat().join(' ') : null) ||
        `Submission failed (status ${uploadRes.status})`;
      throw new Error(errorMsg);
    } catch (err) {
      // If server returned a clear validation error or status, rethrow it directly
      if (err.message && (err.message.includes('pitch deck') || err.message.includes('Submission failed') || err.message.includes('status'))) {
        throw err;
      }
      console.log('FileSystem upload error, falling back to Blob:', err);
    }
  }

  // 2. Web or fallback: Modern WHATWG Blob-based FormData
  const formData = new FormData();
  formData.append('contact_email', email);
  formData.append('one_line', oneLine);

  if (file) {
    if (file instanceof Blob || (typeof File !== 'undefined' && file instanceof File)) {
      formData.append('pitch_deck', file, file.name || 'pitch-deck.pdf');
    } else if (file.uri) {
      try {
        const fileRes = await fetch(file.uri);
        const blob = await fileRes.blob();
        formData.append('pitch_deck', blob, file.name || 'pitch-deck.pdf');
      } catch {
        formData.append('pitch_deck', {
          uri: file.uri,
          name: file.name || 'pitch-deck.pdf',
          type: file.mimeType || 'application/pdf',
        });
      }
    }
  }

  const response = await fetch(targetUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body: formData,
  });

  const result = await response.json();
  if (!response.ok) {
    const errorMsg =
      result?.message ||
      (result?.errors ? Object.values(result.errors).flat().join(' ') : 'Submission failed');
    throw new Error(errorMsg);
  }

  return result;
}

/**
 * Fetch portfolio deals from GET /api/portfolio
 */
export async function fetchPortfolioPageData() {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/portfolio`, {
      headers: { Accept: 'application/json' },
    }, 7000);
    if (res.ok) {
      const json = await res.json();
      const deals = json.data || json;
      if (Array.isArray(deals) && deals.length > 0) {
        return sanitizeDeals(deals);
      }
    }
  } catch (err) {
    console.log('Portfolio fetch fallback notice:', err);
  }
  return sanitizeDeals(FALLBACK_HOME_DATA.portfolio_deals);
}

/**
 * Fetch team members from GET /api/team
 */
export async function fetchTeamPageData() {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/team`, {
      headers: { Accept: 'application/json' },
    }, 7000);
    if (res.ok) {
      const json = await res.json();
      const data = json.data || json;
      if (data) {
        return {
          management: (Array.isArray(data.management) && data.management.length > 0)
            ? sanitizeTeam(data.management)
            : FALLBACK_HOME_DATA.team_members,
          governingBoard: (Array.isArray(data.governing_board) && data.governing_board.length > 0)
            ? sanitizeTeam(data.governing_board)
            : sanitizeTeam(FALLBACK_GOVERNING_BOARD),
          aboutSection: data.about_section || null,
        };
      }
    }
  } catch (err) {
    console.log('Team fetch fallback notice:', err);
  }
  return {
    management: FALLBACK_HOME_DATA.team_members,
    governingBoard: sanitizeTeam(FALLBACK_GOVERNING_BOARD),
    aboutSection: {
      kicker: 'About Bangladesh Angels Network',
      heading: 'What is Bangladesh Angels Network?',
      body: 'BAN is the country\'s first and largest angel-investing platform, connecting visionary entrepreneurs with seasoned investors and fostering an ecosystem that drives innovation and economic growth. With more than $12 million invested across 50+ startups, we combine capital with mentorship, strategic guidance, and meaningful connections.',
      image_badge: 'Capital. Community. Conviction.',
    },
  };
}

/**
 * Fetch membership plans from GET /api/plans
 */
export async function fetchPlansPageData() {
  try {
    const res = await fetch(`${API_BASE_URL}/plans`);
    if (res.ok) {
      const json = await res.json();
      const data = json.data || json;
      if (data?.tiers && Array.isArray(data.tiers)) {
        return data.tiers;
      }
    }
  } catch (err) {
    console.log('Plans fetch fallback notice:', err);
  }
  return FALLBACK_HOME_DATA.membership_tiers;
}

/**
 * Fetch FAQs from GET /api/faq
 */
export async function fetchFaqsPageData() {
  try {
    const res = await fetch(`${API_BASE_URL}/faq`);
    if (res.ok) {
      const json = await res.json();
      const data = json.data || json;
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.log('FAQ fetch fallback notice:', err);
  }
  return FALLBACK_HOME_DATA.faqs;
}

/**
 * Fetch Services & What We Do from GET /api/services
 */
export async function fetchServicesPageData() {
  try {
    const res = await fetch(`${API_BASE_URL}/services`);
    if (res.ok) {
      const json = await res.json();
      const data = json.data || json;
      if (data) return data;
    }
  } catch (err) {
    console.log('Services fetch notice:', err);
  }
  return {
    services: [
      { id: 1, title: 'Founder Services', description: 'Pitch deck review, financial modeling guidance, and investor readiness advisory.', cta_label: 'Learn More', cta_url: '/startups' },
      { id: 2, title: 'Legal Services', description: 'Term sheet review, cap table hygiene, and transaction document assistance.', cta_label: 'Learn More', cta_url: '/startups' },
      { id: 3, title: 'DeckVue (AI Due Diligence)', description: 'AI-assisted pitch deck analysis and instant market intel enrichment.', cta_label: 'Explore DeckVue', cta_url: '/deckvue' },
    ],
  };
}

/**
 * Calculate estimated reading time in minutes
 */
export function calculateReadingTime(content, excerpt = '') {
  const text = (content || excerpt || '').replace(/<[^>]*>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

/**
 * Fetch Blogs from GET /api/blogs
 */
export async function fetchBlogsPageData(search = '', category = '') {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category && category !== 'All') params.append('category', category);
    const url = `${API_BASE_URL}/blogs${params.toString() ? '?' + params.toString() : ''}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (res.ok) {
      const json = await res.json();
      const data = json.data || json;
      if (data && data.blogs) {
        return data;
      }
    }
  } catch (err) {
    console.log('Blogs fetch notice:', err);
  }
  // Curated ecosystem insights fallback (using Nadim's actual blog as primary)
  return {
    blogs: {
      data: [
        {
          id: 7,
          title: 'Bangladesh Makes It Easier for Foreign Investors to Repatriate. How startups can benefit from this.',
          slug: 'bangladesh-makes-it-easier-for-foreign-investors-to-repatriate-how-startups-can-benefit-from-this-2',
          excerpt: 'Analysis of Bangladesh Bank FEID Circular No. 01 on transfer of shares and repatriation of sale proceeds of shares for non-residents.',
          category: 'Educational',
          author_name: 'Nadim Abrar',
          author_role: 'Operations Analyst',
          author_organization: 'Bangladesh Angels Network',
          published_at: '2026-10-04T22:39:00.000000Z',
        },
      ],
      total: 1,
    },
    categories: [
      { category: 'Educational', posts_count: 1 },
    ],
  };
}

/**
 * Fetch single blog post by slug
 */
export async function fetchBlogBySlug(slug) {
  try {
    const res = await fetch(`${API_BASE_URL}/blogs/${slug}`, {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data?.blog) {
        return {
          ...json.data.blog,
          recent_blogs: json.data.recent_blogs || [],
          categories: json.data.categories || [],
        };
      }
      if (json.data) return json.data;
    }
  } catch (err) {
    console.log('Blog detail fetch notice:', err);
  }
  const all = await fetchBlogsPageData();
  return (
    all.blogs?.data?.find((b) => b.slug === slug || String(b.id) === String(slug)) ||
    all.blogs?.data?.[0]
  );
}

/**
 * Fetch Publications from GET /api/publications
 */
export async function fetchPublicationsPageData() {
  try {
    const res = await fetch(`${API_BASE_URL}/publications`);
    if (res.ok) {
      const json = await res.json();
      const data = json.data || json;
      if (data?.publications?.data && data.publications.data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.log('Publications fetch notice:', err);
  }
  return {
    publications: {
      data: [
        {
          id: 1,
          title: 'Bangladesh Startup Ecosystem Report 2024–2025',
          category: 'Market Research',
          excerpt: 'Comprehensive data on seed funding, deal sizes, active sectors, and exit horizons across Bangladesh.',
          published_at: '2025-01-15T00:00:00Z',
          download_url: 'https://bdangels.co/reports/ecosystem-2025.pdf',
        },
        {
          id: 2,
          title: 'Angel Investing in Bangladesh: A Legal & Regulatory Handbook',
          category: 'Legal Guide',
          excerpt: 'RJSC filings, foreign currency inward remittances, SPV formations, and investor rights overview.',
          published_at: '2024-11-20T00:00:00Z',
          download_url: 'https://bdangels.co/reports/legal-handbook.pdf',
        },
      ],
    },
    categories: [
      { category: 'Market Research', publications_count: 1 },
      { category: 'Legal Guide', publications_count: 1 },
    ],
  };
}
