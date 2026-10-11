import { Platform } from 'react-native';
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
  const formData = new FormData();
  formData.append('contact_email', email);
  formData.append('one_line', oneLine);

  if (file) {
    formData.append('pitch_deck', {
      uri: file.uri,
      name: file.name || 'pitch-deck.pdf',
      type: file.mimeType || 'application/pdf',
    });
  }

  const response = await fetch(`${API_BASE_URL}/pitch`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body: formData,
  });

  const result = await response.json();
  if (!response.ok) {
    const errorMsg = result?.message || (result?.errors ? Object.values(result.errors).flat().join(' ') : 'Submission failed');
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
 * Fetch Blogs from GET /api/blogs
 */
export async function fetchBlogsPageData(search = '', category = '') {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    const url = `${API_BASE_URL}/blogs${params.toString() ? '?' + params.toString() : ''}`;
    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      const data = json.data || json;
      if (data?.blogs?.data && data.blogs.data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.log('Blogs fetch notice:', err);
  }
  // Curated ecosystem insights fallback
  return {
    blogs: {
      data: [
        {
          id: 1,
          title: 'The Angel Investor Landscape in Bangladesh: 2025 and Beyond',
          slug: 'angel-investor-landscape-bangladesh',
          excerpt: 'How local syndicates, female angel networks, and overseas diaspora are reshaping seed capital in Dhaka.',
          category: 'Ecosystem',
          published_at: '2025-02-15T10:00:00Z',
          reading_time: '5 min read',
          author: 'Bangladesh Angels Team',
        },
        {
          id: 2,
          title: 'Understanding Term Sheets & SAFE Agreements in Frontier Markets',
          slug: 'understanding-term-sheets-bangladesh',
          excerpt: 'A practical guide for early-stage founders navigating equity, convertible notes, and governance.',
          category: 'Investment',
          published_at: '2025-01-20T10:00:00Z',
          reading_time: '7 min read',
          author: 'Zaaim Zakir',
        },
        {
          id: 3,
          title: 'Why We Backed Jatri, Pathao & Priyoshop: Operator Insights',
          slug: 'why-we-backed-jatri-pathao-priyoshop',
          excerpt: 'Key metrics, market conviction, and team resilience lessons from BAN’s fastest-scaling portfolio companies.',
          category: 'Portfolio',
          published_at: '2024-12-10T10:00:00Z',
          reading_time: '6 min read',
          author: 'Ivy Huq Russell',
        },
      ],
    },
    categories: [
      { category: 'Ecosystem', posts_count: 1 },
      { category: 'Investment', posts_count: 1 },
      { category: 'Portfolio', posts_count: 1 },
    ],
  };
}

/**
 * Fetch single blog post by slug
 */
export async function fetchBlogBySlug(slug) {
  try {
    const res = await fetch(`${API_BASE_URL}/blogs/${slug}`);
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch (err) {
    console.log('Blog detail fetch notice:', err);
  }
  const all = await fetchBlogsPageData();
  return all.blogs.data.find((b) => b.slug === slug) || all.blogs.data[0];
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
