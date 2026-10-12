import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
  Modal,
  Image,
  Linking,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Colors, Radii, Shadows } from '../constants/theme';
import { initAuth, logoutUser } from '../services/auth';
import AdminSidebar from '../components/admin/AdminSidebar';
import BlogContentRenderer from '../components/BlogContentRenderer';
import {
  fetchAdminDashboard,
  fetchAdminMembers,
  createAdminMember,
  approveAdminMember,
  updateAdminMemberStatus,
  updateAdminMemberMode,
  updateAdminMember,
  deleteAdminMember,
  verifyAdminMemberEmail,
  fetchAdminDeals,
  fetchAdminFounderPitches,
  fetchAdminAngelAcademy,
  fetchAdminNotifications,
  markAdminNotificationsViewed,
  fetchAdminSubscriptions,
  fetchAdminInvestorInvestments,
  fetchAdminBanWealthOrders,
  fetchHomePageData,
  fetchBlogsPageData,
  fetchAdminBlogs,
  createAdminBlog,
  updateAdminBlog,
  updateAdminBlogStatus,
  deleteAdminBlog,
  fetchAdminPublications,
  createAdminPublication,
  updateAdminPublication,
  updateAdminPublicationStatus,
  deleteAdminPublication,
  fetchPublicationsPageData,
  fetchTeamPageData,
  fetchAdminLandingPageStats,
  updateAdminLandingPageStats,
  fetchAdminLandingProgramCards,
  createAdminLandingProgramCard,
  updateAdminLandingProgramCard,
  deleteAdminLandingProgramCard,
  fetchAdminHomepagePortfolios,
  addAdminHomepagePortfolio,
  reorderAdminHomepagePortfolios,
  deleteAdminHomepagePortfolio,
  syncAdminHomepagePortfolios,
  fetchAdminTeamAboutSection,
  updateAdminTeamAboutSection,
  fetchAdminEvents,
  createAdminEvent,
  updateAdminEvent,
  deleteAdminEvent,
  fetchAdminStartupServices,
  createAdminStartupService,
  updateAdminStartupService,
  reorderAdminStartupServices,
  deleteAdminStartupService,
  fetchAdminTeamMembers,
  createAdminTeamMember,
  updateAdminTeamMember,
  reorderAdminTeamMembers,
  deleteAdminTeamMember,
} from '../services/api';

export function getViewDisplayName(key) {
  switch (key) {
    case 'overview':
      return 'Platform Overview';
    case 'notifications':
      return 'Activity Notifications';
    case 'members':
      return 'Member Directory';
    case 'deals':
      return 'Deal Pipeline';
    case 'founder-pitches':
      return 'Pitch Submissions';
    case 'angel-academy':
      return 'Academy Applications';
    case 'subscriptions':
      return 'Member Subscriptions';
    case 'investments':
    case 'investor-investments':
      return 'Completed Investments';
    case 'blogs':
      return 'Editorial Blogs';
    case 'publications':
      return 'Research Publications';
    case 'landing-stats':
      return 'Homepage Statistics';
    case 'landing-programs':
      return 'Homepage Programs';
    case 'homepage-portfolios':
      return 'Homepage Portfolios';
    case 'team-about':
      return 'Team About Section';
    case 'events':
      return 'Community Events';
    case 'startup-services':
      return 'Startup Services';
    case 'team-members':
      return 'Team Directory';
    case 'ban-wealth-orders':
      return 'BAN Wealth Orders';
    case 'mail-campaigns':
      return 'Email Campaigns';
    default:
      return 'Admin Workspace';
  }
}

const COUNTRIES_LIST = [
  'Bangladesh',
  'United States',
  'United Kingdom',
  'Singapore',
  'Canada',
  'India',
  'United Arab Emirates',
  'Australia',
  'Malaysia',
  'Germany',
  'Saudi Arabia',
  'Japan',
  'Other',
];

const BLOG_CATEGORIES = [
  'Educational',
  'Announcement',
  'Media appearances',
  'Investment',
  'Misc',
];

const PUBLICATION_CATEGORIES = [
  'Research',
  'Market report',
  'Founder guide',
  'Investment education',
  'Annual report',
  'Misc',
];

const PROGRAM_THEMES = [
  { value: 'blush', label: 'Blush', bg: '#FFF8FB', border: '#FBCFE8', text: '#831843', pill: '#FDF2F8', dot: '#F472B6' },
  { value: 'dark', label: 'Dark green', bg: '#042F2E', border: '#0D5B52', text: '#FFFFFF', pill: '#064E3B', dot: '#10B981' },
  { value: 'mint', label: 'Mint', bg: '#DFF4EB', border: '#A7F3D0', text: '#065F46', pill: '#ECFDF5', dot: '#34D399' },
  { value: 'sand', label: 'Sand', bg: '#F4ECD9', border: '#E5D5B8', text: '#78350F', pill: '#FEFCE8', dot: '#FBBF24' },
  { value: 'white', label: 'White', bg: '#FFFFFF', border: '#CBD5E1', text: '#0F172A', pill: '#F8FAFC', dot: '#94A3B8' },
];

export default function AdminScreen() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Sidebar Visibility
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Dashboard Data
  const [dashboardData, setDashboardData] = useState(null);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState('all'); // 'all' | 'unread'

  // Subscriptions State
  const [subscriptionsData, setSubscriptionsData] = useState(null);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);

  // Investor Investments State
  const [investorInvestments, setInvestorInvestments] = useState([]);
  const [investorInvestmentsLoading, setInvestorInvestmentsLoading] = useState(false);

  // BAN Wealth Orders State
  const [banWealthOrders, setBanWealthOrders] = useState([]);
  const [banWealthOrdersLoading, setBanWealthOrdersLoading] = useState(false);

  // CMS Content State
  const [, setCmsData] = useState(null);
  const [, setCmsLoading] = useState(false);

  // Members Tab State
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberStatusFilter, setMemberStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive' | 'pending' | 'featured'
  const [memberCounts, setMemberCounts] = useState({ all: 0, active: 0, inactive: 0, pending: 0, featured: 0 });
  const [memberPagination, setMemberPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 15,
    from: 1,
    to: 15,
  });
  const [approvingUserId, setApprovingUserId] = useState(null);
  const [verifyingEmailUserId, setVerifyingEmailUserId] = useState(null);
  const [updatingTierUserId, setUpdatingTierUserId] = useState(null);
  const [updatingModeUserId, setUpdatingModeUserId] = useState(null);

  // Status Tier Modal State
  const [tierModalVisible, setTierModalVisible] = useState(false);
  const [selectedMemberForTier, setSelectedMemberForTier] = useState(null);

  // Mode Confirmation Modal State
  const [modeModalVisible, setModeModalVisible] = useState(false);
  const [selectedMemberForMode, setSelectedMemberForMode] = useState(null);
  const [targetMode, setTargetMode] = useState('active');
  const [isModeUpdating, setIsModeUpdating] = useState(false);

  // Delete Member Modal State
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedMemberForDelete, setSelectedMemberForDelete] = useState(null);
  const [isDeletingMember, setIsDeletingMember] = useState(false);

  // Edit Member Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'male',
    primary_country: 'Bangladesh',
    organization: '',
    designation: '',
    preference_sector: '',
    role: 'investor',
    account_status: 'free',
    status: 'active',
    password: '',
  });
  const [editSaving, setEditSaving] = useState(false);

  // Add Member Modal State
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addSaving, setAddSaving] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    gender: 'male',
    primary_country: 'Bangladesh',
    organization: '',
    designation: '',
    address: '',
    preference_sector: '',
    account_status: 'free',
    status: 'active',
    role: 'investor',
    is_approved: true,
    verify_email: true,
  });

  // Deals Tab State
  const [deals, setDeals] = useState([]);
  const [dealsLoading, setDealsLoading] = useState(false);
  const [dealSearch, setDealSearch] = useState('');
  const [dealTypeFilter, setDealTypeFilter] = useState('all');

  // Submissions Tab State
  const [submissionsSubTab, setSubmissionsSubTab] = useState('pitches'); // 'pitches' | 'academy'
  const [founderPitches, setFounderPitches] = useState([]);
  const [academyApplications, setAcademyApplications] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  // Blogs Tab State
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [blogSearch, setBlogSearch] = useState('');
  const [blogStatusFilter, setBlogStatusFilter] = useState('all'); // 'all' | 'published' | 'archived'
  const [blogCounts, setBlogCounts] = useState({ all: 0, published: 0, archived: 0 });
  const [blogPagination, setBlogPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 15,
    from: 0,
    to: 0,
  });

  // Blog Modals
  const [viewBlogModalVisible, setViewBlogModalVisible] = useState(false);
  const [selectedBlogForView, setSelectedBlogForView] = useState(null);

  const [createBlogModalVisible, setCreateBlogModalVisible] = useState(false);
  const [editBlogModalVisible, setEditBlogModalVisible] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [blogSaving, setBlogSaving] = useState(false);
  const [blogFormData, setBlogFormData] = useState({
    title: '',
    slug: '',
    category: 'Educational',
    excerpt: '',
    content: '',
    author_name: '',
    author_role: '',
    author_organization: 'Bangladesh Angels Network',
    status: 'published',
    published_at: '',
  });

  const [deleteBlogModalVisible, setDeleteBlogModalVisible] = useState(false);
  const [selectedBlogForDelete, setSelectedBlogForDelete] = useState(null);
  const [isDeletingBlog, setIsDeletingBlog] = useState(false);
  const [updatingBlogStatusId, setUpdatingBlogStatusId] = useState(null);

  // Blog Rich Content Editor States
  const [blogEditorMode, setBlogEditorMode] = useState('editor'); // 'editor' | 'preview'
  const [editorSelection, setEditorSelection] = useState({ start: 0, end: 0 });
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [linkFormData, setLinkFormData] = useState({ url: 'https://', text: '' });

  // Publications Tab State
  const [publications, setPublications] = useState([]);
  const [publicationsLoading, setPublicationsLoading] = useState(false);
  const [publicationSearch, setPublicationSearch] = useState('');
  const [publicationStatusFilter, setPublicationStatusFilter] = useState('all'); // 'all' | 'published' | 'archived'
  const [publicationCounts, setPublicationCounts] = useState({ all: 0, published: 0, archived: 0 });
  const [publicationPagination, setPublicationPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 15,
    from: 0,
    to: 0,
  });

  // Publication Modals
  const [viewPublicationModalVisible, setViewPublicationModalVisible] = useState(false);
  const [selectedPublicationForView, setSelectedPublicationForView] = useState(null);

  const [createPublicationModalVisible, setCreatePublicationModalVisible] = useState(false);
  const [editPublicationModalVisible, setEditPublicationModalVisible] = useState(false);
  const [editingPublication, setEditingPublication] = useState(null);
  const [publicationSaving, setPublicationSaving] = useState(false);
  const [publicationFormData, setPublicationFormData] = useState({
    title: '',
    category: 'Research',
    excerpt: '',
    pdf_original_name: '',
    pdf_path: '',
    status: 'published',
    published_at: '',
  });
  const [publicationPdfFile, setPublicationPdfFile] = useState(null);

  const [deletePublicationModalVisible, setDeletePublicationModalVisible] = useState(false);
  const [selectedPublicationForDelete, setSelectedPublicationForDelete] = useState(null);
  const [isDeletingPublication, setIsDeletingPublication] = useState(false);
  const [updatingPublicationStatusId, setUpdatingPublicationStatusId] = useState(null);

  // Homepage Statistics State
  const [landingPageStats, setLandingPageStats] = useState([
    { id: 1, value: '500+', label: 'Angel\ninvestors', sort_order: 1 },
    { id: 2, value: '$12M+', label: 'Capital facilitated', sort_order: 2 },
    { id: 3, value: '51', label: 'Portfolio companies', sort_order: 3 },
  ]);
  const [originalLandingPageStats, setOriginalLandingPageStats] = useState([
    { id: 1, value: '500+', label: 'Angel\ninvestors', sort_order: 1 },
    { id: 2, value: '$12M+', label: 'Capital facilitated', sort_order: 2 },
    { id: 3, value: '51', label: 'Portfolio companies', sort_order: 3 },
  ]);
  const [landingPageStatsLoading, setLandingPageStatsLoading] = useState(false);
  const [landingPageStatsSaving, setLandingPageStatsSaving] = useState(false);

  // Homepage Programs State
  const [landingPrograms, setLandingPrograms] = useState([]);
  const [landingProgramsLoading, setLandingProgramsLoading] = useState(false);
  const [createProgramModalVisible, setCreateProgramModalVisible] = useState(false);
  const [editProgramModalVisible, setEditProgramModalVisible] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [programSaving, setProgramSaving] = useState(false);
  const [deleteProgramModalVisible, setDeleteProgramModalVisible] = useState(false);
  const [selectedProgramForDelete, setSelectedProgramForDelete] = useState(null);
  const [isDeletingProgram, setIsDeletingProgram] = useState(false);
  const [programFormData, setProgramFormData] = useState({
    title: '',
    eyebrow: '',
    description: '',
    primary_label: '',
    primary_link: '',
    secondary_label: '',
    secondary_link: '',
    theme: 'white',
    sort_order: '',
    dropdown_label: '',
    dropdown_items: [
      { title: '', link: '' },
      { title: '', link: '' },
    ],
  });

  // Homepage Selected Portfolios State
  const [homepagePortfolios, setHomepagePortfolios] = useState([]);
  const [homepagePortfoliosLoading, setHomepagePortfoliosLoading] = useState(false);
  const [allPortfolioDeals, setAllPortfolioDeals] = useState([]);
  const [addPortfolioModalVisible, setAddPortfolioModalVisible] = useState(false);
  const [selectedDealToAdd, setSelectedDealToAdd] = useState(null);
  const [addPortfolioSearch, setAddPortfolioSearch] = useState('');
  const [portfolioSaving, setPortfolioSaving] = useState(false);
  const [batchPortfolioModalVisible, setBatchPortfolioModalVisible] = useState(false);
  const [batchSelectedDealIds, setBatchSelectedDealIds] = useState([]);
  const [batchSearch, setBatchSearch] = useState('');
  const [deletePortfolioModalVisible, setDeletePortfolioModalVisible] = useState(false);
  const [selectedPortfolioForDelete, setSelectedPortfolioForDelete] = useState(null);
  const [isDeletingPortfolio, setIsDeletingPortfolio] = useState(false);
  const [clearAllPortfoliosModalVisible, setClearAllPortfoliosModalVisible] = useState(false);
  const [isClearingAllPortfolios, setIsClearingAllPortfolios] = useState(false);

  // Team About Section State
  const [teamAboutData, setTeamAboutData] = useState(null);
  const [teamAboutLoading, setTeamAboutLoading] = useState(false);
  const [teamAboutSaving, setTeamAboutSaving] = useState(false);
  const [editTeamAboutModalVisible, setEditTeamAboutModalVisible] = useState(false);
  const [teamAboutForm, setTeamAboutForm] = useState({
    kicker: '',
    heading: '',
    body_text: '',
    image_alt: '',
    image_badge: '',
    image_file: null,
    remove_image: false,
  });

  // Community Events State
  const [eventsList, setEventsList] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsSaving, setEventsSaving] = useState(false);
  const [eventsSearch, setEventsSearch] = useState('');
  const [eventsTypeFilter, setEventsTypeFilter] = useState('all'); // 'all', 'event', 'webinar'
  const [eventsLandingFilter, setEventsLandingFilter] = useState('all'); // 'all', '1'
  const [eventsCounts, setEventsCounts] = useState({ all: 0, events: 0, webinars: 0, landing: 0 });
  const [eventsPagination, setEventsPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 20,
  });
  const [selectedEventForView, setSelectedEventForView] = useState(null);
  const [viewEventModalVisible, setViewEventModalVisible] = useState(false);
  const [createEventModalVisible, setCreateEventModalVisible] = useState(false);
  const [editEventModalVisible, setEditEventModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteEventModalVisible, setDeleteEventModalVisible] = useState(false);
  const [selectedEventForDelete, setSelectedEventForDelete] = useState(null);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);

  const [eventFormData, setEventFormData] = useState({
    title: '',
    type: 'event',
    location: '',
    date: '',
    start_time: '',
    end_time: '',
    registration_fee: '',
    description: '',
    registration_details: '',
    cta_link: '',
    show_on_landing: false,
    benefits: [''],
    event_highlights: [''],
    target_audience: [''],
    speakers: [{ name: '', designation: '' }],
    banner_file: null,
    remove_banner: false,
  });

  // Startup Services State
  const [startupServicesList, setStartupServicesList] = useState([]);
  const [startupServicesLoading, setStartupServicesLoading] = useState(false);
  const [startupServicesSaving, setStartupServicesSaving] = useState(false);
  const [startupServicesSearch, setStartupServicesSearch] = useState('');
  const [selectedStartupServiceForView, setSelectedStartupServiceForView] = useState(null);
  const [viewStartupServiceModalVisible, setViewStartupServiceModalVisible] = useState(false);
  const [createStartupServiceModalVisible, setCreateStartupServiceModalVisible] = useState(false);
  const [editStartupServiceModalVisible, setEditStartupServiceModalVisible] = useState(false);
  const [editingStartupService, setEditingStartupService] = useState(null);
  const [deleteStartupServiceModalVisible, setDeleteStartupServiceModalVisible] = useState(false);
  const [selectedStartupServiceForDelete, setSelectedStartupServiceForDelete] = useState(null);
  const [isDeletingStartupService, setIsDeletingStartupService] = useState(false);

  const [startupServiceFormData, setStartupServiceFormData] = useState({
    title: '',
    intro: '',
    bullets: [''],
    footer_note: '',
    link: '',
    cta_label: 'Get in touch',
    sort_order: '',
    show_brochure_link: true,
    brochure_url: '',
    logo_file: null,
    remove_logo: false,
    remove_brochure: false,
  });

  // Team Directory State
  const [teamMembersList, setTeamMembersList] = useState([]);
  const [teamMembersCounts, setTeamMembersCounts] = useState({ all: 0, management: 0, governing_board: 0 });
  const [teamMembersLoading, setTeamMembersLoading] = useState(false);
  const [teamMembersSaving, setTeamMembersSaving] = useState(false);
  const [teamMembersSearch, setTeamMembersSearch] = useState('');
  const [teamMembersSectionFilter, setTeamMembersSectionFilter] = useState('all'); // 'all', 'management', 'governing_board'
  const [selectedTeamMemberForView, setSelectedTeamMemberForView] = useState(null);
  const [viewTeamMemberModalVisible, setViewTeamMemberModalVisible] = useState(false);
  const [createTeamMemberModalVisible, setCreateTeamMemberModalVisible] = useState(false);
  const [editTeamMemberModalVisible, setEditTeamMemberModalVisible] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState(null);
  const [deleteTeamMemberModalVisible, setDeleteTeamMemberModalVisible] = useState(false);
  const [selectedTeamMemberForDelete, setSelectedTeamMemberForDelete] = useState(null);
  const [isDeletingTeamMember, setIsDeletingTeamMember] = useState(false);

  const [teamMemberFormData, setTeamMemberFormData] = useState({
    section: 'management',
    name: '',
    title: '',
    subtitle: '',
    linkedin_url: '',
    sort_order: '',
    photo_file: null,
    remove_photo: false,
  });

  // Fetch Dashboard summary data
  const loadDashboard = useCallback(async (token = authToken) => {
    if (!token) return;
    try {
      const res = await fetchAdminDashboard(token);
      if (res && res.metrics) {
        setDashboardData(res);
      }
    } catch (err) {
      console.log('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authToken]);

  // Fetch Notifications
  const loadNotifications = useCallback(async (token = authToken) => {
    if (!token) return;
    setNotificationsLoading(true);
    try {
      const res = await fetchAdminNotifications(token);
      if (res) {
        const list = res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
        setNotifications(list);
        const unreadCount = res.unread_count ?? (Array.isArray(list) ? list.filter((n) => !n.viewed_at).length : 0);
        setUnreadNotificationsCount(unreadCount);
      }
    } catch (err) {
      console.log('Error loading admin notifications:', err);
    } finally {
      setNotificationsLoading(false);
    }
  }, [authToken]);

  // Mark all notifications as read
  const handleMarkAllNotificationsRead = async () => {
    if (!authToken) return;
    try {
      const ok = await markAdminNotificationsViewed(authToken);
      if (ok) {
        setUnreadNotificationsCount(0);
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, viewed_at: n.viewed_at || new Date().toISOString() }))
        );
      }
    } catch (err) {
      console.log('Error marking all notifications viewed:', err);
    }
  };

  // Fetch Subscriptions
  const loadSubscriptions = useCallback(async (token = authToken) => {
    if (!token) return;
    setSubscriptionsLoading(true);
    try {
      const res = await fetchAdminSubscriptions(token);
      if (res) {
        setSubscriptionsData(res);
      }
    } catch (err) {
      console.log('Error loading admin subscriptions:', err);
    } finally {
      setSubscriptionsLoading(false);
    }
  }, [authToken]);

  // Fetch Investor Investments
  const loadInvestorInvestments = useCallback(async (token = authToken) => {
    if (!token) return;
    setInvestorInvestmentsLoading(true);
    try {
      const res = await fetchAdminInvestorInvestments(token);
      const list = res?.data || (Array.isArray(res) ? res : []);
      setInvestorInvestments(list);
    } catch (err) {
      console.log('Error loading investor investments:', err);
    } finally {
      setInvestorInvestmentsLoading(false);
    }
  }, [authToken]);

  // Fetch BAN Wealth Orders
  const loadBanWealthOrders = useCallback(async (token = authToken) => {
    if (!token) return;
    setBanWealthOrdersLoading(true);
    try {
      const res = await fetchAdminBanWealthOrders(token);
      const list = res?.data || (Array.isArray(res) ? res : []);
      setBanWealthOrders(list);
    } catch (err) {
      console.log('Error loading BAN wealth orders:', err);
    } finally {
      setBanWealthOrdersLoading(false);
    }
  }, [authToken]);

  // Fetch CMS Content
  const loadCmsData = useCallback(async () => {
    setCmsLoading(true);
    try {
      const [homeRes, blogsRes, pubsRes, teamRes] = await Promise.allSettled([
        fetchHomePageData(),
        fetchBlogsPageData(),
        fetchPublicationsPageData(),
        fetchTeamPageData(),
      ]);
      setCmsData({
        home: homeRes.status === 'fulfilled' ? homeRes.value : null,
        blogs: blogsRes.status === 'fulfilled' ? blogsRes.value : null,
        publications: pubsRes.status === 'fulfilled' ? pubsRes.value : null,
        team: teamRes.status === 'fulfilled' ? teamRes.value : null,
      });
    } catch (err) {
      console.log('Error loading CMS data:', err);
    } finally {
      setCmsLoading(false);
    }
  }, []);

  // Auth Guard
  useEffect(() => {
    async function checkAuth() {
      const session = await initAuth();
      if (!session.token || !session.user || (!session.user.is_admin && session.user.role !== 'admin')) {
        Alert.alert(
          'Admin Access Required',
          'Please sign in with an administrator account to access this workspace.',
          [{ text: 'Sign In', onPress: () => router.replace('/login') }]
        );
        return;
      }
      setCurrentUser(session.user);
      setAuthToken(session.token);
      loadDashboard(session.token);
      loadNotifications(session.token);
    }
    checkAuth();
  }, [loadDashboard, loadNotifications]);

  // Fetch Members with Pagination, Search & Filters
  const loadMembers = useCallback(
    async (
      token = authToken,
      search = memberSearch,
      status = memberStatusFilter,
      page = 1,
      options = {}
    ) => {
      if (!token) return;
      const { silent = false } = options;
      if (!silent) {
        setMembersLoading(true);
      }
      try {
        const filterStatus = status === 'all' ? '' : status;
        const res = await fetchAdminMembers(token, {
          search,
          status: filterStatus,
          page,
          per_page: 15,
        });
        if (res) {
          const paginator = res.data || res;
          const list = Array.isArray(paginator) ? paginator : paginator.data || [];
          setMembers(list);

          if (paginator.current_page !== undefined) {
            setMemberPagination({
              currentPage: paginator.current_page || 1,
              lastPage: paginator.last_page || 1,
              total: paginator.total || list.length,
              perPage: paginator.per_page || 15,
              from: paginator.from || (list.length > 0 ? (paginator.current_page - 1) * 15 + 1 : 0),
              to: paginator.to || (list.length > 0 ? (paginator.current_page - 1) * 15 + list.length : 0),
            });
          } else {
            setMemberPagination({
              currentPage: 1,
              lastPage: 1,
              total: list.length,
              perPage: 15,
              from: list.length > 0 ? 1 : 0,
              to: list.length,
            });
          }

          if (res.counts) {
            setMemberCounts(res.counts);
          }
        }
      } catch (err) {
        console.log('Error loading members:', err);
      } finally {
        if (!silent) {
          setMembersLoading(false);
        }
      }
    },
    [authToken, memberSearch, memberStatusFilter]
  );

  // Fetch Deals
  const loadDeals = useCallback(async (token = authToken, search = dealSearch, type = dealTypeFilter) => {
    if (!token) return;
    setDealsLoading(true);
    try {
      const filterType = type === 'all' ? '' : type;
      const res = await fetchAdminDeals(token, { search, type: filterType });
      const list = res?.data || (Array.isArray(res) ? res : []);
      setDeals(list);
    } catch (err) {
      console.log('Error loading deals:', err);
    } finally {
      setDealsLoading(false);
    }
  }, [authToken, dealSearch, dealTypeFilter]);

  // Fetch Submissions
  const loadSubmissions = useCallback(async (token = authToken) => {
    if (!token) return;
    setSubmissionsLoading(true);
    try {
      const [pitchesRes, academyRes] = await Promise.all([
        fetchAdminFounderPitches(token),
        fetchAdminAngelAcademy(token),
      ]);
      const pitchesList = pitchesRes?.data?.data || pitchesRes?.data || (Array.isArray(pitchesRes) ? pitchesRes : []);
      const academyList = academyRes?.data?.data || academyRes?.data || (Array.isArray(academyRes) ? academyRes : []);
      setFounderPitches(pitchesList);
      setAcademyApplications(academyList);
    } catch (err) {
      console.log('Error loading submissions:', err);
    } finally {
      setSubmissionsLoading(false);
    }
  }, [authToken]);

  // Fetch Blogs
  const loadBlogs = useCallback(
    async (
      token = authToken,
      search = blogSearch,
      status = blogStatusFilter,
      page = 1,
      options = {}
    ) => {
      if (!token) return;
      const { silent = false } = options;
      if (!silent) {
        setBlogsLoading(true);
      }
      try {
        const filterStatus = status === 'all' ? '' : status;
        const res = await fetchAdminBlogs(token, {
          search,
          status: filterStatus,
          page,
          per_page: 15,
        });
        if (res) {
          const paginator = res.data || res;
          const list = Array.isArray(paginator) ? paginator : paginator.data || [];
          setBlogs(list);

          if (paginator.current_page !== undefined) {
            setBlogPagination({
              currentPage: paginator.current_page || 1,
              lastPage: paginator.last_page || 1,
              total: paginator.total || list.length,
              perPage: paginator.per_page || 15,
              from: paginator.from || (list.length > 0 ? (paginator.current_page - 1) * 15 + 1 : 0),
              to: paginator.to || (list.length > 0 ? (paginator.current_page - 1) * 15 + list.length : 0),
            });
          } else {
            setBlogPagination({
              currentPage: 1,
              lastPage: 1,
              total: list.length,
              perPage: 15,
              from: list.length > 0 ? 1 : 0,
              to: list.length,
            });
          }

          if (res.counts) {
            setBlogCounts(res.counts);
          }
        }
      } catch (err) {
        console.log('Error loading blogs:', err);
      } finally {
        if (!silent) {
          setBlogsLoading(false);
        }
      }
    },
    [authToken, blogSearch, blogStatusFilter]
  );

  // Fetch Publications
  const loadPublications = useCallback(
    async (
      token = authToken,
      search = publicationSearch,
      status = publicationStatusFilter,
      page = 1,
      options = {}
    ) => {
      if (!token) return;
      const { silent = false } = options;
      if (!silent) {
        setPublicationsLoading(true);
      }
      try {
        const filterStatus = status === 'all' ? '' : status;
        const res = await fetchAdminPublications(token, {
          search,
          status: filterStatus,
          page,
          per_page: 15,
        });
        if (res) {
          const paginator = res.data || res;
          const list = Array.isArray(paginator) ? paginator : paginator.data || [];
          setPublications(list);

          if (paginator.current_page !== undefined) {
            setPublicationPagination({
              currentPage: paginator.current_page || 1,
              lastPage: paginator.last_page || 1,
              total: paginator.total || list.length,
              perPage: paginator.per_page || 15,
              from: paginator.from || (list.length > 0 ? (paginator.current_page - 1) * 15 + 1 : 0),
              to: paginator.to || (list.length > 0 ? (paginator.current_page - 1) * 15 + list.length : 0),
            });
          } else {
            setPublicationPagination({
              currentPage: 1,
              lastPage: 1,
              total: list.length,
              perPage: 15,
              from: list.length > 0 ? 1 : 0,
              to: list.length,
            });
          }

          if (res.counts) {
            setPublicationCounts(res.counts);
          }
        }
      } catch (err) {
        console.log('Error loading publications:', err);
      } finally {
        if (!silent) {
          setPublicationsLoading(false);
        }
      }
    },
    [authToken, publicationSearch, publicationStatusFilter]
  );

  // Fetch Landing Page Stats
  const loadLandingPageStats = useCallback(
    async (token = authToken, options = {}) => {
      if (!token) return;
      const { silent = false } = options;
      if (!silent) setLandingPageStatsLoading(true);
      try {
        const res = await fetchAdminLandingPageStats(token);
        if (res && Array.isArray(res) && res.length > 0) {
          const formatted = res.map((item, idx) => ({
            id: item.id ?? idx + 1,
            value: item.value ?? item.stat_value ?? '',
            label: item.label ?? item.stat_label ?? '',
            sort_order: item.sort_order ?? idx + 1,
          }));
          setLandingPageStats(formatted);
          setOriginalLandingPageStats(JSON.parse(JSON.stringify(formatted)));
        }
      } catch (err) {
        console.log('Error loading landing page stats:', err);
      } finally {
        if (!silent) setLandingPageStatsLoading(false);
      }
    },
    [authToken]
  );

  // Fetch Landing Program Cards
  const loadLandingPrograms = useCallback(
    async (token = authToken, options = {}) => {
      if (!token) return;
      const { silent = false } = options;
      if (!silent) setLandingProgramsLoading(true);
      try {
        const res = await fetchAdminLandingProgramCards(token);
        if (Array.isArray(res)) {
          const sorted = [...res].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
          setLandingPrograms(sorted);
        }
      } catch (err) {
        console.log('Error loading landing programs:', err);
      } finally {
        if (!silent) setLandingProgramsLoading(false);
      }
    },
    [authToken]
  );

  // Fetch Homepage Selected Portfolios & Available Deals
  const loadHomepagePortfolios = useCallback(
    async (token = authToken, options = {}) => {
      if (!token) return;
      const { silent = false } = options;
      if (!silent) setHomepagePortfoliosLoading(true);
      try {
        const [portfoliosRes, dealsRes] = await Promise.all([
          fetchAdminHomepagePortfolios(token),
          fetchAdminDeals(token, { type: 'portfolio' }),
        ]);
        if (Array.isArray(portfoliosRes)) {
          const sorted = [...portfoliosRes].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
          setHomepagePortfolios(sorted);
        }
        const dealsList = dealsRes?.data || (Array.isArray(dealsRes) ? dealsRes : []);
        setAllPortfolioDeals(dealsList);
      } catch (err) {
        console.log('Error loading homepage portfolios:', err);
      } finally {
        if (!silent) setHomepagePortfoliosLoading(false);
      }
    },
    [authToken]
  );

  // Fetch Team About Section
  const loadTeamAboutSection = useCallback(
    async (token = authToken, options = {}) => {
      if (!token) return;
      const { silent = false } = options;
      if (!silent) setTeamAboutLoading(true);
      try {
        const res = await fetchAdminTeamAboutSection(token);
        if (res) {
          setTeamAboutData(res);
        }
      } catch (err) {
        console.log('Error loading team about section:', err);
      } finally {
        if (!silent) setTeamAboutLoading(false);
      }
    },
    [authToken]
  );

  // Fetch Community Events
  const loadEvents = useCallback(
    async (
      token = authToken,
      search = eventsSearch,
      type = eventsTypeFilter,
      landing = eventsLandingFilter,
      page = 1,
      options = {}
    ) => {
      if (!token) return;
      const { silent = false } = options;
      if (!silent) setEventsLoading(true);
      try {
        const res = await fetchAdminEvents(token, {
          search,
          type: type === 'all' ? '' : type,
          landing: landing === 'all' ? '' : landing,
          page,
          per_page: 20,
        });
        if (res) {
          const list = res.data?.data || (Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []));
          setEventsList(list);
          if (res.data?.total !== undefined) {
            setEventsPagination({
              currentPage: res.data.current_page || 1,
              lastPage: res.data.last_page || 1,
              total: res.data.total || list.length,
              perPage: res.data.per_page || 20,
            });
          } else {
            setEventsPagination({
              currentPage: 1,
              lastPage: 1,
              total: list.length,
              perPage: 20,
            });
          }
          if (res.counts) {
            setEventsCounts(res.counts);
          }
        }
      } catch (err) {
        console.log('Error loading events:', err);
      } finally {
        if (!silent) setEventsLoading(false);
      }
    },
    [authToken, eventsSearch, eventsTypeFilter, eventsLandingFilter]
  );

  // Fetch Startup Services
  const loadStartupServices = useCallback(
    async (token = authToken, options = {}) => {
      if (!token) return;
      const { silent = false } = options;
      if (!silent) setStartupServicesLoading(true);
      try {
        const res = await fetchAdminStartupServices(token);
        if (res && res.data) {
          const list = Array.isArray(res.data) ? res.data : [];
          setStartupServicesList(list);
        }
      } catch (err) {
        console.log('Error loading startup services:', err);
      } finally {
        if (!silent) setStartupServicesLoading(false);
      }
    },
    [authToken]
  );

  // Fetch Team Members
  const loadTeamMembers = useCallback(
    async (token = authToken, options = {}) => {
      if (!token) return;
      const { silent = false } = options;
      if (!silent) setTeamMembersLoading(true);
      try {
        const res = await fetchAdminTeamMembers(token, {
          section: teamMembersSectionFilter,
          search: teamMembersSearch,
        });
        if (res && res.data) {
          const list = Array.isArray(res.data) ? res.data : [];
          setTeamMembersList(list);
          if (res.counts) {
            setTeamMembersCounts(res.counts);
          }
        }
      } catch (err) {
        console.log('Error loading team members:', err);
      } finally {
        if (!silent) setTeamMembersLoading(false);
      }
    },
    [authToken, teamMembersSectionFilter, teamMembersSearch]
  );

  // Handle Tab / Sidebar View Selection
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'notifications') {
      loadNotifications(authToken);
    } else if (tab === 'members') {
      if (members.length === 0) loadMembers(authToken);
    } else if (tab === 'blogs') {
      if (blogs.length === 0) loadBlogs(authToken);
    } else if (tab === 'publications') {
      if (publications.length === 0) loadPublications(authToken);
    } else if (tab === 'landing-stats') {
      loadLandingPageStats(authToken);
    } else if (tab === 'landing-programs') {
      if (landingPrograms.length === 0) loadLandingPrograms(authToken);
    } else if (tab === 'homepage-portfolios') {
      if (homepagePortfolios.length === 0) loadHomepagePortfolios(authToken);
    } else if (tab === 'team-about') {
      loadTeamAboutSection(authToken);
    } else if (tab === 'events') {
      loadEvents(authToken, eventsSearch, eventsTypeFilter, eventsLandingFilter);
    } else if (tab === 'startup-services') {
      loadStartupServices(authToken);
    } else if (tab === 'team-members') {
      loadTeamMembers(authToken);
    } else if (tab === 'deals') {
      if (deals.length === 0) loadDeals(authToken);
    } else if (tab === 'founder-pitches') {
      setSubmissionsSubTab('pitches');
      if (founderPitches.length === 0) loadSubmissions(authToken);
    } else if (tab === 'angel-academy') {
      setSubmissionsSubTab('academy');
      if (academyApplications.length === 0) loadSubmissions(authToken);
    } else if (tab === 'submissions') {
      if (founderPitches.length === 0) loadSubmissions(authToken);
    } else if (tab === 'subscriptions') {
      if (!subscriptionsData) loadSubscriptions(authToken);
    } else if (tab === 'investments' || tab === 'investor-investments') {
      if (investorInvestments.length === 0) loadInvestorInvestments(authToken);
    } else if (tab === 'ban-wealth-orders') {
      if (banWealthOrders.length === 0) loadBanWealthOrders(authToken);
    }
  };

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard(authToken);
    await loadNotifications(authToken);
    if (activeTab === 'members') await loadMembers(authToken);
    if (activeTab === 'blogs') await loadBlogs(authToken);
    if (activeTab === 'publications') await loadPublications(authToken);
    if (activeTab === 'landing-stats') await loadLandingPageStats(authToken);
    if (activeTab === 'landing-programs') await loadLandingPrograms(authToken);
    if (activeTab === 'homepage-portfolios') await loadHomepagePortfolios(authToken);
    if (activeTab === 'team-about') await loadTeamAboutSection(authToken);
    if (activeTab === 'events') await loadEvents(authToken, eventsSearch, eventsTypeFilter, eventsLandingFilter);
    if (activeTab === 'startup-services') await loadStartupServices(authToken);
    if (activeTab === 'team-members') await loadTeamMembers(authToken);
    if (activeTab === 'deals') await loadDeals(authToken);
    if (activeTab === 'submissions' || activeTab === 'founder-pitches' || activeTab === 'angel-academy') {
      await loadSubmissions(authToken);
    }
    if (activeTab === 'subscriptions') await loadSubscriptions(authToken);
    if (activeTab === 'investments' || activeTab === 'investor-investments') {
      await loadInvestorInvestments(authToken);
    }
    if (activeTab === 'ban-wealth-orders') await loadBanWealthOrders(authToken);
    if (
      [
        'startup-services',
        'team-members',
      ].includes(activeTab)
    ) {
      await loadCmsData();
    }
    setRefreshing(false);
  };

  // Handle Member Approval
  const handleApproveMember = async (userId, memberName) => {
    Alert.alert(
      'Approve Member',
      `Are you sure you want to approve ${memberName || 'this member'}? An approval email will be sent.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            setApprovingUserId(userId);
            try {
              const res = await approveAdminMember(authToken, userId);
              if (res.ok) {
                // Instantly update member in-place with zero flicker
                setMembers((prev) =>
                  prev.map((m) => (m.id === userId ? { ...m, is_approved: true } : m))
                );
                setMemberCounts((prev) => ({
                  ...prev,
                  pending: Math.max(0, (prev.pending || 1) - 1),
                  active: (prev.active || 0) + 1,
                }));
                // Silent background sync
                loadMembers(
                  authToken,
                  memberSearch,
                  memberStatusFilter,
                  memberPagination.currentPage,
                  { silent: true }
                );
                loadDashboard(authToken);
              } else {
                Alert.alert('Approval Failed', res.message || 'Could not approve member.');
              }
            } catch (err) {
              console.log('Approve member exception:', err);
              Alert.alert('Error', 'An error occurred while approving member.');
            } finally {
              setApprovingUserId(null);
            }
          },
        },
      ]
    );
  };

  // Handle Verify Member Email
  const handleVerifyEmail = async (userId, memberName) => {
    Alert.alert(
      'Verify Member Email',
      `Mark email address for ${memberName || 'this member'} as verified?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify Email',
          style: 'default',
          onPress: async () => {
            setVerifyingEmailUserId(userId);
            try {
              const res = await verifyAdminMemberEmail(authToken, userId);
              if (res.ok) {
                // Instantly update member in-place with zero flicker
                setMembers((prev) =>
                  prev.map((m) =>
                    m.id === userId
                      ? { ...m, is_email_verified: true, email_verified_at: new Date().toISOString() }
                      : m
                  )
                );
                if (editingMember && editingMember.id === userId) {
                  setEditingMember((prev) => ({ ...prev, is_email_verified: true }));
                }
                // Silent background sync
                loadMembers(
                  authToken,
                  memberSearch,
                  memberStatusFilter,
                  memberPagination.currentPage,
                  { silent: true }
                );
              } else {
                Alert.alert('Verification Failed', res.message || 'Could not verify email.');
              }
            } catch (err) {
              console.log('Verify email exception:', err);
              Alert.alert('Error', 'An error occurred while verifying member email.');
            } finally {
              setVerifyingEmailUserId(null);
            }
          },
        },
      ]
    );
  };

  // Status Tier Handlers
  const handleOpenTierModal = (member) => {
    setSelectedMemberForTier(member);
    setTierModalVisible(true);
  };

  const handleChangeTier = async (newTier) => {
    if (!selectedMemberForTier || !authToken) return;
    const memberId = selectedMemberForTier.id;
    // Instantly close modal and update in-place with zero flicker
    setTierModalVisible(false);
    setSelectedMemberForTier(null);
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? { ...m, account_status: newTier, tier_name: newTier }
          : m
      )
    );
    setUpdatingTierUserId(memberId);
    try {
      const res = await updateAdminMemberStatus(authToken, memberId, { account_status: newTier });
      if (!res.ok) {
        Alert.alert('Update Failed', res.message || 'Could not update status tier.');
      }
      // Silent background sync
      loadMembers(
        authToken,
        memberSearch,
        memberStatusFilter,
        memberPagination.currentPage,
        { silent: true }
      );
    } catch (err) {
      console.log('Error updating tier:', err);
      Alert.alert('Error', 'An unexpected error occurred while updating status tier.');
    } finally {
      setUpdatingTierUserId(null);
    }
  };

  // Mode Handlers (Active <-> Inactive)
  const handleOpenModeModal = (member, requestedMode) => {
    setSelectedMemberForMode(member);
    const target = requestedMode || (member.status === 'active' ? 'inactive' : 'active');
    setTargetMode(target);
    setModeModalVisible(true);
  };

  const handleConfirmModeChange = async () => {
    if (!selectedMemberForMode || !authToken) return;
    const memberId = selectedMemberForMode.id;
    setIsModeUpdating(true);
    setUpdatingModeUserId(memberId);
    try {
      const res = await updateAdminMemberMode(authToken, memberId, targetMode);
      if (res.ok) {
        // Instantly update member in-place with zero flicker
        setMembers((prev) =>
          prev.map((m) =>
            m.id === memberId
              ? { ...m, status: targetMode, is_active: targetMode === 'active' }
              : m
          )
        );
        setMemberCounts((prev) => ({
          ...prev,
          active: targetMode === 'active' ? (prev.active || 0) + 1 : Math.max(0, (prev.active || 1) - 1),
          inactive: targetMode === 'inactive' ? (prev.inactive || 0) + 1 : Math.max(0, (prev.inactive || 1) - 1),
        }));
        setModeModalVisible(false);
        setSelectedMemberForMode(null);
        // Silent background sync
        loadMembers(
          authToken,
          memberSearch,
          memberStatusFilter,
          memberPagination.currentPage,
          { silent: true }
        );
      } else {
        Alert.alert('Update Failed', res.message || 'Could not update member mode.');
      }
    } catch (err) {
      console.log('Error updating mode:', err);
      Alert.alert('Error', 'An unexpected error occurred while updating member mode.');
    } finally {
      setIsModeUpdating(false);
      setUpdatingModeUserId(null);
      setSelectedMemberForMode(null);
    }
  };

  // Delete Member Handlers
  const handleOpenDeleteModal = (member) => {
    setSelectedMemberForDelete(member);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedMemberForDelete || !authToken) return;
    const memberId = selectedMemberForDelete.id;
    setIsDeletingMember(true);
    try {
      const res = await deleteAdminMember(authToken, memberId);
      if (res.ok) {
        // Instantly remove member in-place with zero flicker
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
        setMemberPagination((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
          to: Math.max(0, prev.to - 1),
        }));
        setMemberCounts((prev) => ({
          ...prev,
          all: Math.max(0, (prev.all || 1) - 1),
          ...(prev[memberStatusFilter] !== undefined
            ? { [memberStatusFilter]: Math.max(0, prev[memberStatusFilter] - 1) }
            : {}),
        }));
        setDeleteModalVisible(false);
        setSelectedMemberForDelete(null);
        // Silent background sync
        loadMembers(
          authToken,
          memberSearch,
          memberStatusFilter,
          memberPagination.currentPage,
          { silent: true }
        );
      } else {
        Alert.alert('Delete Failed', res.message || 'Could not remove member.');
      }
    } catch (err) {
      console.log('Error deleting member:', err);
      Alert.alert('Error', 'An unexpected error occurred while deleting member.');
    } finally {
      setIsDeletingMember(false);
      setSelectedMemberForDelete(null);
    }
  };

  // Edit Member Handlers
  const handleOpenEditModal = (member) => {
    setEditingMember(member);
    setEditFormData({
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      gender: member.gender || 'male',
      primary_country: member.primary_country || member.country || 'Bangladesh',
      organization: member.organization || member.company_name || '',
      designation: member.designation || '',
      preference_sector: member.preference_sector || '',
      role: member.role || 'investor',
      account_status: member.account_status || 'free',
      status: member.status || 'active',
      password: '',
    });
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMember || !authToken) return;
    if (!editFormData.name.trim()) {
      Alert.alert('Validation Error', 'Full Name is required.');
      return;
    }
    if (!editFormData.email.trim()) {
      Alert.alert('Validation Error', 'Email address is required.');
      return;
    }
    setEditSaving(true);
    try {
      const payload = {
        name: editFormData.name.trim(),
        email: editFormData.email.trim(),
        phone: editFormData.phone.trim(),
        gender: editFormData.gender,
        primary_country: editFormData.primary_country,
        organization: editFormData.organization.trim(),
        company_name: editFormData.organization.trim(),
        designation: editFormData.designation.trim(),
        preference_sector: editFormData.preference_sector.trim(),
        role: editFormData.role,
        account_status: editFormData.account_status,
        status: editFormData.status,
      };
      if (editFormData.password.trim()) {
        payload.password = editFormData.password.trim();
      }

      const res = await updateAdminMember(authToken, editingMember.id, payload);
      if (res.ok) {
        // Instantly update member in-place with zero flicker
        const updatedData = res.data || { ...editingMember, ...payload };
        setMembers((prev) =>
          prev.map((m) =>
            m.id === editingMember.id ? { ...m, ...updatedData } : m
          )
        );
        setEditModalVisible(false);
        setEditingMember(null);
        // Silent background sync
        loadMembers(
          authToken,
          memberSearch,
          memberStatusFilter,
          memberPagination.currentPage,
          { silent: true }
        );
      } else {
        const errorText = res.errors
          ? Object.values(res.errors).flat().join('\n')
          : res.message || 'Could not update member.';
        Alert.alert('Update Failed', errorText);
      }
    } catch (err) {
      console.log('Error saving member edit:', err);
      Alert.alert('Error', 'An unexpected error occurred while saving member details.');
    } finally {
      setEditSaving(false);
    }
  };

  // Add Member Handlers
  const handleOpenAddModal = () => {
    setAddFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      password_confirmation: '',
      gender: 'male',
      primary_country: 'Bangladesh',
      organization: '',
      designation: '',
      address: '',
      preference_sector: '',
      account_status: 'free',
      status: 'active',
      role: 'investor',
      is_approved: true,
      verify_email: true,
    });
    setShowAddPassword(false);
    setAddModalVisible(true);
  };

  const handleSaveAddMember = async () => {
    if (!authToken) return;
    if (!addFormData.name.trim()) {
      Alert.alert('Validation Error', 'Full Name is required.');
      return;
    }
    if (!addFormData.email.trim()) {
      Alert.alert('Validation Error', 'Email address is required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(addFormData.email.trim())) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }
    if (!addFormData.password || addFormData.password.length < 8) {
      Alert.alert('Validation Error', 'Password must be at least 8 characters long.');
      return;
    }
    if (
      addFormData.password_confirmation &&
      addFormData.password !== addFormData.password_confirmation
    ) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }

    setAddSaving(true);
    try {
      const payload = {
        name: addFormData.name.trim(),
        email: addFormData.email.trim(),
        phone: addFormData.phone.trim(),
        password: addFormData.password,
        gender: addFormData.gender,
        primary_country: addFormData.primary_country,
        organization: addFormData.organization.trim(),
        company_name: addFormData.organization.trim(),
        designation: addFormData.designation.trim(),
        address: addFormData.address.trim(),
        preference_sector: addFormData.preference_sector.trim(),
        role: addFormData.role,
        account_status: addFormData.account_status,
        status: addFormData.status,
        is_approved: Boolean(addFormData.is_approved),
        verify_email: Boolean(addFormData.verify_email),
      };

      const res = await createAdminMember(authToken, payload);
      if (res.ok) {
        // Prepend new member in-place with zero flicker
        const createdUser = res.data || {
          id: Date.now(),
          ...payload,
          is_email_verified: Boolean(payload.verify_email),
          tier_name: payload.account_status.charAt(0).toUpperCase() + payload.account_status.slice(1),
        };
        setMembers((prev) => [createdUser, ...prev]);
        setMemberPagination((prev) => ({
          ...prev,
          total: (prev.total || 0) + 1,
          to: (prev.to || 0) + 1,
        }));
        setMemberCounts((prev) => ({
          ...prev,
          all: (prev.all || 0) + 1,
          active: payload.status === 'active' && payload.is_approved ? (prev.active || 0) + 1 : (prev.active || 0),
          inactive: payload.status === 'inactive' ? (prev.inactive || 0) + 1 : (prev.inactive || 0),
          pending: !payload.is_approved ? (prev.pending || 0) + 1 : (prev.pending || 0),
        }));

        setAddModalVisible(false);
        Alert.alert('Success', `Member "${payload.name}" has been created successfully.`);

        // Silent background sync
        loadMembers(
          authToken,
          memberSearch,
          memberStatusFilter,
          1,
          { silent: true }
        );
        loadDashboard(authToken);
      } else {
        const errorText = res.errors
          ? Object.values(res.errors).flat().join('\n')
          : res.message || 'Could not create member.';
        Alert.alert('Creation Failed', errorText);
      }
    } catch (err) {
      console.log('Error creating member:', err);
      Alert.alert('Error', 'An unexpected error occurred while creating member.');
    } finally {
      setAddSaving(false);
    }
  };

  // Blog Handlers
  const handleOpenViewBlog = (blog) => {
    setSelectedBlogForView(blog);
    setViewBlogModalVisible(true);
  };

  const handleOpenCreateBlog = () => {
    setBlogEditorMode('editor');
    setEditorSelection({ start: 0, end: 0 });
    setBlogFormData({
      title: '',
      slug: '',
      category: 'Educational',
      excerpt: '',
      content: '',
      author_name: currentUser?.name || 'Bangladesh Angels Network',
      author_role: 'Investment Desk',
      author_organization: 'Bangladesh Angels Network',
      status: 'published',
      published_at: new Date().toISOString().slice(0, 16),
    });
    setCreateBlogModalVisible(true);
  };

  // Blog Editor Formatting Toolbar Handler (Parity with Web Blade toolbar)
  const handleEditorFormat = (command, value = null) => {
    const content = blogFormData.content || '';
    const { start = 0, end = 0 } = editorSelection || {};
    const selStart = Math.min(start, end);
    const selEnd = Math.max(start, end);
    const hasSelection = selStart !== selEnd;
    const selectedText = hasSelection ? content.substring(selStart, selEnd) : '';

    let formattedInsertion = '';

    switch (command) {
      case 'formatBlock':
        if (value === 'p') {
          formattedInsertion = selectedText
            ? `<p>${selectedText}</p>`
            : `<p>New paragraph text goes here...</p>\n`;
        } else if (value === 'h2') {
          formattedInsertion = selectedText
            ? `<h2>${selectedText}</h2>`
            : `<h2>Section Headline</h2>\n`;
        } else if (value === 'h3') {
          formattedInsertion = selectedText
            ? `<h3>${selectedText}</h3>`
            : `<h3>Sub-section Headline</h3>\n`;
        }
        break;

      case 'bold':
        formattedInsertion = selectedText
          ? `<strong>${selectedText}</strong>`
          : `<strong>bold text</strong>`;
        break;

      case 'italic':
        formattedInsertion = selectedText
          ? `<em>${selectedText}</em>`
          : `<em>italicized text</em>`;
        break;

      case 'insertUnorderedList':
        if (selectedText) {
          const lines = selectedText.split('\n').map((l) => l.trim()).filter(Boolean);
          const listItems = lines.map((l) => `  <li>${l.replace(/<[^>]*>/g, '')}</li>`).join('\n');
          formattedInsertion = `<ul>\n${listItems || '  <li>List item</li>'}\n</ul>\n`;
        } else {
          formattedInsertion = `<ul>\n  <li>Key takeaway item 1</li>\n  <li>Key takeaway item 2</li>\n  <li>Key takeaway item 3</li>\n</ul>\n`;
        }
        break;

      case 'insertOrderedList':
        if (selectedText) {
          const lines = selectedText.split('\n').map((l) => l.trim()).filter(Boolean);
          const listItems = lines.map((l) => `  <li>${l.replace(/<[^>]*>/g, '')}</li>`).join('\n');
          formattedInsertion = `<ol>\n${listItems || '  <li>List item</li>'}\n</ol>\n`;
        } else {
          formattedInsertion = `<ol>\n  <li>First step or point</li>\n  <li>Second step or point</li>\n  <li>Third step or point</li>\n</ol>\n`;
        }
        break;

      case 'insertListItem':
        formattedInsertion = selectedText
          ? `<li>${selectedText}</li>`
          : `<li>Single list bullet</li>\n`;
        break;

      case 'link':
        setLinkFormData({
          url: 'https://',
          text: selectedText || '',
        });
        setLinkModalVisible(true);
        return;

      case 'removeFormat':
        if (selectedText) {
          formattedInsertion = selectedText.replace(/<[^>]*>/g, '');
        } else {
          const cleanedAll = content.replace(/<[^>]*>/g, '');
          setBlogFormData((prev) => ({ ...prev, content: cleanedAll }));
          return;
        }
        break;

      default:
        return;
    }

    const before = content.substring(0, selStart);
    const after = content.substring(selEnd);
    const newContent = before + formattedInsertion + after;
    setBlogFormData((prev) => ({ ...prev, content: newContent }));
  };

  const handleConfirmInsertLink = () => {
    const url = linkFormData.url.trim();
    if (!url || url === 'https://') {
      Alert.alert('Invalid URL', 'Please enter a valid link URL (e.g. https://bdangels.co).');
      return;
    }
    const text = linkFormData.text.trim() || url;
    const linkHtml = `<a href="${url}">${text}</a>`;

    const content = blogFormData.content || '';
    const { start = 0, end = 0 } = editorSelection || {};
    const selStart = Math.min(start, end);
    const selEnd = Math.max(start, end);

    const before = content.substring(0, selStart);
    const after = content.substring(selEnd);
    const newContent = before + linkHtml + after;

    setBlogFormData((prev) => ({ ...prev, content: newContent }));
    setLinkModalVisible(false);
  };

  const handleSaveCreateBlog = async () => {
    if (!authToken) return;
    if (!blogFormData.title.trim()) {
      Alert.alert('Validation Error', 'Article title is required.');
      return;
    }
    if (!blogFormData.content.trim()) {
      Alert.alert('Validation Error', 'Article content is required.');
      return;
    }

    setBlogSaving(true);
    try {
      const payload = {
        title: blogFormData.title.trim(),
        slug: blogFormData.slug.trim(),
        category: blogFormData.category || 'Educational',
        excerpt: blogFormData.excerpt.trim(),
        content: blogFormData.content.trim(),
        author_name: blogFormData.author_name.trim(),
        author_role: blogFormData.author_role.trim(),
        author_organization: blogFormData.author_organization.trim(),
        status: blogFormData.status || 'published',
        published_at: blogFormData.published_at || null,
      };

      const res = await createAdminBlog(authToken, payload);
      if (res.ok) {
        const words = payload.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
        const newPost = res.data || {
          id: Date.now(),
          ...payload,
          reading_minutes: Math.max(1, Math.ceil(words / 220)),
          created_at: new Date().toISOString(),
        };
        setBlogs((prev) => [newPost, ...prev]);
        setBlogPagination((prev) => ({
          ...prev,
          total: (prev.total || 0) + 1,
          to: (prev.to || 0) + 1,
        }));
        setBlogCounts((prev) => ({
          ...prev,
          all: (prev.all || 0) + 1,
          published: payload.status === 'published' ? (prev.published || 0) + 1 : (prev.published || 0),
          archived: payload.status === 'archived' ? (prev.archived || 0) + 1 : (prev.archived || 0),
        }));

        setCreateBlogModalVisible(false);
        Alert.alert('Success', 'Blog post created successfully!');

        // Silent background sync
        loadBlogs(authToken, blogSearch, blogStatusFilter, 1, { silent: true });
      } else {
        const errorText = res.errors
          ? Object.values(res.errors).flat().join('\n')
          : res.message || 'Could not create blog post.';
        Alert.alert('Creation Failed', errorText);
      }
    } catch (err) {
      console.log('Error creating blog:', err);
      Alert.alert('Error', 'An unexpected error occurred while creating blog post.');
    } finally {
      setBlogSaving(false);
    }
  };

  const handleOpenEditBlog = (blog) => {
    setEditingBlog(blog);
    setBlogEditorMode('editor');
    setEditorSelection({ start: 0, end: 0 });
    setBlogFormData({
      title: blog.title || '',
      slug: blog.slug || '',
      category: blog.category || 'Educational',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      author_name: blog.author_name || '',
      author_role: blog.author_role || '',
      author_organization: blog.author_organization || 'Bangladesh Angels Network',
      status: blog.status || 'published',
      published_at: blog.published_at ? blog.published_at.slice(0, 16) : '',
    });
    setEditBlogModalVisible(true);
  };

  const handleSaveEditBlog = async () => {
    if (!editingBlog || !authToken) return;
    if (!blogFormData.title.trim()) {
      Alert.alert('Validation Error', 'Article title is required.');
      return;
    }
    if (!blogFormData.content.trim()) {
      Alert.alert('Validation Error', 'Article content is required.');
      return;
    }

    setBlogSaving(true);
    try {
      const payload = {
        title: blogFormData.title.trim(),
        slug: blogFormData.slug.trim(),
        category: blogFormData.category || 'Educational',
        excerpt: blogFormData.excerpt.trim(),
        content: blogFormData.content.trim(),
        author_name: blogFormData.author_name.trim(),
        author_role: blogFormData.author_role.trim(),
        author_organization: blogFormData.author_organization.trim(),
        status: blogFormData.status || 'published',
        published_at: blogFormData.published_at || null,
      };

      const res = await updateAdminBlog(authToken, editingBlog.id, payload);
      if (res.ok) {
        const words = payload.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
        const updatedPost = res.data || {
          ...editingBlog,
          ...payload,
          reading_minutes: Math.max(1, Math.ceil(words / 220)),
        };
        setBlogs((prev) =>
          prev.map((b) => (b.id === editingBlog.id ? updatedPost : b))
        );
        if (selectedBlogForView?.id === editingBlog.id) {
          setSelectedBlogForView(updatedPost);
        }

        setEditBlogModalVisible(false);
        setEditingBlog(null);
        Alert.alert('Success', 'Blog post updated successfully!');

        // Silent background sync
        loadBlogs(authToken, blogSearch, blogStatusFilter, blogPagination.currentPage, { silent: true });
      } else {
        const errorText = res.errors
          ? Object.values(res.errors).flat().join('\n')
          : res.message || 'Could not update blog post.';
        Alert.alert('Update Failed', errorText);
      }
    } catch (err) {
      console.log('Error updating blog:', err);
      Alert.alert('Error', 'An unexpected error occurred while updating blog post.');
    } finally {
      setBlogSaving(false);
    }
  };

  const handleToggleBlogStatus = async (blog) => {
    if (!blog || !authToken) return;
    const isCurrentlyPublished = blog.status === 'published';
    const newStatus = isCurrentlyPublished ? 'archived' : 'published';
    const actionLabel = isCurrentlyPublished ? 'Archive' : 'Publish';

    Alert.alert(
      `${actionLabel} Article`,
      isCurrentlyPublished
        ? `Archive "${blog.title}"? It will be hidden from the public blog.`
        : `Publish "${blog.title}"? It will become visible on the public blog.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionLabel,
          style: isCurrentlyPublished ? 'destructive' : 'default',
          onPress: async () => {
            setUpdatingBlogStatusId(blog.id);
            // Optimistic update
            setBlogs((prev) =>
              prev.map((b) => (b.id === blog.id ? { ...b, status: newStatus } : b))
            );
            setBlogCounts((prev) => ({
              ...prev,
              published: newStatus === 'published' ? (prev.published || 0) + 1 : Math.max(0, (prev.published || 1) - 1),
              archived: newStatus === 'archived' ? (prev.archived || 0) + 1 : Math.max(0, (prev.archived || 1) - 1),
            }));
            if (selectedBlogForView?.id === blog.id) {
              setSelectedBlogForView((prev) => ({ ...prev, status: newStatus }));
            }

            try {
              const res = await updateAdminBlogStatus(authToken, blog.id, newStatus);
              if (!res.ok) {
                Alert.alert('Status Change Failed', res.message || 'Could not update blog status.');
              }
              // Silent background sync
              loadBlogs(authToken, blogSearch, blogStatusFilter, blogPagination.currentPage, { silent: true });
            } catch (err) {
              console.log('Error toggling blog status:', err);
              Alert.alert('Error', 'An error occurred while changing blog status.');
            } finally {
              setUpdatingBlogStatusId(null);
            }
          },
        },
      ]
    );
  };

  const handleOpenDeleteBlogModal = (blog) => {
    setSelectedBlogForDelete(blog);
    setDeleteBlogModalVisible(true);
  };

  const handleConfirmDeleteBlog = async () => {
    if (!selectedBlogForDelete || !authToken) return;
    const blogId = selectedBlogForDelete.id;
    setIsDeletingBlog(true);

    try {
      const res = await deleteAdminBlog(authToken, blogId);
      if (res.ok) {
        // Optimistic delete
        setBlogs((prev) => prev.filter((b) => b.id !== blogId));
        setBlogPagination((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
          to: Math.max(0, prev.to - 1),
        }));
        setBlogCounts((prev) => ({
          ...prev,
          all: Math.max(0, (prev.all || 1) - 1),
          published: selectedBlogForDelete.status === 'published' ? Math.max(0, (prev.published || 1) - 1) : (prev.published || 0),
          archived: selectedBlogForDelete.status === 'archived' ? Math.max(0, (prev.archived || 1) - 1) : (prev.archived || 0),
        }));

        setDeleteBlogModalVisible(false);
        if (selectedBlogForView?.id === blogId) {
          setViewBlogModalVisible(false);
          setSelectedBlogForView(null);
        }
        setSelectedBlogForDelete(null);

        // Silent background sync
        loadBlogs(authToken, blogSearch, blogStatusFilter, blogPagination.currentPage, { silent: true });
      } else {
        Alert.alert('Delete Failed', res.message || 'Could not delete blog post.');
      }
    } catch (err) {
      console.log('Error deleting blog post:', err);
      Alert.alert('Error', 'An unexpected error occurred while deleting blog post.');
    } finally {
      setIsDeletingBlog(false);
      setSelectedBlogForDelete(null);
    }
  };

  // Publication Handlers
  const handleOpenViewPublication = (pub) => {
    setSelectedPublicationForView(pub);
    setViewPublicationModalVisible(true);
  };

  const handlePickPublicationPdf = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const file = res.assets[0];
        if (file.size && file.size > 20 * 1024 * 1024) {
          Alert.alert(
            'File Limit Exceeded',
            'The selected PDF is larger than 20 MB. Please choose a smaller file.'
          );
          return;
        }
        setPublicationPdfFile(file);
        setPublicationFormData((prev) => ({
          ...prev,
          pdf_original_name: file.name || prev.pdf_original_name,
        }));
      }
    } catch (err) {
      console.log('Error selecting publication PDF:', err);
      Alert.alert('Notice', 'Could not open document picker.');
    }
  };

  const handleOpenCreatePublication = () => {
    setPublicationPdfFile(null);
    setPublicationFormData({
      title: '',
      category: 'Research',
      excerpt: '',
      pdf_original_name: '',
      pdf_path: '',
      status: 'published',
      published_at: new Date().toISOString().slice(0, 16),
    });
    setCreatePublicationModalVisible(true);
  };

  const handleSaveCreatePublication = async () => {
    if (!authToken) return;
    if (!publicationFormData.title.trim()) {
      Alert.alert('Validation Error', 'Publication title is required.');
      return;
    }
    if (
      !publicationPdfFile &&
      !publicationFormData.pdf_original_name.trim() &&
      !publicationFormData.pdf_path.trim()
    ) {
      Alert.alert(
        'PDF File Required',
        'Please choose a PDF document file to upload for this publication.'
      );
      return;
    }

    setPublicationSaving(true);
    try {
      const payload = {
        title: publicationFormData.title.trim(),
        category: publicationFormData.category || 'Research',
        excerpt: publicationFormData.excerpt.trim(),
        pdf_original_name:
          publicationPdfFile?.name ||
          publicationFormData.pdf_original_name.trim() ||
          `${publicationFormData.title.trim().toLowerCase().replace(/\s+/g, '-')}.pdf`,
        pdf_path: publicationFormData.pdf_path.trim() || '',
        status: publicationFormData.status || 'published',
        published_at: publicationFormData.published_at || null,
        pdfFile: publicationPdfFile,
      };

      const res = await createAdminPublication(authToken, payload);
      if (res.ok) {
        const newPub = res.data || {
          id: Date.now(),
          ...payload,
          download_url: `https://bdangels.co/api/publications/${Date.now()}/download`,
          created_at: new Date().toISOString(),
        };
        setPublications((prev) => [newPub, ...prev]);
        setPublicationPagination((prev) => ({
          ...prev,
          total: (prev.total || 0) + 1,
          to: (prev.to || 0) + 1,
        }));
        setPublicationCounts((prev) => ({
          ...prev,
          all: (prev.all || 0) + 1,
          published:
            payload.status === 'published'
              ? (prev.published || 0) + 1
              : prev.published || 0,
          archived:
            payload.status === 'archived'
              ? (prev.archived || 0) + 1
              : prev.archived || 0,
        }));

        setPublicationPdfFile(null);
        setCreatePublicationModalVisible(false);
        Alert.alert('Success', 'Publication created and PDF uploaded successfully!');

        // Silent background sync
        loadPublications(authToken, publicationSearch, publicationStatusFilter, 1, {
          silent: true,
        });
      } else {
        const errorText = res.errors
          ? Object.values(res.errors).flat().join('\n')
          : res.message || 'Could not create publication.';
        Alert.alert('Creation Failed', errorText);
      }
    } catch (err) {
      console.log('Error creating publication:', err);
      Alert.alert('Error', 'An unexpected error occurred while creating publication.');
    } finally {
      setPublicationSaving(false);
    }
  };

  const handleOpenEditPublication = (pub) => {
    setEditingPublication(pub);
    setPublicationPdfFile(null);
    setPublicationFormData({
      title: pub.title || '',
      category: pub.category || 'Research',
      excerpt: pub.excerpt || '',
      pdf_original_name: pub.pdf_original_name || '',
      pdf_path: pub.pdf_path || '',
      status: pub.status || 'published',
      published_at: pub.published_at ? pub.published_at.slice(0, 16) : '',
    });
    setEditPublicationModalVisible(true);
  };

  const handleSaveEditPublication = async () => {
    if (!editingPublication || !authToken) return;
    if (!publicationFormData.title.trim()) {
      Alert.alert('Validation Error', 'Publication title is required.');
      return;
    }

    setPublicationSaving(true);
    try {
      const payload = {
        title: publicationFormData.title.trim(),
        category: publicationFormData.category || 'Research',
        excerpt: publicationFormData.excerpt.trim(),
        pdf_original_name:
          publicationPdfFile?.name ||
          publicationFormData.pdf_original_name.trim() ||
          editingPublication.pdf_original_name,
        pdf_path:
          publicationFormData.pdf_path.trim() || editingPublication.pdf_path,
        status: publicationFormData.status || 'published',
        published_at: publicationFormData.published_at || null,
        pdfFile: publicationPdfFile,
      };

      const res = await updateAdminPublication(authToken, editingPublication.id, payload);
      if (res.ok) {
        const updatedPub = res.data || {
          ...editingPublication,
          ...payload,
        };
        setPublications((prev) =>
          prev.map((p) => (p.id === editingPublication.id ? updatedPub : p))
        );
        if (selectedPublicationForView?.id === editingPublication.id) {
          setSelectedPublicationForView(updatedPub);
        }

        setPublicationPdfFile(null);
        setEditPublicationModalVisible(false);
        Alert.alert('Success', 'Publication updated successfully!');

        // Silent background sync
        loadPublications(
          authToken,
          publicationSearch,
          publicationStatusFilter,
          publicationPagination.currentPage,
          { silent: true }
        );
      } else {
        const errorText = res.errors
          ? Object.values(res.errors).flat().join('\n')
          : res.message || 'Could not update publication.';
        Alert.alert('Update Failed', errorText);
      }
    } catch (err) {
      console.log('Error updating publication:', err);
      Alert.alert('Error', 'An unexpected error occurred while updating publication.');
    } finally {
      setPublicationSaving(false);
    }
  };

  const handleTogglePublicationStatus = async (pub) => {
    if (!authToken || !pub) return;
    const isCurrentlyPublished = pub.status === 'published';
    const newStatus = isCurrentlyPublished ? 'archived' : 'published';
    const actionLabel = isCurrentlyPublished ? 'Archive' : 'Publish';

    Alert.alert(
      `${actionLabel} Publication`,
      isCurrentlyPublished
        ? `Archive "${pub.title}"? It will be hidden from the public research library.`
        : `Publish "${pub.title}"? It will become visible on the public research library.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionLabel,
          style: isCurrentlyPublished ? 'destructive' : 'default',
          onPress: async () => {
            const oldStatus = pub.status;
            setUpdatingPublicationStatusId(pub.id);

            // Optimistic in-place update
            setPublications((prev) =>
              prev.map((p) => (p.id === pub.id ? { ...p, status: newStatus } : p))
            );
            if (selectedPublicationForView?.id === pub.id) {
              setSelectedPublicationForView((prev) => ({ ...prev, status: newStatus }));
            }
            setPublicationCounts((prev) => ({
              ...prev,
              published:
                newStatus === 'published'
                  ? (prev.published || 0) + 1
                  : Math.max(0, (prev.published || 0) - 1),
              archived:
                newStatus === 'archived'
                  ? (prev.archived || 0) + 1
                  : Math.max(0, (prev.archived || 0) - 1),
            }));

            try {
              const res = await updateAdminPublicationStatus(authToken, pub.id, newStatus);
              if (!res.ok) {
                // Rollback
                setPublications((prev) =>
                  prev.map((p) => (p.id === pub.id ? { ...p, status: oldStatus } : p))
                );
                Alert.alert('Status Update Failed', res.message || 'Could not update status.');
              }
            } catch (err) {
              console.log('Error toggling publication status:', err);
              // Rollback
              setPublications((prev) =>
                prev.map((p) => (p.id === pub.id ? { ...p, status: oldStatus } : p))
              );
            } finally {
              setUpdatingPublicationStatusId(null);
            }
          },
        },
      ]
    );
  };

  const handleOpenDeletePublicationModal = (pub) => {
    setSelectedPublicationForDelete(pub);
    setDeletePublicationModalVisible(true);
  };

  const handleConfirmDeletePublication = async () => {
    if (!selectedPublicationForDelete || !authToken) return;
    const pubId = selectedPublicationForDelete.id;
    const pubStatus = selectedPublicationForDelete.status;

    setIsDeletingPublication(true);

    try {
      const res = await deleteAdminPublication(authToken, pubId);
      if (res.ok) {
        // Optimistic delete
        setPublications((prev) => prev.filter((p) => p.id !== pubId));
        setPublicationPagination((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
          to: Math.max(0, prev.to - 1),
        }));
        setPublicationCounts((prev) => ({
          ...prev,
          all: Math.max(0, (prev.all || 1) - 1),
          published:
            pubStatus === 'published'
              ? Math.max(0, (prev.published || 1) - 1)
              : prev.published || 0,
          archived:
            pubStatus === 'archived'
              ? Math.max(0, (prev.archived || 1) - 1)
              : prev.archived || 0,
        }));

        setDeletePublicationModalVisible(false);
        if (selectedPublicationForView?.id === pubId) {
          setViewPublicationModalVisible(false);
          setSelectedPublicationForView(null);
        }
        setSelectedPublicationForDelete(null);
        Alert.alert('Deleted', 'Publication removed successfully.');

        // Silent background sync
        loadPublications(
          authToken,
          publicationSearch,
          publicationStatusFilter,
          publicationPagination.currentPage,
          { silent: true }
        );
      } else {
        Alert.alert('Delete Failed', res.message || 'Could not delete publication.');
      }
    } catch (err) {
      console.log('Error deleting publication:', err);
      Alert.alert('Error', 'An unexpected error occurred while deleting publication.');
    } finally {
      setIsDeletingPublication(false);
      setSelectedPublicationForDelete(null);
    }
  };

  // Homepage Statistics Handlers
  const hasUnsavedStatsChanges = useMemo(() => {
    if (!landingPageStats || !originalLandingPageStats) return false;
    if (landingPageStats.length !== originalLandingPageStats.length) return true;
    return landingPageStats.some((stat, idx) => {
      const orig = originalLandingPageStats[idx];
      if (!orig) return true;
      return (
        String(stat.value ?? '').trim() !== String(orig.value ?? '').trim() ||
        String(stat.label ?? '').trim() !== String(orig.label ?? '').trim()
      );
    });
  }, [landingPageStats, originalLandingPageStats]);

  const handleUpdateStatField = (id, field, value) => {
    setLandingPageStats((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleResetLandingPageStats = () => {
    if (!hasUnsavedStatsChanges) return;
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to revert all unsaved edits to original figures and labels?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard Changes',
          style: 'destructive',
          onPress: () => {
            setLandingPageStats(JSON.parse(JSON.stringify(originalLandingPageStats)));
          },
        },
      ]
    );
  };

  const handleSaveLandingPageStats = async () => {
    if (!authToken) return;

    // Validation
    for (let i = 0; i < landingPageStats.length; i++) {
      const stat = landingPageStats[i];
      if (!stat.value || !stat.value.trim()) {
        Alert.alert('Validation Error', `Statistic #${i + 1} Figure cannot be empty.`);
        return;
      }
      if (!stat.label || !stat.label.trim()) {
        Alert.alert('Validation Error', `Statistic #${i + 1} Label cannot be empty.`);
        return;
      }
      if (stat.value.trim().length > 40) {
        Alert.alert(
          'Character Limit Exceeded',
          `Statistic #${i + 1} Figure cannot exceed 40 characters.`
        );
        return;
      }
      if (stat.label.trim().length > 120) {
        Alert.alert(
          'Character Limit Exceeded',
          `Statistic #${i + 1} Label cannot exceed 120 characters.`
        );
        return;
      }
    }

    setLandingPageStatsSaving(true);
    try {
      const payload = landingPageStats.map((item, idx) => ({
        id: item.id,
        value: item.value.trim(),
        label: item.label.trim(),
        sort_order: item.sort_order ?? idx + 1,
      }));

      const res = await updateAdminLandingPageStats(authToken, payload);
      if (res.ok) {
        const updatedList =
          Array.isArray(res.data) && res.data.length > 0 ? res.data : payload;
        const formatted = updatedList.map((item, idx) => ({
          id: item.id ?? idx + 1,
          value: item.value ?? item.stat_value ?? '',
          label: item.label ?? item.stat_label ?? '',
          sort_order: item.sort_order ?? idx + 1,
        }));
        setLandingPageStats(formatted);
        setOriginalLandingPageStats(JSON.parse(JSON.stringify(formatted)));
        Alert.alert(
          'Saved Successfully',
          'Homepage statistics have been updated and are now live on the landing page.'
        );
      } else {
        const errMsg = res.errors
          ? Object.values(res.errors).flat().join('\n')
          : res.message || 'Could not update homepage statistics.';
        Alert.alert('Save Failed', errMsg);
      }
    } catch (err) {
      console.log('Error saving landing page stats:', err);
      Alert.alert('Error', 'An unexpected error occurred while saving statistics.');
    } finally {
      setLandingPageStatsSaving(false);
    }
  };

  // Homepage Programs Handlers
  const handleOpenCreateProgram = () => {
    if (landingPrograms.length >= 5) {
      Alert.alert(
        'Maximum Limit Reached',
        'The homepage can show a maximum of 5 program cards. You must edit or remove an existing card to add a new one.'
      );
      return;
    }
    setProgramFormData({
      title: '',
      eyebrow: '',
      description: '',
      primary_label: '',
      primary_link: '',
      secondary_label: '',
      secondary_link: '',
      theme: 'white',
      sort_order: String(landingPrograms.length + 1),
      dropdown_label: '',
      dropdown_items: [
        { title: '', link: '' },
        { title: '', link: '' },
      ],
    });
    setCreateProgramModalVisible(true);
  };

  const handleOpenEditProgram = (prog) => {
    if (!prog) return;
    setEditingProgram(prog);

    let existingDropdown = prog.dropdown_items;
    if (typeof existingDropdown === 'string') {
      try {
        existingDropdown = JSON.parse(existingDropdown);
      } catch {
        existingDropdown = {};
      }
    }

    let rawItems = [];
    let dropdownLabel = '';
    if (Array.isArray(existingDropdown)) {
      rawItems = existingDropdown;
    } else if (existingDropdown && typeof existingDropdown === 'object') {
      if (Array.isArray(existingDropdown.items)) {
        rawItems = existingDropdown.items;
      }
      if (existingDropdown.label) {
        dropdownLabel = String(existingDropdown.label);
      }
    }

    const existingItems = rawItems.map((it) => ({
      title: it && it.title ? String(it.title) : '',
      link: it && it.link ? String(it.link) : '',
    }));

    while (existingItems.length < 2) {
      existingItems.push({ title: '', link: '' });
    }

    setProgramFormData({
      title: prog.title || '',
      eyebrow: prog.eyebrow || prog.badge || '',
      description: prog.description || '',
      primary_label: prog.primary_label || prog.link_label || '',
      primary_link: prog.primary_link || prog.link_url || '',
      secondary_label: prog.secondary_label || '',
      secondary_link: prog.secondary_link || '',
      theme: prog.theme || 'white',
      sort_order: String(prog.sort_order ?? ''),
      dropdown_label: dropdownLabel,
      dropdown_items: existingItems,
    });
    setEditProgramModalVisible(true);
  };

  const handleAddDropdownItem = () => {
    if (programFormData.dropdown_items.length >= 6) {
      Alert.alert('Notice', 'A card can have a maximum of 6 dropdown options.');
      return;
    }
    setProgramFormData((prev) => ({
      ...prev,
      dropdown_items: [...prev.dropdown_items, { title: '', link: '' }],
    }));
  };

  const handleRemoveDropdownItem = (index) => {
    setProgramFormData((prev) => ({
      ...prev,
      dropdown_items: prev.dropdown_items.filter((_, idx) => idx !== index),
    }));
  };

  const handleUpdateDropdownItem = (index, field, value) => {
    setProgramFormData((prev) => {
      const next = [...prev.dropdown_items];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, dropdown_items: next };
    });
  };

  const buildProgramPayload = () => {
    if (!programFormData.eyebrow.trim()) {
      Alert.alert('Validation Error', 'Category label is required (e.g. Women-led investment).');
      return null;
    }
    if (!programFormData.title.trim()) {
      Alert.alert('Validation Error', 'Program title is required (e.g. BWIN).');
      return null;
    }
    if (!programFormData.description.trim()) {
      Alert.alert('Validation Error', 'Description is required.');
      return null;
    }
    if (!programFormData.primary_label.trim()) {
      Alert.alert('Validation Error', 'Primary button label is required (e.g. Explore BWIN).');
      return null;
    }
    if (!programFormData.primary_link.trim()) {
      Alert.alert('Validation Error', 'Primary button link is required (e.g. /bwin or https://...).');
      return null;
    }

    const hasSecLabel = Boolean(programFormData.secondary_label.trim());
    const hasSecLink = Boolean(programFormData.secondary_link.trim());
    if (hasSecLabel !== hasSecLink) {
      Alert.alert(
        'Secondary Action Incomplete',
        'Both secondary button label and link must be filled, or leave both empty.'
      );
      return null;
    }

    let dropdownPayload = null;
    const dropLabel = programFormData.dropdown_label.trim();
    if (dropLabel) {
      const activeItems = programFormData.dropdown_items
        .map((it) => ({ title: it.title.trim(), link: it.link.trim() }))
        .filter((it) => it.title.length > 0);

      dropdownPayload = {
        label: dropLabel,
        items: activeItems.map((it) => ({
          title: it.title,
          link: it.link || '#',
        })),
      };
    }

    return {
      eyebrow: programFormData.eyebrow.trim(),
      title: programFormData.title.trim(),
      description: programFormData.description.trim(),
      primary_label: programFormData.primary_label.trim(),
      primary_link: programFormData.primary_link.trim(),
      secondary_label: programFormData.secondary_label.trim() || null,
      secondary_link: programFormData.secondary_link.trim() || null,
      theme: programFormData.theme || 'white',
      sort_order: programFormData.sort_order ? parseInt(programFormData.sort_order, 10) : landingPrograms.length + 1,
      dropdown_items: dropdownPayload,
    };
  };

  const handleSaveCreateProgram = async () => {
    if (!authToken) return;
    const payload = buildProgramPayload();
    if (!payload) return;

    setProgramSaving(true);
    try {
      const res = await createAdminLandingProgramCard(authToken, payload);
      if (res.ok) {
        const newCard = res.data || { id: Date.now(), ...payload };
        const updated = [...landingPrograms, newCard].sort(
          (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
        );
        setLandingPrograms(updated);
        setCreateProgramModalVisible(false);
        Alert.alert('Success', 'Homepage program card created successfully!');
        loadLandingPrograms(authToken, { silent: true });
      } else {
        const errMsg = res.errors
          ? Object.values(res.errors).flat().join('\n')
          : res.message || 'Could not create program card.';
        Alert.alert('Creation Failed', errMsg);
      }
    } catch (err) {
      console.log('Error creating program card:', err);
      Alert.alert('Error', 'An unexpected error occurred while creating program card.');
    } finally {
      setProgramSaving(false);
    }
  };

  const handleSaveEditProgram = async () => {
    if (!authToken || !editingProgram) return;
    const payload = buildProgramPayload();
    if (!payload) return;

    setProgramSaving(true);
    try {
      const res = await updateAdminLandingProgramCard(authToken, editingProgram.id, payload);
      if (res.ok) {
        const updatedCard = res.data || { id: editingProgram.id, ...payload };
        const updated = landingPrograms
          .map((c) => (c.id === editingProgram.id ? updatedCard : c))
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        setLandingPrograms(updated);
        setEditProgramModalVisible(false);
        setEditingProgram(null);
        Alert.alert('Success', 'Homepage program card updated successfully!');
        loadLandingPrograms(authToken, { silent: true });
      } else {
        const errMsg = res.errors
          ? Object.values(res.errors).flat().join('\n')
          : res.message || 'Could not update program card.';
        Alert.alert('Update Failed', errMsg);
      }
    } catch (err) {
      console.log('Error updating program card:', err);
      Alert.alert('Error', 'An unexpected error occurred while updating program card.');
    } finally {
      setProgramSaving(false);
    }
  };

  const handleOpenDeleteProgram = (prog) => {
    setSelectedProgramForDelete(prog);
    setDeleteProgramModalVisible(true);
  };

  const handleConfirmDeleteProgram = async () => {
    if (!authToken || !selectedProgramForDelete) return;
    setIsDeletingProgram(true);
    try {
      const res = await deleteAdminLandingProgramCard(authToken, selectedProgramForDelete.id);
      if (res.ok) {
        setLandingPrograms((prev) =>
          prev.filter((c) => c.id !== selectedProgramForDelete.id)
        );
        setDeleteProgramModalVisible(false);
        setSelectedProgramForDelete(null);
        Alert.alert('Deleted', 'Program card removed from homepage.');
        loadLandingPrograms(authToken, { silent: true });
      } else {
        Alert.alert('Delete Failed', res.message || 'Could not delete program card.');
      }
    } catch (err) {
      console.log('Error deleting program card:', err);
      Alert.alert('Error', 'An unexpected error occurred while deleting program card.');
    } finally {
      setIsDeletingProgram(false);
      setSelectedProgramForDelete(null);
    }
  };

  // ==========================================
  // HOMEPAGE PORTFOLIOS HANDLERS
  // ==========================================
  const handleOpenAddPortfolio = () => {
    if (homepagePortfolios.length >= 8) {
      Alert.alert(
        'Maximum Limit Reached',
        'The homepage can show a maximum of 8 selected portfolio companies. You must remove an existing company first.'
      );
      return;
    }
    setSelectedDealToAdd(null);
    setAddPortfolioSearch('');
    setAddPortfolioModalVisible(true);
  };

  const handleConfirmAddPortfolio = async () => {
    if (!authToken || !selectedDealToAdd) return;
    if (homepagePortfolios.length >= 8) {
      Alert.alert('Maximum Limit Reached', 'A maximum of 8 portfolio companies can be selected for the homepage.');
      return;
    }
    setPortfolioSaving(true);
    try {
      const res = await addAdminHomepagePortfolio(authToken, selectedDealToAdd.id);
      if (res.ok) {
        setAddPortfolioModalVisible(false);
        setSelectedDealToAdd(null);
        setAddPortfolioSearch('');
        Alert.alert('Success', `${selectedDealToAdd.title} has been added to homepage selected portfolios.`);
        loadHomepagePortfolios(authToken, { silent: true });
      } else {
        Alert.alert('Failed', res.message || 'Could not add portfolio to homepage.');
      }
    } catch (err) {
      console.log('Error adding homepage portfolio:', err);
      Alert.alert('Error', 'An unexpected error occurred while adding portfolio.');
    } finally {
      setPortfolioSaving(false);
    }
  };

  const handleMovePortfolio = async (item, direction) => {
    if (!authToken || !item || portfolioSaving) return;
    const currentIndex = homepagePortfolios.findIndex((p) => p.id === item.id);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= homepagePortfolios.length) return;

    const updated = [...homepagePortfolios];
    const temp = updated[currentIndex];
    updated[currentIndex] = updated[targetIndex];
    updated[targetIndex] = temp;

    setHomepagePortfolios(updated);
    setPortfolioSaving(true);
    try {
      const orderIds = updated.map((p) => p.id);
      const res = await reorderAdminHomepagePortfolios(authToken, orderIds);
      if (res.ok && Array.isArray(res.data)) {
        setHomepagePortfolios(res.data);
      } else {
        loadHomepagePortfolios(authToken, { silent: true });
      }
    } catch (err) {
      console.log('Error reordering homepage portfolios:', err);
      loadHomepagePortfolios(authToken, { silent: true });
    } finally {
      setPortfolioSaving(false);
    }
  };

  const handleOpenDeletePortfolio = (item) => {
    setSelectedPortfolioForDelete(item);
    setDeletePortfolioModalVisible(true);
  };

  const handleConfirmDeletePortfolio = async () => {
    if (!authToken || !selectedPortfolioForDelete) return;
    setIsDeletingPortfolio(true);
    try {
      const res = await deleteAdminHomepagePortfolio(authToken, selectedPortfolioForDelete.id);
      if (res.ok) {
        setHomepagePortfolios((prev) =>
          prev.filter((p) => p.id !== selectedPortfolioForDelete.id)
        );
        setDeletePortfolioModalVisible(false);
        const title = selectedPortfolioForDelete.deal?.title || 'Portfolio company';
        Alert.alert('Removed', `${title} removed from homepage selected portfolios.`);
        loadHomepagePortfolios(authToken, { silent: true });
      } else {
        Alert.alert('Remove Failed', res.message || 'Could not remove portfolio.');
      }
    } catch (err) {
      console.log('Error removing homepage portfolio:', err);
      Alert.alert('Error', 'An unexpected error occurred while removing portfolio.');
    } finally {
      setIsDeletingPortfolio(false);
      setSelectedPortfolioForDelete(null);
    }
  };

  const handleOpenBatchPortfolios = () => {
    const currentDealIds = homepagePortfolios.map((p) => p.deal_id);
    setBatchSelectedDealIds(currentDealIds);
    setBatchSearch('');
    setBatchPortfolioModalVisible(true);
  };

  const handleToggleBatchDeal = (dealId) => {
    setBatchSelectedDealIds((prev) => {
      if (prev.includes(dealId)) {
        return prev.filter((id) => id !== dealId);
      } else {
        if (prev.length >= 8) {
          Alert.alert(
            'Maximum Limit Reached',
            'You can select a maximum of 8 portfolio companies for the homepage. Uncheck a company to select another.'
          );
          return prev;
        }
        return [...prev, dealId];
      }
    });
  };

  const handleConfirmBatchPortfolios = async () => {
    if (!authToken || portfolioSaving) return;
    setPortfolioSaving(true);
    try {
      const res = await syncAdminHomepagePortfolios(authToken, batchSelectedDealIds);
      if (res.ok) {
        setBatchPortfolioModalVisible(false);
        if (Array.isArray(res.data)) {
          setHomepagePortfolios(res.data);
        } else {
          loadHomepagePortfolios(authToken, { silent: true });
        }
        Alert.alert('Success', 'Homepage selections updated successfully.');
      } else {
        Alert.alert('Sync Failed', res.message || 'Could not update homepage selections.');
      }
    } catch (err) {
      console.log('Error syncing homepage portfolios:', err);
      Alert.alert('Error', 'An unexpected error occurred while saving selections.');
    } finally {
      setPortfolioSaving(false);
    }
  };

  const handleOpenClearAllPortfolios = () => {
    setClearAllPortfoliosModalVisible(true);
  };

  const handleConfirmClearAllPortfolios = async () => {
    if (!authToken || isClearingAllPortfolios) return;
    setIsClearingAllPortfolios(true);
    try {
      const res = await syncAdminHomepagePortfolios(authToken, []);
      if (res.ok) {
        setHomepagePortfolios([]);
        setClearAllPortfoliosModalVisible(false);
        Alert.alert(
          'Reverted to Default',
          'Custom selections cleared. The homepage will now show the latest 8 portfolio companies automatically.'
        );
      } else {
        Alert.alert('Clear Failed', res.message || 'Could not clear selections.');
      }
    } catch (err) {
      console.log('Error clearing homepage portfolios:', err);
      Alert.alert('Error', 'An unexpected error occurred while clearing selections.');
    } finally {
      setIsClearingAllPortfolios(false);
    }
  };

  // ==========================================
  // TEAM ABOUT SECTION HANDLERS
  // ==========================================
  const handleOpenEditTeamAbout = () => {
    const paragraphs = teamAboutData?.paragraphs || teamAboutData?.body || [];
    const bodyText = Array.isArray(paragraphs)
      ? paragraphs.join('\n\n')
      : typeof teamAboutData?.body === 'string'
      ? teamAboutData.body
      : '';
    setTeamAboutForm({
      kicker: teamAboutData?.kicker || '',
      heading: teamAboutData?.heading || '',
      body_text: bodyText,
      image_alt: teamAboutData?.image_alt || '',
      image_badge: teamAboutData?.image_badge || '',
      image_file: null,
      remove_image: false,
    });
    setEditTeamAboutModalVisible(true);
  };

  const handlePickTeamAboutImage = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const file = res.assets[0];
        if (file.size && file.size > 8 * 1024 * 1024) {
          Alert.alert(
            'Image Too Large',
            'The selected photo exceeds 8 MB. Please choose an image under 8 MB.'
          );
          return;
        }
        setTeamAboutForm((prev) => ({
          ...prev,
          image_file: file,
          remove_image: false,
        }));
      }
    } catch (err) {
      console.log('Error picking team about photo:', err);
      Alert.alert('Notice', 'Could not access file picker.');
    }
  };

  const handleRemoveTeamAboutImage = () => {
    setTeamAboutForm((prev) => ({
      ...prev,
      image_file: null,
      remove_image: true,
    }));
  };

  const handleCancelImageChange = () => {
    setTeamAboutForm((prev) => ({
      ...prev,
      image_file: null,
      remove_image: false,
    }));
  };

  const handleSaveTeamAbout = async () => {
    if (!authToken) return;
    if (!teamAboutForm.kicker.trim()) {
      Alert.alert('Validation Error', 'Kicker (section label) is required.');
      return;
    }
    if (!teamAboutForm.heading.trim()) {
      Alert.alert('Validation Error', 'Heading is required.');
      return;
    }
    if (!teamAboutForm.body_text.trim()) {
      Alert.alert('Validation Error', 'Section body text is required.');
      return;
    }

    setTeamAboutSaving(true);
    try {
      let payload;
      if (teamAboutForm.image_file) {
        payload = new FormData();
        payload.append('kicker', teamAboutForm.kicker.trim());
        payload.append('heading', teamAboutForm.heading.trim());
        payload.append('body_text', teamAboutForm.body_text.trim());
        payload.append('image_alt', teamAboutForm.image_alt.trim());
        payload.append('image_badge', teamAboutForm.image_badge.trim());
        payload.append('remove_image', '0');

        const file = teamAboutForm.image_file;
        const uri = file.uri;
        const filename = file.name || uri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = file.mimeType || (match ? `image/${match[1]}` : 'image/jpeg');

        payload.append('image', {
          uri,
          name: filename,
          type,
        });
      } else {
        payload = {
          kicker: teamAboutForm.kicker.trim(),
          heading: teamAboutForm.heading.trim(),
          body_text: teamAboutForm.body_text.trim(),
          image_alt: teamAboutForm.image_alt.trim(),
          image_badge: teamAboutForm.image_badge.trim(),
          remove_image: teamAboutForm.remove_image ? true : false,
        };
      }

      const res = await updateAdminTeamAboutSection(authToken, payload);
      if (res.ok) {
        if (res.data) {
          setTeamAboutData(res.data);
        } else {
          await loadTeamAboutSection(authToken, { silent: true });
        }
        setEditTeamAboutModalVisible(false);
        Alert.alert('Success', 'Team About section updated successfully!');
      } else {
        const errorMsg = res.errors
          ? Object.values(res.errors).flat().join('\n')
          : res.message || 'Could not update section.';
        Alert.alert('Update Failed', errorMsg);
      }
    } catch (err) {
      console.log('Error saving team about section:', err);
      Alert.alert('Error', 'An unexpected error occurred while saving.');
    } finally {
      setTeamAboutSaving(false);
    }
  };

  // ==========================================
  // COMMUNITY EVENTS HANDLERS
  // ==========================================
  const handleOpenCreateEvent = () => {
    setEventFormData({
      title: '',
      type: 'event',
      location: '',
      date: '',
      start_time: '',
      end_time: '',
      registration_fee: '',
      description: '',
      registration_details: '',
      cta_link: '',
      show_on_landing: false,
      benefits: [''],
      event_highlights: [''],
      target_audience: [''],
      speakers: [{ name: '', designation: '' }],
      banner_file: null,
      remove_banner: false,
    });
    setCreateEventModalVisible(true);
  };

  const handleOpenEditEvent = (event) => {
    setEditingEvent(event);
    const dateStr = event.date ? (typeof event.date === 'string' ? event.date.slice(0, 10) : '') : '';
    const startTimeStr = event.start_time ? (typeof event.start_time === 'string' ? event.start_time.slice(0, 5) : '') : '';
    const endTimeStr = event.end_time ? (typeof event.end_time === 'string' ? event.end_time.slice(0, 5) : '') : '';

    const rawBenefits = Array.isArray(event.benefits) && event.benefits.length > 0 ? event.benefits : [''];
    const rawHighlights = Array.isArray(event.event_highlights) && event.event_highlights.length > 0 ? event.event_highlights : [''];
    const rawAudience = Array.isArray(event.target_audience) && event.target_audience.length > 0 ? event.target_audience : [''];
    const rawSpeakers = Array.isArray(event.speakers) && event.speakers.length > 0 ? event.speakers : [{ name: '', designation: '' }];

    setEventFormData({
      title: event.title || '',
      type: event.type || 'event',
      location: event.location || '',
      date: dateStr,
      start_time: startTimeStr,
      end_time: endTimeStr,
      registration_fee: event.registration_fee !== null && event.registration_fee !== undefined ? String(event.registration_fee) : '',
      description: event.description || '',
      registration_details: event.registration_details || '',
      cta_link: event.cta_link || '',
      show_on_landing: Boolean(event.show_on_landing),
      benefits: rawBenefits,
      event_highlights: rawHighlights,
      target_audience: rawAudience,
      speakers: rawSpeakers.map((s) => ({ name: s.name || '', designation: s.designation || '' })),
      banner_file: null,
      remove_banner: false,
    });
    setEditEventModalVisible(true);
  };

  const handleOpenViewEvent = (event) => {
    setSelectedEventForView(event);
    setViewEventModalVisible(true);
  };

  const handlePickEventBanner = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const file = res.assets[0];
        if (file.size && file.size > 8 * 1024 * 1024) {
          Alert.alert('File Limit Exceeded', 'The selected banner is larger than 8 MB.');
          return;
        }
        setEventFormData((prev) => ({
          ...prev,
          banner_file: file,
          remove_banner: false,
        }));
      }
    } catch (err) {
      console.log('Error picking event banner:', err);
      Alert.alert('Notice', 'Could not open image picker.');
    }
  };

  const handleRemoveEventBanner = () => {
    setEventFormData((prev) => ({
      ...prev,
      banner_file: null,
      remove_banner: true,
    }));
  };

  const handleCancelEventBannerChange = () => {
    setEventFormData((prev) => ({
      ...prev,
      banner_file: null,
      remove_banner: false,
    }));
  };

  const handleAddEventBenefit = () => {
    setEventFormData((prev) => ({ ...prev, benefits: [...prev.benefits, ''] }));
  };

  const handleRemoveEventBenefit = (idx) => {
    setEventFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== idx),
    }));
  };

  const handleUpdateEventBenefit = (idx, text) => {
    setEventFormData((prev) => {
      const arr = [...prev.benefits];
      arr[idx] = text;
      return { ...prev, benefits: arr };
    });
  };

  const handleAddEventHighlight = () => {
    setEventFormData((prev) => ({ ...prev, event_highlights: [...prev.event_highlights, ''] }));
  };

  const handleRemoveEventHighlight = (idx) => {
    setEventFormData((prev) => ({
      ...prev,
      event_highlights: prev.event_highlights.filter((_, i) => i !== idx),
    }));
  };

  const handleUpdateEventHighlight = (idx, text) => {
    setEventFormData((prev) => {
      const arr = [...prev.event_highlights];
      arr[idx] = text;
      return { ...prev, event_highlights: arr };
    });
  };

  const handleAddEventAudience = () => {
    setEventFormData((prev) => ({ ...prev, target_audience: [...prev.target_audience, ''] }));
  };

  const handleRemoveEventAudience = (idx) => {
    setEventFormData((prev) => ({
      ...prev,
      target_audience: prev.target_audience.filter((_, i) => i !== idx),
    }));
  };

  const handleUpdateEventAudience = (idx, text) => {
    setEventFormData((prev) => {
      const arr = [...prev.target_audience];
      arr[idx] = text;
      return { ...prev, target_audience: arr };
    });
  };

  const handleAddEventSpeaker = () => {
    setEventFormData((prev) => ({
      ...prev,
      speakers: [...prev.speakers, { name: '', designation: '' }],
    }));
  };

  const handleRemoveEventSpeaker = (idx) => {
    setEventFormData((prev) => ({
      ...prev,
      speakers: prev.speakers.filter((_, i) => i !== idx),
    }));
  };

  const handleUpdateEventSpeaker = (idx, key, text) => {
    setEventFormData((prev) => {
      const arr = [...prev.speakers];
      arr[idx] = { ...arr[idx], [key]: text };
      return { ...prev, speakers: arr };
    });
  };

  const buildEventPayload = () => {
    if (!eventFormData.title.trim()) {
      Alert.alert('Validation Error', 'Event title is required.');
      return null;
    }
    if (!eventFormData.description.trim()) {
      Alert.alert('Validation Error', 'Event description is required.');
      return null;
    }

    const cleanBenefits = (eventFormData.benefits || []).map((b) => b.trim()).filter(Boolean);
    const cleanHighlights = (eventFormData.event_highlights || []).map((h) => h.trim()).filter(Boolean);
    const cleanAudience = (eventFormData.target_audience || []).map((a) => a.trim()).filter(Boolean);
    const cleanSpeakers = (eventFormData.speakers || []).filter(
      (s) => s.name?.trim() || s.designation?.trim()
    );

    const hasBannerFile = Boolean(eventFormData.banner_file);

    if (hasBannerFile) {
      const fd = new FormData();
      fd.append('title', eventFormData.title.trim());
      fd.append('type', eventFormData.type || 'event');
      if (eventFormData.location.trim()) fd.append('location', eventFormData.location.trim());
      if (eventFormData.date.trim()) fd.append('date', eventFormData.date.trim());
      if (eventFormData.start_time.trim()) fd.append('start_time', eventFormData.start_time.trim());
      if (eventFormData.end_time.trim()) fd.append('end_time', eventFormData.end_time.trim());
      if (eventFormData.registration_fee.trim()) fd.append('registration_fee', eventFormData.registration_fee.trim());
      fd.append('description', eventFormData.description.trim());
      if (eventFormData.registration_details.trim()) fd.append('registration_details', eventFormData.registration_details.trim());
      if (eventFormData.cta_link.trim()) fd.append('cta_link', eventFormData.cta_link.trim());
      fd.append('show_on_landing', eventFormData.show_on_landing ? '1' : '0');
      fd.append('remove_banner', eventFormData.remove_banner ? '1' : '0');

      cleanBenefits.forEach((b, i) => fd.append(`benefits[${i}]`, b));
      cleanHighlights.forEach((h, i) => fd.append(`event_highlights[${i}]`, h));
      cleanAudience.forEach((a, i) => fd.append(`target_audience[${i}]`, a));
      cleanSpeakers.forEach((s, i) => {
        fd.append(`speakers[${i}][name]`, s.name.trim());
        fd.append(`speakers[${i}][designation]`, s.designation.trim());
      });

      const file = eventFormData.banner_file;
      const uri = file.uri;
      const filename = file.name || uri.split('/').pop() || 'banner.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const mime = file.mimeType || (match ? `image/${match[1]}` : 'image/jpeg');

      fd.append('banner_image', {
        uri,
        name: filename,
        type: mime,
      });

      return fd;
    }

    return {
      title: eventFormData.title.trim(),
      type: eventFormData.type || 'event',
      location: eventFormData.location.trim() || null,
      date: eventFormData.date.trim() || null,
      start_time: eventFormData.start_time.trim() || null,
      end_time: eventFormData.end_time.trim() || null,
      registration_fee: eventFormData.registration_fee.trim() ? Number(eventFormData.registration_fee) : null,
      description: eventFormData.description.trim(),
      registration_details: eventFormData.registration_details.trim() || null,
      cta_link: eventFormData.cta_link.trim() || null,
      show_on_landing: Boolean(eventFormData.show_on_landing),
      benefits: cleanBenefits,
      event_highlights: cleanHighlights,
      target_audience: cleanAudience,
      speakers: cleanSpeakers,
      remove_banner: Boolean(eventFormData.remove_banner),
    };
  };

  const handleSaveCreateEvent = async () => {
    if (!authToken) return;
    const payload = buildEventPayload();
    if (!payload) return;

    setEventsSaving(true);
    try {
      const res = await createAdminEvent(authToken, payload);
      if (res.ok) {
        setCreateEventModalVisible(false);
        Alert.alert('Success', 'Event created successfully!');
        loadEvents(authToken, eventsSearch, eventsTypeFilter, eventsLandingFilter, 1);
      } else {
        const errorMsg = res.errors
          ? Object.values(res.errors).flat().join('\n')
          : res.message || 'Could not create event.';
        Alert.alert('Creation Failed', errorMsg);
      }
    } catch (err) {
      console.log('Error creating event:', err);
      Alert.alert('Error', 'An unexpected error occurred while creating event.');
    } finally {
      setEventsSaving(false);
    }
  };

  const handleSaveEditEvent = async () => {
    if (!authToken || !editingEvent) return;
    const payload = buildEventPayload();
    if (!payload) return;

    setEventsSaving(true);
    try {
      const res = await updateAdminEvent(authToken, editingEvent.id, payload);
      if (res.ok) {
        const updated = res.data || { ...editingEvent, ...payload };
        setEventsList((prev) => prev.map((e) => (e.id === editingEvent.id ? updated : e)));
        if (selectedEventForView?.id === editingEvent.id) {
          setSelectedEventForView(updated);
        }
        setEditEventModalVisible(false);
        setEditingEvent(null);
        Alert.alert('Success', 'Event updated successfully!');
        loadEvents(authToken, eventsSearch, eventsTypeFilter, eventsLandingFilter, eventsPagination.currentPage, { silent: true });
      } else {
        const errorMsg = res.errors
          ? Object.values(res.errors).flat().join('\n')
          : res.message || 'Could not update event.';
        Alert.alert('Update Failed', errorMsg);
      }
    } catch (err) {
      console.log('Error updating event:', err);
      Alert.alert('Error', 'An unexpected error occurred while updating event.');
    } finally {
      setEventsSaving(false);
    }
  };

  const handleOpenDeleteEvent = (event) => {
    setSelectedEventForDelete(event);
    setDeleteEventModalVisible(true);
  };

  const handleConfirmDeleteEvent = async () => {
    if (!authToken || !selectedEventForDelete) return;
    setIsDeletingEvent(true);
    try {
      const res = await deleteAdminEvent(authToken, selectedEventForDelete.id);
      if (res.ok) {
        setEventsList((prev) => prev.filter((e) => e.id !== selectedEventForDelete.id));
        setEventsCounts((prev) => ({
          ...prev,
          all: Math.max(0, (prev.all || 1) - 1),
          events: selectedEventForDelete.type === 'event' ? Math.max(0, (prev.events || 1) - 1) : prev.events,
          webinars: selectedEventForDelete.type === 'webinar' ? Math.max(0, (prev.webinars || 1) - 1) : prev.webinars,
          landing: selectedEventForDelete.show_on_landing ? Math.max(0, (prev.landing || 1) - 1) : prev.landing,
        }));
        setDeleteEventModalVisible(false);
        if (selectedEventForView?.id === selectedEventForDelete.id) {
          setViewEventModalVisible(false);
          setSelectedEventForView(null);
        }
        setSelectedEventForDelete(null);
        Alert.alert('Deleted', 'Event deleted successfully.');
      } else {
        Alert.alert('Delete Failed', res.message || 'Could not delete event.');
      }
    } catch (err) {
      console.log('Error deleting event:', err);
      Alert.alert('Error', 'An unexpected error occurred while deleting event.');
    } finally {
      setIsDeletingEvent(false);
      setSelectedEventForDelete(null);
    }
  };

  // ==========================================
  // STARTUP SERVICES HANDLERS
  // ==========================================
  const handleOpenCreateStartupService = () => {
    setStartupServiceFormData({
      title: '',
      intro: '',
      bullets: [''],
      footer_note: '',
      link: '',
      cta_label: 'Get in touch',
      sort_order: String(startupServicesList.length + 1),
      show_brochure_link: true,
      brochure_url: '',
      logo_file: null,
      remove_logo: false,
      remove_brochure: false,
    });
    setEditingStartupService(null);
    setCreateStartupServiceModalVisible(true);
  };

  const handleOpenEditStartupService = (item) => {
    if (!item) return;
    setEditingStartupService(item);
    const bulletsArr = Array.isArray(item.bullets) && item.bullets.length > 0
      ? [...item.bullets]
      : [''];

    setStartupServiceFormData({
      title: item.title || '',
      intro: item.intro || item.description || '',
      bullets: bulletsArr,
      footer_note: item.footer_note || '',
      link: item.link || item.cta_url || '',
      cta_label: item.cta_label || 'Get in touch',
      sort_order: item.sort_order !== undefined && item.sort_order !== null ? String(item.sort_order) : '',
      show_brochure_link: item.show_brochure_link !== undefined ? !!item.show_brochure_link : true,
      brochure_url: item.brochure_url || '',
      logo_file: null,
      remove_logo: false,
      remove_brochure: false,
    });
    setEditStartupServiceModalVisible(true);
  };

  const handleOpenViewStartupService = (item) => {
    setSelectedStartupServiceForView(item);
    setViewStartupServiceModalVisible(true);
  };

  const handlePickStartupServiceLogo = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const file = res.assets[0];
        if (file.size && file.size > 5 * 1024 * 1024) {
          Alert.alert('File Limit Exceeded', 'The selected logo is larger than 5 MB.');
          return;
        }
        setStartupServiceFormData((prev) => ({
          ...prev,
          logo_file: file,
          remove_logo: false,
        }));
      }
    } catch (err) {
      console.log('Error picking service logo:', err);
      Alert.alert('Notice', 'Could not open image picker.');
    }
  };

  const handleRemoveStartupServiceLogo = () => {
    setStartupServiceFormData((prev) => ({
      ...prev,
      logo_file: null,
      remove_logo: true,
    }));
  };

  const handleCancelStartupServiceLogoChange = () => {
    setStartupServiceFormData((prev) => ({
      ...prev,
      logo_file: null,
      remove_logo: false,
    }));
  };

  const handleAddStartupServiceBullet = () => {
    setStartupServiceFormData((prev) => ({
      ...prev,
      bullets: [...(prev.bullets || []), ''],
    }));
  };

  const handleRemoveStartupServiceBullet = (index) => {
    setStartupServiceFormData((prev) => {
      const current = prev.bullets || [];
      if (current.length <= 1) {
        return { ...prev, bullets: [''] };
      }
      return {
        ...prev,
        bullets: current.filter((_, idx) => idx !== index),
      };
    });
  };

  const handleUpdateStartupServiceBullet = (text, index) => {
    setStartupServiceFormData((prev) => {
      const copy = [...(prev.bullets || [''])];
      copy[index] = text;
      return { ...prev, bullets: copy };
    });
  };

  const buildStartupServicePayload = (formData) => {
    const hasNewLogo = !!formData.logo_file;
    const isRemovingLogo = !!formData.remove_logo;
    const isRemovingBrochure = !!formData.remove_brochure;
    const needsFormData = hasNewLogo || isRemovingLogo || isRemovingBrochure;
    const filteredBullets = (formData.bullets || []).map((b) => (b || '').trim()).filter(Boolean);

    if (needsFormData) {
      const data = new FormData();
      data.append('title', (formData.title || '').trim());
      data.append('intro', (formData.intro || '').trim());
      data.append('bullets', JSON.stringify(filteredBullets));
      data.append('footer_note', (formData.footer_note || '').trim());
      data.append('link', (formData.link || '').trim());
      data.append('cta_label', (formData.cta_label || 'Get in touch').trim());
      if (formData.sort_order !== '' && formData.sort_order !== null && formData.sort_order !== undefined) {
        data.append('sort_order', String(formData.sort_order));
      }
      data.append('show_brochure_link', formData.show_brochure_link ? '1' : '0');
      if (formData.brochure_url) {
        data.append('brochure_url', formData.brochure_url.trim());
      }
      if (formData.logo_file) {
        const uri = formData.logo_file.uri;
        const filename = uri.split('/').pop() || 'logo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        data.append('logo', {
          uri,
          name: filename,
          type,
        });
      } else if (formData.remove_logo) {
        data.append('remove_logo', '1');
      }
      if (formData.remove_brochure) {
        data.append('remove_brochure', '1');
      }
      return data;
    }

    return {
      title: (formData.title || '').trim(),
      intro: (formData.intro || '').trim(),
      bullets: filteredBullets,
      footer_note: (formData.footer_note || '').trim(),
      link: (formData.link || '').trim(),
      cta_label: (formData.cta_label || 'Get in touch').trim(),
      sort_order: formData.sort_order !== '' && formData.sort_order !== null ? parseInt(formData.sort_order, 10) : undefined,
      show_brochure_link: !!formData.show_brochure_link,
      brochure_url: formData.brochure_url ? formData.brochure_url.trim() : null,
    };
  };

  const handleSaveCreateStartupService = async () => {
    if (!authToken) return;
    if (!startupServiceFormData.title.trim()) {
      Alert.alert('Required Field', 'Please enter a title for the startup service.');
      return;
    }
    if (!startupServiceFormData.intro.trim()) {
      Alert.alert('Required Field', 'Please enter an introductory description.');
      return;
    }
    if (!startupServiceFormData.link.trim()) {
      Alert.alert('Required Field', 'Please enter a CTA link (URL or mailto: link).');
      return;
    }

    setStartupServicesSaving(true);
    try {
      const payload = buildStartupServicePayload(startupServiceFormData);
      const res = await createAdminStartupService(authToken, payload);
      if (res.ok) {
        setCreateStartupServiceModalVisible(false);
        Alert.alert('Success', 'Startup service created successfully!');
        loadStartupServices(authToken);
      } else {
        const errorMsg = res.errors
          ? Object.values(res.errors).flat().join('\n')
          : res.message || 'Could not create startup service.';
        Alert.alert('Create Failed', errorMsg);
      }
    } catch (err) {
      console.log('Error creating startup service:', err);
      Alert.alert('Error', 'An unexpected error occurred while creating service.');
    } finally {
      setStartupServicesSaving(false);
    }
  };

  const handleSaveEditStartupService = async () => {
    if (!authToken || !editingStartupService) return;
    if (!startupServiceFormData.title.trim()) {
      Alert.alert('Required Field', 'Please enter a title for the startup service.');
      return;
    }
    if (!startupServiceFormData.intro.trim()) {
      Alert.alert('Required Field', 'Please enter an introductory description.');
      return;
    }
    if (!startupServiceFormData.link.trim()) {
      Alert.alert('Required Field', 'Please enter a CTA link (URL or mailto: link).');
      return;
    }

    setStartupServicesSaving(true);
    try {
      const payload = buildStartupServicePayload(startupServiceFormData);
      const res = await updateAdminStartupService(authToken, editingStartupService.id, payload);
      if (res.ok) {
        const updated = res.data || { ...editingStartupService, ...startupServiceFormData };
        setStartupServicesList((prev) =>
          prev.map((s) => (s.id === editingStartupService.id ? updated : s))
        );
        if (selectedStartupServiceForView?.id === editingStartupService.id) {
          setSelectedStartupServiceForView(updated);
        }
        setEditStartupServiceModalVisible(false);
        setEditingStartupService(null);
        Alert.alert('Success', 'Startup service updated successfully!');
        loadStartupServices(authToken, { silent: true });
      } else {
        const errorMsg = res.errors
          ? Object.values(res.errors).flat().join('\n')
          : res.message || 'Could not update startup service.';
        Alert.alert('Update Failed', errorMsg);
      }
    } catch (err) {
      console.log('Error updating startup service:', err);
      Alert.alert('Error', 'An unexpected error occurred while updating service.');
    } finally {
      setStartupServicesSaving(false);
    }
  };

  const handleOpenDeleteStartupService = (item) => {
    setSelectedStartupServiceForDelete(item);
    setDeleteStartupServiceModalVisible(true);
  };

  const handleConfirmDeleteStartupService = async () => {
    if (!authToken || !selectedStartupServiceForDelete) return;
    setIsDeletingStartupService(true);
    try {
      const res = await deleteAdminStartupService(authToken, selectedStartupServiceForDelete.id);
      if (res.ok) {
        setStartupServicesList((prev) => prev.filter((s) => s.id !== selectedStartupServiceForDelete.id));
        setDeleteStartupServiceModalVisible(false);
        if (selectedStartupServiceForView?.id === selectedStartupServiceForDelete.id) {
          setViewStartupServiceModalVisible(false);
          setSelectedStartupServiceForView(null);
        }
        setSelectedStartupServiceForDelete(null);
        Alert.alert('Deleted', 'Startup service deleted successfully.');
      } else {
        Alert.alert('Delete Failed', res.message || 'Could not delete startup service.');
      }
    } catch (err) {
      console.log('Error deleting startup service:', err);
      Alert.alert('Error', 'An unexpected error occurred while deleting service.');
    } finally {
      setIsDeletingStartupService(false);
      setSelectedStartupServiceForDelete(null);
    }
  };

  const handleMoveStartupService = async (index, direction) => {
    if (!authToken) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= startupServicesList.length) return;

    const newList = [...startupServicesList];
    const [moved] = newList.splice(index, 1);
    newList.splice(targetIndex, 0, moved);

    // Optimistically update
    setStartupServicesList(newList);

    try {
      const orderIds = newList.map((item) => item.id);
      await reorderAdminStartupServices(authToken, orderIds);
    } catch (err) {
      console.log('Error reordering startup services:', err);
      loadStartupServices(authToken, { silent: true });
    }
  };

  // ==========================================
  // TEAM DIRECTORY HANDLERS
  // ==========================================
  const handleOpenCreateTeamMember = (defaultSection = 'management') => {
    const targetSection = teamMembersSectionFilter !== 'all' ? teamMembersSectionFilter : defaultSection;
    const sameSectionMembers = teamMembersList.filter((m) => m.section === targetSection);
    setTeamMemberFormData({
      section: targetSection,
      name: '',
      title: '',
      subtitle: '',
      linkedin_url: '',
      sort_order: String(sameSectionMembers.length + 1),
      photo_file: null,
      remove_photo: false,
    });
    setEditingTeamMember(null);
    setCreateTeamMemberModalVisible(true);
  };

  const handleOpenEditTeamMember = (item) => {
    if (!item) return;
    setEditingTeamMember(item);
    setTeamMemberFormData({
      section: item.section || 'management',
      name: item.name || '',
      title: item.title || '',
      subtitle: item.subtitle || '',
      linkedin_url: item.linkedin_url || '',
      sort_order: item.sort_order !== undefined && item.sort_order !== null ? String(item.sort_order) : '',
      photo_file: null,
      remove_photo: false,
    });
    setEditTeamMemberModalVisible(true);
  };

  const handleOpenViewTeamMember = (item) => {
    setSelectedTeamMemberForView(item);
    setViewTeamMemberModalVisible(true);
  };

  const handlePickTeamMemberPhoto = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const file = res.assets[0];
        if (file.size && file.size > 5 * 1024 * 1024) {
          Alert.alert('File Limit Exceeded', 'The selected photo is larger than 5 MB.');
          return;
        }
        setTeamMemberFormData((prev) => ({
          ...prev,
          photo_file: file,
          remove_photo: false,
        }));
      }
    } catch (err) {
      console.log('Error picking team photo:', err);
      Alert.alert('Notice', 'Could not open image picker.');
    }
  };

  const handleRemoveTeamMemberPhoto = () => {
    setTeamMemberFormData((prev) => ({
      ...prev,
      photo_file: null,
      remove_photo: true,
    }));
  };

  const handleCancelTeamMemberPhotoChange = () => {
    setTeamMemberFormData((prev) => ({
      ...prev,
      photo_file: null,
      remove_photo: false,
    }));
  };

  const buildTeamMemberPayload = (formData) => {
    const hasNewPhoto = !!formData.photo_file;
    const isRemovingPhoto = !!formData.remove_photo;
    const needsFormData = hasNewPhoto || isRemovingPhoto;

    if (needsFormData) {
      const data = new FormData();
      data.append('section', formData.section || 'management');
      data.append('name', (formData.name || '').trim());
      data.append('title', (formData.title || '').trim());
      if (formData.subtitle) data.append('subtitle', formData.subtitle.trim());
      if (formData.linkedin_url) data.append('linkedin_url', formData.linkedin_url.trim());
      if (formData.sort_order !== '' && formData.sort_order !== null && formData.sort_order !== undefined) {
        data.append('sort_order', String(formData.sort_order));
      }
      if (formData.photo_file) {
        const uri = formData.photo_file.uri;
        const filename = uri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        data.append('photo', {
          uri,
          name: filename,
          type,
        });
      } else if (formData.remove_photo) {
        data.append('remove_photo', '1');
      }
      return data;
    }

    return {
      section: formData.section || 'management',
      name: (formData.name || '').trim(),
      title: (formData.title || '').trim(),
      subtitle: formData.subtitle ? formData.subtitle.trim() : null,
      linkedin_url: formData.linkedin_url ? formData.linkedin_url.trim() : null,
      sort_order: formData.sort_order !== '' && formData.sort_order !== null ? parseInt(formData.sort_order, 10) : undefined,
    };
  };

  const handleSaveCreateTeamMember = async () => {
    if (!authToken) return;
    if (!teamMemberFormData.name.trim()) {
      Alert.alert('Required Field', 'Please enter the member\'s full name.');
      return;
    }
    if (!teamMemberFormData.title.trim()) {
      Alert.alert('Required Field', 'Please enter the member\'s title or designation.');
      return;
    }

    setTeamMembersSaving(true);
    try {
      const payload = buildTeamMemberPayload(teamMemberFormData);
      const res = await createAdminTeamMember(authToken, payload);
      if (res.ok) {
        setCreateTeamMemberModalVisible(false);
        Alert.alert('Success', 'Team member added successfully!');
        loadTeamMembers(authToken);
      } else {
        const errorMsg = res.errors
          ? Object.values(res.errors).flat().join('\n')
          : res.message || 'Could not add team member.';
        Alert.alert('Create Failed', errorMsg);
      }
    } catch (err) {
      console.log('Error creating team member:', err);
      Alert.alert('Error', 'An unexpected error occurred while adding team member.');
    } finally {
      setTeamMembersSaving(false);
    }
  };

  const handleSaveEditTeamMember = async () => {
    if (!authToken || !editingTeamMember) return;
    if (!teamMemberFormData.name.trim()) {
      Alert.alert('Required Field', 'Please enter the member\'s full name.');
      return;
    }
    if (!teamMemberFormData.title.trim()) {
      Alert.alert('Required Field', 'Please enter the member\'s title or designation.');
      return;
    }

    setTeamMembersSaving(true);
    try {
      const payload = buildTeamMemberPayload(teamMemberFormData);
      const res = await updateAdminTeamMember(authToken, editingTeamMember.id, payload);
      if (res.ok) {
        const updated = res.data || { ...editingTeamMember, ...teamMemberFormData };
        setTeamMembersList((prev) =>
          prev.map((m) => (m.id === editingTeamMember.id ? updated : m))
        );
        if (selectedTeamMemberForView?.id === editingTeamMember.id) {
          setSelectedTeamMemberForView(updated);
        }
        setEditTeamMemberModalVisible(false);
        setEditingTeamMember(null);
        Alert.alert('Success', 'Team member updated successfully!');
        loadTeamMembers(authToken, { silent: true });
      } else {
        const errorMsg = res.errors
          ? Object.values(res.errors).flat().join('\n')
          : res.message || 'Could not update team member.';
        Alert.alert('Update Failed', errorMsg);
      }
    } catch (err) {
      console.log('Error updating team member:', err);
      Alert.alert('Error', 'An unexpected error occurred while updating team member.');
    } finally {
      setTeamMembersSaving(false);
    }
  };

  const handleOpenDeleteTeamMember = (item) => {
    setSelectedTeamMemberForDelete(item);
    setDeleteTeamMemberModalVisible(true);
  };

  const handleConfirmDeleteTeamMember = async () => {
    if (!authToken || !selectedTeamMemberForDelete) return;
    setIsDeletingTeamMember(true);
    try {
      const res = await deleteAdminTeamMember(authToken, selectedTeamMemberForDelete.id);
      if (res.ok) {
        setTeamMembersList((prev) => prev.filter((m) => m.id !== selectedTeamMemberForDelete.id));
        setTeamMembersCounts((prev) => ({
          ...prev,
          all: Math.max(0, (prev.all || 1) - 1),
          management: selectedTeamMemberForDelete.section === 'management' ? Math.max(0, (prev.management || 1) - 1) : prev.management,
          governing_board: selectedTeamMemberForDelete.section === 'governing_board' ? Math.max(0, (prev.governing_board || 1) - 1) : prev.governing_board,
        }));
        setDeleteTeamMemberModalVisible(false);
        if (selectedTeamMemberForView?.id === selectedTeamMemberForDelete.id) {
          setViewTeamMemberModalVisible(false);
          setSelectedTeamMemberForView(null);
        }
        setSelectedTeamMemberForDelete(null);
        Alert.alert('Deleted', 'Team member deleted successfully.');
      } else {
        Alert.alert('Delete Failed', res.message || 'Could not delete team member.');
      }
    } catch (err) {
      console.log('Error deleting team member:', err);
      Alert.alert('Error', 'An unexpected error occurred while deleting member.');
    } finally {
      setIsDeletingTeamMember(false);
      setSelectedTeamMemberForDelete(null);
    }
  };

  const handleMoveTeamMember = async (index, direction) => {
    if (!authToken) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= teamMembersList.length) return;

    const newList = [...teamMembersList];
    const [moved] = newList.splice(index, 1);
    newList.splice(targetIndex, 0, moved);

    // Optimistically update
    setTeamMembersList(newList);

    try {
      const orderIds = newList.map((item) => item.id);
      await reorderAdminTeamMembers(authToken, orderIds);
    } catch (err) {
      console.log('Error reordering team members:', err);
      loadTeamMembers(authToken, { silent: true });
    }
  };

  // Handle Logout
  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of the admin panel?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logoutUser();
          router.replace('/login');
        },
      },
    ]);
  };

  const metrics = dashboardData?.metrics || {
    total_revenue: 0,
    active_members: 0,
    total_members: 0,
    completed_payments: 0,
    total_deals: 0,
    active_deals: 0,
  };

  const recentPayments = dashboardData?.recent_payments || [];
  const planDistribution = dashboardData?.charts?.plan_distribution || [];
  const paymentMethods = dashboardData?.charts?.payment_methods || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Admin Sidebar Navigation Drawer */}
      <AdminSidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        activeView={activeTab}
        onSelectView={handleTabChange}
        unreadNotificationsCount={unreadNotificationsCount}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Admin Top Bar (matches web admin topbar & mobile hamburger menu) */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {/* Web-style mobile menu button (#0A5554) */}
          <TouchableOpacity
            style={styles.sidebarToggleBtn}
            onPress={() => setSidebarVisible(true)}
            accessibilityLabel="Open Admin Navigation Menu"
            activeOpacity={0.85}
          >
            <Ionicons name="menu" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerGreetingWrap}>
            <Text style={styles.greetingTitle} numberOfLines={1}>
              Hi {currentUser?.name ? currentUser.name.split(' ')[0] : 'Admin'},
            </Text>
            <Text style={styles.greetingSubtitle} numberOfLines={1}>
              {getViewDisplayName(activeTab)}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* Notifications Bell with unread badge */}
          <TouchableOpacity
            style={styles.notificationBellBtn}
            onPress={() => handleTabChange('notifications')}
            accessibilityLabel="View Activity Notifications"
            activeOpacity={0.8}
          >
            <Ionicons
              name={unreadNotificationsCount > 0 ? 'notifications' : 'notifications-outline'}
              size={21}
              color={unreadNotificationsCount > 0 ? '#0A5554' : Colors.ink}
            />
            {unreadNotificationsCount > 0 && (
              <View style={styles.headerUnreadBadge}>
                <Text style={styles.headerUnreadBadgeText}>
                  {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={onRefresh}
            accessibilityLabel="Refresh admin data"
          >
            <Ionicons name="refresh-outline" size={19} color={Colors.ink} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerPublicBtn}
            onPress={() => router.replace('/')}
            accessibilityLabel="Return to public app"
          >
            <Ionicons name="arrow-back-outline" size={16} color={Colors.muted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Navigation Scroll Bar */}
      <View style={styles.tabsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          <TouchableOpacity
            style={styles.menuQuickPill}
            onPress={() => setSidebarVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="apps" size={15} color="#0A5554" />
            <Text style={styles.menuQuickPillText}>All Sections</Text>
          </TouchableOpacity>

          {[
            { key: 'overview', label: 'Dashboard', icon: 'grid' },
            { key: 'notifications', label: 'Notifications', icon: 'notifications', badge: unreadNotificationsCount },
            { key: 'members', label: 'Members', icon: 'people' },
            { key: 'deals', label: 'Deals', icon: 'briefcase' },
            { key: 'founder-pitches', label: 'Pitches', icon: 'paper-plane' },
            { key: 'angel-academy', label: 'Academy', icon: 'school' },
            { key: 'subscriptions', label: 'Subscriptions', icon: 'card' },
            { key: 'blogs', label: 'Blogs', icon: 'newspaper' },
            { key: 'team-members', label: 'Team', icon: 'person-circle' },
          ].map((item) => {
            const isActive = activeTab === item.key;
            return (
              <TouchableOpacity
                key={`tab-${item.key}`}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
                onPress={() => handleTabChange(item.key)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isActive ? item.icon : `${item.icon}-outline`}
                  size={15}
                  color={isActive ? '#FFFFFF' : Colors.muted}
                />
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{item.label}</Text>
                {Boolean(item.badge && item.badge > 0) && (
                  <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                    <Text style={styles.tabBadgeText}>{item.badge > 99 ? '99+' : item.badge}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Body */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={Colors.forest} />
          <Text style={styles.loadingText}>Loading admin workspace...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.forest]} />}
        >
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <View style={styles.tabContent}>
              {/* Welcome Banner matching Web Blade */}
              <View style={styles.welcomeBanner}>
                <View style={styles.welcomeHeader}>
                  <Text style={styles.eyebrow}>PLATFORM OVERVIEW</Text>
                  <Text style={styles.welcomeTitle}>Welcome back, {currentUser?.name || 'Admin'}.</Text>
                  <Text style={styles.welcomeSubtitle}>
                    Monitor membership, deal flow, subscriptions, and revenue from one focused workspace.
                  </Text>
                </View>

                {/* Quick Action Buttons */}
                <View style={styles.quickActions}>
                  <TouchableOpacity
                    style={styles.quickActionBtnPrimary}
                    onPress={() => {
                      handleTabChange('members');
                      setTimeout(() => handleOpenAddModal(), 200);
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="person-add" size={15} color="#FFFFFF" />
                    <Text style={styles.quickActionBtnPrimaryText}>+ Add Member</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickActionBtnSecondary}
                    onPress={() => handleTabChange('members')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="people-outline" size={15} color={Colors.forest} />
                    <Text style={styles.quickActionBtnSecondaryText}>Directory</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickActionBtnSecondary}
                    onPress={() => handleTabChange('deals')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add-circle-outline" size={15} color={Colors.forest} />
                    <Text style={styles.quickActionBtnSecondaryText}>View Deals</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickActionBtnSecondary}
                    onPress={() => handleTabChange('submissions')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="file-tray-full-outline" size={15} color={Colors.forest} />
                    <Text style={styles.quickActionBtnSecondaryText}>Pitches</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 4 Metric Cards */}
              <View style={styles.metricsGrid}>
                {/* Total Members */}
                <TouchableOpacity
                  style={[styles.metricCard, styles.metricCardTeal]}
                  onPress={() => handleTabChange('members')}
                  activeOpacity={0.8}
                >
                  <View style={styles.metricTop}>
                    <Text style={styles.metricLabel}>Total members</Text>
                    <View style={[styles.metricIconWrap, { backgroundColor: '#E6F4F1' }]}>
                      <Ionicons name="people" size={18} color="#0F7359" />
                    </View>
                  </View>
                  <Text style={styles.metricValue}>{metrics.total_members?.toLocaleString() || 0}</Text>
                  <View style={styles.metricBottom}>
                    <Text style={styles.metricDetail}>{metrics.active_members?.toLocaleString() || 0} active members</Text>
                    <Ionicons name="arrow-forward" size={14} color={Colors.muted} />
                  </View>
                </TouchableOpacity>

                {/* Deal Flow */}
                <TouchableOpacity
                  style={[styles.metricCard, styles.metricCardBlue]}
                  onPress={() => handleTabChange('deals')}
                  activeOpacity={0.8}
                >
                  <View style={styles.metricTop}>
                    <Text style={styles.metricLabel}>Deal flow</Text>
                    <View style={[styles.metricIconWrap, { backgroundColor: '#E0F2FE' }]}>
                      <Ionicons name="briefcase" size={18} color="#0284C7" />
                    </View>
                  </View>
                  <Text style={styles.metricValue}>{metrics.total_deals?.toLocaleString() || 0}</Text>
                  <View style={styles.metricBottom}>
                    <Text style={styles.metricDetail}>{metrics.active_deals?.toLocaleString() || 0} active rounds</Text>
                    <Ionicons name="arrow-forward" size={14} color={Colors.muted} />
                  </View>
                </TouchableOpacity>

                {/* Subscriptions */}
                <View style={[styles.metricCard, styles.metricCardPlum]}>
                  <View style={styles.metricTop}>
                    <Text style={styles.metricLabel}>Subscriptions</Text>
                    <View style={[styles.metricIconWrap, { backgroundColor: '#F3E8FF' }]}>
                      <Ionicons name="card" size={18} color="#7E22CE" />
                    </View>
                  </View>
                  <Text style={styles.metricValue}>{metrics.completed_payments?.toLocaleString() || 0}</Text>
                  <View style={styles.metricBottom}>
                    <Text style={styles.metricDetail}>Plans on record</Text>
                    <Ionicons name="checkmark-done" size={14} color="#7E22CE" />
                  </View>
                </View>

                {/* Total Revenue */}
                <View style={[styles.metricCard, styles.metricCardGold]}>
                  <View style={styles.metricTop}>
                    <Text style={styles.metricLabel}>Total revenue</Text>
                    <View style={[styles.metricIconWrap, { backgroundColor: '#FEF3C7' }]}>
                      <Ionicons name="cash" size={18} color="#B45309" />
                    </View>
                  </View>
                  <Text style={[styles.metricValue, styles.currencyValue]}>
                    BDT {Number(metrics.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </Text>
                  <View style={styles.metricBottom}>
                    <Text style={styles.metricDetail}>{metrics.completed_payments || 0} completed payments</Text>
                  </View>
                </View>
              </View>

              {/* Plan Distribution Breakdown */}
              {planDistribution.length > 0 && (
                <View style={styles.panelCard}>
                  <View style={styles.panelHeader}>
                    <View>
                      <Text style={styles.panelTitle}>Plan mix</Text>
                      <Text style={styles.panelSubtitle}>Subscriptions distributed by tier</Text>
                    </View>
                    <Ionicons name="pie-chart-outline" size={18} color={Colors.forest} />
                  </View>
                  <View style={styles.distributionList}>
                    {planDistribution.map((item, idx) => {
                      const totalSub = planDistribution.reduce((acc, curr) => acc + (curr.count || 0), 0) || 1;
                      const pct = Math.round(((item.count || 0) / totalSub) * 100);
                      return (
                        <View key={`plan-${idx}`} style={styles.distributionRow}>
                          <View style={styles.distributionMeta}>
                            <Text style={styles.distributionLabel}>
                              {String(item.plan || 'Standard').toUpperCase()}
                            </Text>
                            <Text style={styles.distributionCount}>
                              {item.count} ({pct}%)
                            </Text>
                          </View>
                          <View style={styles.progressBarTrack}>
                            <View
                              style={[
                                styles.progressBarFill,
                                {
                                  width: `${pct}%`,
                                  backgroundColor: idx % 2 === 0 ? Colors.forest : Colors.bright,
                                },
                              ]}
                            />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Payment Methods Breakdown */}
              {paymentMethods.length > 0 && (
                <View style={styles.panelCard}>
                  <View style={styles.panelHeader}>
                    <View>
                      <Text style={styles.panelTitle}>Payment channels</Text>
                      <Text style={styles.panelSubtitle}>Completed transactions by gateway</Text>
                    </View>
                    <Ionicons name="wallet-outline" size={18} color={Colors.forest} />
                  </View>
                  <View style={styles.distributionList}>
                    {paymentMethods.map((item, idx) => {
                      const totalPm = paymentMethods.reduce((acc, curr) => acc + (curr.count || 0), 0) || 1;
                      const pct = Math.round(((item.count || 0) / totalPm) * 100);
                      return (
                        <View key={`pm-${idx}`} style={styles.distributionRow}>
                          <View style={styles.distributionMeta}>
                            <Text style={styles.distributionLabel}>
                              {String(item.payment_method || 'Online').toUpperCase()}
                            </Text>
                            <Text style={styles.distributionCount}>
                              {item.count} ({pct}%)
                            </Text>
                          </View>
                          <View style={styles.progressBarTrack}>
                            <View
                              style={[
                                styles.progressBarFill,
                                {
                                  width: `${pct}%`,
                                  backgroundColor: idx === 0 ? '#0284C7' : '#D97706',
                                },
                              ]}
                            />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Recent Payments Table / List */}
              <View style={styles.panelCard}>
                <View style={styles.panelHeader}>
                  <View>
                    <Text style={styles.panelTitle}>Recent payments</Text>
                    <Text style={styles.panelSubtitle}>Latest 10 transactions</Text>
                  </View>
                  <View style={styles.pillCount}>
                    <Text style={styles.pillCountText}>{recentPayments.length} records</Text>
                  </View>
                </View>

                {recentPayments.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="receipt-outline" size={36} color={Colors.mutedLight} />
                    <Text style={styles.emptyText}>No recent payment records found.</Text>
                  </View>
                ) : (
                  <View style={styles.tableList}>
                    {recentPayments.map((payment, index) => {
                      const memberName = payment.user?.name || 'Investor';
                      const memberInitial = memberName.charAt(0).toUpperCase();
                      const isCompleted = payment.status === 'completed';
                      const isFailed = payment.status === 'failed';
                      const formattedDate = payment.payment_date
                        ? new Date(payment.payment_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Recent';

                      return (
                        <View key={`payment-${payment.id || index}`} style={styles.paymentRow}>
                          <View style={styles.paymentLeft}>
                            <View style={styles.avatarCircle}>
                              <Text style={styles.avatarText}>{memberInitial}</Text>
                            </View>
                            <View style={styles.paymentDetails}>
                              <Text style={styles.paymentMemberName}>{memberName}</Text>
                              <Text style={styles.paymentDate}>
                                {formattedDate} • {payment.payment_method || 'Online'}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.paymentRight}>
                            <Text style={styles.paymentAmount}>
                              BDT {Number(payment.amount || 0).toLocaleString()}
                            </Text>
                            <View
                              style={[
                                styles.statusBadge,
                                isCompleted
                                  ? styles.statusCompleted
                                  : isFailed
                                  ? styles.statusFailed
                                  : styles.statusWarning,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.statusBadgeText,
                                  isCompleted
                                    ? styles.statusCompletedText
                                    : isFailed
                                    ? styles.statusFailedText
                                    : styles.statusWarningText,
                                ]}
                              >
                                {isCompleted ? 'Completed' : isFailed ? 'Failed' : payment.status || 'Pending'}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* TAB 2: MEMBERS MANAGEMENT */}
          {activeTab === 'members' && (
            <View style={styles.tabContent}>
              {/* Header with Title and Pagination Summary */}
              <View style={styles.sectionHeaderRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.sectionHeading}>Member Management</Text>
                  <Text style={styles.sectionSubheading}>
                    {memberPagination.total > 0
                      ? `Showing ${memberPagination.from}–${memberPagination.to} of ${memberPagination.total} members`
                      : 'Directory of angel investors, access tiers & statuses'}
                  </Text>
                </View>
                <View style={styles.sectionHeaderActions}>
                  <TouchableOpacity
                    style={styles.addMemberBtn}
                    onPress={handleOpenAddModal}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="person-add" size={14} color="#FFFFFF" />
                    <Text style={styles.addMemberBtnText}>Add Member</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.refreshIconBtn}
                    onPress={() => loadMembers(authToken, memberSearch, memberStatusFilter, memberPagination.currentPage)}
                    disabled={membersLoading}
                  >
                    <Ionicons
                      name="refresh"
                      size={18}
                      color={Colors.forest}
                      style={membersLoading ? { opacity: 0.5 } : {}}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Search Box */}
              <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color={Colors.muted} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search name, email, phone, company..."
                  placeholderTextColor={Colors.mutedLight}
                  value={memberSearch}
                  onChangeText={(val) => {
                    setMemberSearch(val);
                    loadMembers(authToken, val, memberStatusFilter, 1);
                  }}
                  autoCapitalize="none"
                  returnKeyType="search"
                />
                {memberSearch.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setMemberSearch('');
                      loadMembers(authToken, '', memberStatusFilter, 1);
                    }}
                  >
                    <Ionicons name="close-circle" size={18} color={Colors.muted} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Filter Tabs matching Web Livewire with Count Badges */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.memberFilterScroll}
              >
                {[
                  { key: 'all', label: 'All', count: memberCounts.all || memberPagination.total },
                  { key: 'active', label: 'Active', count: memberCounts.active },
                  { key: 'inactive', label: 'Inactive', count: memberCounts.inactive },
                  { key: 'pending', label: 'Pending Approval', count: memberCounts.pending },
                  { key: 'featured', label: 'Featured', count: memberCounts.featured },
                ].map((tab) => {
                  const isActive = memberStatusFilter === tab.key;
                  return (
                    <TouchableOpacity
                      key={`member-filter-${tab.key}`}
                      style={[styles.memberFilterChip, isActive && styles.memberFilterChipActive]}
                      onPress={() => {
                        setMemberStatusFilter(tab.key);
                        loadMembers(authToken, memberSearch, tab.key, 1);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.memberFilterChipText,
                          isActive && styles.memberFilterChipTextActive,
                        ]}
                      >
                        {tab.label}
                      </Text>
                      <View
                        style={[
                          styles.memberFilterBadge,
                          isActive ? styles.memberFilterBadgeActive : styles.memberFilterBadgeInactive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.memberFilterBadgeText,
                            isActive && styles.memberFilterBadgeTextActive,
                          ]}
                        >
                          {tab.count !== undefined ? tab.count : 0}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Members List */}
              {membersLoading && members.length === 0 ? (
                <View style={styles.listLoadingBox}>
                  <ActivityIndicator size="small" color={Colors.forest} />
                  <Text style={styles.loadingText}>Fetching members...</Text>
                </View>
              ) : members.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={44} color={Colors.mutedLight} />
                  <Text style={styles.emptyTitle}>No members found</Text>
                  <Text style={styles.emptyText}>
                    No members match your current search query or filter scope.
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyAddBtn}
                    onPress={handleOpenAddModal}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="person-add" size={15} color="#FFFFFF" />
                    <Text style={styles.emptyAddBtnText}>Add New Member</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.cardsList}>
                  {membersLoading && (
                    <View style={styles.memberListUpdatingBar}>
                      <ActivityIndicator size="small" color={Colors.forest} />
                      <Text style={styles.memberListUpdatingText}>Syncing latest data...</Text>
                    </View>
                  )}
                  {members.map((member) => {
                    const isApproved = Boolean(member.is_approved);
                    const isApproving = approvingUserId === member.id;
                    const isVerifying = verifyingEmailUserId === member.id;
                    const isUpdatingTier = updatingTierUserId === member.id;
                    const isUpdatingMode = updatingModeUserId === member.id;
                    const isCurrentUser = member.id === currentUser?.id;

                    // Status Tier Style & Label
                    const tierConfig = (() => {
                      const t = String(member.account_status || 'free').toLowerCase();
                      switch (t) {
                        case 'core':
                          return { dot: '#10B981', text: '#065F46', bg: '#ECFDF5', border: '#A7F3D0', label: 'Core Tier' };
                        case 'advanced':
                          return { dot: '#14B8A6', text: '#0F766E', bg: '#F0FDFA', border: '#99F6E4', label: 'Advanced Tier' };
                        case 'institutional':
                          return { dot: '#A855F7', text: '#6B21A8', bg: '#FAF5FF', border: '#E9D5FF', label: 'Institutional' };
                        default:
                          return { dot: '#9CA3AF', text: '#374151', bg: '#F3F4F6', border: '#D1D5DB', label: 'Free Tier' };
                      }
                    })();

                    // Mode Style & Label (Active vs Inactive)
                    const modeConfig = (() => {
                      const m = String(member.status || 'active').toLowerCase();
                      if (m === 'inactive') {
                        return { dot: '#9CA3AF', text: '#4B5563', bg: '#F3F4F6', border: '#D1D5DB', label: 'Inactive' };
                      }
                      return { dot: '#10B981', text: '#065F46', bg: '#ECFDF5', border: '#A7F3D0', label: 'Active' };
                    })();

                    const joinedDate = member.created_at
                      ? new Date(member.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'N/A';

                    return (
                      <View key={`member-${member.id}`} style={styles.memberCardEnhanced}>
                        {/* 1. Header: Avatar, Name, Email, Badges */}
                        <View style={styles.memberCardTop}>
                          {member.profile_photo_url ? (
                            <Image
                              source={{ uri: member.profile_photo_url }}
                              style={styles.avatarPhoto}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={styles.avatarCircleLarge}>
                              <Text style={styles.avatarTextLarge}>
                                {(member.name || 'U').charAt(0).toUpperCase()}
                              </Text>
                            </View>
                          )}

                          <View style={styles.memberInfo}>
                            <View style={styles.memberTitleRow}>
                              <Text style={styles.memberName} numberOfLines={1}>
                                {member.name}
                              </Text>
                              {isCurrentUser && (
                                <View style={styles.youBadge}>
                                  <Text style={styles.youBadgeText}>You</Text>
                                </View>
                              )}
                              {member.role === 'admin' && (
                                <View style={styles.adminRolePill}>
                                  <Text style={styles.adminRolePillText}>ADMIN</Text>
                                </View>
                              )}
                            </View>
                            <Text style={styles.memberEmail} numberOfLines={1}>
                              {member.email}
                            </Text>
                            <View style={styles.memberMetaRow}>
                              <Text style={styles.memberMetaText}>
                                ID #{member.id} • {member.primary_country || member.country || 'Bangladesh'}
                              </Text>
                              <Text style={styles.memberMetaText}>
                                • Joined {joinedDate}
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* 2. Professional Details & Contact */}
                        <View style={styles.memberDetailsBox}>
                          {(Boolean(member.designation) || Boolean(member.company_name || member.organization)) && (
                            <View style={styles.memberDetailRow}>
                              <Ionicons name="briefcase-outline" size={14} color={Colors.muted} style={{ marginTop: 2 }} />
                              <Text style={styles.memberDetailText}>
                                {member.designation || 'Member'}
                                {Boolean(member.company_name || member.organization) ? ` at ${member.company_name || member.organization}` : ''}
                              </Text>
                            </View>
                          )}

                          {Boolean(member.phone) && (
                            <View style={styles.memberDetailRow}>
                              <Ionicons name="call-outline" size={14} color={Colors.muted} style={{ marginTop: 1 }} />
                              <Text style={styles.memberDetailText}>{member.phone}</Text>
                            </View>
                          )}

                          {/* Email Verified Row */}
                          <View style={styles.emailVerifiedRow}>
                            <View style={styles.emailVerifiedStatus}>
                              {member.is_email_verified ? (
                                <View style={styles.verifiedTag}>
                                  <Ionicons name="checkmark-circle" size={14} color="#059669" />
                                  <Text style={styles.verifiedTagText}>Email Verified</Text>
                                </View>
                              ) : (
                                <View style={styles.unverifiedTag}>
                                  <Ionicons name="alert-circle-outline" size={14} color="#D97706" />
                                  <Text style={styles.unverifiedTagText}>Email Unverified</Text>
                                </View>
                              )}
                            </View>

                            {!member.is_email_verified && (
                              <TouchableOpacity
                                style={styles.inlineVerifyBtn}
                                onPress={() => handleVerifyEmail(member.id, member.name)}
                                disabled={isVerifying}
                              >
                                {isVerifying ? (
                                  <ActivityIndicator size="small" color="#0A5554" />
                                ) : (
                                  <Text style={styles.inlineVerifyBtnText}>Verify Email</Text>
                                )}
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>

                        {/* 3. Status Tier & Mode Interactive Selectors */}
                        <View style={styles.statusAndModeRow}>
                          {/* Status (Account Tier) Selector */}
                          <View style={styles.selectorColumn}>
                            <Text style={styles.selectorLabel}>STATUS TIER</Text>
                            <TouchableOpacity
                              style={[
                                styles.interactivePill,
                                { backgroundColor: tierConfig.bg, borderColor: tierConfig.border },
                              ]}
                              onPress={() => handleOpenTierModal(member)}
                              disabled={isUpdatingTier}
                              activeOpacity={0.7}
                            >
                              <View style={[styles.statusDot, { backgroundColor: tierConfig.dot }]} />
                              <Text style={[styles.interactivePillText, { color: tierConfig.text }]}>
                                {tierConfig.label}
                              </Text>
                              {isUpdatingTier ? (
                                <ActivityIndicator size="small" color={tierConfig.text} style={{ marginLeft: 4 }} />
                              ) : (
                                <Ionicons name="chevron-down" size={13} color={tierConfig.text} style={{ opacity: 0.7 }} />
                              )}
                            </TouchableOpacity>
                          </View>

                          {/* Mode (Active / Inactive) Selector */}
                          <View style={styles.selectorColumn}>
                            <Text style={styles.selectorLabel}>MODE</Text>
                            <TouchableOpacity
                              style={[
                                styles.interactivePill,
                                { backgroundColor: modeConfig.bg, borderColor: modeConfig.border },
                              ]}
                              onPress={() => handleOpenModeModal(member)}
                              disabled={isUpdatingMode}
                              activeOpacity={0.7}
                            >
                              <View style={[styles.statusDot, { backgroundColor: modeConfig.dot }]} />
                              <Text style={[styles.interactivePillText, { color: modeConfig.text }]}>
                                {modeConfig.label}
                              </Text>
                              {isUpdatingMode ? (
                                <ActivityIndicator size="small" color={modeConfig.text} style={{ marginLeft: 4 }} />
                              ) : (
                                <Ionicons name="chevron-down" size={13} color={modeConfig.text} style={{ opacity: 0.7 }} />
                              )}
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* 4. Action Buttons: Approve, Edit, Delete */}
                        <View style={styles.memberActionButtonsRow}>
                          {!isApproved && (
                            <TouchableOpacity
                              style={styles.actionBtnApprove}
                              onPress={() => handleApproveMember(member.id, member.name)}
                              disabled={isApproving}
                              activeOpacity={0.8}
                            >
                              {isApproving ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                              ) : (
                                <>
                                  <Ionicons name="checkmark-circle" size={15} color="#FFFFFF" />
                                  <Text style={styles.actionBtnApproveText}>Approve</Text>
                                </>
                              )}
                            </TouchableOpacity>
                          )}

                          <TouchableOpacity
                            style={styles.actionBtnEdit}
                            onPress={() => handleOpenEditModal(member)}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="pencil" size={14} color="#0A5554" />
                            <Text style={styles.actionBtnEditText}>Edit</Text>
                          </TouchableOpacity>

                          {!isCurrentUser && (
                            <TouchableOpacity
                              style={styles.actionBtnDelete}
                              onPress={() => handleOpenDeleteModal(member)}
                              activeOpacity={0.8}
                            >
                              <Ionicons name="trash-outline" size={14} color="#DC2626" />
                              <Text style={styles.actionBtnDeleteText}>Delete</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    );
                  })}

                  {/* 5. Pagination Bar matching Web Table Footer */}
                  {memberPagination.lastPage > 1 && (
                    <View style={styles.paginationContainer}>
                      <TouchableOpacity
                        style={[
                          styles.paginationBtn,
                          memberPagination.currentPage <= 1 && styles.paginationBtnDisabled,
                        ]}
                        onPress={() => {
                          if (memberPagination.currentPage > 1) {
                            loadMembers(
                              authToken,
                              memberSearch,
                              memberStatusFilter,
                              memberPagination.currentPage - 1
                            );
                          }
                        }}
                        disabled={memberPagination.currentPage <= 1 || membersLoading}
                      >
                        <Ionicons
                          name="chevron-back"
                          size={16}
                          color={memberPagination.currentPage <= 1 ? '#9CA3AF' : '#0A5554'}
                        />
                        <Text
                          style={[
                            styles.paginationBtnText,
                            memberPagination.currentPage <= 1 && styles.paginationBtnTextDisabled,
                          ]}
                        >
                          Previous
                        </Text>
                      </TouchableOpacity>

                      <View style={styles.paginationInfoBox}>
                        <Text style={styles.paginationInfoText}>
                          Page {memberPagination.currentPage} of {memberPagination.lastPage}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.paginationBtn,
                          memberPagination.currentPage >= memberPagination.lastPage &&
                            styles.paginationBtnDisabled,
                        ]}
                        onPress={() => {
                          if (memberPagination.currentPage < memberPagination.lastPage) {
                            loadMembers(
                              authToken,
                              memberSearch,
                              memberStatusFilter,
                              memberPagination.currentPage + 1
                            );
                          }
                        }}
                        disabled={
                          memberPagination.currentPage >= memberPagination.lastPage || membersLoading
                        }
                      >
                        <Text
                          style={[
                            styles.paginationBtnText,
                            memberPagination.currentPage >= memberPagination.lastPage &&
                              styles.paginationBtnTextDisabled,
                          ]}
                        >
                          Next
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color={
                            memberPagination.currentPage >= memberPagination.lastPage
                              ? '#9CA3AF'
                              : '#0A5554'
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* TAB 3: DEALS */}
          {activeTab === 'deals' && (
            <View style={styles.tabContent}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionHeading}>Deal Flow Pipeline</Text>
                  <Text style={styles.sectionSubheading}>Active opportunities, co-investments & portfolios</Text>
                </View>
                <TouchableOpacity
                  style={styles.refreshIconBtn}
                  onPress={() => loadDeals(authToken, dealSearch, dealTypeFilter)}
                >
                  <Ionicons name="refresh" size={18} color={Colors.forest} />
                </TouchableOpacity>
              </View>

              {/* Deal Search */}
              <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color={Colors.muted} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search deals by name or company..."
                  placeholderTextColor={Colors.mutedLight}
                  value={dealSearch}
                  onChangeText={(val) => {
                    setDealSearch(val);
                    loadDeals(authToken, val, dealTypeFilter);
                  }}
                  autoCapitalize="none"
                />
                {dealSearch.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setDealSearch('');
                      loadDeals(authToken, '', dealTypeFilter);
                    }}
                  >
                    <Ionicons name="close-circle" size={18} color={Colors.muted} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Deal Type Filters */}
              <View style={styles.filterChipsRow}>
                {['all', 'syndicate', 'co-investment', 'portfolio'].map((type) => (
                  <TouchableOpacity
                    key={`type-${type}`}
                    style={[styles.filterChip, dealTypeFilter === type && styles.filterChipActive]}
                    onPress={() => {
                      setDealTypeFilter(type);
                      loadDeals(authToken, dealSearch, type);
                    }}
                  >
                    <Text style={[styles.filterChipText, dealTypeFilter === type && styles.filterChipTextActive]}>
                      {type === 'all' ? 'All Deals' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Deals List */}
              {dealsLoading ? (
                <View style={styles.listLoadingBox}>
                  <ActivityIndicator size="small" color={Colors.forest} />
                  <Text style={styles.loadingText}>Loading deals...</Text>
                </View>
              ) : deals.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="briefcase-outline" size={40} color={Colors.mutedLight} />
                  <Text style={styles.emptyTitle}>No deals found</Text>
                  <Text style={styles.emptyText}>No deal entries matching your current filters.</Text>
                </View>
              ) : (
                <View style={styles.cardsList}>
                  {deals.map((deal) => {
                    const isActive = deal.status === 'active';
                    return (
                      <View key={`deal-${deal.id}`} style={styles.dealCard}>
                        <View style={styles.dealCardHeader}>
                          <View style={styles.dealTitleWrap}>
                            <Text style={styles.dealTitle}>{deal.title || deal.company_name}</Text>
                            {Boolean(deal.company_name && deal.company_name !== deal.title) && (
                              <Text style={styles.dealCompany}>{deal.company_name}</Text>
                            )}
                          </View>
                          <View
                            style={[
                              styles.statusBadge,
                              isActive ? styles.statusCompleted : styles.statusNeutral,
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusBadgeText,
                                isActive ? styles.statusCompletedText : styles.statusNeutralText,
                              ]}
                            >
                              {String(deal.status || 'Active').toUpperCase()}
                            </Text>
                          </View>
                        </View>

                        {/* Badges / Sector / Stage */}
                        <View style={styles.dealMetaRow}>
                          {Boolean(deal.sector) && (
                            <View style={styles.metaPill}>
                              <Text style={styles.metaPillText}>{deal.sector}</Text>
                            </View>
                          )}
                          {Boolean(deal.stage) && (
                            <View style={[styles.metaPill, styles.metaPillStage]}>
                              <Text style={[styles.metaPillText, styles.metaPillStageText]}>{deal.stage}</Text>
                            </View>
                          )}
                          {Boolean(deal.type) && (
                            <View style={[styles.metaPill, styles.metaPillType]}>
                              <Text style={[styles.metaPillText, styles.metaPillTypeText]}>{deal.type}</Text>
                            </View>
                          )}
                        </View>

                        {/* Deal Summary / Pitch */}
                        {Boolean(deal.short_pitch || deal.description) && (
                          <Text style={styles.dealPitch} numberOfLines={2}>
                            {deal.short_pitch || deal.description}
                          </Text>
                        )}

                        {/* Deal Target & Minimum */}
                        {(Boolean(deal.target_amount) || Boolean(deal.min_investment)) && (
                          <View style={styles.dealStatsBox}>
                            {Boolean(deal.target_amount) && (
                              <View style={styles.dealStatItem}>
                                <Text style={styles.dealStatLabel}>Target Round</Text>
                                <Text style={styles.dealStatValue}>
                                  BDT {Number(deal.target_amount).toLocaleString()}
                                </Text>
                              </View>
                            )}
                            {Boolean(deal.min_investment) && (
                              <View style={styles.dealStatItem}>
                                <Text style={styles.dealStatLabel}>Min Ticket</Text>
                                <Text style={styles.dealStatValue}>
                                  BDT {Number(deal.min_investment).toLocaleString()}
                                </Text>
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {/* TAB: SUBMISSIONS / FOUNDER PITCHES / ANGEL ACADEMY */}
          {(activeTab === 'submissions' || activeTab === 'founder-pitches' || activeTab === 'angel-academy') && (
            <View style={styles.tabContent}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionHeading}>Inbound Applications</Text>
                  <Text style={styles.sectionSubheading}>Founder pitch decks and Angel Academy signups</Text>
                </View>
                <TouchableOpacity style={styles.refreshIconBtn} onPress={() => loadSubmissions(authToken)}>
                  <Ionicons name="refresh" size={18} color={Colors.forest} />
                </TouchableOpacity>
              </View>

              {/* Sub-tab Switcher */}
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[styles.toggleBtn, submissionsSubTab === 'pitches' && styles.toggleBtnActive]}
                  onPress={() => setSubmissionsSubTab('pitches')}
                >
                  <Ionicons
                    name="paper-plane-outline"
                    size={16}
                    color={submissionsSubTab === 'pitches' ? '#FFFFFF' : Colors.muted}
                  />
                  <Text
                    style={[
                      styles.toggleBtnText,
                      submissionsSubTab === 'pitches' && styles.toggleBtnTextActive,
                    ]}
                  >
                    Founder Pitches ({founderPitches.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.toggleBtn, submissionsSubTab === 'academy' && styles.toggleBtnActive]}
                  onPress={() => setSubmissionsSubTab('academy')}
                >
                  <Ionicons
                    name="school-outline"
                    size={16}
                    color={submissionsSubTab === 'academy' ? '#FFFFFF' : Colors.muted}
                  />
                  <Text
                    style={[
                      styles.toggleBtnText,
                      submissionsSubTab === 'academy' && styles.toggleBtnTextActive,
                    ]}
                  >
                    Angel Academy ({academyApplications.length})
                  </Text>
                </TouchableOpacity>
              </View>

              {submissionsLoading ? (
                <View style={styles.listLoadingBox}>
                  <ActivityIndicator size="small" color={Colors.forest} />
                  <Text style={styles.loadingText}>Fetching applications...</Text>
                </View>
              ) : submissionsSubTab === 'pitches' ? (
                /* Founder Pitches List */
                founderPitches.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="folder-open-outline" size={40} color={Colors.mutedLight} />
                    <Text style={styles.emptyTitle}>No Founder Pitches</Text>
                    <Text style={styles.emptyText}>No startup pitch submissions on record.</Text>
                  </View>
                ) : (
                  <View style={styles.cardsList}>
                    {founderPitches.map((pitch) => {
                      const submittedDate = pitch.created_at
                        ? new Date(pitch.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Recent';

                      return (
                        <View key={`pitch-${pitch.id}`} style={styles.submissionCard}>
                          <View style={styles.submissionTop}>
                            <View style={styles.submissionTitleBox}>
                              <Text style={styles.submissionTitle}>{pitch.company_name || pitch.name || 'Startup Pitch'}</Text>
                              <Text style={styles.submissionFounder}>Founder: {pitch.name || pitch.founder_name || 'Anonymous'}</Text>
                            </View>
                            <View style={styles.dateBadge}>
                              <Text style={styles.dateBadgeText}>{submittedDate}</Text>
                            </View>
                          </View>

                          <View style={styles.contactRow}>
                            {Boolean(pitch.email) && (
                              <Text style={styles.contactItem}>✉ {pitch.email}</Text>
                            )}
                            {Boolean(pitch.phone) && (
                              <Text style={styles.contactItem}>📞 {pitch.phone}</Text>
                            )}
                          </View>

                          {Boolean(pitch.elevator_pitch || pitch.description) && (
                            <Text style={styles.submissionDesc} numberOfLines={3}>
                              {pitch.elevator_pitch || pitch.description}
                            </Text>
                          )}

                          <View style={styles.submissionFooter}>
                            <View style={styles.metaPillRow}>
                              {Boolean(pitch.sector) && (
                                <View style={styles.metaPill}>
                                  <Text style={styles.metaPillText}>{pitch.sector}</Text>
                                </View>
                              )}
                              {Boolean(pitch.stage) && (
                                <View style={[styles.metaPill, styles.metaPillStage]}>
                                  <Text style={[styles.metaPillText, styles.metaPillStageText]}>{pitch.stage}</Text>
                                </View>
                              )}
                            </View>

                            <View style={styles.deckIndicator}>
                              <Ionicons name="document-attach" size={14} color={Colors.forest} />
                              <Text style={styles.deckIndicatorText}>Deck Attached</Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )
              ) : (
                /* Angel Academy Applications List */
                academyApplications.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="school-outline" size={40} color={Colors.mutedLight} />
                    <Text style={styles.emptyTitle}>No Academy Applications</Text>
                    <Text style={styles.emptyText}>No applicants have registered for Angel Academy yet.</Text>
                  </View>
                ) : (
                  <View style={styles.cardsList}>
                    {academyApplications.map((app) => {
                      const appDate = app.created_at
                        ? new Date(app.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Recent';

                      return (
                        <View key={`app-${app.id}`} style={styles.submissionCard}>
                          <View style={styles.submissionTop}>
                            <View style={styles.submissionTitleBox}>
                              <Text style={styles.submissionTitle}>{app.name || 'Candidate'}</Text>
                              <Text style={styles.submissionFounder}>{app.occupation || app.designation || 'Angel Candidate'}</Text>
                            </View>
                            <View style={styles.dateBadge}>
                              <Text style={styles.dateBadgeText}>{appDate}</Text>
                            </View>
                          </View>

                          <View style={styles.contactRow}>
                            {Boolean(app.email) && <Text style={styles.contactItem}>✉ {app.email}</Text>}
                            {Boolean(app.phone) && <Text style={styles.contactItem}>📞 {app.phone}</Text>}
                          </View>

                          {Boolean(app.investment_experience || app.background) && (
                            <Text style={styles.submissionDesc} numberOfLines={3}>
                              Experience: {app.investment_experience || app.background}
                            </Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )
              )}
            </View>
          )}

          {/* TAB: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <View style={styles.tabContent}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionHeading}>Member Activity Notifications</Text>
                  <Text style={styles.sectionSubheading}>
                    Real-time investment commitments and expressions of interest
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.refreshIconBtn}
                  onPress={() => loadNotifications(authToken)}
                >
                  <Ionicons name="refresh" size={18} color={Colors.forest} />
                </TouchableOpacity>
              </View>

              {/* Action bar with unread count and Mark All as Read button */}
              <View style={styles.notifActionBar}>
                <View style={styles.notifMetaPill}>
                  <Text style={styles.notifMetaPillText}>
                    {unreadNotificationsCount} Unread • {notifications.length} Total
                  </Text>
                </View>
                {unreadNotificationsCount > 0 && (
                  <TouchableOpacity
                    style={styles.markReadBtn}
                    onPress={handleMarkAllNotificationsRead}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark-done" size={15} color="#0A5554" />
                    <Text style={styles.markReadBtnText}>Mark all as read</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Filter chips */}
              <View style={styles.filterChipsRow}>
                <TouchableOpacity
                  style={[styles.filterChip, notificationFilter === 'all' && styles.filterChipActive]}
                  onPress={() => setNotificationFilter('all')}
                >
                  <Text style={[styles.filterChipText, notificationFilter === 'all' && styles.filterChipTextActive]}>
                    All ({notifications.length})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterChip, notificationFilter === 'unread' && styles.filterChipActive]}
                  onPress={() => setNotificationFilter('unread')}
                >
                  <Text style={[styles.filterChipText, notificationFilter === 'unread' && styles.filterChipTextActive]}>
                    Unread ({unreadNotificationsCount})
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Notifications List */}
              {notificationsLoading ? (
                <View style={styles.listLoadingBox}>
                  <ActivityIndicator size="small" color={Colors.forest} />
                  <Text style={styles.loadingText}>Fetching activity notifications...</Text>
                </View>
              ) : (
                (() => {
                  const filtered = notificationFilter === 'unread'
                    ? notifications.filter((n) => !n.viewed_at)
                    : notifications;

                  if (filtered.length === 0) {
                    return (
                      <View style={styles.emptyState}>
                        <Ionicons name="notifications-off-outline" size={40} color={Colors.mutedLight} />
                        <Text style={styles.emptyTitle}>No Notifications</Text>
                        <Text style={styles.emptyText}>
                          {notificationFilter === 'unread'
                            ? 'All activity notifications have been reviewed!'
                            : 'No recent member activity recorded.'}
                        </Text>
                      </View>
                    );
                  }

                  return (
                    <View style={styles.cardsList}>
                      {filtered.map((item, idx) => {
                        const isUnread = !item.viewed_at;
                        const userName = item.user?.name || item.investor_name || 'Member';
                        const userEmail = item.user?.email || item.investor_email || '';
                        const dealTitle = item.deal?.title || item.deal_name || 'Syndicate Deal';
                        const dateFormatted = item.created_at
                          ? new Date(item.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Recent';

                        return (
                          <View
                            key={`notif-${item.id || idx}`}
                            style={[styles.notificationCard, isUnread && styles.notificationCardUnread]}
                          >
                            <View style={styles.notificationCardTop}>
                              <View style={styles.notificationAvatar}>
                                <Text style={styles.notificationAvatarText}>
                                  {userName.charAt(0).toUpperCase()}
                                </Text>
                              </View>
                              <View style={styles.notificationInfo}>
                                <View style={styles.notificationHeaderRow}>
                                  <Text style={styles.notificationUserName} numberOfLines={1}>
                                    {userName}
                                  </Text>
                                  {isUnread && <View style={styles.unreadAmberDot} />}
                                </View>
                                {Boolean(userEmail) && (
                                  <Text style={styles.notificationEmail} numberOfLines={1}>
                                    {userEmail}
                                  </Text>
                                )}
                              </View>
                              <Text style={styles.notificationDate}>{dateFormatted}</Text>
                            </View>

                            <View style={styles.notificationBody}>
                              <Text style={styles.notificationMessage}>
                                Expressed investment interest in{' '}
                                <Text style={styles.notificationDealBold}>{dealTitle}</Text>
                              </Text>
                              {Boolean(item.amount) && (
                                <View style={styles.notificationAmountPill}>
                                  <Text style={styles.notificationAmountText}>
                                    Target: {item.currency || 'BDT'} {Number(item.amount).toLocaleString()}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  );
                })()
              )}
            </View>
          )}

          {/* TAB: SUBSCRIPTIONS */}
          {activeTab === 'subscriptions' && (
            <View style={styles.tabContent}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionHeading}>Member Subscriptions</Text>
                  <Text style={styles.sectionSubheading}>Tiers, active memberships, and payments</Text>
                </View>
                <TouchableOpacity
                  style={styles.refreshIconBtn}
                  onPress={() => loadSubscriptions(authToken)}
                >
                  <Ionicons name="refresh" size={18} color={Colors.forest} />
                </TouchableOpacity>
              </View>

              {/* Tiers Summary */}
              <Text style={styles.subSectionTitle}>Active Membership Tiers</Text>
              <View style={styles.tiersGrid}>
                {[
                  { name: 'Core Angel', price: 'BDT 5,000/yr', desc: 'Curated deal flow, investor syndicate voting, online pitches' },
                  { name: 'Advanced Angel', price: 'BDT 15,000/yr', desc: 'Direct founder intros, priority allocations, data room access' },
                  { name: 'Institutional', price: 'BDT 50,000/yr', desc: 'Custom SPVs, syndicate co-lead, strategic committee seat' },
                ].map((tier, idx) => (
                  <View key={`tier-${idx}`} style={styles.tierCard}>
                    <Text style={styles.tierName}>{tier.name}</Text>
                    <Text style={styles.tierPrice}>{tier.price}</Text>
                    <Text style={styles.tierDesc}>{tier.desc}</Text>
                  </View>
                ))}
              </View>

              {/* Subscriptions List */}
              <Text style={styles.subSectionTitle}>Subscribed Members</Text>
              {subscriptionsLoading ? (
                <View style={styles.listLoadingBox}>
                  <ActivityIndicator size="small" color={Colors.forest} />
                  <Text style={styles.loadingText}>Fetching subscriptions...</Text>
                </View>
              ) : (
                (() => {
                  const subsList = subscriptionsData?.subscriptions || [];
                  if (subsList.length === 0) {
                    return (
                      <View style={styles.emptyState}>
                        <Ionicons name="card-outline" size={40} color={Colors.mutedLight} />
                        <Text style={styles.emptyTitle}>No Subscriptions on Record</Text>
                        <Text style={styles.emptyText}>Active subscriber entries will appear here.</Text>
                      </View>
                    );
                  }

                  return (
                    <View style={styles.cardsList}>
                      {subsList.map((sub, idx) => {
                        const sUser = sub.user || {};
                        return (
                          <View key={`sub-${sub.id || idx}`} style={styles.subCard}>
                            <View style={styles.subCardHeader}>
                              <View>
                                <Text style={styles.subUserName}>{sUser.name || 'Member'}</Text>
                                <Text style={styles.subUserEmail}>{sUser.email || ''}</Text>
                              </View>
                              <View style={styles.statusCompleted}>
                                <Text style={styles.statusCompletedText}>
                                  {String(sUser.account_status || 'Active').toUpperCase()}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.subCardBottom}>
                              <Text style={styles.subDate}>Tier: {sub.tier_name || 'Angel Member'}</Text>
                              {Boolean(sub.payment?.amount) && (
                                <Text style={styles.subAmount}>
                                  BDT {Number(sub.payment.amount).toLocaleString()}
                                </Text>
                              )}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  );
                })()
              )}
            </View>
          )}

          {/* TAB: INVESTMENTS / INVESTOR INVESTMENTS */}
          {(activeTab === 'investments' || activeTab === 'investor-investments') && (
            <View style={styles.tabContent}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionHeading}>Completed Investments</Text>
                  <Text style={styles.sectionSubheading}>Syndicate and direct portfolio transactions</Text>
                </View>
                <TouchableOpacity
                  style={styles.refreshIconBtn}
                  onPress={() => loadInvestorInvestments(authToken)}
                >
                  <Ionicons name="refresh" size={18} color={Colors.forest} />
                </TouchableOpacity>
              </View>

              {investorInvestmentsLoading ? (
                <View style={styles.listLoadingBox}>
                  <ActivityIndicator size="small" color={Colors.forest} />
                  <Text style={styles.loadingText}>Fetching investments...</Text>
                </View>
              ) : investorInvestments.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="trending-up-outline" size={40} color={Colors.mutedLight} />
                  <Text style={styles.emptyTitle}>No Investment Records</Text>
                  <Text style={styles.emptyText}>Completed investment transactions will appear here.</Text>
                </View>
              ) : (
                <View style={styles.cardsList}>
                  {investorInvestments.map((inv, idx) => (
                    <View key={`inv-${inv.id || idx}`} style={styles.dealCard}>
                      <View style={styles.dealCardHeader}>
                        <View style={styles.dealTitleWrap}>
                          <Text style={styles.dealTitle}>
                            {inv.investor_name || inv.investor?.name || 'Investor'}
                          </Text>
                          <Text style={styles.dealCompany}>
                            Invested in: {inv.startup_name || inv.startup?.title || 'Portfolio Startup'}
                          </Text>
                        </View>
                        <View style={styles.statusCompleted}>
                          <Text style={styles.statusCompletedText}>COMPLETED</Text>
                        </View>
                      </View>
                      <View style={styles.dealMetaRow}>
                        <View style={styles.metaPill}>
                          <Text style={styles.metaPillText}>
                            {inv.currency || 'BDT'} {Number(inv.amount || 0).toLocaleString()}
                          </Text>
                        </View>
                        {Boolean(inv.completed_at) && (
                          <Text style={styles.dealDateText}>
                            {new Date(inv.completed_at).toLocaleDateString()}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* TAB: BLOGS MANAGEMENT */}
          {activeTab === 'blogs' && (
            <View style={styles.tabContent}>
              {/* Header with Title and Pagination Summary */}
              <View style={styles.sectionHeaderRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.sectionHeading}>Editorial Blogs</Text>
                  <Text style={styles.sectionSubheading}>
                    {blogPagination.total > 0
                      ? `Showing ${blogPagination.from}–${blogPagination.to} of ${blogPagination.total} articles`
                      : 'Ecosystem insights, market analysis, and guides'}
                  </Text>
                </View>
                <View style={styles.sectionHeaderActions}>
                  <TouchableOpacity
                    style={styles.addMemberBtn}
                    onPress={handleOpenCreateBlog}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add-circle" size={15} color="#FFFFFF" />
                    <Text style={styles.addMemberBtnText}>New Post</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.refreshIconBtn}
                    onPress={() =>
                      loadBlogs(authToken, blogSearch, blogStatusFilter, blogPagination.currentPage)
                    }
                    disabled={blogsLoading}
                  >
                    <Ionicons
                      name="refresh"
                      size={18}
                      color={Colors.forest}
                      style={blogsLoading ? { opacity: 0.5 } : {}}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Search Box */}
              <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color={Colors.muted} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search articles by title..."
                  placeholderTextColor={Colors.mutedLight}
                  value={blogSearch}
                  onChangeText={(val) => {
                    setBlogSearch(val);
                    loadBlogs(authToken, val, blogStatusFilter, 1);
                  }}
                  autoCapitalize="none"
                  returnKeyType="search"
                />
                {blogSearch.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setBlogSearch('');
                      loadBlogs(authToken, '', blogStatusFilter, 1);
                    }}
                  >
                    <Ionicons name="close-circle" size={18} color={Colors.muted} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Filter Tabs (All / Published / Archived) */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.memberFilterTabsContent}
                style={styles.memberFilterTabsScroll}
              >
                {[
                  { key: 'all', label: 'All Articles', count: blogCounts.all || blogPagination.total },
                  { key: 'published', label: 'Published', count: blogCounts.published },
                  { key: 'archived', label: 'Archived', count: blogCounts.archived },
                ].map((tab) => {
                  const isActive = blogStatusFilter === tab.key;
                  return (
                    <TouchableOpacity
                      key={`blog-filter-${tab.key}`}
                      style={[styles.memberFilterChip, isActive && styles.memberFilterChipActive]}
                      onPress={() => {
                        setBlogStatusFilter(tab.key);
                        loadBlogs(authToken, blogSearch, tab.key, 1);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.memberFilterChipText,
                          isActive && styles.memberFilterChipTextActive,
                        ]}
                      >
                        {tab.label}
                      </Text>
                      <View
                        style={[
                          styles.memberFilterBadge,
                          isActive ? styles.memberFilterBadgeActive : styles.memberFilterBadgeInactive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.memberFilterBadgeText,
                            isActive && styles.memberFilterBadgeTextActive,
                          ]}
                        >
                          {tab.count !== undefined ? tab.count : 0}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Blog List Content */}
              {blogsLoading && blogs.length === 0 ? (
                <View style={styles.listLoadingBox}>
                  <ActivityIndicator size="small" color={Colors.forest} />
                  <Text style={styles.loadingText}>Fetching articles...</Text>
                </View>
              ) : blogs.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="newspaper-outline" size={44} color={Colors.mutedLight} />
                  <Text style={styles.emptyTitle}>No blog posts found</Text>
                  <Text style={styles.emptyText}>
                    No articles match your current search query or filter scope.
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyAddBtn}
                    onPress={handleOpenCreateBlog}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add-circle" size={15} color="#FFFFFF" />
                    <Text style={styles.emptyAddBtnText}>Write New Article</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.cardsList}>
                  {blogsLoading && (
                    <View style={styles.memberListUpdatingBar}>
                      <ActivityIndicator size="small" color={Colors.forest} />
                      <Text style={styles.memberListUpdatingText}>Syncing articles...</Text>
                    </View>
                  )}

                  {blogs.map((blog) => {
                    const isPublished = blog.status === 'published';
                    const isUpdatingStatus = updatingBlogStatusId === blog.id;
                    const cleanExcerpt = blog.excerpt
                      ? blog.excerpt.replace(/<[^>]*>/g, '')
                      : blog.content
                      ? blog.content.replace(/<[^>]*>/g, '').slice(0, 140) + '...'
                      : 'No summary provided.';
                    const readingTime = blog.reading_minutes || (blog.content ? Math.max(1, Math.ceil(blog.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length / 220)) : 3);
                    const formattedDate = blog.published_at
                      ? new Date(blog.published_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Draft';

                    return (
                      <View key={`blog-card-${blog.id}`} style={styles.blogCard}>
                        {/* Badges Row */}
                        <View style={styles.blogCardTop}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', flex: 1 }}>
                            <View style={styles.blogCategoryPill}>
                              <Text style={styles.blogCategoryPillText}>{blog.category || 'Educational'}</Text>
                            </View>
                            <View
                              style={[
                                styles.blogStatusPill,
                                isPublished ? styles.blogStatusPillPublished : styles.blogStatusPillArchived,
                              ]}
                            >
                              <View
                                style={[
                                  styles.blogStatusDot,
                                  { backgroundColor: isPublished ? '#059669' : '#D97706' },
                                ]}
                              />
                              <Text
                                style={[
                                  styles.blogStatusPillText,
                                  { color: isPublished ? '#065F46' : '#92400E' },
                                ]}
                              >
                                {isPublished ? 'Published' : 'Archived'}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.blogReadTimePill}>
                            <Ionicons name="time-outline" size={12} color="#64748B" />
                            <Text style={styles.blogReadTimeText}>{readingTime} min</Text>
                          </View>
                        </View>

                        {/* Title */}
                        <TouchableOpacity
                          onPress={() => handleOpenViewBlog(blog)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.blogCardTitle}>{blog.title}</Text>
                        </TouchableOpacity>

                        {/* Excerpt */}
                        <Text style={styles.blogCardExcerpt} numberOfLines={2}>
                          {cleanExcerpt}
                        </Text>

                        {/* Author & Slug Details */}
                        <View style={styles.blogMetaRow}>
                          <View style={styles.blogMetaAuthorWrap}>
                            <Ionicons name="person-outline" size={13} color="#64748B" />
                            <Text style={styles.blogMetaAuthorText} numberOfLines={1}>
                              {blog.author_name || 'BAN Editorial'}
                            </Text>
                          </View>
                          <Text style={styles.blogMetaDot}>•</Text>
                          <Text style={styles.blogMetaDateText}>{formattedDate}</Text>
                        </View>
                        <Text style={styles.blogSlugText} numberOfLines={1}>
                          /{blog.slug}
                        </Text>

                        {/* Action Buttons Toolbar */}
                        <View style={styles.blogActionsToolbar}>
                          {/* Read / Preview */}
                          <TouchableOpacity
                            style={styles.blogActionBtn}
                            onPress={() => handleOpenViewBlog(blog)}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="eye-outline" size={15} color="#0A5554" />
                            <Text style={styles.blogActionBtnText}>Read</Text>
                          </TouchableOpacity>

                          {/* Edit */}
                          <TouchableOpacity
                            style={styles.blogActionBtn}
                            onPress={() => handleOpenEditBlog(blog)}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="create-outline" size={15} color="#0A5554" />
                            <Text style={styles.blogActionBtnText}>Edit</Text>
                          </TouchableOpacity>

                          {/* Publish / Archive Toggle */}
                          <TouchableOpacity
                            style={[
                              styles.blogActionBtn,
                              isPublished ? styles.blogActionBtnArchive : styles.blogActionBtnPublish,
                            ]}
                            onPress={() => handleToggleBlogStatus(blog)}
                            disabled={isUpdatingStatus}
                            activeOpacity={0.7}
                          >
                            {isUpdatingStatus ? (
                              <ActivityIndicator size="small" color={isPublished ? '#B45309' : '#047857'} />
                            ) : (
                              <>
                                <Ionicons
                                  name={isPublished ? 'archive-outline' : 'checkmark-done-outline'}
                                  size={15}
                                  color={isPublished ? '#B45309' : '#047857'}
                                />
                                <Text
                                  style={[
                                    styles.blogActionBtnText,
                                    { color: isPublished ? '#B45309' : '#047857' },
                                  ]}
                                >
                                  {isPublished ? 'Archive' : 'Publish'}
                                </Text>
                              </>
                            )}
                          </TouchableOpacity>

                          {/* Delete */}
                          <TouchableOpacity
                            style={styles.blogActionDeleteBtn}
                            onPress={() => handleOpenDeleteBlogModal(blog)}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="trash-outline" size={16} color="#DC2626" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}

                  {/* Pagination Bar */}
                  {blogPagination.lastPage > 1 && (
                    <View style={styles.paginationContainer}>
                      <TouchableOpacity
                        style={[
                          styles.paginationBtn,
                          blogPagination.currentPage <= 1 && styles.paginationBtnDisabled,
                        ]}
                        onPress={() => {
                          if (blogPagination.currentPage > 1) {
                            loadBlogs(
                              authToken,
                              blogSearch,
                              blogStatusFilter,
                              blogPagination.currentPage - 1
                            );
                          }
                        }}
                        disabled={blogPagination.currentPage <= 1 || blogsLoading}
                      >
                        <Ionicons
                          name="chevron-back"
                          size={16}
                          color={blogPagination.currentPage <= 1 ? '#9CA3AF' : '#0A5554'}
                        />
                        <Text
                          style={[
                            styles.paginationBtnText,
                            blogPagination.currentPage <= 1 && styles.paginationBtnTextDisabled,
                          ]}
                        >
                          Prev
                        </Text>
                      </TouchableOpacity>

                      <View style={styles.paginationInfoBox}>
                        <Text style={styles.paginationInfoText}>
                          Page {blogPagination.currentPage} of {blogPagination.lastPage}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.paginationBtn,
                          blogPagination.currentPage >= blogPagination.lastPage && styles.paginationBtnDisabled,
                        ]}
                        onPress={() => {
                          if (blogPagination.currentPage < blogPagination.lastPage) {
                            loadBlogs(
                              authToken,
                              blogSearch,
                              blogStatusFilter,
                              blogPagination.currentPage + 1
                            );
                          }
                        }}
                        disabled={blogPagination.currentPage >= blogPagination.lastPage || blogsLoading}
                      >
                        <Text
                          style={[
                            styles.paginationBtnText,
                            blogPagination.currentPage >= blogPagination.lastPage && styles.paginationBtnTextDisabled,
                          ]}
                        >
                          Next
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color={blogPagination.currentPage >= blogPagination.lastPage ? '#9CA3AF' : '#0A5554'}
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* TAB: PUBLICATIONS */}
          {activeTab === 'publications' && (
            <View style={styles.tabContent}>
              {/* Header */}
              <View style={styles.sectionHeaderRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.sectionHeading}>Research Publications</Text>
                  <Text style={styles.sectionSubheading}>
                    {publicationPagination.total > 0
                      ? `Showing ${publicationPagination.from}–${publicationPagination.to} of ${publicationPagination.total} reports`
                      : 'Upload and manage whitepapers, legal guides, and research'}
                  </Text>
                </View>
                <View style={styles.sectionHeaderActions}>
                  <TouchableOpacity
                    style={styles.addMemberBtn}
                    onPress={handleOpenCreatePublication}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add-circle" size={15} color="#FFFFFF" />
                    <Text style={styles.addMemberBtnText}>New Report</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.refreshIconBtn}
                    onPress={() =>
                      loadPublications(
                        authToken,
                        publicationSearch,
                        publicationStatusFilter,
                        publicationPagination.currentPage
                      )
                    }
                    disabled={publicationsLoading}
                  >
                    <Ionicons
                      name="refresh"
                      size={18}
                      color={Colors.forest}
                      style={publicationsLoading ? { opacity: 0.5 } : {}}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Search Box */}
              <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color={Colors.muted} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by title, summary, or category..."
                  placeholderTextColor={Colors.mutedLight}
                  value={publicationSearch}
                  onChangeText={(val) => {
                    setPublicationSearch(val);
                    loadPublications(authToken, val, publicationStatusFilter, 1);
                  }}
                  autoCapitalize="none"
                  returnKeyType="search"
                />
                {publicationSearch.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setPublicationSearch('');
                      loadPublications(authToken, '', publicationStatusFilter, 1);
                    }}
                  >
                    <Ionicons name="close-circle" size={18} color={Colors.muted} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Filter Tabs (All / Published / Archived) */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.memberFilterTabsContent}
                style={styles.memberFilterTabsScroll}
              >
                {[
                  {
                    key: 'all',
                    label: 'All Reports',
                    count: publicationCounts.all || publicationPagination.total,
                  },
                  { key: 'published', label: 'Published', count: publicationCounts.published },
                  { key: 'archived', label: 'Archived', count: publicationCounts.archived },
                ].map((tab) => {
                  const isActive = publicationStatusFilter === tab.key;
                  return (
                    <TouchableOpacity
                      key={`pub-filter-${tab.key}`}
                      style={[styles.memberFilterChip, isActive && styles.memberFilterChipActive]}
                      onPress={() => {
                        setPublicationStatusFilter(tab.key);
                        loadPublications(authToken, publicationSearch, tab.key, 1);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.memberFilterChipText,
                          isActive && styles.memberFilterChipTextActive,
                        ]}
                      >
                        {tab.label}
                      </Text>
                      <View
                        style={[
                          styles.memberFilterBadge,
                          isActive ? styles.memberFilterBadgeActive : styles.memberFilterBadgeInactive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.memberFilterBadgeText,
                            isActive && styles.memberFilterBadgeTextActive,
                          ]}
                        >
                          {tab.count !== undefined ? tab.count : 0}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Publication List Content */}
              {publicationsLoading && publications.length === 0 ? (
                <View style={styles.listLoadingBox}>
                  <ActivityIndicator size="small" color={Colors.forest} />
                  <Text style={styles.loadingText}>Fetching publications...</Text>
                </View>
              ) : publications.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="document-text-outline" size={44} color={Colors.mutedLight} />
                  <Text style={styles.emptyTitle}>No publications found</Text>
                  <Text style={styles.emptyText}>
                    No research reports match your current search query or filter scope.
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyAddBtn}
                    onPress={handleOpenCreatePublication}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add-circle" size={15} color="#FFFFFF" />
                    <Text style={styles.emptyAddBtnText}>Add New Publication</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.cardsList}>
                  {publicationsLoading && (
                    <View style={styles.memberListUpdatingBar}>
                      <ActivityIndicator size="small" color={Colors.forest} />
                      <Text style={styles.memberListUpdatingText}>Syncing publications...</Text>
                    </View>
                  )}

                  {publications.map((pub) => {
                    const isPublished = pub.status === 'published';
                    const isUpdatingStatus = updatingPublicationStatusId === pub.id;
                    const formattedDate = pub.published_at
                      ? new Date(pub.published_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : pub.created_at
                      ? new Date(pub.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Draft';

                    const pdfFileName =
                      pub.pdf_original_name ||
                      (pub.pdf_path ? pub.pdf_path.split('/').pop() : 'Report.pdf');
                    const downloadUrl =
                      pub.download_url ||
                      `https://bdangels.co/api/publications/${pub.id}/download`;

                    return (
                      <View key={`pub-card-${pub.id}`} style={styles.pubCard}>
                        {/* Badges Row */}
                        <View style={styles.blogCardTop}>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 6,
                              flexWrap: 'wrap',
                              flex: 1,
                            }}
                          >
                            <View style={styles.pubCategoryPill}>
                              <Text style={styles.pubCategoryPillText}>
                                {pub.category || 'Research'}
                              </Text>
                            </View>
                            <View
                              style={[
                                styles.blogStatusPill,
                                isPublished
                                  ? styles.blogStatusPillPublished
                                  : styles.blogStatusPillArchived,
                              ]}
                            >
                              <View
                                style={[
                                  styles.blogStatusDot,
                                  { backgroundColor: isPublished ? '#059669' : '#D97706' },
                                ]}
                              />
                              <Text
                                style={[
                                  styles.blogStatusPillText,
                                  { color: isPublished ? '#065F46' : '#92400E' },
                                ]}
                              >
                                {isPublished ? 'Published' : 'Archived'}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.pubDatePill}>
                            <Ionicons name="calendar-outline" size={12} color="#64748B" />
                            <Text style={styles.pubDateText}>{formattedDate}</Text>
                          </View>
                        </View>

                        {/* Title */}
                        <TouchableOpacity
                          onPress={() => handleOpenViewPublication(pub)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.blogCardTitle}>{pub.title}</Text>
                        </TouchableOpacity>

                        {/* Excerpt / Summary */}
                        {Boolean(pub.excerpt) && (
                          <Text style={styles.blogCardExcerpt} numberOfLines={2}>
                            {pub.excerpt}
                          </Text>
                        )}

                        {/* PDF File Pill with direct download trigger */}
                        <TouchableOpacity
                          style={styles.pubPdfBar}
                          onPress={async () => {
                            try {
                              const canOpen = await Linking.canOpenURL(downloadUrl);
                              if (canOpen) {
                                await Linking.openURL(downloadUrl);
                              } else {
                                Alert.alert('Cannot Open Link', downloadUrl);
                              }
                            } catch {
                              Linking.openURL(downloadUrl);
                            }
                          }}
                          activeOpacity={0.7}
                        >
                          <View style={styles.pubPdfIconWrap}>
                            <Ionicons name="document-text" size={16} color="#DC2626" />
                          </View>
                          <Text style={styles.pubPdfName} numberOfLines={1}>
                            {pdfFileName}
                          </Text>
                          <View style={styles.pubPdfActionBtn}>
                            <Ionicons name="arrow-down-circle" size={15} color="#0A5554" />
                            <Text style={styles.pubPdfActionText}>Download</Text>
                          </View>
                        </TouchableOpacity>

                        {/* Action Buttons Toolbar */}
                        <View style={styles.blogActionsToolbar}>
                          {/* Preview / View */}
                          <TouchableOpacity
                            style={styles.blogActionBtn}
                            onPress={() => handleOpenViewPublication(pub)}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="eye-outline" size={15} color="#0A5554" />
                            <Text style={styles.blogActionBtnText}>Preview</Text>
                          </TouchableOpacity>

                          {/* Edit */}
                          <TouchableOpacity
                            style={styles.blogActionBtn}
                            onPress={() => handleOpenEditPublication(pub)}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="create-outline" size={15} color="#0A5554" />
                            <Text style={styles.blogActionBtnText}>Edit</Text>
                          </TouchableOpacity>

                          {/* Publish / Archive Toggle */}
                          <TouchableOpacity
                            style={[
                              styles.blogActionBtn,
                              isPublished ? styles.blogActionBtnArchive : styles.blogActionBtnPublish,
                            ]}
                            onPress={() => handleTogglePublicationStatus(pub)}
                            disabled={isUpdatingStatus}
                            activeOpacity={0.7}
                          >
                            {isUpdatingStatus ? (
                              <ActivityIndicator
                                size="small"
                                color={isPublished ? '#B45309' : '#047857'}
                              />
                            ) : (
                              <>
                                <Ionicons
                                  name={isPublished ? 'archive-outline' : 'checkmark-done-outline'}
                                  size={15}
                                  color={isPublished ? '#B45309' : '#047857'}
                                />
                                <Text
                                  style={[
                                    styles.blogActionBtnText,
                                    isPublished
                                      ? styles.blogActionBtnTextArchive
                                      : styles.blogActionBtnTextPublish,
                                  ]}
                                >
                                  {isPublished ? 'Archive' : 'Publish'}
                                </Text>
                              </>
                            )}
                          </TouchableOpacity>

                          {/* Delete */}
                          <TouchableOpacity
                            style={styles.blogActionDeleteBtn}
                            onPress={() => handleOpenDeletePublicationModal(pub)}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="trash-outline" size={16} color="#DC2626" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}

                  {/* Pagination Footer */}
                  {publicationPagination.lastPage > 1 && (
                    <View style={styles.paginationBar}>
                      <TouchableOpacity
                        style={[
                          styles.paginationBtn,
                          publicationPagination.currentPage <= 1 && styles.paginationBtnDisabled,
                        ]}
                        disabled={publicationPagination.currentPage <= 1 || publicationsLoading}
                        onPress={() => {
                          const prevPage = publicationPagination.currentPage - 1;
                          loadPublications(
                            authToken,
                            publicationSearch,
                            publicationStatusFilter,
                            prevPage
                          );
                        }}
                      >
                        <Ionicons
                          name="chevron-back"
                          size={16}
                          color={publicationPagination.currentPage <= 1 ? '#9CA3AF' : '#0A5554'}
                        />
                        <Text
                          style={[
                            styles.paginationBtnText,
                            publicationPagination.currentPage <= 1 &&
                              styles.paginationBtnTextDisabled,
                          ]}
                        >
                          Prev
                        </Text>
                      </TouchableOpacity>

                      <Text style={styles.paginationInfo}>
                        Page {publicationPagination.currentPage} of{' '}
                        {publicationPagination.lastPage} ({publicationPagination.total} total)
                      </Text>

                      <TouchableOpacity
                        style={[
                          styles.paginationBtn,
                          publicationPagination.currentPage >= publicationPagination.lastPage &&
                            styles.paginationBtnDisabled,
                        ]}
                        disabled={
                          publicationPagination.currentPage >= publicationPagination.lastPage ||
                          publicationsLoading
                        }
                        onPress={() => {
                          const nextPage = publicationPagination.currentPage + 1;
                          loadPublications(
                            authToken,
                            publicationSearch,
                            publicationStatusFilter,
                            nextPage
                          );
                        }}
                      >
                        <Text
                          style={[
                            styles.paginationBtnText,
                            publicationPagination.currentPage >= publicationPagination.lastPage &&
                              styles.paginationBtnTextDisabled,
                          ]}
                        >
                          Next
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color={
                            publicationPagination.currentPage >= publicationPagination.lastPage
                              ? '#9CA3AF'
                              : '#0A5554'
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* TAB: HOMEPAGE STATS */}
          {activeTab === 'landing-stats' && (
            <View style={styles.tabContent}>
              <View style={styles.sectionHeaderRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.sectionHeading}>Homepage Statistics</Text>
                  <Text style={styles.sectionSubheading}>
                    Update the three figures shown below the main landing-page introduction
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.refreshIconBtn}
                  onPress={() => loadLandingPageStats(authToken)}
                  disabled={landingPageStatsLoading}
                  accessibilityLabel="Refresh statistics"
                >
                  {landingPageStatsLoading ? (
                    <ActivityIndicator size="small" color={Colors.forest} />
                  ) : (
                    <Ionicons name="refresh" size={18} color={Colors.forest} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Unsaved Draft Changes Pill */}
              {hasUnsavedStatsChanges && (
                <View style={styles.statsUnsavedBanner}>
                  <Ionicons name="alert-circle" size={18} color="#D97706" />
                  <Text style={styles.statsUnsavedBannerText}>
                    {"You have unsaved changes. Tap 'Save Changes' below to apply to the live site."}
                  </Text>
                </View>
              )}

              {/* Hero Live Preview Card */}
              <View style={styles.statsPreviewContainer}>
                <View style={styles.statsPreviewHeader}>
                  <View style={styles.statsPreviewHeaderTitleRow}>
                    <Ionicons name="eye-outline" size={16} color="#0A5554" />
                    <Text style={styles.statsPreviewHeaderTitle}>LIVE LANDING-PAGE PREVIEW</Text>
                  </View>
                  <View style={styles.statsPreviewLiveBadge}>
                    <View style={styles.statsPreviewLiveDot} />
                    <Text style={styles.statsPreviewLiveBadgeText}>Live Preview</Text>
                  </View>
                </View>

                {/* Dark Hero Strip Banner */}
                <View style={styles.heroStripBanner}>
                  <View style={styles.heroStripTopline}>
                    <View style={styles.heroStripDot} />
                    <Text style={styles.heroStripNetworkText}>BAN AT A GLANCE</Text>
                    <Text style={styles.heroStripSiteText}>bdangels.co</Text>
                  </View>

                  <View style={styles.heroProofRow}>
                    {landingPageStats.map((item, idx) => {
                      const isLast = idx === landingPageStats.length - 1;
                      return (
                        <View
                          key={`preview-${item.id || idx}`}
                          style={[
                            styles.heroProofItem,
                            !isLast && styles.heroProofItemBorder,
                          ]}
                        >
                          <Text style={styles.heroProofVal} numberOfLines={1}>
                            {item.value || '—'}
                          </Text>
                          <Text style={styles.heroProofLbl} numberOfLines={2}>
                            {item.label ? item.label : 'Label text'}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>

              {/* Editable Stat Cards */}
              <View style={styles.statsEditorSection}>
                <View style={styles.statsEditorHeadingRow}>
                  <Text style={styles.statsEditorHeading}>STATISTIC CARDS</Text>
                  <Text style={styles.statsEditorSubheading}>
                    {landingPageStats.length} metrics configured
                  </Text>
                </View>

                {landingPageStatsLoading && landingPageStats.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color="#0A5554" />
                    <Text style={styles.emptyText}>Loading statistics...</Text>
                  </View>
                ) : (
                  landingPageStats.map((stat, idx) => {
                    const original = originalLandingPageStats[idx];
                    const isModified =
                      original &&
                      (stat.value !== original.value || stat.label !== original.label);

                    return (
                      <View key={`stat-card-${stat.id || idx}`} style={styles.statEditCard}>
                        {/* Card Top Row */}
                        <View style={styles.statEditCardHeader}>
                          <View style={styles.statEditCardBadge}>
                            <Ionicons name="stats-chart" size={14} color="#0A5554" />
                            <Text style={styles.statEditCardBadgeText}>
                              STATISTIC #{idx + 1}
                            </Text>
                          </View>
                          <View style={styles.statEditCardRightTags}>
                            {isModified && (
                              <View style={styles.statModifiedBadge}>
                                <Text style={styles.statModifiedBadgeText}>Modified</Text>
                              </View>
                            )}
                            <View style={styles.statOrderPill}>
                              <Text style={styles.statOrderPillText}>
                                Order {stat.sort_order || idx + 1}
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Figure Input */}
                        <View style={styles.statFieldGroup}>
                          <View style={styles.statFieldLabelRow}>
                            <Text style={styles.statFieldLabel}>Figure / Value *</Text>
                            <Text style={styles.statCharCount}>
                              {(stat.value || '').length}/40
                            </Text>
                          </View>
                          <TextInput
                            style={styles.statInput}
                            value={stat.value}
                            onChangeText={(val) => handleUpdateStatField(stat.id, 'value', val)}
                            placeholder="e.g. 500+, $12M+, 51"
                            placeholderTextColor="#94A3B8"
                            maxLength={40}
                            autoCapitalize="none"
                            autoCorrect={false}
                          />
                          <Text style={styles.statFieldHint}>
                            Shown in large bold numbers on the landing hero.
                          </Text>
                        </View>

                        {/* Label Input */}
                        <View style={[styles.statFieldGroup, { marginBottom: 0 }]}>
                          <View style={styles.statFieldLabelRow}>
                            <Text style={styles.statFieldLabel}>Label *</Text>
                            <Text style={styles.statCharCount}>
                              {(stat.label || '').length}/120
                            </Text>
                          </View>
                          <TextInput
                            style={styles.statTextarea}
                            value={stat.label}
                            onChangeText={(val) => handleUpdateStatField(stat.id, 'label', val)}
                            placeholder={'e.g. Angel\ninvestors'}
                            placeholderTextColor="#94A3B8"
                            multiline
                            numberOfLines={3}
                            maxLength={120}
                            textAlignVertical="top"
                          />
                          <View style={styles.statTextareaHintRow}>
                            <Ionicons name="bulb-outline" size={13} color="#64748B" />
                            <Text style={styles.statFieldHintLine}>
                              Add a line break (Enter) where you want the label to wrap.
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>

              {/* Action Buttons Bar */}
              <View style={styles.statActionButtonsBar}>
                <TouchableOpacity
                  style={[
                    styles.statDiscardBtn,
                    (!hasUnsavedStatsChanges || landingPageStatsSaving) && styles.statBtnDisabled,
                  ]}
                  onPress={handleResetLandingPageStats}
                  disabled={!hasUnsavedStatsChanges || landingPageStatsSaving}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="arrow-undo-outline"
                    size={17}
                    color={hasUnsavedStatsChanges ? '#64748B' : '#94A3B8'}
                  />
                  <Text
                    style={[
                      styles.statDiscardBtnText,
                      (!hasUnsavedStatsChanges || landingPageStatsSaving) && { color: '#94A3B8' },
                    ]}
                  >
                    Discard
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statSaveBtn,
                    (!hasUnsavedStatsChanges || landingPageStatsSaving) && styles.statSaveBtnDisabled,
                  ]}
                  onPress={handleSaveLandingPageStats}
                  disabled={!hasUnsavedStatsChanges || landingPageStatsSaving}
                  activeOpacity={0.85}
                >
                  {landingPageStatsSaving ? (
                    <>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={styles.statSaveBtnText}>Saving changes...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                      <Text style={styles.statSaveBtnText}>Save changes</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* View on website link card */}
              <TouchableOpacity
                style={styles.statsExternalLinkCard}
                onPress={() => {
                  Linking.openURL('https://bdangels.co').catch(() => {
                    Alert.alert('Notice', 'Could not open https://bdangels.co');
                  });
                }}
                activeOpacity={0.8}
              >
                <View style={styles.statsExternalLinkLeft}>
                  <Ionicons name="globe-outline" size={20} color="#0A5554" />
                  <View>
                    <Text style={styles.statsExternalLinkTitle}>View section on live site</Text>
                    <Text style={styles.statsExternalLinkDesc}>bdangels.co hero landing banner</Text>
                  </View>
                </View>
                <Ionicons name="open-outline" size={18} color="#0A5554" />
              </TouchableOpacity>
            </View>
          )}

          {/* TAB: HOMEPAGE PROGRAMS */}
          {activeTab === 'landing-programs' && (
            <View style={styles.tabContent}>
              {/* Header Row */}
              <View style={styles.sectionHeaderRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.sectionHeading}>Homepage Programs</Text>
                  <Text style={styles.sectionSubheading}>
                    Manage up to 5 program cards shown in the programs section on the landing page
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.refreshIconBtn}
                  onPress={() => loadLandingPrograms(authToken)}
                  disabled={landingProgramsLoading}
                  accessibilityLabel="Refresh programs"
                >
                  {landingProgramsLoading ? (
                    <ActivityIndicator size="small" color={Colors.forest} />
                  ) : (
                    <Ionicons name="refresh" size={18} color={Colors.forest} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Top Summary Bar & Add Program Button */}
              <View style={styles.programsActionBar}>
                <View style={styles.programsCountPill}>
                  <Ionicons name="layers" size={14} color="#0A5554" />
                  <Text style={styles.programsCountPillText}>
                    {landingPrograms.length} / 5 cards
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.programsAddBtn,
                    landingPrograms.length >= 5 && styles.programsAddBtnDisabled,
                  ]}
                  onPress={handleOpenCreateProgram}
                  disabled={landingPrograms.length >= 5}
                  activeOpacity={0.85}
                >
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                  <Text style={styles.programsAddBtnText}>Add Program</Text>
                </TouchableOpacity>
              </View>

              {/* Maximum cards notice */}
              {landingPrograms.length >= 5 && (
                <View style={styles.programsMaxBanner}>
                  <Ionicons name="information-circle" size={16} color="#92400E" />
                  <Text style={styles.programsMaxBannerText}>
                    {"Maximum limit reached (5 cards). Remove or edit existing cards to change the section."}
                  </Text>
                </View>
              )}

              {/* LIVE CARDS PREVIEW SECTION */}
              {landingPrograms.length > 0 && (
                <View style={styles.programsPreviewContainer}>
                  <View style={styles.programsPreviewHeader}>
                    <View style={styles.programsPreviewHeaderLeft}>
                      <Ionicons name="eye-outline" size={16} color="#0A5554" />
                      <Text style={styles.programsPreviewHeaderTitle}>
                        LIVE HOMEPAGE PREVIEW
                      </Text>
                    </View>
                    <View style={styles.programsPreviewBadge}>
                      <Text style={styles.programsPreviewBadgeText}>bdangels.co/ #programs</Text>
                    </View>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.programsPreviewScrollContent}
                  >
                    {landingPrograms.map((prog, idx) => {
                      const themeMeta =
                        PROGRAM_THEMES.find((t) => t.value === prog.theme) ||
                        PROGRAM_THEMES[4]; // fallback white
                      const isDark = prog.theme === 'dark';

                      return (
                        <View
                          key={`live-preview-${prog.id || idx}`}
                          style={[
                            styles.liveProgramPreviewCard,
                            {
                              backgroundColor: themeMeta.bg,
                              borderColor: themeMeta.border,
                            },
                          ]}
                        >
                          <View style={styles.liveProgramPreviewTop}>
                            <Text
                              style={[
                                styles.liveProgramEyebrow,
                                { color: isDark ? '#10B981' : '#0A5554' },
                              ]}
                              numberOfLines={1}
                            >
                              {prog.eyebrow || prog.badge || 'PROGRAM'}
                            </Text>
                            <Text
                              style={[
                                styles.liveProgramTitle,
                                { color: isDark ? '#FFFFFF' : '#0F172A' },
                              ]}
                              numberOfLines={1}
                            >
                              {prog.title}
                            </Text>
                            <Text
                              style={[
                                styles.liveProgramDesc,
                                { color: isDark ? '#94A3B8' : '#475569' },
                              ]}
                              numberOfLines={3}
                            >
                              {prog.description}
                            </Text>
                          </View>

                          <View style={styles.liveProgramActions}>
                            <View
                              style={[
                                styles.liveProgramActionBtn,
                                isDark
                                  ? styles.liveProgramActionBtnDark
                                  : styles.liveProgramActionBtnLight,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.liveProgramActionText,
                                  isDark ? { color: '#042F2E' } : { color: '#0A5554' },
                                ]}
                                numberOfLines={1}
                              >
                                {prog.primary_label || prog.link_label || 'Explore'} ↗
                              </Text>
                            </View>

                            {Boolean(prog.secondary_label) && (
                              <View
                                style={[
                                  styles.liveProgramSecBtn,
                                  isDark
                                    ? styles.liveProgramSecBtnDark
                                    : styles.liveProgramSecBtnLight,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.liveProgramSecText,
                                    isDark ? { color: '#E2E8F0' } : { color: '#334155' },
                                  ]}
                                  numberOfLines={1}
                                >
                                  {prog.secondary_label} ↗
                                </Text>
                              </View>
                            )}

                            {Boolean(prog.dropdown_items?.label) && (
                              <View
                                style={[
                                  styles.liveProgramDropBtn,
                                  isDark
                                    ? styles.liveProgramSecBtnDark
                                    : styles.liveProgramSecBtnLight,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.liveProgramSecText,
                                    isDark ? { color: '#E2E8F0' } : { color: '#334155' },
                                  ]}
                                  numberOfLines={1}
                                >
                                  {prog.dropdown_items.label} ▾
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {/* LIST OF PROGRAM CARDS */}
              <View style={styles.programCardsListWrap}>
                <View style={styles.programCardsListHeadingRow}>
                  <Text style={styles.programCardsListHeading}>CONFIGURED PROGRAM CARDS</Text>
                  <Text style={styles.programCardsListSubheading}>
                    Sorted by display order
                  </Text>
                </View>

                {landingProgramsLoading && landingPrograms.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color="#0A5554" />
                    <Text style={styles.emptyText}>Loading program cards...</Text>
                  </View>
                ) : landingPrograms.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="layers-outline" size={48} color="#94A3B8" />
                    <Text style={styles.emptyTitle}>No Program Cards Yet</Text>
                    <Text style={styles.emptyText}>
                      Add program cards to showcase BWIN, Angel Academy, Syndicates, and services on the homepage.
                    </Text>
                    <TouchableOpacity
                      style={styles.emptyActionBtn}
                      onPress={handleOpenCreateProgram}
                    >
                      <Ionicons name="add" size={16} color="#FFFFFF" />
                      <Text style={styles.emptyActionBtnText}>Add First Program</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  landingPrograms.map((prog, idx) => {
                    const themeMeta =
                      PROGRAM_THEMES.find((t) => t.value === prog.theme) ||
                      PROGRAM_THEMES[4];
                    const hasDropdown = Boolean(prog.dropdown_items?.label);
                    const dropdownItemCount = (prog.dropdown_items?.items || []).length;

                    return (
                      <View key={`program-card-${prog.id || idx}`} style={styles.programCardItem}>
                        {/* Header Row */}
                        <View style={styles.programCardItemHeader}>
                          <View style={styles.programCardItemBadges}>
                            <View style={styles.programOrderBadge}>
                              <Text style={styles.programOrderBadgeText}>
                                #{idx + 1}
                              </Text>
                            </View>
                            <View style={styles.programEyebrowPill}>
                              <Text style={styles.programEyebrowPillText} numberOfLines={1}>
                                {prog.eyebrow || prog.badge || 'Program'}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.programCardThemeBadge}>
                            <View
                              style={[
                                styles.programThemeColorDot,
                                { backgroundColor: themeMeta.dot },
                              ]}
                            />
                            <Text style={styles.programCardThemeText}>
                              {themeMeta.label}
                            </Text>
                          </View>
                        </View>

                        {/* Title & Description */}
                        <Text style={styles.programCardItemTitle}>{prog.title}</Text>
                        <Text style={styles.programCardItemDesc} numberOfLines={3}>
                          {prog.description}
                        </Text>

                        {/* Action Details Pills */}
                        <View style={styles.programMetaInfoRow}>
                          <View style={styles.programActionTag}>
                            <Ionicons name="arrow-forward-circle" size={13} color="#0A5554" />
                            <Text style={styles.programActionTagText} numberOfLines={1}>
                              {prog.primary_label || prog.link_label} → {prog.primary_link || prog.link_url}
                            </Text>
                          </View>

                          {Boolean(prog.secondary_label) && (
                            <View style={styles.programActionTag}>
                              <Ionicons name="open-outline" size={12} color="#0369A1" />
                              <Text style={[styles.programActionTagText, { color: '#0369A1' }]} numberOfLines={1}>
                                {prog.secondary_label} → {prog.secondary_link}
                              </Text>
                            </View>
                          )}

                          {hasDropdown && (
                            <View style={[styles.programActionTag, { backgroundColor: '#F3E8FF' }]}>
                              <Ionicons name="list-outline" size={12} color="#7E22CE" />
                              <Text style={[styles.programActionTagText, { color: '#7E22CE' }]} numberOfLines={1}>
                                Dropdown: {prog.dropdown_items.label} ({dropdownItemCount} items)
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* Card Bottom Actions */}
                        <View style={styles.programCardActionsBar}>
                          <View style={styles.programOrderDisplay}>
                            <Text style={styles.programOrderDisplayText}>
                              Sort Order: <Text style={{ fontWeight: '800' }}>{prog.sort_order ?? idx + 1}</Text>
                            </Text>
                          </View>

                          <View style={styles.programCardBtnGroup}>
                            <TouchableOpacity
                              style={styles.programEditBtn}
                              onPress={() => handleOpenEditProgram(prog)}
                              activeOpacity={0.8}
                            >
                              <Ionicons name="pencil-outline" size={14} color="#0A5554" />
                              <Text style={styles.programEditBtnText}>Edit</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.programDeleteBtn}
                              onPress={() => handleOpenDeleteProgram(prog)}
                              activeOpacity={0.8}
                              accessibilityLabel={`Delete program ${prog.title}`}
                            >
                              <Ionicons name="trash-outline" size={15} color="#DC2626" />
                              <Text style={styles.programDeleteBtnText}>Remove</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>

              {/* View on website link card */}
              <TouchableOpacity
                style={styles.statsExternalLinkCard}
                onPress={() => {
                  Linking.openURL('https://bdangels.co#programs').catch(() => {
                    Alert.alert('Notice', 'Could not open https://bdangels.co#programs');
                  });
                }}
                activeOpacity={0.8}
              >
                <View style={styles.statsExternalLinkLeft}>
                  <Ionicons name="globe-outline" size={20} color="#0A5554" />
                  <View>
                    <Text style={styles.statsExternalLinkTitle}>View section on live site</Text>
                    <Text style={styles.statsExternalLinkDesc}>bdangels.co/#programs section</Text>
                  </View>
                </View>
                <Ionicons name="open-outline" size={18} color="#0A5554" />
              </TouchableOpacity>
            </View>
          )}

          {/* TAB: HOMEPAGE PORTFOLIOS */}
          {activeTab === 'homepage-portfolios' && (
            <View style={styles.tabContent}>
              {/* Header Row */}
              <View style={styles.sectionHeaderRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.sectionHeading}>Homepage Portfolios</Text>
                  <Text style={styles.sectionSubheading}>
                    Curate and rank portfolio companies showcased on the landing page (up to 8)
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.statsRefreshBtn}
                  onPress={() => loadHomepagePortfolios(authToken)}
                  disabled={homepagePortfoliosLoading}
                  accessibilityLabel="Refresh homepage portfolios"
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="refresh"
                    size={18}
                    color="#0A5554"
                    style={homepagePortfoliosLoading ? { opacity: 0.5 } : null}
                  />
                </TouchableOpacity>
              </View>

              {/* KPI / Overview Summary Cards */}
              <View style={styles.portfolioKpiContainer}>
                {/* Card 1: Homepage Selections */}
                <View style={styles.portfolioKpiCard}>
                  <View style={styles.portfolioKpiHeader}>
                    <Text style={styles.portfolioKpiLabel}>HOMEPAGE SELECTIONS</Text>
                    <View
                      style={
                        homepagePortfolios.length > 0
                          ? styles.portfolioActiveBadge
                          : styles.portfolioDefaultBadge
                      }
                    >
                      <Text
                        style={
                          homepagePortfolios.length > 0
                            ? styles.portfolioActiveBadgeText
                            : styles.portfolioDefaultBadgeText
                        }
                      >
                        {homepagePortfolios.length > 0 ? 'Custom Active' : 'Default Mode'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.portfolioKpiValue}>
                    {homepagePortfolios.length}{' '}
                    <Text style={{ fontSize: 13, fontWeight: '500', color: '#64748B' }}>
                      / 8 max
                    </Text>
                  </Text>

                  {/* Progress Bar */}
                  <View style={styles.portfolioProgressBar}>
                    <View
                      style={[
                        styles.portfolioProgressFill,
                        { width: `${Math.min(100, (homepagePortfolios.length / 8) * 100)}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.portfolioKpiSub}>
                    {homepagePortfolios.length >= 8
                      ? 'Maximum limit of 8 portfolios reached.'
                      : homepagePortfolios.length > 0
                      ? `You can add ${8 - homepagePortfolios.length} more ${
                          8 - homepagePortfolios.length === 1 ? 'company' : 'companies'
                        }.`
                      : 'Showing latest 8 companies by default.'}
                  </Text>
                </View>

                {/* Card 2: Display Mode */}
                <View style={[styles.portfolioKpiCard, { borderLeftColor: '#2563EB' }]}>
                  <Text style={styles.portfolioKpiLabel}>HOMEPAGE DISPLAY MODE</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: homepagePortfolios.length > 0 ? '#10B981' : '#94A3B8',
                      }}
                    />
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A' }}>
                      {homepagePortfolios.length > 0
                        ? 'Selected Portfolios'
                        : 'Default (Latest Deals)'}
                    </Text>
                  </View>
                  <Text style={styles.portfolioKpiSub}>
                    {homepagePortfolios.length > 0
                      ? `The homepage displays only these ${homepagePortfolios.length} custom companies in the exact rank order below.`
                      : 'No custom selections active yet. The homepage automatically displays the latest 8 published portfolio deals.'}
                  </Text>
                </View>

                {/* Card 3: Available Pool */}
                <View style={[styles.portfolioKpiCard, { borderLeftColor: '#0D9488' }]}>
                  <View style={styles.portfolioKpiHeader}>
                    <Text style={styles.portfolioKpiLabel}>AVAILABLE DEALS POOL</Text>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748B' }}>
                      {Math.max(0, allPortfolioDeals.length - homepagePortfolios.length)} unselected
                    </Text>
                  </View>
                  <Text style={styles.portfolioKpiValue}>
                    {allPortfolioDeals.length}{' '}
                    <Text style={{ fontSize: 13, fontWeight: '500', color: '#64748B' }}>
                      total in portfolio
                    </Text>
                  </Text>
                  <Text style={styles.portfolioKpiSub}>
                    Companies listed with type &ldquo;Portfolio only&rdquo; or &ldquo;Invest &amp; Portfolio&rdquo;.
                  </Text>
                </View>
              </View>

              {/* Action Toolbar */}
              <View style={styles.portfolioActionToolbar}>
                <TouchableOpacity
                  style={[
                    styles.portfolioToolbarBtnPrimary,
                    homepagePortfolios.length >= 8 && { opacity: 0.6 },
                  ]}
                  onPress={handleOpenAddPortfolio}
                  disabled={portfolioSaving || homepagePortfolios.length >= 8}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add-circle" size={16} color="#FFFFFF" />
                  <Text style={styles.portfolioToolbarBtnPrimaryText}>
                    {homepagePortfolios.length >= 8 ? 'Max Reached (8/8)' : '+ Add Portfolio'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.portfolioToolbarBtnSecondary}
                  onPress={handleOpenBatchPortfolios}
                  disabled={portfolioSaving}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkbox-outline" size={16} color="#0A5554" />
                  <Text style={styles.portfolioToolbarBtnSecondaryText}>Batch Selection</Text>
                </TouchableOpacity>

                {homepagePortfolios.length > 0 && (
                  <TouchableOpacity
                    style={styles.portfolioToolbarBtnDanger}
                    onPress={handleOpenClearAllPortfolios}
                    disabled={portfolioSaving}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="refresh-outline" size={15} color="#DC2626" />
                    <Text style={styles.portfolioToolbarBtnDangerText}>Revert to Default</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Curated Portfolios List */}
              <View style={styles.cardsList}>
                <View style={styles.formSectionHeaderRow}>
                  <Text style={styles.formSectionHeader}>
                    CURATED HOMEPAGE ORDER ({homepagePortfolios.length} OF 8)
                  </Text>
                  {homepagePortfolios.length > 0 && (
                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#64748B' }}>
                      Use &#x25B2; / &#x25BC; to reorder
                    </Text>
                  )}
                </View>

                {homepagePortfoliosLoading && homepagePortfolios.length === 0 ? (
                  <View style={styles.statsLoadingBox}>
                    <ActivityIndicator size="large" color="#0A5554" />
                    <Text style={styles.statsLoadingText}>Loading homepage portfolios...</Text>
                  </View>
                ) : homepagePortfolios.length === 0 ? (
                  <View style={styles.portfolioEmptyBox}>
                    <View style={styles.statsEmptyIconWrap}>
                      <Ionicons name="briefcase-outline" size={30} color="#0A5554" />
                    </View>
                    <Text style={styles.portfolioEmptyTitle}>Default Display Mode Active</Text>
                    <Text style={styles.portfolioEmptyDesc}>
                      No custom portfolio companies have been selected yet. The homepage automatically showcases the latest 8 published companies from your portfolio library.
                    </Text>
                    <TouchableOpacity
                      style={[styles.portfolioToolbarBtnPrimary, { marginTop: 6 }]}
                      onPress={handleOpenBatchPortfolios}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="layers-outline" size={16} color="#FFFFFF" />
                      <Text style={styles.portfolioToolbarBtnPrimaryText}>Select Companies to Feature</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  homepagePortfolios.map((item, idx) => {
                    const deal = item.deal || {};
                    const isFirst = idx === 0;
                    const isLast = idx === homepagePortfolios.length - 1;
                    return (
                      <View key={`hp-portfolio-card-${item.id || idx}`} style={styles.portfolioCard}>
                        {/* Top Info Row */}
                        <View style={styles.portfolioCardTopRow}>
                          {/* Rank badge */}
                          <View style={styles.portfolioRankBadge}>
                            <Text style={styles.portfolioRankBadgeText}>#{idx + 1}</Text>
                          </View>

                          {/* Logo or placeholder */}
                          {deal.logo_url ? (
                            <Image
                              source={{ uri: deal.logo_url }}
                              style={styles.portfolioLogoImage}
                              resizeMode="contain"
                            />
                          ) : (
                            <View style={styles.portfolioLogoPlaceholder}>
                              <Text style={styles.portfolioLogoPlaceholderText}>
                                {(deal.title || 'P').charAt(0).toUpperCase()}
                              </Text>
                            </View>
                          )}

                          {/* Title & Sector */}
                          <View style={{ flex: 1, minWidth: 0 }}>
                            <Text style={styles.portfolioCardTitle} numberOfLines={1}>
                              {deal.title || 'Untitled Portfolio Deal'}
                            </Text>
                            <Text style={styles.portfolioCardSector} numberOfLines={1}>
                              {deal.sector || 'Portfolio'}
                            </Text>
                          </View>

                          {/* Type / Status badge */}
                          <View style={styles.programCategoryBadge}>
                            <Text style={styles.programCategoryBadgeText}>
                              {deal.type === 'portfolio' ? 'Portfolio only' : 'Invest & Portfolio'}
                            </Text>
                          </View>
                        </View>

                        {/* Description */}
                        {Boolean(deal.description) && (
                          <Text style={styles.portfolioCardDesc} numberOfLines={2}>
                            {deal.description}
                          </Text>
                        )}

                        {/* Bottom Actions Row */}
                        <View style={styles.portfolioCardBottomRow}>
                          {/* Reordering Buttons */}
                          <View style={styles.portfolioReorderButtonGroup}>
                            <TouchableOpacity
                              style={[
                                styles.portfolioReorderBtn,
                                (isFirst || portfolioSaving) && styles.portfolioReorderBtnDisabled,
                              ]}
                              onPress={() => handleMovePortfolio(item, 'up')}
                              disabled={isFirst || portfolioSaving}
                              accessibilityLabel={`Move ${deal.title} up`}
                              activeOpacity={0.7}
                            >
                              <Ionicons
                                name="chevron-up"
                                size={18}
                                color={isFirst ? '#94A3B8' : '#0A5554'}
                              />
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[
                                styles.portfolioReorderBtn,
                                (isLast || portfolioSaving) && styles.portfolioReorderBtnDisabled,
                              ]}
                              onPress={() => handleMovePortfolio(item, 'down')}
                              disabled={isLast || portfolioSaving}
                              accessibilityLabel={`Move ${deal.title} down`}
                              activeOpacity={0.7}
                            >
                              <Ionicons
                                name="chevron-down"
                                size={18}
                                color={isLast ? '#94A3B8' : '#0A5554'}
                              />
                            </TouchableOpacity>

                            <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748B', marginLeft: 4 }}>
                              Position #{idx + 1}
                            </Text>
                          </View>

                          {/* Remove Button */}
                          <TouchableOpacity
                            style={styles.portfolioDeleteBtn}
                            onPress={() => handleOpenDeletePortfolio(item)}
                            disabled={portfolioSaving}
                            activeOpacity={0.8}
                            accessibilityLabel={`Remove ${deal.title} from homepage`}
                          >
                            <Ionicons name="trash-outline" size={14} color="#DC2626" />
                            <Text style={styles.portfolioDeleteBtnText}>Remove</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>

              {/* View on website link card */}
              <TouchableOpacity
                style={styles.statsExternalLinkCard}
                onPress={() => {
                  Linking.openURL('https://bdangels.co#portfolio').catch(() => {
                    Alert.alert('Notice', 'Could not open https://bdangels.co#portfolio');
                  });
                }}
                activeOpacity={0.8}
              >
                <View style={styles.statsExternalLinkLeft}>
                  <Ionicons name="globe-outline" size={20} color="#0A5554" />
                  <View>
                    <Text style={styles.statsExternalLinkTitle}>View section on live site</Text>
                    <Text style={styles.statsExternalLinkDesc}>bdangels.co/#portfolio section</Text>
                  </View>
                </View>
                <Ionicons name="open-outline" size={18} color="#0A5554" />
              </TouchableOpacity>
            </View>
          )}

          {/* TAB: TEAM ABOUT */}
          {activeTab === 'team-about' && (
            <View style={styles.tabContent}>
              {/* Section Header Row */}
              <View style={styles.sectionHeaderRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.sectionHeading}>Team About Section</Text>
                  <Text style={styles.sectionSubheading}>
                    Mission, narrative paragraphs, hero photo and branding badge
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity
                    style={styles.refreshIconBtn}
                    onPress={() => loadTeamAboutSection(authToken)}
                    disabled={teamAboutLoading}
                    accessibilityLabel="Refresh team about section"
                  >
                    {teamAboutLoading ? (
                      <ActivityIndicator size="small" color={Colors.forest} />
                    ) : (
                      <Ionicons name="refresh" size={18} color={Colors.forest} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.teamAboutEditBtn}
                    onPress={handleOpenEditTeamAbout}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="create-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.teamAboutEditBtnText}>Edit Section</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Status & Overview Card */}
              <View style={styles.teamAboutOverviewCard}>
                <View style={styles.teamAboutHeaderPillsRow}>
                  <View style={styles.teamAboutLivePill}>
                    <View style={styles.teamAboutLiveDot} />
                    <Text style={styles.teamAboutLiveText}>Live on BAN Website</Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleOpenEditTeamAbout}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#0A5554' }}>
                      Edit Content &rarr;
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Quick stats grid */}
                <View style={styles.teamAboutMetaGrid}>
                  <View style={styles.teamAboutMetaItem}>
                    <Text style={styles.teamAboutMetaLabel}>Paragraphs</Text>
                    <Text style={styles.teamAboutMetaValue}>
                      {teamAboutData?.paragraphs?.length || (Array.isArray(teamAboutData?.body) ? teamAboutData.body.length : 1)} blocks
                    </Text>
                  </View>
                  <View style={styles.teamAboutMetaDivider} />
                  <View style={styles.teamAboutMetaItem}>
                    <Text style={styles.teamAboutMetaLabel}>Hero Photo</Text>
                    <Text style={styles.teamAboutMetaValue}>
                      {teamAboutData?.image_url ? 'Configured' : 'Default Asset'}
                    </Text>
                  </View>
                  <View style={styles.teamAboutMetaDivider} />
                  <View style={styles.teamAboutMetaItem}>
                    <Text style={styles.teamAboutMetaLabel}>Photo Badge</Text>
                    <Text style={styles.teamAboutMetaValue} numberOfLines={1}>
                      {teamAboutData?.image_badge ? 'Active' : 'None'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* LIVE SECTION PREVIEW */}
              <View style={styles.teamAboutPreviewBox}>
                <View style={styles.teamAboutPreviewTop}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="eye-outline" size={16} color="#0A5554" />
                    <Text style={styles.teamAboutPreviewTopTitle}>LIVE SECTION PREVIEW</Text>
                  </View>
                  <View style={styles.teamAboutPreviewTopBadge}>
                    <Text style={styles.teamAboutPreviewTopBadgeText}>bdangels.co/team</Text>
                  </View>
                </View>

                {teamAboutLoading && !teamAboutData ? (
                  <View style={styles.teamAboutEmptyState}>
                    <ActivityIndicator size="small" color="#0A5554" />
                    <Text style={styles.teamAboutEmptyStateText}>Loading section data...</Text>
                  </View>
                ) : (
                  <>
                    {/* Eyebrow / Kicker */}
                    {teamAboutData?.kicker ? (
                      <View style={styles.teamAboutKickerPill}>
                        <Text style={styles.teamAboutKickerText}>{teamAboutData.kicker}</Text>
                      </View>
                    ) : null}

                    {/* Heading */}
                    <Text style={styles.teamAboutHeadingText}>
                      {teamAboutData?.heading || 'What is Bangladesh Angels Network?'}
                    </Text>

                    {/* Body Paragraphs */}
                    <View style={styles.teamAboutParagraphsWrap}>
                      {(teamAboutData?.paragraphs || (Array.isArray(teamAboutData?.body) ? teamAboutData.body : [teamAboutData?.body || 'BAN is the country’s first and largest angel-investing platform, connecting visionary entrepreneurs with seasoned investors and fostering an ecosystem that drives innovation and economic growth.'])).map((para, pIdx) => (
                        <View key={pIdx} style={styles.teamAboutParagraphCard}>
                          <Text style={styles.teamAboutParagraphText}>{para}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Hero Image Card */}
                    <View style={styles.teamAboutHeroImageCard}>
                      <Image
                        source={{
                          uri:
                            teamAboutData?.image_url ||
                            'https://bdangels.co/DSC00467.jpg',
                        }}
                        style={styles.teamAboutHeroImg}
                        resizeMode="cover"
                      />
                      {teamAboutData?.image_badge ? (
                        <View style={styles.teamAboutHeroBadgeOverlay}>
                          <Ionicons name="sparkles" size={12} color="#FFFFFF" />
                          <Text style={styles.teamAboutHeroBadgeText}>
                            {teamAboutData.image_badge}
                          </Text>
                        </View>
                      ) : null}
                      <View style={styles.teamAboutHeroAltBar}>
                        <Ionicons name="information-circle-outline" size={14} color="#64748B" />
                        <Text style={styles.teamAboutHeroAltText} numberOfLines={1}>
                          Alt text: &ldquo;{teamAboutData?.image_alt || 'BAN Community'}&rdquo;
                        </Text>
                      </View>
                    </View>
                  </>
                )}
              </View>

              {/* View on website link card */}
              <TouchableOpacity
                style={styles.statsExternalLinkCard}
                onPress={() => {
                  Linking.openURL('https://bdangels.co/team').catch(() => {
                    Alert.alert('Notice', 'Could not open https://bdangels.co/team');
                  });
                }}
                activeOpacity={0.8}
              >
                <View style={styles.statsExternalLinkLeft}>
                  <Ionicons name="globe-outline" size={20} color="#0A5554" />
                  <View>
                    <Text style={styles.statsExternalLinkTitle}>View section on live site</Text>
                    <Text style={styles.statsExternalLinkDesc}>bdangels.co/team About section</Text>
                  </View>
                </View>
                <Ionicons name="open-outline" size={18} color="#0A5554" />
              </TouchableOpacity>
            </View>
          )}

          {/* TAB: EVENTS */}
          {activeTab === 'events' && (
            <View style={styles.tabContent}>
              {/* Header Row */}
              <View style={styles.sectionHeaderRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.sectionHeading}>Community Events</Text>
                  <Text style={styles.sectionSubheading}>
                    Upcoming showcases, webinars & public registrations
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity
                    style={styles.refreshIconBtn}
                    onPress={() => loadEvents(authToken, eventsSearch, eventsTypeFilter, eventsLandingFilter)}
                    disabled={eventsLoading}
                    accessibilityLabel="Refresh events"
                  >
                    {eventsLoading ? (
                      <ActivityIndicator size="small" color={Colors.forest} />
                    ) : (
                      <Ionicons name="refresh" size={18} color={Colors.forest} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.teamAboutEditBtn}
                    onPress={handleOpenCreateEvent}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="add" size={16} color="#FFFFFF" />
                    <Text style={styles.teamAboutEditBtnText}>Add Event</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Type Filter Pills Row (All, Events, Webinars, Homepage Featured) */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.memberFilterScroll}
              >
                <TouchableOpacity
                  style={[
                    styles.memberFilterChip,
                    eventsTypeFilter === 'all' && eventsLandingFilter === 'all' && styles.memberFilterChipActive,
                  ]}
                  onPress={() => {
                    setEventsTypeFilter('all');
                    setEventsLandingFilter('all');
                    loadEvents(authToken, eventsSearch, 'all', 'all', 1);
                  }}
                >
                  <Text
                    style={[
                      styles.memberFilterChipText,
                      eventsTypeFilter === 'all' && eventsLandingFilter === 'all' && styles.memberFilterChipTextActive,
                    ]}
                  >
                    All Items
                  </Text>
                  <View
                    style={[
                      styles.memberFilterBadge,
                      eventsTypeFilter === 'all' && eventsLandingFilter === 'all'
                        ? styles.memberFilterBadgeActive
                        : styles.memberFilterBadgeInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.memberFilterBadgeText,
                        eventsTypeFilter === 'all' && eventsLandingFilter === 'all' && styles.memberFilterBadgeTextActive,
                      ]}
                    >
                      {eventsCounts.all}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.memberFilterChip,
                    eventsTypeFilter === 'event' && eventsLandingFilter === 'all' && styles.memberFilterChipActive,
                  ]}
                  onPress={() => {
                    setEventsTypeFilter('event');
                    setEventsLandingFilter('all');
                    loadEvents(authToken, eventsSearch, 'event', 'all', 1);
                  }}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={13}
                    color={eventsTypeFilter === 'event' && eventsLandingFilter === 'all' ? '#0A5554' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.memberFilterChipText,
                      eventsTypeFilter === 'event' && eventsLandingFilter === 'all' && styles.memberFilterChipTextActive,
                    ]}
                  >
                    Events
                  </Text>
                  <View
                    style={[
                      styles.memberFilterBadge,
                      eventsTypeFilter === 'event' && eventsLandingFilter === 'all'
                        ? styles.memberFilterBadgeActive
                        : styles.memberFilterBadgeInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.memberFilterBadgeText,
                        eventsTypeFilter === 'event' && eventsLandingFilter === 'all' && styles.memberFilterBadgeTextActive,
                      ]}
                    >
                      {eventsCounts.events}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.memberFilterChip,
                    eventsTypeFilter === 'webinar' && eventsLandingFilter === 'all' && styles.memberFilterChipActive,
                  ]}
                  onPress={() => {
                    setEventsTypeFilter('webinar');
                    setEventsLandingFilter('all');
                    loadEvents(authToken, eventsSearch, 'webinar', 'all', 1);
                  }}
                >
                  <Ionicons
                    name="videocam-outline"
                    size={13}
                    color={eventsTypeFilter === 'webinar' && eventsLandingFilter === 'all' ? '#0A5554' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.memberFilterChipText,
                      eventsTypeFilter === 'webinar' && eventsLandingFilter === 'all' && styles.memberFilterChipTextActive,
                    ]}
                  >
                    Webinars
                  </Text>
                  <View
                    style={[
                      styles.memberFilterBadge,
                      eventsTypeFilter === 'webinar' && eventsLandingFilter === 'all'
                        ? styles.memberFilterBadgeActive
                        : styles.memberFilterBadgeInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.memberFilterBadgeText,
                        eventsTypeFilter === 'webinar' && eventsLandingFilter === 'all' && styles.memberFilterBadgeTextActive,
                      ]}
                    >
                      {eventsCounts.webinars}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.memberFilterChip,
                    eventsLandingFilter === '1' && styles.memberFilterChipActive,
                  ]}
                  onPress={() => {
                    setEventsLandingFilter('1');
                    setEventsTypeFilter('all');
                    loadEvents(authToken, eventsSearch, 'all', '1', 1);
                  }}
                >
                  <Ionicons
                    name="star-outline"
                    size={13}
                    color={eventsLandingFilter === '1' ? '#0A5554' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.memberFilterChipText,
                      eventsLandingFilter === '1' && styles.memberFilterChipTextActive,
                    ]}
                  >
                    Homepage Featured
                  </Text>
                  <View
                    style={[
                      styles.memberFilterBadge,
                      eventsLandingFilter === '1'
                        ? styles.memberFilterBadgeActive
                        : styles.memberFilterBadgeInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.memberFilterBadgeText,
                        eventsLandingFilter === '1' && styles.memberFilterBadgeTextActive,
                      ]}
                    >
                      {eventsCounts.landing}
                    </Text>
                  </View>
                </TouchableOpacity>
              </ScrollView>

              {/* Search Bar */}
              <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color={Colors.muted} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search events by title, description, location..."
                  placeholderTextColor={Colors.mutedLight}
                  value={eventsSearch}
                  onChangeText={(text) => {
                    setEventsSearch(text);
                    loadEvents(authToken, text, eventsTypeFilter, eventsLandingFilter, 1);
                  }}
                  returnKeyType="search"
                />
                {eventsSearch.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setEventsSearch('');
                      loadEvents(authToken, '', eventsTypeFilter, eventsLandingFilter, 1);
                    }}
                    style={styles.searchClearBtn}
                  >
                    <Ionicons name="close-circle" size={18} color={Colors.muted} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Events List */}
              {eventsLoading && eventsList.length === 0 ? (
                <View style={styles.centerBox}>
                  <ActivityIndicator size="large" color="#0A5554" />
                  <Text style={styles.loadingText}>Loading community events...</Text>
                </View>
              ) : eventsList.length === 0 ? (
                <View style={styles.portfolioEmptyBox}>
                  <Ionicons name="calendar-outline" size={32} color="#94A3B8" />
                  <Text style={styles.portfolioEmptyTitle}>No Events Found</Text>
                  <Text style={styles.portfolioEmptyDesc}>
                    {eventsSearch.trim() || eventsTypeFilter !== 'all' || eventsLandingFilter !== 'all'
                      ? 'No events match your current search or filter criteria.'
                      : 'No community events or webinars have been created yet.'}
                  </Text>
                  <TouchableOpacity
                    style={[styles.programsAddBtn, { alignSelf: 'center', marginTop: 8 }]}
                    onPress={handleOpenCreateEvent}
                  >
                    <Ionicons name="add" size={16} color="#FFFFFF" />
                    <Text style={styles.programsAddBtnText}>Add Your First Event</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ gap: 14 }}>
                  {eventsList.map((item) => {
                    const isWebinar = item.type === 'webinar';
                    const bannerSrc = item.banner_url || (item.media && item.media[0] ? item.media[0].original_url : null);
                    const formattedDateTime = item.formatted_date_time || (item.date ? String(item.date).slice(0, 10) : 'TBD');

                    return (
                      <View key={`event-${item.id}`} style={styles.eventCard}>
                        {/* Banner Image with overlay badges */}
                        <View style={styles.eventBannerWrap}>
                          <Image
                            source={{
                              uri: bannerSrc || 'https://bdangels.co/what-we-do-placeholder.svg',
                            }}
                            style={styles.eventBannerImg}
                            resizeMode="cover"
                          />
                          <View style={styles.eventTypePillWrap}>
                            <View
                              style={[
                                styles.eventTypePill,
                                isWebinar ? styles.eventTypePillWebinar : styles.eventTypePillEvent,
                              ]}
                            >
                              <Ionicons
                                name={isWebinar ? 'videocam' : 'calendar'}
                                size={11}
                                color={isWebinar ? '#4338CA' : '#0A5554'}
                              />
                              <Text
                                style={[
                                  styles.eventTypePillText,
                                  isWebinar ? styles.eventTypePillTextWebinar : styles.eventTypePillTextEvent,
                                ]}
                              >
                                {isWebinar ? 'Webinar' : 'Event'}
                              </Text>
                            </View>

                            {item.show_on_landing ? (
                              <View style={styles.eventLandingBadge}>
                                <Ionicons name="star" size={10} color="#065F46" />
                                <Text style={styles.eventLandingBadgeText}>Homepage</Text>
                              </View>
                            ) : null}
                          </View>

                          {item.registration_fee !== null && item.registration_fee !== undefined && item.registration_fee !== '' ? (
                            <View style={styles.eventFeePill}>
                              <Text style={styles.eventFeePillText}>
                                {Number(item.registration_fee) > 0 ? `৳${item.registration_fee}` : 'Free'}
                              </Text>
                            </View>
                          ) : (
                            <View style={styles.eventFeePill}>
                              <Text style={styles.eventFeePillText}>Free</Text>
                            </View>
                          )}
                        </View>

                        {/* Event Content Body */}
                        <View style={styles.eventBody}>
                          <Text style={styles.eventTitle}>{item.title}</Text>

                          {/* Date, Time, Location Chips */}
                          <View style={styles.eventMetaRow}>
                            {formattedDateTime ? (
                              <View style={styles.eventMetaChip}>
                                <Ionicons name="calendar-outline" size={12} color="#0A5554" />
                                <Text style={styles.eventMetaChipText} numberOfLines={1}>
                                  {formattedDateTime}
                                </Text>
                              </View>
                            ) : null}

                            {item.location ? (
                              <View style={styles.eventMetaChip}>
                                <Ionicons name="location-outline" size={12} color="#64748B" />
                                <Text style={styles.eventMetaChipText} numberOfLines={1}>
                                  {item.location}
                                </Text>
                              </View>
                            ) : null}
                          </View>

                          {/* Description Excerpt */}
                          {item.description ? (
                            <Text style={styles.eventDesc} numberOfLines={2}>
                              {item.description}
                            </Text>
                          ) : null}

                          {/* CTA or RSVP Info */}
                          {item.cta_link ? (
                            <View style={styles.eventCtaBar}>
                              <Ionicons name="link-outline" size={13} color="#0A5554" />
                              <Text style={styles.eventCtaBarText} numberOfLines={1}>
                                RSVP Link: {item.cta_link}
                              </Text>
                            </View>
                          ) : null}

                          {/* Speakers Info */}
                          {Array.isArray(item.speakers) && item.speakers.length > 0 ? (
                            <View style={styles.eventSpeakersRow}>
                              <View style={styles.eventSpeakersPill}>
                                <Ionicons name="people-outline" size={12} color="#64748B" />
                                <Text style={styles.eventSpeakersPillText}>
                                  {item.speakers.length} {item.speakers.length === 1 ? 'Speaker' : 'Speakers'}
                                </Text>
                              </View>
                            </View>
                          ) : null}

                          {/* Action Toolbar */}
                          <View style={styles.eventActionsRow}>
                            <TouchableOpacity
                              style={styles.eventActionBtn}
                              onPress={() => handleOpenViewEvent(item)}
                              activeOpacity={0.8}
                            >
                              <Ionicons name="eye-outline" size={14} color="#0A5554" />
                              <Text style={styles.eventActionBtnText}>View Details</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[styles.eventActionBtn, styles.eventActionBtnEdit]}
                              onPress={() => handleOpenEditEvent(item)}
                              activeOpacity={0.8}
                            >
                              <Ionicons name="create-outline" size={14} color="#0284C7" />
                              <Text style={[styles.eventActionBtnText, { color: '#0284C7' }]}>Edit</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[styles.eventActionBtn, styles.eventActionBtnDelete]}
                              onPress={() => handleOpenDeleteEvent(item)}
                              activeOpacity={0.8}
                            >
                              <Ionicons name="trash-outline" size={14} color="#DC2626" />
                              <Text style={[styles.eventActionBtnText, { color: '#DC2626' }]}>Delete</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* View on website link card */}
              <TouchableOpacity
                style={styles.statsExternalLinkCard}
                onPress={() => {
                  Linking.openURL('https://bdangels.co/events').catch(() => {
                    Alert.alert('Notice', 'Could not open https://bdangels.co/events');
                  });
                }}
                activeOpacity={0.8}
              >
                <View style={styles.statsExternalLinkLeft}>
                  <Ionicons name="globe-outline" size={20} color="#0A5554" />
                  <View>
                    <Text style={styles.statsExternalLinkTitle}>View events on live site</Text>
                    <Text style={styles.statsExternalLinkDesc}>bdangels.co/events public directory</Text>
                  </View>
                </View>
                <Ionicons name="open-outline" size={18} color="#0A5554" />
              </TouchableOpacity>
            </View>
          )}

          {/* TAB: STARTUP SERVICES */}
          {activeTab === 'startup-services' && (
            <View style={styles.tabContent}>
              {/* Header with Title and Add Button */}
              <View style={styles.sectionHeaderRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.sectionHeading}>Startup Services</Text>
                  <Text style={styles.sectionSubheading}>
                    Value-add services on public /startups
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity
                    style={styles.teamAboutEditBtn}
                    onPress={handleOpenCreateStartupService}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="add" size={16} color="#FFFFFF" />
                    <Text style={styles.teamAboutEditBtnText}>Add Service</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.refreshIconBtn}
                    onPress={() => loadStartupServices(authToken)}
                    disabled={startupServicesLoading}
                  >
                    <Ionicons
                      name="refresh"
                      size={18}
                      color={Colors.forest}
                      style={startupServicesLoading ? { opacity: 0.5 } : {}}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Quick Metrics Chips Row */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <View style={styles.eventLandingBadge}>
                  <Ionicons name="cube-outline" size={13} color="#065F46" />
                  <Text style={styles.eventLandingBadgeText}>
                    {startupServicesList.length} Total Services
                  </Text>
                </View>
                <View style={[styles.eventLandingBadge, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                  <Ionicons name="document-text-outline" size={13} color="#1D4ED8" />
                  <Text style={[styles.eventLandingBadgeText, { color: '#1D4ED8' }]}>
                    {startupServicesList.filter((s) => s.show_brochure_link).length} with Brochure
                  </Text>
                </View>
              </View>

              {/* Real-time Search Bar */}
              <View style={styles.searchBarContainer}>
                <Ionicons name="search-outline" size={18} color="#64748B" style={{ marginLeft: 12 }} />
                <TextInput
                  style={[styles.searchInput, { paddingLeft: 8 }]}
                  placeholder="Search services by title, intro, or bullet..."
                  placeholderTextColor="#94A3B8"
                  value={startupServicesSearch}
                  onChangeText={setStartupServicesSearch}
                  clearButtonMode="while-editing"
                />
                {startupServicesSearch ? (
                  <TouchableOpacity
                    onPress={() => setStartupServicesSearch('')}
                    style={{ padding: 8, marginRight: 4 }}
                  >
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* List of Services */}
              {startupServicesLoading && startupServicesList.length === 0 ? (
                <View style={styles.statsLoadingBox}>
                  <ActivityIndicator size="large" color="#0A5554" />
                  <Text style={styles.statsLoadingText}>Loading startup services...</Text>
                </View>
              ) : startupServicesList.length === 0 ? (
                <View style={[styles.emptyContainer, { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 24 }]}>
                  <View style={styles.statsEmptyIconWrap}>
                    <Ionicons name="briefcase-outline" size={26} color="#94A3B8" />
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 6 }}>No Startup Services Yet</Text>
                  <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 14 }}>
                    Add founder and legal services to display them on the public /startups page.
                  </Text>
                  <TouchableOpacity
                    style={[styles.programsAddBtn, { alignSelf: 'center' }]}
                    onPress={handleOpenCreateStartupService}
                  >
                    <Ionicons name="add" size={16} color="#FFFFFF" />
                    <Text style={styles.programsAddBtnText}>Add Your First Service</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ gap: 14 }}>
                  {startupServicesList
                    .filter((item) => {
                      if (!startupServicesSearch) return true;
                      const q = startupServicesSearch.toLowerCase();
                      const titleMatch = (item.title || '').toLowerCase().includes(q);
                      const introMatch = (item.intro || item.description || '').toLowerCase().includes(q);
                      const ctaMatch = (item.cta_label || '').toLowerCase().includes(q);
                      const bulletMatch = Array.isArray(item.bullets) && item.bullets.some((b) => (b || '').toLowerCase().includes(q));
                      return titleMatch || introMatch || ctaMatch || bulletMatch;
                    })
                    .map((item, idx) => {
                      const logoSrc = item.logo_url || item.icon_url || null;
                      const bulletsList = Array.isArray(item.bullets) ? item.bullets : [];

                      return (
                        <View key={`startup-svc-${item.id}`} style={styles.eventCard}>
                          {/* Card Header: Logo, Title, Order Controls */}
                          <View style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                              {logoSrc ? (
                                <Image
                                  source={{ uri: logoSrc }}
                                  style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#E2E8F0', borderWidth: 1, borderColor: '#CBD5E1' }}
                                />
                              ) : (
                                <View
                                  style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 22,
                                    backgroundColor: '#E6F4F1',
                                    borderWidth: 1,
                                    borderColor: '#B4E6DA',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#0A5554' }}>
                                    {(item.title || 'S').charAt(0).toUpperCase()}
                                  </Text>
                                </View>
                              )}

                              <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 2 }}>
                                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                                    <View style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 }}>
                                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#475569' }}>
                                        #{item.sort_order || idx + 1}
                                      </Text>
                                    </View>
                                    <Text style={[styles.eventTitle, { fontSize: 15, flex: 1 }]} numberOfLines={1}>
                                      {item.title}
                                    </Text>
                                  </View>

                                  {/* Up / Down Reordering Buttons */}
                                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <TouchableOpacity
                                      style={{ padding: 5, borderRadius: 6, backgroundColor: idx === 0 ? '#F8FAFC' : '#F1F5F9', opacity: idx === 0 ? 0.35 : 1 }}
                                      disabled={idx === 0}
                                      onPress={() => handleMoveStartupService(idx, 'up')}
                                      activeOpacity={0.7}
                                    >
                                      <Ionicons name="arrow-up" size={13} color="#334155" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                      style={{ padding: 5, borderRadius: 6, backgroundColor: idx === startupServicesList.length - 1 ? '#F8FAFC' : '#F1F5F9', opacity: idx === startupServicesList.length - 1 ? 0.35 : 1 }}
                                      disabled={idx === startupServicesList.length - 1}
                                      onPress={() => handleMoveStartupService(idx, 'down')}
                                      activeOpacity={0.7}
                                    >
                                      <Ionicons name="arrow-down" size={13} color="#334155" />
                                    </TouchableOpacity>
                                  </View>
                                </View>

                                {item.show_brochure_link ? (
                                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' }} />
                                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#059669' }}>
                                      Brochure Link Enabled
                                    </Text>
                                  </View>
                                ) : (
                                  <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                                    Brochure Hidden
                                  </Text>
                                )}
                              </View>
                            </View>
                          </View>

                          {/* Body: Intro & Bullets Preview */}
                          <View style={styles.eventBody}>
                            <Text style={styles.eventDesc} numberOfLines={3}>
                              {item.intro || item.description}
                            </Text>

                            {/* Bullets List */}
                            {bulletsList.length > 0 ? (
                              <View style={{ backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#F1F5F9', gap: 6, marginTop: 4 }}>
                                <Text style={{ fontSize: 11, fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                  Key Offerings ({bulletsList.length})
                                </Text>
                                {bulletsList.slice(0, 3).map((bullet, bIdx) => (
                                  <View key={bIdx} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
                                    <Ionicons name="checkmark-circle" size={13} color="#0D9488" style={{ marginTop: 2 }} />
                                    <Text style={{ fontSize: 12, color: '#334155', flex: 1, lineHeight: 17 }} numberOfLines={1}>
                                      {bullet}
                                    </Text>
                                  </View>
                                ))}
                                {bulletsList.length > 3 ? (
                                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#0D9488', marginLeft: 19 }}>
                                    +{bulletsList.length - 3} more points
                                  </Text>
                                ) : null}
                              </View>
                            ) : null}

                            {/* Footer Note */}
                            {item.footer_note ? (
                              <View style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#FFFBEB', borderRadius: 6, borderWidth: 1, borderColor: '#FEF3C7' }}>
                                <Text style={{ fontSize: 11, color: '#92400E', fontStyle: 'italic' }} numberOfLines={2}>
                                  Note: {item.footer_note}
                                </Text>
                              </View>
                            ) : null}

                            {/* CTA Link Preview */}
                            <View style={styles.eventCtaBar}>
                              <Ionicons name="link-outline" size={14} color="#0D9488" />
                              <Text style={styles.eventCtaBarText} numberOfLines={1}>
                                {item.cta_label || 'Get in touch'}: {item.link || item.cta_url}
                              </Text>
                            </View>

                            {/* Action Toolbar */}
                            <View style={styles.eventActionsRow}>
                              <TouchableOpacity
                                style={styles.eventActionBtn}
                                onPress={() => handleOpenViewStartupService(item)}
                                activeOpacity={0.8}
                              >
                                <Ionicons name="eye-outline" size={14} color="#0A5554" />
                                <Text style={styles.eventActionBtnText}>View Details</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={[styles.eventActionBtn, styles.eventActionBtnEdit]}
                                onPress={() => handleOpenEditStartupService(item)}
                                activeOpacity={0.8}
                              >
                                <Ionicons name="create-outline" size={14} color="#0284C7" />
                                <Text style={[styles.eventActionBtnText, { color: '#0284C7' }]}>Edit</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={[styles.eventActionBtn, styles.eventActionBtnDelete]}
                                onPress={() => handleOpenDeleteStartupService(item)}
                                activeOpacity={0.8}
                              >
                                <Ionicons name="trash-outline" size={14} color="#DC2626" />
                                <Text style={[styles.eventActionBtnText, { color: '#DC2626' }]}>Delete</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                </View>
              )}

              {/* View on website link card */}
              <TouchableOpacity
                style={styles.statsExternalLinkCard}
                onPress={() => {
                  Linking.openURL('https://bdangels.co/startups#our-services').catch(() => {
                    Alert.alert('Notice', 'Could not open https://bdangels.co/startups#our-services');
                  });
                }}
                activeOpacity={0.8}
              >
                <View style={styles.statsExternalLinkLeft}>
                  <Ionicons name="globe-outline" size={20} color="#0A5554" />
                  <View>
                    <Text style={styles.statsExternalLinkTitle}>View services on live site</Text>
                    <Text style={styles.statsExternalLinkDesc}>bdangels.co/startups#our-services section</Text>
                  </View>
                </View>
                <Ionicons name="open-outline" size={18} color="#0A5554" />
              </TouchableOpacity>
            </View>
          )}

          {/* TAB: TEAM DIRECTORY */}
          {activeTab === 'team-members' && (
            <View style={styles.tabContent}>
              {/* Header with Title and Add Button */}
              <View style={styles.sectionHeaderRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.sectionHeading}>Team Directory</Text>
                  <Text style={styles.sectionSubheading}>
                    Leadership, operators & governing board
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity
                    style={styles.teamAboutEditBtn}
                    onPress={() => handleOpenCreateTeamMember('management')}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="add" size={16} color="#FFFFFF" />
                    <Text style={styles.teamAboutEditBtnText}>Add Member</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.refreshIconBtn}
                    onPress={() => loadTeamMembers(authToken)}
                    disabled={teamMembersLoading}
                  >
                    <Ionicons
                      name="refresh"
                      size={18}
                      color={Colors.forest}
                      style={teamMembersLoading ? { opacity: 0.5 } : {}}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Section Filter Chips Row */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 12 }}
                contentContainerStyle={{ gap: 8 }}
              >
                {[
                  { key: 'all', label: 'All Members', count: teamMembersCounts.all || teamMembersList.length },
                  { key: 'management', label: 'Management', count: teamMembersCounts.management },
                  { key: 'governing_board', label: 'Governing Board', count: teamMembersCounts.governing_board },
                ].map((chip) => {
                  const isActive = teamMembersSectionFilter === chip.key;
                  return (
                    <TouchableOpacity
                      key={chip.key}
                      style={[
                        styles.filterChip,
                        isActive && styles.filterChipActive,
                        { flexDirection: 'row', alignItems: 'center', gap: 6 },
                      ]}
                      onPress={() => setTeamMembersSectionFilter(chip.key)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          isActive && styles.filterChipTextActive,
                        ]}
                      >
                        {chip.label}
                      </Text>
                      <View
                        style={[
                          styles.filterChipBadge,
                          isActive && styles.filterChipBadgeActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterChipBadgeText,
                            isActive && styles.filterChipBadgeTextActive,
                          ]}
                        >
                          {chip.count}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Real-time Search Bar */}
              <View style={styles.searchBarContainer}>
                <Ionicons name="search-outline" size={18} color="#64748B" style={{ marginLeft: 12 }} />
                <TextInput
                  style={[styles.searchInput, { paddingLeft: 8 }]}
                  placeholder="Search members by name, title, or affiliation..."
                  placeholderTextColor="#94A3B8"
                  value={teamMembersSearch}
                  onChangeText={setTeamMembersSearch}
                  clearButtonMode="while-editing"
                />
                {teamMembersSearch ? (
                  <TouchableOpacity
                    onPress={() => setTeamMembersSearch('')}
                    style={{ padding: 8, marginRight: 4 }}
                  >
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* List of Team Members */}
              {teamMembersLoading && teamMembersList.length === 0 ? (
                <View style={styles.statsLoadingBox}>
                  <ActivityIndicator size="large" color="#0A5554" />
                  <Text style={styles.statsLoadingText}>Loading team directory...</Text>
                </View>
              ) : teamMembersList.length === 0 ? (
                <View style={[styles.emptyContainer, { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 24 }]}>
                  <View style={styles.statsEmptyIconWrap}>
                    <Ionicons name="people-outline" size={26} color="#94A3B8" />
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 6 }}>No Team Members Found</Text>
                  <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 14 }}>
                    {teamMembersSearch || teamMembersSectionFilter !== 'all'
                      ? 'No members match the selected filter or search term.'
                      : 'Add leadership and governing board members to showcase your team on the live site.'}
                  </Text>
                  <TouchableOpacity
                    style={[styles.programsAddBtn, { alignSelf: 'center' }]}
                    onPress={() => handleOpenCreateTeamMember('management')}
                  >
                    <Ionicons name="add" size={16} color="#FFFFFF" />
                    <Text style={styles.programsAddBtnText}>Add Team Member</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ gap: 12 }}>
                  {teamMembersList
                    .filter((item) => {
                      if (teamMembersSectionFilter !== 'all' && item.section !== teamMembersSectionFilter) {
                        return false;
                      }
                      if (!teamMembersSearch) return true;
                      const q = teamMembersSearch.toLowerCase();
                      const nameMatch = (item.name || '').toLowerCase().includes(q);
                      const titleMatch = (item.title || '').toLowerCase().includes(q);
                      const subMatch = (item.subtitle || '').toLowerCase().includes(q);
                      return nameMatch || titleMatch || subMatch;
                    })
                    .map((item, idx) => {
                      const isManagement = item.section === 'management';
                      const photoSrc = item.photo_url || null;

                      return (
                        <View key={`team-m-${item.id}`} style={[styles.eventCard, { padding: 14, gap: 10 }]}>
                          {/* Member Top Row */}
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                            {photoSrc ? (
                              <Image
                                source={{ uri: photoSrc }}
                                style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: '#E2E8F0', borderWidth: 1, borderColor: '#CBD5E1' }}
                              />
                            ) : (
                              <View
                                style={{
                                  width: 52,
                                  height: 52,
                                  borderRadius: 26,
                                  backgroundColor: '#E6F4F1',
                                  borderWidth: 1,
                                  borderColor: '#B4E6DA',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Text style={{ fontSize: 20, fontWeight: '800', color: '#0A5554' }}>
                                  {(item.name || 'M').charAt(0).toUpperCase()}
                                </Text>
                              </View>
                            )}

                            <View style={{ flex: 1 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 2 }}>
                                <Text style={[styles.eventTitle, { fontSize: 16, flex: 1 }]} numberOfLines={1}>
                                  {item.name}
                                </Text>

                                {/* Up / Down Reordering Buttons */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                  <TouchableOpacity
                                    style={{ padding: 4, borderRadius: 6, backgroundColor: idx === 0 ? '#F8FAFC' : '#F1F5F9', opacity: idx === 0 ? 0.35 : 1 }}
                                    disabled={idx === 0}
                                    onPress={() => handleMoveTeamMember(idx, 'up')}
                                    activeOpacity={0.7}
                                  >
                                    <Ionicons name="arrow-up" size={12} color="#334155" />
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    style={{ padding: 4, borderRadius: 6, backgroundColor: idx === teamMembersList.length - 1 ? '#F8FAFC' : '#F1F5F9', opacity: idx === teamMembersList.length - 1 ? 0.35 : 1 }}
                                    disabled={idx === teamMembersList.length - 1}
                                    onPress={() => handleMoveTeamMember(idx, 'down')}
                                    activeOpacity={0.7}
                                  >
                                    <Ionicons name="arrow-down" size={12} color="#334155" />
                                  </TouchableOpacity>
                                </View>
                              </View>

                              <Text style={{ fontSize: 13, fontWeight: '700', color: '#0A5554', marginBottom: 2 }} numberOfLines={1}>
                                {item.title}
                              </Text>

                              {item.subtitle ? (
                                <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 6 }} numberOfLines={1}>
                                  {item.subtitle}
                                </Text>
                              ) : null}

                              {/* Section & Sort Badge */}
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                <View
                                  style={[
                                    styles.eventTypePill,
                                    isManagement ? styles.eventTypePillEvent : styles.eventTypePillWebinar,
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.eventTypePillText,
                                      isManagement ? styles.eventTypePillTextEvent : styles.eventTypePillTextWebinar,
                                    ]}
                                  >
                                    {isManagement ? 'Management' : 'Governing Board'}
                                  </Text>
                                </View>
                                <View style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 }}>
                                  <Text style={{ fontSize: 10, fontWeight: '800', color: '#64748B' }}>
                                    Order #{item.sort_order || idx + 1}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </View>

                          {/* LinkedIn Link (if available) */}
                          {item.linkedin_url ? (
                            <TouchableOpacity
                              style={styles.eventCtaBar}
                              onPress={() => {
                                Linking.openURL(item.linkedin_url).catch(() => Alert.alert('Notice', `Could not open: ${item.linkedin_url}`));
                              }}
                              activeOpacity={0.8}
                            >
                              <Ionicons name="logo-linkedin" size={14} color="#0A66C2" />
                              <Text style={[styles.eventCtaBarText, { color: '#0A66C2' }]} numberOfLines={1}>
                                {item.linkedin_url}
                              </Text>
                              <Ionicons name="open-outline" size={12} color="#0A66C2" />
                            </TouchableOpacity>
                          ) : null}

                          {/* Action Toolbar */}
                          <View style={styles.eventActionsRow}>
                            <TouchableOpacity
                              style={styles.eventActionBtn}
                              onPress={() => handleOpenViewTeamMember(item)}
                              activeOpacity={0.8}
                            >
                              <Ionicons name="eye-outline" size={14} color="#0A5554" />
                              <Text style={styles.eventActionBtnText}>View Details</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[styles.eventActionBtn, styles.eventActionBtnEdit]}
                              onPress={() => handleOpenEditTeamMember(item)}
                              activeOpacity={0.8}
                            >
                              <Ionicons name="create-outline" size={14} color="#0284C7" />
                              <Text style={[styles.eventActionBtnText, { color: '#0284C7' }]}>Edit</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[styles.eventActionBtn, styles.eventActionBtnDelete]}
                              onPress={() => handleOpenDeleteTeamMember(item)}
                              activeOpacity={0.8}
                            >
                              <Ionicons name="trash-outline" size={14} color="#DC2626" />
                              <Text style={[styles.eventActionBtnText, { color: '#DC2626' }]}>Delete</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                </View>
              )}

              {/* View on website link card */}
              <TouchableOpacity
                style={styles.statsExternalLinkCard}
                onPress={() => {
                  Linking.openURL('https://bdangels.co/team').catch(() => {
                    Alert.alert('Notice', 'Could not open https://bdangels.co/team');
                  });
                }}
                activeOpacity={0.8}
              >
                <View style={styles.statsExternalLinkLeft}>
                  <Ionicons name="globe-outline" size={20} color="#0A5554" />
                  <View>
                    <Text style={styles.statsExternalLinkTitle}>View team on live site</Text>
                    <Text style={styles.statsExternalLinkDesc}>bdangels.co/team leadership and board</Text>
                  </View>
                </View>
                <Ionicons name="open-outline" size={18} color="#0A5554" />
              </TouchableOpacity>
            </View>
          )}

          {/* TAB: BAN WEALTH ORDERS */}
          {activeTab === 'ban-wealth-orders' && (
            <View style={styles.tabContent}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionHeading}>BAN Wealth Orders</Text>
                  <Text style={styles.sectionSubheading}>Private wealth & syndicate fund management orders</Text>
                </View>
                <TouchableOpacity
                  style={styles.refreshIconBtn}
                  onPress={() => loadBanWealthOrders(authToken)}
                >
                  <Ionicons name="refresh" size={18} color={Colors.forest} />
                </TouchableOpacity>
              </View>

              {banWealthOrdersLoading ? (
                <View style={styles.listLoadingBox}>
                  <ActivityIndicator size="small" color={Colors.forest} />
                  <Text style={styles.loadingText}>Fetching wealth orders...</Text>
                </View>
              ) : banWealthOrders.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="receipt-outline" size={40} color={Colors.mutedLight} />
                  <Text style={styles.emptyTitle}>No Wealth Orders</Text>
                  <Text style={styles.emptyText}>All wealth management orders will appear here.</Text>
                </View>
              ) : (
                <View style={styles.cardsList}>
                  {banWealthOrders.map((ord, idx) => (
                    <View key={`ord-${ord.id || idx}`} style={styles.subCard}>
                      <Text style={styles.subUserName}>Order #{ord.id}</Text>
                      <Text style={styles.subUserEmail}>{ord.currency || 'BDT'} {ord.amount}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* TAB: EMAIL CAMPAIGNS */}
          {activeTab === 'mail-campaigns' && (
            <View style={styles.tabContent}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionHeading}>Email Campaigns</Text>
                  <Text style={styles.sectionSubheading}>Syndicate memos, member announcements, digests</Text>
                </View>
              </View>

              <View style={styles.cmsCard}>
                <View style={styles.cmsCardHeader}>
                  <View style={styles.metaPill}>
                    <Text style={styles.metaPillText}>Digest Active</Text>
                  </View>
                  <Ionicons name="mail-outline" size={18} color={Colors.forest} />
                </View>
                <Text style={styles.cmsCardTitle}>Weekly Deal Memorandum</Text>
                <Text style={styles.cmsCardDesc}>
                  Automated notifications sent out to approved angel members whenever a new syndicate opportunity is opened.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      )}
      {/* 1. STATUS TIER SELECTION MODAL */}
      <Modal
        visible={tierModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTierModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setTierModalVisible(false)}
        >
          <View style={styles.modalCardCenter} onStartShouldSetResponder={() => true}>
            <View style={styles.modalTopBarTeal} />
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalHeaderTitle}>Change Account Tier</Text>
                <Text style={styles.modalHeaderSubtitle}>
                  {selectedMemberForTier?.name} • ID #{selectedMemberForTier?.id}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setTierModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.tierOptionsList}>
              {[
                {
                  key: 'free',
                  label: 'Free Tier',
                  desc: 'Public directory access, exploratory account',
                  color: '#4B5563',
                  bg: '#F3F4F6',
                  dot: '#9CA3AF',
                },
                {
                  key: 'core',
                  label: 'Core Tier',
                  desc: 'Full angel syndicate access and deal pipeline',
                  color: '#065F46',
                  bg: '#ECFDF5',
                  dot: '#10B981',
                },
                {
                  key: 'advanced',
                  label: 'Advanced Tier',
                  desc: 'Data rooms, priority allocation & direct dealflow',
                  color: '#0F766E',
                  bg: '#F0FDFA',
                  dot: '#14B8A6',
                },
                {
                  key: 'institutional',
                  label: 'Institutional Tier',
                  desc: 'Multi-seat access, bespoke syndicates & family offices',
                  color: '#6B21A8',
                  bg: '#FAF5FF',
                  dot: '#A855F7',
                },
              ].map((tier) => {
                const isSelected =
                  String(selectedMemberForTier?.account_status || 'free').toLowerCase() === tier.key;
                return (
                  <TouchableOpacity
                    key={`tier-opt-${tier.key}`}
                    style={[
                      styles.tierOptionItem,
                      isSelected && styles.tierOptionItemSelected,
                    ]}
                    onPress={() => handleChangeTier(tier.key)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.tierOptionLeft}>
                      <View style={[styles.tierDotLarge, { backgroundColor: tier.dot }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.tierOptionTitle, { color: tier.color }]}>
                          {tier.label}
                        </Text>
                        <Text style={styles.tierOptionDesc}>{tier.desc}</Text>
                      </View>
                    </View>
                    {isSelected ? (
                      <Ionicons name="checkmark-circle" size={22} color="#0A5554" />
                    ) : (
                      <View style={styles.tierRadioUnchecked} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setTierModalVisible(false)}
            >
              <Text style={styles.modalCancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 2. MODE CONFIRMATION MODAL */}
      <Modal
        visible={modeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !isModeUpdating && setModeModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => !isModeUpdating && setModeModalVisible(false)}
        >
          <View style={styles.modalCardCenter} onStartShouldSetResponder={() => true}>
            <View
              style={[
                styles.modalTopBarTeal,
                targetMode === 'inactive'
                  ? { backgroundColor: '#F59E0B' }
                  : { backgroundColor: '#10B981' },
              ]}
            />
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalHeaderTitle}>
                  Change Mode to {targetMode === 'active' ? 'Active' : 'Inactive'}
                </Text>
                <Text style={styles.modalHeaderSubtitle}>
                  Update member access permissions
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => !isModeUpdating && setModeModalVisible(false)}
                style={styles.modalCloseBtn}
                disabled={isModeUpdating}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Member Preview Card */}
            <View style={styles.memberPreviewCard}>
              {selectedMemberForMode?.profile_photo_url ? (
                <Image
                  source={{ uri: selectedMemberForMode.profile_photo_url }}
                  style={styles.previewAvatarPhoto}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.previewAvatarCircle}>
                  <Text style={styles.previewAvatarText}>
                    {(selectedMemberForMode?.name || 'U').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.previewMemberName} numberOfLines={1}>
                  {selectedMemberForMode?.name}
                </Text>
                <Text style={styles.previewMemberEmail} numberOfLines={1}>
                  {selectedMemberForMode?.email}
                </Text>
                <Text style={styles.previewMemberMeta}>
                  ID #{selectedMemberForMode?.id} • Currently{' '}
                  {selectedMemberForMode?.status === 'inactive' ? 'Inactive' : 'Active'}
                </Text>
              </View>
            </View>

            <View style={styles.modalWarningBox}>
              <Ionicons
                name={targetMode === 'inactive' ? 'warning-outline' : 'shield-checkmark-outline'}
                size={18}
                color={targetMode === 'inactive' ? '#B45309' : '#047857'}
              />
              <Text
                style={[
                  styles.modalWarningText,
                  targetMode === 'inactive' ? { color: '#92400E' } : { color: '#065F46' },
                ]}
              >
                {targetMode === 'inactive'
                  ? 'Switching this member to Inactive will temporarily suspend their ability to log in and commit to syndicate deals.'
                  : 'Switching this member to Active will restore full platform login and deal participation privileges.'}
              </Text>
            </View>

            <View style={styles.modalFooterActionsRow}>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setModeModalVisible(false)}
                disabled={isModeUpdating}
              >
                <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalPrimaryBtn,
                  targetMode === 'inactive'
                    ? { backgroundColor: '#D97706' }
                    : { backgroundColor: '#0A5554' },
                ]}
                onPress={handleConfirmModeChange}
                disabled={isModeUpdating}
              >
                {isModeUpdating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalPrimaryBtnText}>
                    Yes, Change to {targetMode === 'active' ? 'Active' : 'Inactive'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 3. DELETE MEMBER CONFIRMATION MODAL */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !isDeletingMember && setDeleteModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => !isDeletingMember && setDeleteModalVisible(false)}
        >
          <View style={styles.modalCardCenter} onStartShouldSetResponder={() => true}>
            <View style={styles.modalTopBarRed} />
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalDangerHeaderWrap}>
                <View style={styles.modalDangerIconBadge}>
                  <Ionicons name="trash-outline" size={20} color="#DC2626" />
                </View>
                <View>
                  <Text style={styles.modalHeaderTitleDanger}>Delete Member Account</Text>
                  <Text style={styles.modalHeaderSubtitle}>Permanent removal of member</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => !isDeletingMember && setDeleteModalVisible(false)}
                style={styles.modalCloseBtn}
                disabled={isDeletingMember}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Member Preview Card */}
            <View style={styles.memberPreviewCard}>
              {selectedMemberForDelete?.profile_photo_url ? (
                <Image
                  source={{ uri: selectedMemberForDelete.profile_photo_url }}
                  style={styles.previewAvatarPhoto}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.previewAvatarCircle}>
                  <Text style={styles.previewAvatarText}>
                    {(selectedMemberForDelete?.name || 'U').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.previewMemberName} numberOfLines={1}>
                  {selectedMemberForDelete?.name}
                </Text>
                <Text style={styles.previewMemberEmail} numberOfLines={1}>
                  {selectedMemberForDelete?.email}
                </Text>
                <Text style={styles.previewMemberMeta}>
                  ID #{selectedMemberForDelete?.id}
                </Text>
              </View>
            </View>

            <View style={styles.modalDangerNoticeBox}>
              <Text style={styles.modalDangerNoticeTitle}>Warning: This action cannot be undone</Text>
              <Text style={styles.modalDangerNoticeDesc}>
                All profile records, investments history links, and uploaded files for this member will be permanently removed from the system.
              </Text>
            </View>

            <View style={styles.modalFooterActionsRow}>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setDeleteModalVisible(false)}
                disabled={isDeletingMember}
              >
                <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalDangerBtn}
                onPress={handleConfirmDelete}
                disabled={isDeletingMember}
              >
                {isDeletingMember ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalDangerBtnText}>Yes, Delete Member</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 4. EDIT MEMBER PROFILE MODAL */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => !editSaving && setEditModalVisible(false)}
      >
        <SafeAreaView style={styles.editModalSafeArea}>
          <View style={styles.editModalContainer}>
            {/* Header */}
            <View style={styles.editModalHeader}>
              <View style={styles.editModalHeaderLeft}>
                <View style={styles.editModalIconWrap}>
                  <Ionicons name="person" size={18} color="#0A5554" />
                </View>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.editModalTitle}>Edit Member Profile</Text>
                    {editingMember && (
                      <View style={styles.editModalIdBadge}>
                        <Text style={styles.editModalIdBadgeText}>ID #{editingMember.id}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.editModalSubtitle}>
                    Update member credentials, tier, mode & details
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => !editSaving && setEditModalVisible(false)}
                style={styles.modalCloseBtn}
                disabled={editSaving}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Form Body */}
            <ScrollView
              style={styles.editModalScrollView}
              contentContainerStyle={styles.editModalFormContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Member Avatar Section */}
              <View style={styles.editAvatarSection}>
                {editingMember?.profile_photo_url ? (
                  <Image
                    source={{ uri: editingMember.profile_photo_url }}
                    style={styles.editAvatarImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.editAvatarPlaceholder}>
                    <Text style={styles.editAvatarPlaceholderText}>
                      {(editFormData.name || 'U').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={{ marginLeft: 14, flex: 1 }}>
                  <Text style={styles.editAvatarName} numberOfLines={1}>
                    {editFormData.name || 'Member'}
                  </Text>
                  <Text style={styles.editAvatarEmail} numberOfLines={1}>
                    {editFormData.email || 'Email'}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                    <View style={styles.editMetaBadge}>
                      <Text style={styles.editMetaBadgeText}>
                        {editFormData.account_status.toUpperCase()} TIER
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.editMetaBadge,
                        editFormData.status === 'active'
                          ? { backgroundColor: '#ECFDF5' }
                          : { backgroundColor: '#F3F4F6' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.editMetaBadgeText,
                          editFormData.status === 'active'
                            ? { color: '#065F46' }
                            : { color: '#6B7280' },
                        ]}
                      >
                        {editFormData.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Section 1: Personal Details */}
              <Text style={styles.formSectionHeader}>PERSONAL & CONTACT DETAILS</Text>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  Full Name <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.fieldInput}
                  value={editFormData.name}
                  onChangeText={(val) => setEditFormData((prev) => ({ ...prev, name: val }))}
                  placeholder="e.g. John Doe"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  Email Address <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.fieldInput}
                  value={editFormData.email}
                  onChangeText={(val) => setEditFormData((prev) => ({ ...prev, email: val }))}
                  placeholder="e.g. john@example.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  Phone / WhatsApp <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.fieldInput}
                  value={editFormData.phone}
                  onChangeText={(val) => setEditFormData((prev) => ({ ...prev, phone: val }))}
                  placeholder="e.g. +8801712345678"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                />
              </View>

              {/* Gender Chips */}
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  Gender <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.chipButtonGroup}>
                  {['male', 'female', 'other'].map((g) => (
                    <TouchableOpacity
                      key={`gender-${g}`}
                      style={[
                        styles.chipBtn,
                        editFormData.gender === g && styles.chipBtnActive,
                      ]}
                      onPress={() => setEditFormData((prev) => ({ ...prev, gender: g }))}
                    >
                      <Text
                        style={[
                          styles.chipBtnText,
                          editFormData.gender === g && styles.chipBtnTextActive,
                        ]}
                      >
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Country Selection Chips */}
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Primary Country</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 6, paddingVertical: 2 }}
                >
                  {COUNTRIES_LIST.map((c) => (
                    <TouchableOpacity
                      key={`country-${c}`}
                      style={[
                        styles.chipBtnSmall,
                        editFormData.primary_country === c && styles.chipBtnSmallActive,
                      ]}
                      onPress={() =>
                        setEditFormData((prev) => ({ ...prev, primary_country: c }))
                      }
                    >
                      <Text
                        style={[
                          styles.chipBtnSmallText,
                          editFormData.primary_country === c && styles.chipBtnSmallTextActive,
                        ]}
                      >
                        {c}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Section 2: Professional Details */}
              <Text style={styles.formSectionHeader}>PROFESSIONAL BACKGROUND</Text>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Organization / Company</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={editFormData.organization}
                  onChangeText={(val) =>
                    setEditFormData((prev) => ({ ...prev, organization: val }))
                  }
                  placeholder="e.g. Pathao, Grameenphone"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Designation / Title</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={editFormData.designation}
                  onChangeText={(val) =>
                    setEditFormData((prev) => ({ ...prev, designation: val }))
                  }
                  placeholder="e.g. Managing Director, Founder"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Preference Sector</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={editFormData.preference_sector}
                  onChangeText={(val) =>
                    setEditFormData((prev) => ({ ...prev, preference_sector: val }))
                  }
                  placeholder="e.g. Fintech, Edtech, Healthtech"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Section 3: Tier, Role & Mode */}
              <Text style={styles.formSectionHeader}>ACCOUNT TIER, ROLE & MODE</Text>

              {/* Account Tier */}
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  Account Tier <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.chipButtonGroup}>
                  {[
                    { key: 'free', label: 'Free' },
                    { key: 'core', label: 'Core' },
                    { key: 'advanced', label: 'Advanced' },
                    { key: 'institutional', label: 'Institutional' },
                  ].map((t) => (
                    <TouchableOpacity
                      key={`edit-tier-${t.key}`}
                      style={[
                        styles.chipBtn,
                        editFormData.account_status === t.key && styles.chipBtnActive,
                      ]}
                      onPress={() =>
                        setEditFormData((prev) => ({ ...prev, account_status: t.key }))
                      }
                    >
                      <Text
                        style={[
                          styles.chipBtnText,
                          editFormData.account_status === t.key && styles.chipBtnTextActive,
                        ]}
                      >
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Account Mode */}
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  Account Mode <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.chipButtonGroup}>
                  {[
                    { key: 'active', label: 'Active Mode' },
                    { key: 'inactive', label: 'Inactive Mode' },
                  ].map((m) => (
                    <TouchableOpacity
                      key={`edit-mode-${m.key}`}
                      style={[
                        styles.chipBtn,
                        editFormData.status === m.key && styles.chipBtnActive,
                      ]}
                      onPress={() =>
                        setEditFormData((prev) => ({ ...prev, status: m.key }))
                      }
                    >
                      <Text
                        style={[
                          styles.chipBtnText,
                          editFormData.status === m.key && styles.chipBtnTextActive,
                        ]}
                      >
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Role */}
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Role</Text>
                <View style={styles.chipButtonGroup}>
                  {[
                    { key: 'investor', label: 'Investor' },
                    { key: 'admin', label: 'Admin' },
                    { key: 'disabled', label: 'Disabled' },
                  ].map((r) => (
                    <TouchableOpacity
                      key={`edit-role-${r.key}`}
                      style={[
                        styles.chipBtn,
                        editFormData.role === r.key && styles.chipBtnActive,
                      ]}
                      onPress={() =>
                        setEditFormData((prev) => ({ ...prev, role: r.key }))
                      }
                    >
                      <Text
                        style={[
                          styles.chipBtnText,
                          editFormData.role === r.key && styles.chipBtnTextActive,
                        ]}
                      >
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Password */}
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>New Password (leave blank to keep current)</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={editFormData.password}
                  onChangeText={(val) => setEditFormData((prev) => ({ ...prev, password: val }))}
                  placeholder="Min 8 characters"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                />
              </View>

              {/* Email Verification Status Banner */}
              <View style={styles.editVerificationBanner}>
                {editingMember?.is_email_verified ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="checkmark-circle" size={18} color="#059669" />
                    <View>
                      <Text style={styles.editVerificationTitle}>Email Address Verified</Text>
                      <Text style={styles.editVerificationSubtitle}>
                        This member holds a verified email badge.
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                      <Ionicons name="alert-circle-outline" size={18} color="#D97706" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.editVerificationTitleWarning}>Email Unverified</Text>
                        <Text style={styles.editVerificationSubtitle}>
                          Member has not completed email verification link.
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.editManualVerifyBtn}
                      onPress={() => handleVerifyEmail(editingMember?.id, editingMember?.name)}
                    >
                      <Text style={styles.editManualVerifyBtnText}>Verify Now</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.editModalFooter}>
              <TouchableOpacity
                style={styles.editModalCancelBtn}
                onPress={() => setEditModalVisible(false)}
                disabled={editSaving}
              >
                <Text style={styles.editModalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editModalSaveBtn}
                onPress={handleSaveEdit}
                disabled={editSaving}
              >
                {editSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.editModalSaveBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ADD MEMBER MODAL */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => !addSaving && setAddModalVisible(false)}
      >
        <SafeAreaView style={styles.editModalSafeArea}>
          <View style={styles.editModalContainer}>
            {/* Header */}
            <View style={styles.editModalHeader}>
              <View style={styles.editModalHeaderLeft}>
                <View style={[styles.editModalIconWrap, { backgroundColor: '#E6F4F1' }]}>
                  <Ionicons name="person-add" size={18} color="#0A5554" />
                </View>
                <View>
                  <Text style={styles.editModalTitle}>Add New Member</Text>
                  <Text style={styles.editModalSubtitle}>
                    Create an investor account in Bangladesh Angels
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => !addSaving && setAddModalVisible(false)}
                style={styles.modalCloseBtn}
                disabled={addSaving}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Form Body */}
            <ScrollView
              style={styles.editModalScrollView}
              contentContainerStyle={styles.editModalFormContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Section 1: Basic & Contact */}
              <Text style={styles.formSectionHeader}>BASIC & CONTACT DETAILS</Text>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  Full Name <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.fieldInput}
                  value={addFormData.name}
                  onChangeText={(val) => setAddFormData((prev) => ({ ...prev, name: val }))}
                  placeholder="e.g. Tanveer Islam"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  Email Address <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.fieldInput}
                  value={addFormData.email}
                  onChangeText={(val) => setAddFormData((prev) => ({ ...prev, email: val }))}
                  placeholder="e.g. tanveer@example.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Phone / WhatsApp</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={addFormData.phone}
                  onChangeText={(val) => setAddFormData((prev) => ({ ...prev, phone: val }))}
                  placeholder="e.g. +8801712345678"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                />
              </View>

              {/* Password & Confirm */}
              <View style={styles.formField}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.fieldLabel}>
                    Password <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TouchableOpacity onPress={() => setShowAddPassword((prev) => !prev)}>
                    <Text style={{ fontSize: 12, color: Colors.forest, fontWeight: '600' }}>
                      {showAddPassword ? 'Hide' : 'Show'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.fieldInput}
                  value={addFormData.password}
                  onChangeText={(val) => setAddFormData((prev) => ({ ...prev, password: val }))}
                  placeholder="At least 8 characters"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showAddPassword}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  Confirm Password <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.fieldInput}
                  value={addFormData.password_confirmation}
                  onChangeText={(val) =>
                    setAddFormData((prev) => ({ ...prev, password_confirmation: val }))
                  }
                  placeholder="Re-type password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showAddPassword}
                />
              </View>

              {/* Gender Chips */}
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Gender</Text>
                <View style={styles.chipButtonGroup}>
                  {['male', 'female', 'other'].map((g) => (
                    <TouchableOpacity
                      key={`add-gender-${g}`}
                      style={[
                        styles.chipBtn,
                        addFormData.gender === g && styles.chipBtnActive,
                      ]}
                      onPress={() => setAddFormData((prev) => ({ ...prev, gender: g }))}
                    >
                      <Text
                        style={[
                          styles.chipBtnText,
                          addFormData.gender === g && styles.chipBtnTextActive,
                        ]}
                      >
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Country Selection Chips */}
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Primary Country</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 6, paddingVertical: 2 }}
                >
                  {COUNTRIES_LIST.map((c) => (
                    <TouchableOpacity
                      key={`add-country-${c}`}
                      style={[
                        styles.chipBtnSmall,
                        addFormData.primary_country === c && styles.chipBtnSmallActive,
                      ]}
                      onPress={() =>
                        setAddFormData((prev) => ({ ...prev, primary_country: c }))
                      }
                    >
                      <Text
                        style={[
                          styles.chipBtnSmallText,
                          addFormData.primary_country === c && styles.chipBtnSmallTextActive,
                        ]}
                      >
                        {c}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Section 2: Professional Details */}
              <Text style={styles.formSectionHeader}>PROFESSIONAL & BILLING DETAILS</Text>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Organization / Company</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={addFormData.organization}
                  onChangeText={(val) =>
                    setAddFormData((prev) => ({ ...prev, organization: val }))
                  }
                  placeholder="e.g. Apex Ventures, Robi"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Designation / Title</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={addFormData.designation}
                  onChangeText={(val) =>
                    setAddFormData((prev) => ({ ...prev, designation: val }))
                  }
                  placeholder="e.g. Partner, Director"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Billing / Office Address</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={addFormData.address}
                  onChangeText={(val) =>
                    setAddFormData((prev) => ({ ...prev, address: val }))
                  }
                  placeholder="e.g. Gulshan-2, Dhaka"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Sector Preference</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={addFormData.preference_sector}
                  onChangeText={(val) =>
                    setAddFormData((prev) => ({ ...prev, preference_sector: val }))
                  }
                  placeholder="e.g. Fintech, Edtech, SaaS, AI"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Section 3: Account Tier, Role & Mode */}
              <Text style={styles.formSectionHeader}>TIER, ROLE & STATUS</Text>

              {/* Account Tier */}
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Account Tier</Text>
                <View style={styles.chipButtonGroup}>
                  {[
                    { key: 'free', label: 'Free' },
                    { key: 'core', label: 'Core' },
                    { key: 'advanced', label: 'Advanced' },
                    { key: 'institutional', label: 'Institutional' },
                  ].map((t) => (
                    <TouchableOpacity
                      key={`add-tier-${t.key}`}
                      style={[
                        styles.chipBtn,
                        addFormData.account_status === t.key && styles.chipBtnActive,
                      ]}
                      onPress={() =>
                        setAddFormData((prev) => ({ ...prev, account_status: t.key }))
                      }
                    >
                      <Text
                        style={[
                          styles.chipBtnText,
                          addFormData.account_status === t.key && styles.chipBtnTextActive,
                        ]}
                      >
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Account Mode */}
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Account Mode</Text>
                <View style={styles.chipButtonGroup}>
                  {[
                    { key: 'active', label: 'Active Mode' },
                    { key: 'inactive', label: 'Inactive Mode' },
                  ].map((m) => (
                    <TouchableOpacity
                      key={`add-mode-${m.key}`}
                      style={[
                        styles.chipBtn,
                        addFormData.status === m.key && styles.chipBtnActive,
                      ]}
                      onPress={() =>
                        setAddFormData((prev) => ({ ...prev, status: m.key }))
                      }
                    >
                      <Text
                        style={[
                          styles.chipBtnText,
                          addFormData.status === m.key && styles.chipBtnTextActive,
                        ]}
                      >
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Role */}
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Role</Text>
                <View style={styles.chipButtonGroup}>
                  {[
                    { key: 'investor', label: 'Investor' },
                    { key: 'admin', label: 'Admin' },
                    { key: 'disabled', label: 'Disabled' },
                  ].map((r) => (
                    <TouchableOpacity
                      key={`add-role-${r.key}`}
                      style={[
                        styles.chipBtn,
                        addFormData.role === r.key && styles.chipBtnActive,
                      ]}
                      onPress={() =>
                        setAddFormData((prev) => ({ ...prev, role: r.key }))
                      }
                    >
                      <Text
                        style={[
                          styles.chipBtnText,
                          addFormData.role === r.key && styles.chipBtnTextActive,
                        ]}
                      >
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Verification & Approval Toggles */}
              <View style={styles.addTogglesContainer}>
                {/* Pre-Approve Toggle */}
                <TouchableOpacity
                  style={styles.addToggleRow}
                  onPress={() =>
                    setAddFormData((prev) => ({ ...prev, is_approved: !prev.is_approved }))
                  }
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.addToggleTitle}>Approve Immediately</Text>
                    <Text style={styles.addToggleSubtitle}>
                      Allow member immediate directory and platform access
                    </Text>
                  </View>
                  <Ionicons
                    name={addFormData.is_approved ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={addFormData.is_approved ? '#0F7359' : '#94A3B8'}
                  />
                </TouchableOpacity>

                {/* Mark Email Verified Toggle */}
                <TouchableOpacity
                  style={styles.addToggleRow}
                  onPress={() =>
                    setAddFormData((prev) => ({ ...prev, verify_email: !prev.verify_email }))
                  }
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.addToggleTitle}>Verify Email Immediately</Text>
                    <Text style={styles.addToggleSubtitle}>
                      Grant verified badge without email link requirement
                    </Text>
                  </View>
                  <Ionicons
                    name={addFormData.verify_email ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={addFormData.verify_email ? '#0F7359' : '#94A3B8'}
                  />
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.editModalFooter}>
              <TouchableOpacity
                style={styles.editModalCancelBtn}
                onPress={() => setAddModalVisible(false)}
                disabled={addSaving}
              >
                <Text style={styles.editModalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editModalSaveBtn}
                onPress={handleSaveAddMember}
                disabled={addSaving}
              >
                {addSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.editModalSaveBtnText}>Create Member</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* VIEW / READ BLOG MODAL */}
      <Modal
        visible={viewBlogModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setViewBlogModalVisible(false)}
      >
        <SafeAreaView style={styles.editModalSafeArea}>
          <View style={styles.editModalContainer}>
            {/* Header */}
            <View style={styles.editModalHeader}>
              <View style={styles.editModalHeaderLeft}>
                <View style={[styles.editModalIconWrap, { backgroundColor: '#E6F4F1' }]}>
                  <Ionicons name="book-outline" size={18} color="#0A5554" />
                </View>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.editModalTitle} numberOfLines={1}>Article Preview</Text>
                  <Text style={styles.editModalSubtitle} numberOfLines={1}>
                    {selectedBlogForView?.category || 'Editorial Publication'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setViewBlogModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Reader Body */}
            <ScrollView
              style={styles.editModalScrollView}
              contentContainerStyle={styles.blogReaderContent}
            >
              {/* Badges Row */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                <View style={styles.blogCategoryPill}>
                  <Text style={styles.blogCategoryPillText}>
                    {selectedBlogForView?.category || 'Educational'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.blogStatusPill,
                    selectedBlogForView?.status === 'published'
                      ? styles.blogStatusPillPublished
                      : styles.blogStatusPillArchived,
                  ]}
                >
                  <View
                    style={[
                      styles.blogStatusDot,
                      {
                        backgroundColor:
                          selectedBlogForView?.status === 'published' ? '#059669' : '#D97706',
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.blogStatusPillText,
                      {
                        color:
                          selectedBlogForView?.status === 'published' ? '#065F46' : '#92400E',
                      },
                    ]}
                  >
                    {selectedBlogForView?.status === 'published' ? 'Published' : 'Archived'}
                  </Text>
                </View>
                <View style={styles.blogReadTimePill}>
                  <Ionicons name="time-outline" size={12} color="#64748B" />
                  <Text style={styles.blogReadTimeText}>
                    {selectedBlogForView?.reading_minutes || 3} min read
                  </Text>
                </View>
              </View>

              {/* Title */}
              <Text style={styles.blogReaderTitle}>{selectedBlogForView?.title}</Text>

              {/* Author & Meta Box */}
              <View style={styles.blogReaderAuthorBox}>
                <View style={styles.blogReaderAvatarCircle}>
                  <Text style={styles.blogReaderAvatarText}>
                    {(selectedBlogForView?.author_name || 'B').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.blogReaderAuthorName}>
                    {selectedBlogForView?.author_name || 'Bangladesh Angels Network'}
                  </Text>
                  <Text style={styles.blogReaderAuthorRole}>
                    {[
                      selectedBlogForView?.author_role,
                      selectedBlogForView?.author_organization || 'Bangladesh Angels Network',
                    ]
                      .filter(Boolean)
                      .join(' • ')}
                  </Text>
                  <Text style={styles.blogReaderDate}>
                    {selectedBlogForView?.published_at
                      ? new Date(selectedBlogForView.published_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'Draft / Unpublished'} • /{selectedBlogForView?.slug}
                  </Text>
                </View>
              </View>

              {/* Excerpt Callout */}
              {Boolean(selectedBlogForView?.excerpt) && (
                <View style={styles.blogReaderExcerptBox}>
                  <Text style={styles.blogReaderExcerptText}>
                    {selectedBlogForView.excerpt.replace(/<[^>]*>/g, '')}
                  </Text>
                </View>
              )}

              {/* Content Body */}
              <View style={styles.blogReaderBodyBox}>
                <BlogContentRenderer content={selectedBlogForView?.content} />
              </View>
            </ScrollView>

            {/* Footer Action Bar */}
            <View style={styles.blogReaderFooter}>
              <TouchableOpacity
                style={styles.blogReaderBtnOutline}
                onPress={() => {
                  setViewBlogModalVisible(false);
                  handleOpenEditBlog(selectedBlogForView);
                }}
              >
                <Ionicons name="create-outline" size={16} color="#0A5554" />
                <Text style={styles.blogReaderBtnOutlineText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.blogReaderBtnOutline,
                  selectedBlogForView?.status === 'published'
                    ? { borderColor: '#FDE68A' }
                    : { borderColor: '#A7F3D0' },
                ]}
                onPress={() => handleToggleBlogStatus(selectedBlogForView)}
              >
                <Ionicons
                  name={
                    selectedBlogForView?.status === 'published'
                      ? 'archive-outline'
                      : 'checkmark-circle-outline'
                  }
                  size={16}
                  color={selectedBlogForView?.status === 'published' ? '#B45309' : '#047857'}
                />
                <Text
                  style={[
                    styles.blogReaderBtnOutlineText,
                    {
                      color:
                        selectedBlogForView?.status === 'published' ? '#B45309' : '#047857',
                    },
                  ]}
                >
                  {selectedBlogForView?.status === 'published' ? 'Archive' : 'Publish'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.blogReaderBtnClose}
                onPress={() => setViewBlogModalVisible(false)}
              >
                <Text style={styles.blogReaderBtnCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* CREATE & EDIT BLOG MODAL */}
      <Modal
        visible={createBlogModalVisible || editBlogModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!blogSaving) {
            setCreateBlogModalVisible(false);
            setEditBlogModalVisible(false);
            setEditingBlog(null);
          }
        }}
      >
        <SafeAreaView style={styles.editModalSafeArea}>
          <View style={styles.editModalContainer}>
            {/* Header */}
            <View style={styles.editModalHeader}>
              <View style={styles.editModalHeaderLeft}>
                <View style={[styles.editModalIconWrap, { backgroundColor: '#E6F4F1' }]}>
                  <Ionicons
                    name={editBlogModalVisible ? 'create' : 'add-circle'}
                    size={18}
                    color="#0A5554"
                  />
                </View>
                <View>
                  <Text style={styles.editModalTitle}>
                    {editBlogModalVisible ? 'Edit Blog Post' : 'New Blog Post'}
                  </Text>
                  <Text style={styles.editModalSubtitle}>
                    {editBlogModalVisible
                      ? 'Update content and article metadata'
                      : 'Publish or draft an article for the BAN library'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (!blogSaving) {
                    setCreateBlogModalVisible(false);
                    setEditBlogModalVisible(false);
                    setEditingBlog(null);
                  }
                }}
                style={styles.modalCloseBtn}
                disabled={blogSaving}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Form Body */}
            <ScrollView
              style={styles.editModalScrollView}
              contentContainerStyle={styles.editModalFormContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Section 1: Article Info */}
              <Text style={styles.formSectionHeader}>ARTICLE INFORMATION</Text>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  Article Title <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.fieldInput}
                  value={blogFormData.title}
                  onChangeText={(val) => setBlogFormData((prev) => ({ ...prev, title: val }))}
                  placeholder="A clear, specific headline"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>URL Slug</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={blogFormData.slug}
                  onChangeText={(val) => setBlogFormData((prev) => ({ ...prev, slug: val }))}
                  placeholder="auto-generated-from-title"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                />
                <Text style={styles.fieldHint}>
                  Lowercase letters, numbers, and hyphens. Leave blank to generate automatically.
                </Text>
              </View>

              {/* Category Chips */}
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  Category <Text style={styles.requiredStar}>*</Text>
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 6, paddingVertical: 2 }}
                >
                  {BLOG_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={`cat-chip-${cat}`}
                      style={[
                        styles.chipBtnSmall,
                        blogFormData.category === cat && styles.chipBtnSmallActive,
                      ]}
                      onPress={() => setBlogFormData((prev) => ({ ...prev, category: cat }))}
                    >
                      <Text
                        style={[
                          styles.chipBtnSmallText,
                          blogFormData.category === cat && styles.chipBtnSmallTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Summary / Excerpt</Text>
                <TextInput
                  style={[styles.fieldInput, { height: 75, textAlignVertical: 'top', paddingTop: 8 }]}
                  value={blogFormData.excerpt}
                  onChangeText={(val) => setBlogFormData((prev) => ({ ...prev, excerpt: val }))}
                  placeholder="A concise introduction used on listings and in search results"
                  placeholderTextColor="#94A3B8"
                  multiline
                />
              </View>

              {/* Rich HTML Content Editor with Web-parity Formatting Toolbar */}
              <View style={styles.editorContainerBox}>
                <View style={styles.editorHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                    <Ionicons name="document-text-outline" size={15} color="#0A5554" />
                    <Text style={styles.fieldLabel}>
                      Article Content <Text style={styles.requiredStar}>*</Text>
                    </Text>
                  </View>

                  {/* Mode Switcher: Code Editor vs Live Preview */}
                  <View style={styles.editorModeSwitchGroup}>
                    <TouchableOpacity
                      style={[
                        styles.editorModeSwitchBtn,
                        blogEditorMode === 'editor' && styles.editorModeSwitchBtnActive,
                      ]}
                      onPress={() => setBlogEditorMode('editor')}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="code-slash"
                        size={12}
                        color={blogEditorMode === 'editor' ? '#FFFFFF' : '#475569'}
                      />
                      <Text
                        style={[
                          styles.editorModeSwitchText,
                          blogEditorMode === 'editor' && styles.editorModeSwitchTextActive,
                        ]}
                      >
                        Editor
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.editorModeSwitchBtn,
                        blogEditorMode === 'preview' && styles.editorModeSwitchBtnActive,
                      ]}
                      onPress={() => setBlogEditorMode('preview')}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="eye-outline"
                        size={12}
                        color={blogEditorMode === 'preview' ? '#FFFFFF' : '#475569'}
                      />
                      <Text
                        style={[
                          styles.editorModeSwitchText,
                          blogEditorMode === 'preview' && styles.editorModeSwitchTextActive,
                        ]}
                      >
                        Live Preview
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {blogEditorMode === 'editor' ? (
                  <View style={styles.editorContentWrapper}>
                    {/* Formatting Toolbar (Matches web blade buttons) */}
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.editorToolbarContent}
                      style={styles.editorToolbarBar}
                    >
                      <TouchableOpacity
                        style={styles.editorToolBtn}
                        onPress={() => handleEditorFormat('formatBlock', 'p')}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.editorToolBtnText}>Paragraph</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.editorToolBtn}
                        onPress={() => handleEditorFormat('formatBlock', 'h2')}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.editorToolBtnText}>Heading 2</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.editorToolBtn}
                        onPress={() => handleEditorFormat('formatBlock', 'h3')}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.editorToolBtnText}>Heading 3</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.editorToolBtn}
                        onPress={() => handleEditorFormat('bold')}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.editorToolBtnText, { fontWeight: '900' }]}>Bold</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.editorToolBtn}
                        onPress={() => handleEditorFormat('italic')}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.editorToolBtnText, { fontStyle: 'italic' }]}>Italic</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.editorToolBtn}
                        onPress={() => handleEditorFormat('insertUnorderedList')}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.editorToolBtnText}>• List</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.editorToolBtn}
                        onPress={() => handleEditorFormat('insertOrderedList')}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.editorToolBtnText}>1. List</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.editorToolBtn}
                        onPress={() => handleEditorFormat('insertListItem')}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.editorToolBtnText}>+ Item</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.editorToolBtn}
                        onPress={() => handleEditorFormat('link')}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="link-outline" size={12} color="#0A5554" />
                        <Text style={styles.editorToolBtnText}>Link</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.editorToolBtn, styles.editorToolBtnClear]}
                        onPress={() => handleEditorFormat('removeFormat')}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="backspace-outline" size={12} color="#64748B" />
                        <Text style={[styles.editorToolBtnText, { color: '#64748B' }]}>Clear</Text>
                      </TouchableOpacity>
                    </ScrollView>

                    {/* Text Input */}
                    <TextInput
                      style={styles.editorTextInput}
                      value={blogFormData.content}
                      onChangeText={(val) => setBlogFormData((prev) => ({ ...prev, content: val }))}
                      onSelectionChange={(e) => setEditorSelection(e.nativeEvent.selection)}
                      placeholder="Write the full article content. Use the formatting toolbar above for headings, paragraphs, lists, and links..."
                      placeholderTextColor="#94A3B8"
                      multiline
                    />
                  </View>
                ) : (
                  /* Live Preview Box */
                  <View style={styles.editorPreviewContainer}>
                    {blogFormData.content?.trim() ? (
                      <BlogContentRenderer content={blogFormData.content} />
                    ) : (
                      <View style={styles.editorPreviewEmpty}>
                        <Ionicons name="document-text-outline" size={30} color="#CBD5E1" />
                        <Text style={styles.editorPreviewEmptyText}>
                          Nothing to preview yet. Switch back to Editor and write content or tap formatting tools.
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                <Text style={styles.editorHelperText}>
                  Designed for long-form writing. Use headings, short paragraphs, bold text, links, and lists for readability.
                </Text>
              </View>

              {/* Section 2: Author & Attribution */}
              <Text style={styles.formSectionHeader}>AUTHOR & ATTRIBUTION</Text>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Author Name</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={blogFormData.author_name}
                  onChangeText={(val) => setBlogFormData((prev) => ({ ...prev, author_name: val }))}
                  placeholder="e.g. Nadim Abrar"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Author Title / Role</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={blogFormData.author_role}
                  onChangeText={(val) => setBlogFormData((prev) => ({ ...prev, author_role: val }))}
                  placeholder="e.g. Investment Associate"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Author Organization</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={blogFormData.author_organization}
                  onChangeText={(val) =>
                    setBlogFormData((prev) => ({ ...prev, author_organization: val }))
                  }
                  placeholder="e.g. Bangladesh Angels Network"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Section 3: Visibility Status */}
              <Text style={styles.formSectionHeader}>VISIBILITY & STATUS</Text>

              <View style={styles.formField}>
                <View style={styles.chipButtonGroup}>
                  {[
                    { key: 'published', label: 'Published (Public)' },
                    { key: 'archived', label: 'Archived (Hidden)' },
                  ].map((s) => (
                    <TouchableOpacity
                      key={`blog-status-opt-${s.key}`}
                      style={[
                        styles.chipBtn,
                        blogFormData.status === s.key && styles.chipBtnActive,
                      ]}
                      onPress={() => setBlogFormData((prev) => ({ ...prev, status: s.key }))}
                    >
                      <Text
                        style={[
                          styles.chipBtnText,
                          blogFormData.status === s.key && styles.chipBtnTextActive,
                        ]}
                      >
                        {s.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.editModalFooter}>
              <TouchableOpacity
                style={styles.editModalCancelBtn}
                onPress={() => {
                  setCreateBlogModalVisible(false);
                  setEditBlogModalVisible(false);
                  setEditingBlog(null);
                }}
                disabled={blogSaving}
              >
                <Text style={styles.editModalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editModalSaveBtn}
                onPress={editBlogModalVisible ? handleSaveEditBlog : handleSaveCreateBlog}
                disabled={blogSaving}
              >
                {blogSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.editModalSaveBtnText}>
                    {editBlogModalVisible ? 'Save Changes' : 'Publish Article'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* DELETE BLOG CONFIRMATION MODAL */}
      <Modal
        visible={deleteBlogModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !isDeletingBlog && setDeleteBlogModalVisible(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalBox}>
            <View style={[styles.deleteModalIconWrap, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="trash-outline" size={26} color="#DC2626" />
            </View>
            <Text style={styles.deleteModalTitle}>Delete Blog Post?</Text>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete &ldquo;{selectedBlogForDelete?.title}&rdquo;? It will no longer appear in the active content library.
            </Text>
            <View style={styles.deleteModalBtnRow}>
              <TouchableOpacity
                style={styles.deleteModalCancelBtn}
                onPress={() => setDeleteBlogModalVisible(false)}
                disabled={isDeletingBlog}
              >
                <Text style={styles.deleteModalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteModalConfirmBtn}
                onPress={handleConfirmDeleteBlog}
                disabled={isDeletingBlog}
              >
                {isDeletingBlog ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.deleteModalConfirmBtnText}>Delete Post</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 5. INSERT LINK MODAL */}
      <Modal
        visible={linkModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLinkModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLinkModalVisible(false)}
        >
          <View style={styles.modalCardCenter} onStartShouldSetResponder={() => true}>
            <View style={styles.modalTopBarTeal} />
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalHeaderTitle}>Insert Hyperlink</Text>
                <Text style={styles.modalHeaderSubtitle}>Web link for article text</Text>
              </View>
              <TouchableOpacity
                onPress={() => setLinkModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 12 }}>
              <View style={{ gap: 4 }}>
                <Text style={styles.fieldLabel}>Display Text</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={linkFormData.text}
                  onChangeText={(val) => setLinkFormData((prev) => ({ ...prev, text: val }))}
                  placeholder="e.g. Visit Bangladesh Angels"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={{ gap: 4 }}>
                <Text style={styles.fieldLabel}>
                  Destination URL <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.fieldInput}
                  value={linkFormData.url}
                  onChangeText={(val) => setLinkFormData((prev) => ({ ...prev, url: val }))}
                  placeholder="https://bdangels.co"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>

              <View style={[styles.modalFooterActionsRow, { marginHorizontal: -16, marginBottom: -16 }]}>
                <TouchableOpacity
                  style={styles.modalSecondaryBtn}
                  onPress={() => setLinkModalVisible(false)}
                >
                  <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalPrimaryBtn}
                  onPress={handleConfirmInsertLink}
                >
                  <Text style={styles.modalPrimaryBtnText}>Insert Link</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* VIEW / PREVIEW PUBLICATION MODAL */}
      <Modal
        visible={viewPublicationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setViewPublicationModalVisible(false);
          setSelectedPublicationForView(null);
        }}
      >
        <SafeAreaView style={styles.editModalSafeArea}>
          <View style={styles.editModalContainer}>
            {/* Header */}
            <View style={styles.editModalHeader}>
              <View style={styles.editModalHeaderLeft}>
                <View style={[styles.editModalIconWrap, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="document-text" size={18} color="#DC2626" />
                </View>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.editModalTitle} numberOfLines={1}>
                    Publication Preview
                  </Text>
                  <Text style={styles.editModalSubtitle} numberOfLines={1}>
                    {selectedPublicationForView?.category || 'Research Library'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setViewPublicationModalVisible(false);
                  setSelectedPublicationForView(null);
                }}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Reader Body */}
            {selectedPublicationForView && (
              <ScrollView
                style={styles.editModalScrollView}
                contentContainerStyle={styles.blogReaderContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Badges Row */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    flexWrap: 'wrap',
                    marginBottom: 12,
                  }}
                >
                  <View style={styles.pubCategoryPill}>
                    <Text style={styles.pubCategoryPillText}>
                      {selectedPublicationForView.category || 'Research'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.blogStatusPill,
                      selectedPublicationForView.status === 'published'
                        ? styles.blogStatusPillPublished
                        : styles.blogStatusPillArchived,
                    ]}
                  >
                    <View
                      style={[
                        styles.blogStatusDot,
                        {
                          backgroundColor:
                            selectedPublicationForView.status === 'published'
                              ? '#059669'
                              : '#D97706',
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.blogStatusPillText,
                        {
                          color:
                            selectedPublicationForView.status === 'published'
                              ? '#065F46'
                              : '#92400E',
                        },
                      ]}
                    >
                      {selectedPublicationForView.status === 'published' ? 'Published' : 'Archived'}
                    </Text>
                  </View>
                </View>

                {/* Title */}
                <Text style={styles.blogReaderTitle}>{selectedPublicationForView.title}</Text>

                {/* Date & Metadata Card */}
                <View style={styles.pubDetailMetaBox}>
                  <View style={styles.pubDetailMetaItem}>
                    <Ionicons name="calendar-outline" size={15} color="#64748B" />
                    <Text style={styles.pubDetailMetaLabel}>Published:</Text>
                    <Text style={styles.pubDetailMetaValue}>
                      {selectedPublicationForView.published_at
                        ? new Date(selectedPublicationForView.published_at).toLocaleDateString(
                            'en-GB',
                            {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            }
                          )
                        : 'Unpublished / Draft'}
                    </Text>
                  </View>
                  <View style={styles.pubDetailMetaItem}>
                    <Ionicons name="folder-outline" size={15} color="#64748B" />
                    <Text style={styles.pubDetailMetaLabel}>Category:</Text>
                    <Text style={styles.pubDetailMetaValue}>
                      {selectedPublicationForView.category || 'Research'}
                    </Text>
                  </View>
                </View>

                {/* PDF Download Hero Card */}
                <View style={styles.pubDownloadHeroCard}>
                  <View style={styles.pubDownloadHeroIconWrap}>
                    <Ionicons name="document-text" size={26} color="#DC2626" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pubDownloadHeroTitle} numberOfLines={1}>
                      {selectedPublicationForView.pdf_original_name || 'Publication Report.pdf'}
                    </Text>
                    <Text style={styles.pubDownloadHeroSubtitle}>
                      Official publication document (PDF)
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.pubDownloadHeroBtn}
                    onPress={async () => {
                      const url =
                        selectedPublicationForView.download_url ||
                        `https://bdangels.co/api/publications/${selectedPublicationForView.id}/download`;
                      try {
                        const canOpen = await Linking.canOpenURL(url);
                        if (canOpen) {
                          await Linking.openURL(url);
                        } else {
                          Alert.alert('Cannot Open Link', url);
                        }
                      } catch {
                        Linking.openURL(url);
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="download" size={15} color="#FFFFFF" />
                    <Text style={styles.pubDownloadHeroBtnText}>Download</Text>
                  </TouchableOpacity>
                </View>

                {/* Summary / Excerpt Section */}
                <View style={styles.pubSummarySection}>
                  <Text style={styles.pubSummarySectionTitle}>EXECUTIVE SUMMARY & ABSTRACT</Text>
                  <Text style={styles.pubSummaryText}>
                    {selectedPublicationForView.excerpt ||
                      'No summary or abstract has been provided for this publication.'}
                  </Text>
                </View>

                {/* Public Library Notice Box */}
                <View style={styles.pubPublicNoticeBox}>
                  <Ionicons name="information-circle-outline" size={20} color="#0A5554" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pubPublicNoticeTitle}>Research Portal Integration</Text>
                    <Text style={styles.pubPublicNoticeText}>
                      When marked as Published, this report is available for investors and founders at bdangels.co/publications.
                    </Text>
                  </View>
                </View>
              </ScrollView>
            )}

            {/* Footer Action Bar */}
            <View style={styles.blogReaderFooter}>
              <TouchableOpacity
                style={styles.blogReaderBtnOutline}
                onPress={() => {
                  const pub = selectedPublicationForView;
                  setViewPublicationModalVisible(false);
                  handleOpenEditPublication(pub);
                }}
              >
                <Ionicons name="create-outline" size={16} color="#0A5554" />
                <Text style={styles.blogReaderBtnOutlineText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.blogReaderBtnOutline,
                  selectedPublicationForView?.status === 'published'
                    ? { borderColor: '#FDE68A' }
                    : { borderColor: '#A7F3D0' },
                ]}
                onPress={() => handleTogglePublicationStatus(selectedPublicationForView)}
              >
                <Ionicons
                  name={
                    selectedPublicationForView?.status === 'published'
                      ? 'archive-outline'
                      : 'checkmark-circle-outline'
                  }
                  size={16}
                  color={
                    selectedPublicationForView?.status === 'published' ? '#B45309' : '#047857'
                  }
                />
                <Text
                  style={[
                    styles.blogReaderBtnOutlineText,
                    {
                      color:
                        selectedPublicationForView?.status === 'published'
                          ? '#B45309'
                          : '#047857',
                    },
                  ]}
                >
                  {selectedPublicationForView?.status === 'published' ? 'Archive' : 'Publish'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.blogReaderBtnClose}
                onPress={() => {
                  setViewPublicationModalVisible(false);
                  setSelectedPublicationForView(null);
                }}
              >
                <Text style={styles.blogReaderBtnCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* CREATE & EDIT PUBLICATION MODAL */}
      <Modal
        visible={createPublicationModalVisible || editPublicationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!publicationSaving) {
            setCreatePublicationModalVisible(false);
            setEditPublicationModalVisible(false);
            setEditingPublication(null);
          }
        }}
      >
        <SafeAreaView style={styles.editModalSafeArea}>
          <View style={styles.editModalContainer}>
            {/* Header */}
            <View style={styles.editModalHeader}>
              <View style={styles.editModalHeaderLeft}>
                <View style={[styles.editModalIconWrap, { backgroundColor: '#E6F4F1' }]}>
                  <Ionicons
                    name={editPublicationModalVisible ? 'create' : 'add-circle'}
                    size={18}
                    color="#0A5554"
                  />
                </View>
                <View>
                  <Text style={styles.editModalTitle}>
                    {editPublicationModalVisible ? 'Edit Publication' : 'New Publication'}
                  </Text>
                  <Text style={styles.editModalSubtitle}>
                    {editPublicationModalVisible
                      ? 'Update publication details and document path'
                      : 'Upload reports and make them available to the public'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (!publicationSaving) {
                    setCreatePublicationModalVisible(false);
                    setEditPublicationModalVisible(false);
                    setEditingPublication(null);
                  }
                }}
                style={styles.modalCloseBtn}
                disabled={publicationSaving}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Form Body */}
            <ScrollView
              style={styles.editModalScrollView}
              contentContainerStyle={styles.editModalFormContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Section 1: Publication Information */}
              <Text style={styles.formSectionHeader}>PUBLICATION INFORMATION</Text>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  Publication Title <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.fieldInput}
                  value={publicationFormData.title}
                  onChangeText={(val) =>
                    setPublicationFormData((prev) => ({ ...prev, title: val }))
                  }
                  placeholder="e.g. Bangladesh Startup Ecosystem Report 2024–2025"
                  placeholderTextColor="#94A3B8"
                  maxLength={255}
                />
              </View>

              {/* Category Chips */}
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  Category <Text style={styles.requiredStar}>*</Text>
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 6, paddingVertical: 2 }}
                >
                  {PUBLICATION_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={`pub-cat-chip-${cat}`}
                      style={[
                        styles.chipBtnSmall,
                        publicationFormData.category === cat && styles.chipBtnSmallActive,
                      ]}
                      onPress={() =>
                        setPublicationFormData((prev) => ({ ...prev, category: cat }))
                      }
                    >
                      <Text
                        style={[
                          styles.chipBtnSmallText,
                          publicationFormData.category === cat && styles.chipBtnSmallTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TextInput
                  style={[styles.fieldInput, { marginTop: 8 }]}
                  value={publicationFormData.category}
                  onChangeText={(val) =>
                    setPublicationFormData((prev) => ({ ...prev, category: val }))
                  }
                  placeholder="Or enter custom category"
                  placeholderTextColor="#94A3B8"
                  maxLength={100}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Summary / Abstract</Text>
                <TextInput
                  style={[
                    styles.fieldInput,
                    { height: 95, textAlignVertical: 'top', paddingTop: 8 },
                  ]}
                  value={publicationFormData.excerpt}
                  onChangeText={(val) =>
                    setPublicationFormData((prev) => ({ ...prev, excerpt: val }))
                  }
                  placeholder="A short description shown on the public publications page."
                  placeholderTextColor="#94A3B8"
                  multiline
                  maxLength={2000}
                />
                <Text style={styles.fieldHint}>
                  {(publicationFormData.excerpt || '').length}/2000 characters
                </Text>
              </View>

              {/* Section 2: PDF Document Upload & Details */}
              <Text style={styles.formSectionHeader}>PDF DOCUMENT UPLOAD</Text>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  PDF Document File{' '}
                  {createPublicationModalVisible && <Text style={styles.requiredStar}>*</Text>}
                </Text>

                {/* If editing and has existing file */}
                {Boolean(editingPublication?.pdf_original_name) && !publicationPdfFile && (
                  <View style={styles.pubCurrentFileBanner}>
                    <View style={styles.pubCurrentFileLeft}>
                      <Ionicons name="document-text" size={18} color="#0A5554" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.pubCurrentFileTitle}>Current Uploaded File</Text>
                        <Text style={styles.pubCurrentFileName} numberOfLines={1}>
                          {editingPublication.pdf_original_name}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Selected File Card */}
                {publicationPdfFile ? (
                  <View style={styles.pubPickedFileCard}>
                    <View style={styles.pubPickedFileIconWrap}>
                      <Ionicons name="document-text" size={24} color="#DC2626" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pubPickedFileName} numberOfLines={1}>
                        {publicationPdfFile.name || 'document.pdf'}
                      </Text>
                      <Text style={styles.pubPickedFileSize}>
                        {publicationPdfFile.size
                          ? `${(publicationPdfFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload`
                          : 'Ready to upload'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.pubChangeFileBtn}
                      onPress={handlePickPublicationPdf}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="swap-horizontal" size={14} color="#0A5554" />
                      <Text style={styles.pubChangeFileText}>Replace</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  /* Upload Box / Trigger */
                  <TouchableOpacity
                    style={styles.pubUploadDropzone}
                    onPress={handlePickPublicationPdf}
                    activeOpacity={0.8}
                  >
                    <View style={styles.pubUploadDropzoneIconWrap}>
                      <Ionicons name="cloud-upload-outline" size={24} color="#0A5554" />
                    </View>
                    <Text style={styles.pubUploadDropzoneTitle}>
                      {editPublicationModalVisible
                        ? 'Upload New PDF Document'
                        : 'Choose PDF Document'}
                    </Text>
                    <Text style={styles.pubUploadDropzoneSubtitle}>
                      PDF only, maximum 20 MB. Uploads directly to research storage.
                    </Text>
                    <View style={styles.pubUploadDropzoneBtn}>
                      <Ionicons name="attach-outline" size={15} color="#FFFFFF" />
                      <Text style={styles.pubUploadDropzoneBtnText}>Browse Files</Text>
                    </View>
                  </TouchableOpacity>
                )}
                <Text style={styles.fieldHint}>
                  {editPublicationModalVisible
                    ? 'Uploading a new file replaces the existing PDF. Leave unselected to keep current file.'
                    : 'PDF only, maximum 20 MB. The file will be available for download.'}
                </Text>
              </View>

              {/* Document Display Name */}
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Document Display Name</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={publicationFormData.pdf_original_name}
                  onChangeText={(val) =>
                    setPublicationFormData((prev) => ({ ...prev, pdf_original_name: val }))
                  }
                  placeholder="e.g. Bangladesh-Startup-Report-2025.pdf"
                  placeholderTextColor="#94A3B8"
                />
                <Text style={styles.fieldHint}>
                  The display filename presented to users when downloading the PDF.
                </Text>
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Publication Date</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={publicationFormData.published_at}
                  onChangeText={(val) =>
                    setPublicationFormData((prev) => ({ ...prev, published_at: val }))
                  }
                  placeholder="YYYY-MM-DD (e.g. 2025-06-15)"
                  placeholderTextColor="#94A3B8"
                />
                <Text style={styles.fieldHint}>
                  If blank when publishing, the current timestamp will be used automatically.
                </Text>
              </View>

              {/* Section 3: Visibility Status */}
              <Text style={styles.formSectionHeader}>VISIBILITY & STATUS</Text>

              <View style={styles.formField}>
                <View style={styles.chipButtonGroup}>
                  {[
                    { key: 'published', label: 'Published (Public)' },
                    { key: 'archived', label: 'Archived (Hidden)' },
                  ].map((s) => (
                    <TouchableOpacity
                      key={`pub-status-opt-${s.key}`}
                      style={[
                        styles.chipBtn,
                        publicationFormData.status === s.key && styles.chipBtnActive,
                      ]}
                      onPress={() =>
                        setPublicationFormData((prev) => ({ ...prev, status: s.key }))
                      }
                    >
                      <Text
                        style={[
                          styles.chipBtnText,
                          publicationFormData.status === s.key && styles.chipBtnTextActive,
                        ]}
                      >
                        {s.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.editModalFooter}>
              <TouchableOpacity
                style={styles.editModalCancelBtn}
                onPress={() => {
                  setCreatePublicationModalVisible(false);
                  setEditPublicationModalVisible(false);
                  setEditingPublication(null);
                }}
                disabled={publicationSaving}
              >
                <Text style={styles.editModalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editModalSaveBtn}
                onPress={
                  editPublicationModalVisible
                    ? handleSaveEditPublication
                    : handleSaveCreatePublication
                }
                disabled={publicationSaving}
              >
                {publicationSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.editModalSaveBtnText}>
                    {editPublicationModalVisible ? 'Save Changes' : 'Publish Report'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* DELETE PUBLICATION CONFIRMATION MODAL */}
      <Modal
        visible={deletePublicationModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          !isDeletingPublication && setDeletePublicationModalVisible(false)
        }
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalBox}>
            <View style={[styles.deleteModalIconWrap, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="trash-outline" size={26} color="#DC2626" />
            </View>
            <Text style={styles.deleteModalTitle}>Delete Publication?</Text>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to permanently delete &ldquo;
              {selectedPublicationForDelete?.title}&rdquo;? It will be removed from the public research library.
            </Text>
            <View style={styles.deleteModalBtnRow}>
              <TouchableOpacity
                style={styles.deleteModalCancelBtn}
                onPress={() => setDeletePublicationModalVisible(false)}
                disabled={isDeletingPublication}
              >
                <Text style={styles.deleteModalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteModalConfirmBtn}
                onPress={handleConfirmDeletePublication}
                disabled={isDeletingPublication}
              >
                {isDeletingPublication ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.deleteModalConfirmBtnText}>Delete Publication</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* CREATE PROGRAM MODAL */}
      <Modal
        visible={createProgramModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => !programSaving && setCreateProgramModalVisible(false)}
      >
        <SafeAreaView style={styles.editModalSafeArea}>
          <View style={styles.editModalContainer}>
            {/* Modal Header */}
            <View style={styles.editModalHeader}>
              <View style={styles.editModalHeaderLeft}>
                <View style={styles.editModalIconWrap}>
                  <Ionicons name="layers" size={18} color="#0A5554" />
                </View>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.editModalTitle}>Add Homepage Program</Text>
                  <Text style={styles.editModalSubtitle} numberOfLines={1}>
                    Configure a new card for the landing page programs grid
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => !programSaving && setCreateProgramModalVisible(false)}
                disabled={programSaving}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.editModalScrollView}
              contentContainerStyle={styles.editModalFormContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Category & Title */}
              <Text style={styles.formSectionHeader}>PROGRAM INFORMATION</Text>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  Category Label <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.fieldInput}
                  value={programFormData.eyebrow}
                  onChangeText={(val) =>
                    setProgramFormData((prev) => ({ ...prev, eyebrow: val }))
                  }
                  placeholder="e.g. Women-led investment, Investor education"
                  placeholderTextColor="#94A3B8"
                  maxLength={120}
                />
                <Text style={styles.fieldHelperText}>
                  Shown in small uppercase text at the top of the card.
                </Text>
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  Program Title <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.fieldInput}
                  value={programFormData.title}
                  onChangeText={(val) =>
                    setProgramFormData((prev) => ({ ...prev, title: val }))
                  }
                  placeholder="e.g. BWIN, Angel Academy, DeckVue"
                  placeholderTextColor="#94A3B8"
                  maxLength={255}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  Description <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={[styles.fieldInput, styles.fieldTextArea, { minHeight: 90 }]}
                  value={programFormData.description}
                  onChangeText={(val) =>
                    setProgramFormData((prev) => ({ ...prev, description: val }))
                  }
                  placeholder="Provide a compelling overview of what this program or service offers..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={4}
                  maxLength={1200}
                  textAlignVertical="top"
                />
              </View>

              {/* Card Theme */}
              <Text style={styles.formSectionHeader}>CARD APPEARANCE</Text>
              <Text style={styles.fieldHelperText}>
                Choose the background and visual theme for this card on the homepage:
              </Text>

              <View style={styles.themeSelectorRow}>
                {PROGRAM_THEMES.map((th) => {
                  const isSelected = (programFormData.theme || 'white') === th.value;
                  return (
                    <TouchableOpacity
                      key={`theme-opt-${th.value}`}
                      style={[
                        styles.themeSelectorCard,
                        { backgroundColor: th.bg, borderColor: isSelected ? '#0A5554' : th.border },
                        isSelected && styles.themeSelectorCardActive,
                      ]}
                      onPress={() =>
                        setProgramFormData((prev) => ({ ...prev, theme: th.value }))
                      }
                      activeOpacity={0.8}
                    >
                      <View style={[styles.themeDot, { backgroundColor: th.dot }]} />
                      <Text
                        style={[
                          styles.themeSelectorLabel,
                          { color: th.value === 'dark' ? '#FFFFFF' : '#0F172A' },
                        ]}
                      >
                        {th.label}
                      </Text>
                      {isSelected && (
                        <View style={styles.themeSelectedCheck}>
                          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Primary Action Button */}
              <Text style={styles.formSectionHeader}>PRIMARY ACTION BUTTON</Text>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  Button Label <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.fieldInput}
                  value={programFormData.primary_label}
                  onChangeText={(val) =>
                    setProgramFormData((prev) => ({ ...prev, primary_label: val }))
                  }
                  placeholder="e.g. Explore BWIN, Learn more"
                  placeholderTextColor="#94A3B8"
                  maxLength={120}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  Button Link <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.fieldInput}
                  value={programFormData.primary_link}
                  onChangeText={(val) =>
                    setProgramFormData((prev) => ({ ...prev, primary_link: val }))
                  }
                  placeholder="e.g. /bwin, /angel-academy or https://..."
                  placeholderTextColor="#94A3B8"
                  maxLength={2048}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Secondary Action Button */}
              <Text style={styles.formSectionHeader}>SECONDARY ACTION (OPTIONAL)</Text>
              <Text style={styles.fieldHelperText}>
                Fill in both fields to display a secondary action button on the card.
              </Text>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Secondary Button Label</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={programFormData.secondary_label}
                  onChangeText={(val) =>
                    setProgramFormData((prev) => ({ ...prev, secondary_label: val }))
                  }
                  placeholder="e.g. Book a call, Book a demo"
                  placeholderTextColor="#94A3B8"
                  maxLength={120}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Secondary Button Link</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={programFormData.secondary_link}
                  onChangeText={(val) =>
                    setProgramFormData((prev) => ({ ...prev, secondary_link: val }))
                  }
                  placeholder="e.g. https://calendar.google.com/... or mailto:info@bdangels.co"
                  placeholderTextColor="#94A3B8"
                  maxLength={2048}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Dropdown Menu */}
              <Text style={styles.formSectionHeader}>DROPDOWN BUTTON (OPTIONAL)</Text>
              <Text style={styles.fieldHelperText}>
                Add an expandable dropdown button to display up to 6 custom sub-links.
              </Text>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Dropdown Trigger Label</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={programFormData.dropdown_label}
                  onChangeText={(val) =>
                    setProgramFormData((prev) => ({ ...prev, dropdown_label: val }))
                  }
                  placeholder="e.g. View Services (leave blank if not using dropdown)"
                  placeholderTextColor="#94A3B8"
                  maxLength={120}
                />
              </View>

              {Boolean(programFormData.dropdown_label.trim()) && (
                <View style={styles.dropdownItemsEditorBox}>
                  <View style={styles.dropdownItemsHeaderRow}>
                    <Text style={styles.dropdownItemsHeaderTitle}>DROPDOWN OPTIONS (UP TO 6)</Text>
                    <TouchableOpacity
                      style={[
                        styles.dropdownAddOptionBtn,
                        programFormData.dropdown_items.length >= 6 && { opacity: 0.5 },
                      ]}
                      onPress={handleAddDropdownItem}
                      disabled={programFormData.dropdown_items.length >= 6}
                    >
                      <Ionicons name="add-circle" size={15} color="#0A5554" />
                      <Text style={styles.dropdownAddOptionBtnText}>Add Option</Text>
                    </TouchableOpacity>
                  </View>

                  {programFormData.dropdown_items.map((item, dIdx) => (
                    <View key={`dropdown-item-field-${dIdx}`} style={styles.dropdownItemFieldRow}>
                      <View style={styles.dropdownItemNumberBadge}>
                        <Text style={styles.dropdownItemNumberText}>#{dIdx + 1}</Text>
                      </View>
                      <View style={{ flex: 1, gap: 6 }}>
                        <TextInput
                          style={styles.dropdownItemInput}
                          value={item.title}
                          onChangeText={(val) => handleUpdateDropdownItem(dIdx, 'title', val)}
                          placeholder="Option Title (e.g. Founder Services)"
                          placeholderTextColor="#94A3B8"
                          maxLength={120}
                        />
                        <TextInput
                          style={styles.dropdownItemInput}
                          value={item.link}
                          onChangeText={(val) => handleUpdateDropdownItem(dIdx, 'link', val)}
                          placeholder="Option Link (e.g. /startups#our-services)"
                          placeholderTextColor="#94A3B8"
                          maxLength={2048}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      </View>
                      {programFormData.dropdown_items.length > 1 && (
                        <TouchableOpacity
                          style={styles.dropdownItemRemoveBtn}
                          onPress={() => handleRemoveDropdownItem(dIdx)}
                          accessibilityLabel={`Remove option ${dIdx + 1}`}
                        >
                          <Ionicons name="trash-outline" size={16} color="#DC2626" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* Sort Order */}
              <Text style={styles.formSectionHeader}>DISPLAY POSITION</Text>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Sort Order</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={programFormData.sort_order}
                  onChangeText={(val) =>
                    setProgramFormData((prev) => ({ ...prev, sort_order: val }))
                  }
                  placeholder="e.g. 1, 2, 3"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={3}
                />
                <Text style={styles.fieldHelperText}>
                  Controls position on the homepage. Lowest numbers appear first.
                </Text>
              </View>
            </ScrollView>

            {/* Modal Bottom Actions */}
            <View style={styles.editModalFooter}>
              <TouchableOpacity
                style={styles.editModalCancelBtn}
                onPress={() => setCreateProgramModalVisible(false)}
                disabled={programSaving}
              >
                <Text style={styles.editModalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editModalSaveBtn}
                onPress={handleSaveCreateProgram}
                disabled={programSaving}
              >
                {programSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.editModalSaveBtnText}>Add Program</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* EDIT PROGRAM MODAL */}
      <Modal
        visible={editProgramModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => !programSaving && setEditProgramModalVisible(false)}
      >
        <SafeAreaView style={styles.editModalSafeArea}>
          <View style={styles.editModalContainer}>
            {/* Modal Header */}
            <View style={styles.editModalHeader}>
              <View style={styles.editModalHeaderLeft}>
                <View style={styles.editModalIconWrap}>
                  <Ionicons name="pencil" size={18} color="#0A5554" />
                </View>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.editModalTitle}>Edit Program Card</Text>
                    {editingProgram?.id && (
                      <View style={styles.editModalIdBadge}>
                        <Text style={styles.editModalIdBadgeText}>ID #{editingProgram.id}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.editModalSubtitle} numberOfLines={1}>
                    Modify &ldquo;{editingProgram?.title || 'Program'}&rdquo; details and links
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => !programSaving && setEditProgramModalVisible(false)}
                disabled={programSaving}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.editModalScrollView}
              contentContainerStyle={styles.editModalFormContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Category & Title */}
              <Text style={styles.formSectionHeader}>PROGRAM INFORMATION</Text>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  Category Label <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.fieldInput}
                  value={programFormData.eyebrow}
                  onChangeText={(val) =>
                    setProgramFormData((prev) => ({ ...prev, eyebrow: val }))
                  }
                  placeholder="e.g. Women-led investment, Investor education"
                  placeholderTextColor="#94A3B8"
                  maxLength={120}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  Program Title <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.fieldInput}
                  value={programFormData.title}
                  onChangeText={(val) =>
                    setProgramFormData((prev) => ({ ...prev, title: val }))
                  }
                  placeholder="e.g. BWIN, Angel Academy, DeckVue"
                  placeholderTextColor="#94A3B8"
                  maxLength={255}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  Description <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={[styles.fieldInput, styles.fieldTextArea, { minHeight: 90 }]}
                  value={programFormData.description}
                  onChangeText={(val) =>
                    setProgramFormData((prev) => ({ ...prev, description: val }))
                  }
                  placeholder="Provide a compelling overview of what this program or service offers..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={4}
                  maxLength={1200}
                  textAlignVertical="top"
                />
              </View>

              {/* Card Theme */}
              <Text style={styles.formSectionHeader}>CARD APPEARANCE</Text>
              <Text style={styles.fieldHelperText}>
                Choose the background and visual theme for this card on the homepage:
              </Text>

              <View style={styles.themeSelectorRow}>
                {PROGRAM_THEMES.map((th) => {
                  const isSelected = (programFormData.theme || 'white') === th.value;
                  return (
                    <TouchableOpacity
                      key={`edit-theme-opt-${th.value}`}
                      style={[
                        styles.themeSelectorCard,
                        { backgroundColor: th.bg, borderColor: isSelected ? '#0A5554' : th.border },
                        isSelected && styles.themeSelectorCardActive,
                      ]}
                      onPress={() =>
                        setProgramFormData((prev) => ({ ...prev, theme: th.value }))
                      }
                      activeOpacity={0.8}
                    >
                      <View style={[styles.themeDot, { backgroundColor: th.dot }]} />
                      <Text
                        style={[
                          styles.themeSelectorLabel,
                          { color: th.value === 'dark' ? '#FFFFFF' : '#0F172A' },
                        ]}
                      >
                        {th.label}
                      </Text>
                      {isSelected && (
                        <View style={styles.themeSelectedCheck}>
                          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Primary Action Button */}
              <Text style={styles.formSectionHeader}>PRIMARY ACTION BUTTON</Text>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  Button Label <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.fieldInput}
                  value={programFormData.primary_label}
                  onChangeText={(val) =>
                    setProgramFormData((prev) => ({ ...prev, primary_label: val }))
                  }
                  placeholder="e.g. Explore BWIN, Learn more"
                  placeholderTextColor="#94A3B8"
                  maxLength={120}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  Button Link <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.fieldInput}
                  value={programFormData.primary_link}
                  onChangeText={(val) =>
                    setProgramFormData((prev) => ({ ...prev, primary_link: val }))
                  }
                  placeholder="e.g. /bwin, /angel-academy or https://..."
                  placeholderTextColor="#94A3B8"
                  maxLength={2048}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Secondary Action Button */}
              <Text style={styles.formSectionHeader}>SECONDARY ACTION (OPTIONAL)</Text>
              <Text style={styles.fieldHelperText}>
                Fill in both fields to display a secondary action button on the card.
              </Text>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Secondary Button Label</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={programFormData.secondary_label}
                  onChangeText={(val) =>
                    setProgramFormData((prev) => ({ ...prev, secondary_label: val }))
                  }
                  placeholder="e.g. Book a call, Book a demo"
                  placeholderTextColor="#94A3B8"
                  maxLength={120}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Secondary Button Link</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={programFormData.secondary_link}
                  onChangeText={(val) =>
                    setProgramFormData((prev) => ({ ...prev, secondary_link: val }))
                  }
                  placeholder="e.g. https://calendar.google.com/... or mailto:info@bdangels.co"
                  placeholderTextColor="#94A3B8"
                  maxLength={2048}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Dropdown Menu */}
              <Text style={styles.formSectionHeader}>DROPDOWN BUTTON (OPTIONAL)</Text>
              <Text style={styles.fieldHelperText}>
                Add an expandable dropdown button to display up to 6 custom sub-links.
              </Text>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Dropdown Trigger Label</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={programFormData.dropdown_label}
                  onChangeText={(val) =>
                    setProgramFormData((prev) => ({ ...prev, dropdown_label: val }))
                  }
                  placeholder="e.g. View Services (leave blank if not using dropdown)"
                  placeholderTextColor="#94A3B8"
                  maxLength={120}
                />
              </View>

              {Boolean(programFormData.dropdown_label.trim()) && (
                <View style={styles.dropdownItemsEditorBox}>
                  <View style={styles.dropdownItemsHeaderRow}>
                    <Text style={styles.dropdownItemsHeaderTitle}>DROPDOWN OPTIONS (UP TO 6)</Text>
                    <TouchableOpacity
                      style={[
                        styles.dropdownAddOptionBtn,
                        programFormData.dropdown_items.length >= 6 && { opacity: 0.5 },
                      ]}
                      onPress={handleAddDropdownItem}
                      disabled={programFormData.dropdown_items.length >= 6}
                    >
                      <Ionicons name="add-circle" size={15} color="#0A5554" />
                      <Text style={styles.dropdownAddOptionBtnText}>Add Option</Text>
                    </TouchableOpacity>
                  </View>

                  {programFormData.dropdown_items.map((item, dIdx) => (
                    <View key={`edit-dropdown-item-field-${dIdx}`} style={styles.dropdownItemFieldRow}>
                      <View style={styles.dropdownItemNumberBadge}>
                        <Text style={styles.dropdownItemNumberText}>#{dIdx + 1}</Text>
                      </View>
                      <View style={{ flex: 1, gap: 6 }}>
                        <TextInput
                          style={styles.dropdownItemInput}
                          value={item.title}
                          onChangeText={(val) => handleUpdateDropdownItem(dIdx, 'title', val)}
                          placeholder="Option Title (e.g. Founder Services)"
                          placeholderTextColor="#94A3B8"
                          maxLength={120}
                        />
                        <TextInput
                          style={styles.dropdownItemInput}
                          value={item.link}
                          onChangeText={(val) => handleUpdateDropdownItem(dIdx, 'link', val)}
                          placeholder="Option Link (e.g. /startups#our-services)"
                          placeholderTextColor="#94A3B8"
                          maxLength={2048}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      </View>
                      {programFormData.dropdown_items.length > 1 && (
                        <TouchableOpacity
                          style={styles.dropdownItemRemoveBtn}
                          onPress={() => handleRemoveDropdownItem(dIdx)}
                          accessibilityLabel={`Remove option ${dIdx + 1}`}
                        >
                          <Ionicons name="trash-outline" size={16} color="#DC2626" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* Sort Order */}
              <Text style={styles.formSectionHeader}>DISPLAY POSITION</Text>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Sort Order</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={programFormData.sort_order}
                  onChangeText={(val) =>
                    setProgramFormData((prev) => ({ ...prev, sort_order: val }))
                  }
                  placeholder="e.g. 1, 2, 3"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={3}
                />
                <Text style={styles.fieldHelperText}>
                  Controls position on the homepage. Lowest numbers appear first.
                </Text>
              </View>
            </ScrollView>

            {/* Modal Bottom Actions */}
            <View style={styles.editModalFooter}>
              <TouchableOpacity
                style={styles.editModalCancelBtn}
                onPress={() => setEditProgramModalVisible(false)}
                disabled={programSaving}
              >
                <Text style={styles.editModalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editModalSaveBtn}
                onPress={handleSaveEditProgram}
                disabled={programSaving}
              >
                {programSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.editModalSaveBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* DELETE PROGRAM CONFIRMATION MODAL */}
      <Modal
        visible={deleteProgramModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !isDeletingProgram && setDeleteProgramModalVisible(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalBox}>
            <View style={[styles.deleteModalIconWrap, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="trash-outline" size={26} color="#DC2626" />
            </View>
            <Text style={styles.deleteModalTitle}>Remove Program Card?</Text>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to remove &ldquo;{selectedProgramForDelete?.title}&rdquo; from the homepage? This will immediately remove it from the public landing page.
            </Text>
            <View style={styles.deleteModalBtnRow}>
              <TouchableOpacity
                style={styles.deleteModalCancelBtn}
                onPress={() => setDeleteProgramModalVisible(false)}
                disabled={isDeletingProgram}
              >
                <Text style={styles.deleteModalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteModalConfirmBtn}
                onPress={handleConfirmDeleteProgram}
                disabled={isDeletingProgram}
              >
                {isDeletingProgram ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.deleteModalConfirmBtnText}>Remove Card</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ADD HOMEPAGE PORTFOLIO MODAL */}
      <Modal
        visible={addPortfolioModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => !portfolioSaving && setAddPortfolioModalVisible(false)}
      >
        <SafeAreaView style={styles.editModalSafeArea}>
          <View style={styles.editModalContainer}>
            {/* Header */}
            <View style={styles.editModalHeader}>
              <View style={styles.editModalHeaderLeft}>
                <View style={styles.editModalIconWrap}>
                  <Ionicons name="briefcase" size={18} color="#0A5554" />
                </View>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.editModalTitle}>Add Portfolio Company</Text>
                  <Text style={styles.editModalSubtitle} numberOfLines={1}>
                    Select a company to feature on homepage ({homepagePortfolios.length}/8 selected)
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => !portfolioSaving && setAddPortfolioModalVisible(false)}
                disabled={portfolioSaving}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Filter Search */}
            <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 }}>
              <TextInput
                style={styles.batchModalSearchBox}
                value={addPortfolioSearch}
                onChangeText={setAddPortfolioSearch}
                placeholder="Search available portfolio companies..."
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />
            </View>

            {/* Deals List */}
            <ScrollView
              style={styles.editModalScrollView}
              contentContainerStyle={styles.editModalFormContent}
              keyboardShouldPersistTaps="handled"
            >
              {(() => {
                const selectedDealIds = homepagePortfolios.map((p) => p.deal_id);
                const available = allPortfolioDeals.filter(
                  (d) =>
                    !selectedDealIds.includes(d.id) &&
                    (addPortfolioSearch.trim() === '' ||
                      (d.title || '').toLowerCase().includes(addPortfolioSearch.toLowerCase()) ||
                      (d.sector || '').toLowerCase().includes(addPortfolioSearch.toLowerCase()))
                );

                if (available.length === 0) {
                  return (
                    <View style={styles.portfolioEmptyBox}>
                      <Ionicons name="search-outline" size={26} color="#94A3B8" />
                      <Text style={styles.portfolioEmptyTitle}>No Available Companies Found</Text>
                      <Text style={styles.portfolioEmptyDesc}>
                        {addPortfolioSearch.trim() !== ''
                          ? 'No unselected portfolio deals match your search criteria.'
                          : 'All published portfolio companies are already selected for the homepage.'}
                      </Text>
                    </View>
                  );
                }

                return available.map((deal) => {
                  const isChosen = selectedDealToAdd?.id === deal.id;
                  return (
                    <TouchableOpacity
                      key={`avail-deal-${deal.id}`}
                      style={[
                        styles.batchDealItemCard,
                        isChosen && styles.batchDealItemCardActive,
                      ]}
                      onPress={() => setSelectedDealToAdd(deal)}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.batchRadioCircle,
                          isChosen && styles.batchRadioCircleActive,
                        ]}
                      >
                        {isChosen && <View style={styles.batchRadioInnerDot} />}
                      </View>

                      {deal.logo_url ? (
                        <Image
                          source={{ uri: deal.logo_url }}
                          style={styles.portfolioLogoImage}
                          resizeMode="contain"
                        />
                      ) : (
                        <View style={styles.portfolioLogoPlaceholder}>
                          <Text style={styles.portfolioLogoPlaceholderText}>
                            {(deal.title || 'P').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}

                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.portfolioCardTitle} numberOfLines={1}>
                          {deal.title}
                        </Text>
                        <Text style={styles.portfolioCardSector} numberOfLines={1}>
                          {deal.sector || 'Portfolio'}
                        </Text>
                      </View>

                      <View style={styles.programCategoryBadge}>
                        <Text style={styles.programCategoryBadgeText}>
                          {deal.type === 'portfolio' ? 'Portfolio only' : 'Invest & Portfolio'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                });
              })()}
            </ScrollView>

            {/* Modal Bottom Actions */}
            <View style={styles.editModalFooter}>
              <TouchableOpacity
                style={styles.editModalCancelBtn}
                onPress={() => setAddPortfolioModalVisible(false)}
                disabled={portfolioSaving}
              >
                <Text style={styles.editModalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.editModalSaveBtn,
                  (!selectedDealToAdd || portfolioSaving) && { opacity: 0.6 },
                ]}
                onPress={handleConfirmAddPortfolio}
                disabled={!selectedDealToAdd || portfolioSaving}
              >
                {portfolioSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.editModalSaveBtnText}>Add to Homepage</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* BATCH HOMEPAGE PORTFOLIOS MODAL */}
      <Modal
        visible={batchPortfolioModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => !portfolioSaving && setBatchPortfolioModalVisible(false)}
      >
        <SafeAreaView style={styles.editModalSafeArea}>
          <View style={styles.editModalContainer}>
            {/* Header */}
            <View style={styles.editModalHeader}>
              <View style={styles.editModalHeaderLeft}>
                <View style={styles.editModalIconWrap}>
                  <Ionicons name="checkbox" size={18} color="#0A5554" />
                </View>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.editModalTitle}>Batch Portfolio Selection</Text>
                  <Text style={styles.editModalSubtitle} numberOfLines={1}>
                    Toggle up to 8 companies ({batchSelectedDealIds.length}/8 selected)
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => !portfolioSaving && setBatchPortfolioModalVisible(false)}
                disabled={portfolioSaving}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Filter Search */}
            <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 }}>
              <TextInput
                style={styles.batchModalSearchBox}
                value={batchSearch}
                onChangeText={setBatchSearch}
                placeholder="Search portfolio companies..."
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />
            </View>

            {/* Deals List */}
            <ScrollView
              style={styles.editModalScrollView}
              contentContainerStyle={styles.editModalFormContent}
              keyboardShouldPersistTaps="handled"
            >
              {(() => {
                const filtered = allPortfolioDeals.filter(
                  (d) =>
                    batchSearch.trim() === '' ||
                    (d.title || '').toLowerCase().includes(batchSearch.toLowerCase()) ||
                    (d.sector || '').toLowerCase().includes(batchSearch.toLowerCase())
                );

                if (filtered.length === 0) {
                  return (
                    <View style={styles.portfolioEmptyBox}>
                      <Ionicons name="search-outline" size={26} color="#94A3B8" />
                      <Text style={styles.portfolioEmptyTitle}>No Matching Companies</Text>
                      <Text style={styles.portfolioEmptyDesc}>
                        No portfolio deals match your search criteria.
                      </Text>
                    </View>
                  );
                }

                return filtered.map((deal) => {
                  const isChecked = batchSelectedDealIds.includes(deal.id);
                  return (
                    <TouchableOpacity
                      key={`batch-deal-${deal.id}`}
                      style={[
                        styles.batchDealItemCard,
                        isChecked && styles.batchDealItemCardActive,
                      ]}
                      onPress={() => handleToggleBatchDeal(deal.id)}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.batchCheckbox,
                          isChecked && styles.batchCheckboxActive,
                        ]}
                      >
                        {isChecked && (
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        )}
                      </View>

                      {deal.logo_url ? (
                        <Image
                          source={{ uri: deal.logo_url }}
                          style={styles.portfolioLogoImage}
                          resizeMode="contain"
                        />
                      ) : (
                        <View style={styles.portfolioLogoPlaceholder}>
                          <Text style={styles.portfolioLogoPlaceholderText}>
                            {(deal.title || 'P').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}

                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.portfolioCardTitle} numberOfLines={1}>
                          {deal.title}
                        </Text>
                        <Text style={styles.portfolioCardSector} numberOfLines={1}>
                          {deal.sector || 'Portfolio'}
                        </Text>
                      </View>

                      <View style={styles.programCategoryBadge}>
                        <Text style={styles.programCategoryBadgeText}>
                          {deal.type === 'portfolio' ? 'Portfolio only' : 'Invest & Portfolio'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                });
              })()}
            </ScrollView>

            {/* Modal Bottom Actions */}
            <View style={styles.editModalFooter}>
              <TouchableOpacity
                style={styles.editModalCancelBtn}
                onPress={() => setBatchPortfolioModalVisible(false)}
                disabled={portfolioSaving}
              >
                <Text style={styles.editModalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editModalSaveBtn}
                onPress={handleConfirmBatchPortfolios}
                disabled={portfolioSaving}
              >
                {portfolioSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.editModalSaveBtnText}>
                    Save Selections ({batchSelectedDealIds.length}/8)
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* DELETE HOMEPAGE PORTFOLIO CONFIRMATION MODAL */}
      <Modal
        visible={deletePortfolioModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !isDeletingPortfolio && setDeletePortfolioModalVisible(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalBox}>
            <View style={[styles.deleteModalIconWrap, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="trash-outline" size={26} color="#DC2626" />
            </View>
            <Text style={styles.deleteModalTitle}>Remove from Homepage?</Text>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to remove &ldquo;{selectedPortfolioForDelete?.deal?.title}&rdquo; from the homepage selected portfolios? The deal will remain in the main portfolio directory.
            </Text>
            <View style={styles.deleteModalBtnRow}>
              <TouchableOpacity
                style={styles.deleteModalCancelBtn}
                onPress={() => setDeletePortfolioModalVisible(false)}
                disabled={isDeletingPortfolio}
              >
                <Text style={styles.deleteModalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteModalConfirmBtn}
                onPress={handleConfirmDeletePortfolio}
                disabled={isDeletingPortfolio}
              >
                {isDeletingPortfolio ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.deleteModalConfirmBtnText}>Remove from Homepage</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* CLEAR ALL HOMEPAGE PORTFOLIOS CONFIRMATION MODAL */}
      <Modal
        visible={clearAllPortfoliosModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !isClearingAllPortfolios && setClearAllPortfoliosModalVisible(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalBox}>
            <View style={[styles.deleteModalIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="refresh-outline" size={26} color="#D97706" />
            </View>
            <Text style={styles.deleteModalTitle}>Revert to Default Mode?</Text>
            <Text style={styles.deleteModalMessage}>
              This will clear all custom homepage portfolio selections. The homepage will automatically showcase the latest 8 published portfolio companies.
            </Text>
            <View style={styles.deleteModalBtnRow}>
              <TouchableOpacity
                style={styles.deleteModalCancelBtn}
                onPress={() => setClearAllPortfoliosModalVisible(false)}
                disabled={isClearingAllPortfolios}
              >
                <Text style={styles.deleteModalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteModalConfirmBtn, { backgroundColor: '#D97706' }]}
                onPress={handleConfirmClearAllPortfolios}
                disabled={isClearingAllPortfolios}
              >
                {isClearingAllPortfolios ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.deleteModalConfirmBtnText}>Revert to Default</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* EDIT TEAM ABOUT SECTION MODAL */}
      <Modal
        visible={editTeamAboutModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => !teamAboutSaving && setEditTeamAboutModalVisible(false)}
      >
        <SafeAreaView style={styles.editModalSafeArea}>
          <View style={styles.editModalContainer}>
            {/* Modal Header */}
            <View style={styles.editModalHeader}>
              <View style={styles.editModalHeaderLeft}>
                <View style={styles.editModalIconWrap}>
                  <Ionicons name="information-circle" size={20} color="#0A5554" />
                </View>
                <View>
                  <Text style={styles.editModalTitle}>Edit Team About Section</Text>
                  <Text style={styles.editModalSubtitle}>
                    Update kicker, heading, narrative, and hero photo
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => !teamAboutSaving && setEditTeamAboutModalVisible(false)}
                disabled={teamAboutSaving}
                accessibilityLabel="Close editor"
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Modal Form ScrollView */}
            <ScrollView
              style={styles.editModalScrollView}
              contentContainerStyle={styles.editModalFormContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Field 1: Kicker */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Kicker / Section Label *</Text>
                <TextInput
                  style={styles.formInput}
                  value={teamAboutForm.kicker}
                  onChangeText={(text) =>
                    setTeamAboutForm((prev) => ({ ...prev, kicker: text }))
                  }
                  placeholder="e.g. ABOUT BANGLADESH ANGELS"
                  placeholderTextColor="#94A3B8"
                  maxLength={160}
                />
                <Text style={styles.editorHelperText}>
                  Small uppercase eyebrow label shown above the main heading.
                </Text>
              </View>

              {/* Field 2: Heading */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Section Heading *</Text>
                <TextInput
                  style={styles.formInput}
                  value={teamAboutForm.heading}
                  onChangeText={(text) =>
                    setTeamAboutForm((prev) => ({ ...prev, heading: text }))
                  }
                  placeholder="e.g. What is Bangladesh Angels Network?"
                  placeholderTextColor="#94A3B8"
                  maxLength={255}
                />
                <Text style={styles.editorHelperText}>
                  Main title of the about section.
                </Text>
              </View>

              {/* Field 3: Body Text (Paragraphs) */}
              <View style={styles.formField}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.formLabel}>Section Body Paragraphs *</Text>
                  <Text style={styles.teamAboutCharCount}>
                    {teamAboutForm.body_text.length} / 12,000
                  </Text>
                </View>
                <TextInput
                  style={[styles.formInput, { minHeight: 180, textAlignVertical: 'top', paddingTop: 10 }]}
                  value={teamAboutForm.body_text}
                  onChangeText={(text) =>
                    setTeamAboutForm((prev) => ({ ...prev, body_text: text }))
                  }
                  placeholder={"Type or paste your narrative here.\n\nTo create separate paragraphs, leave a blank line between them (press Enter twice)."}
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={8}
                  maxLength={12000}
                />
                <Text style={styles.editorHelperText}>
                  Separate paragraphs with an empty line. Each paragraph is rendered in a dedicated block.
                </Text>
              </View>

              {/* Field 4: Hero Photo */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Hero Photo</Text>
                <View style={styles.teamAboutPhotoPickerBox}>
                  {teamAboutForm.image_file ? (
                    <View style={styles.pubPickedFileCard}>
                      <View style={[styles.pubPickedFileIconWrap, { backgroundColor: '#E6F4F1' }]}>
                        <Ionicons name="image" size={20} color="#0A5554" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.pubPickedFileName} numberOfLines={1}>
                          {teamAboutForm.image_file.name || 'Selected image'}
                        </Text>
                        <Text style={styles.pubPickedFileSize}>
                          {teamAboutForm.image_file.size
                            ? `${(teamAboutForm.image_file.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload`
                            : 'New image chosen'}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.pubChangeFileBtn}
                        onPress={handleCancelImageChange}
                      >
                        <Ionicons name="close" size={14} color="#0A5554" />
                        <Text style={styles.pubChangeFileText}>Clear</Text>
                      </TouchableOpacity>
                    </View>
                  ) : teamAboutForm.remove_image ? (
                    <View style={styles.teamAboutPhotoRemovedNotice}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                        <Ionicons name="alert-circle" size={16} color="#D97706" />
                        <Text style={styles.teamAboutPhotoRemovedText}>
                          Photo will be removed and reset to default asset.
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.teamAboutPhotoUndoBtn}
                        onPress={handleCancelImageChange}
                      >
                        <Text style={styles.teamAboutPhotoUndoBtnText}>Undo</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.teamAboutPhotoPickerRow}>
                      <Image
                        source={{
                          uri:
                            teamAboutData?.image_url ||
                            'https://bdangels.co/DSC00467.jpg',
                        }}
                        style={styles.teamAboutPhotoThumb}
                        resizeMode="cover"
                      />
                      <View style={styles.teamAboutPhotoActionsCol}>
                        <TouchableOpacity
                          style={styles.teamAboutPhotoChooseBtn}
                          onPress={handlePickTeamAboutImage}
                        >
                          <Ionicons name="cloud-upload-outline" size={15} color="#0A5554" />
                          <Text style={styles.teamAboutPhotoChooseBtnText}>
                            {teamAboutData?.image_url ? 'Replace Photo' : 'Upload Photo'}
                          </Text>
                        </TouchableOpacity>
                        {teamAboutData?.image_url ? (
                          <TouchableOpacity
                            style={styles.teamAboutPhotoRemoveBtn}
                            onPress={handleRemoveTeamAboutImage}
                          >
                            <Ionicons name="trash-outline" size={14} color="#DC2626" />
                            <Text style={styles.teamAboutPhotoRemoveBtnText}>Remove Custom Photo</Text>
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    </View>
                  )}
                </View>
                <Text style={styles.editorHelperText}>
                  Recommended dimensions: 1200x800px. Max 8 MB (JPEG, PNG, WebP).
                </Text>
              </View>

              {/* Field 5: Floating Image Badge */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Floating Photo Badge</Text>
                <TextInput
                  style={styles.formInput}
                  value={teamAboutForm.image_badge}
                  onChangeText={(text) =>
                    setTeamAboutForm((prev) => ({ ...prev, image_badge: text }))
                  }
                  placeholder="e.g. Capital. Community. Conviction."
                  placeholderTextColor="#94A3B8"
                  maxLength={160}
                />
                <Text style={styles.editorHelperText}>
                  Tagline pill overlaid on the corner of the hero photo.
                </Text>
              </View>

              {/* Field 6: Image Alt Text */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Photo Alt Text (Accessibility)</Text>
                <TextInput
                  style={styles.formInput}
                  value={teamAboutForm.image_alt}
                  onChangeText={(text) =>
                    setTeamAboutForm((prev) => ({ ...prev, image_alt: text }))
                  }
                  placeholder="e.g. Bangladesh Angels Network leadership and ecosystem community"
                  placeholderTextColor="#94A3B8"
                  maxLength={255}
                />
                <Text style={styles.editorHelperText}>
                  Descriptive text for accessibility screen readers.
                </Text>
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.editModalFooter}>
              <TouchableOpacity
                style={styles.editModalCancelBtn}
                onPress={() => !teamAboutSaving && setEditTeamAboutModalVisible(false)}
                disabled={teamAboutSaving}
              >
                <Text style={styles.editModalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editModalSaveBtn}
                onPress={handleSaveTeamAbout}
                disabled={teamAboutSaving}
                activeOpacity={0.85}
              >
                {teamAboutSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.editModalSaveBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* VIEW EVENT DETAILS MODAL */}
      <Modal
        visible={viewEventModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setViewEventModalVisible(false)}
      >
        <SafeAreaView style={styles.editModalSafeArea}>
          <View style={styles.editModalContainer}>
            {/* Header */}
            <View style={styles.editModalHeader}>
              <View style={styles.editModalHeaderLeft}>
                <View style={styles.editModalIconWrap}>
                  <Ionicons name="calendar" size={20} color="#0A5554" />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.editModalTitle} numberOfLines={1}>
                    {selectedEventForView?.title || 'Event Details'}
                  </Text>
                  <Text style={styles.editModalSubtitle}>
                    {selectedEventForView?.type === 'webinar' ? 'Online Webinar' : 'Community Event'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setViewEventModalVisible(false)}
                accessibilityLabel="Close details modal"
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Scrollable details */}
            <ScrollView
              style={styles.editModalScrollView}
              contentContainerStyle={styles.editModalFormContent}
            >
              {/* Banner Photo */}
              <View style={styles.eventBannerWrap}>
                <Image
                  source={{
                    uri:
                      selectedEventForView?.banner_url ||
                      (selectedEventForView?.media && selectedEventForView.media[0]
                        ? selectedEventForView.media[0].original_url
                        : 'https://bdangels.co/what-we-do-placeholder.svg'),
                  }}
                  style={styles.eventBannerImg}
                  resizeMode="cover"
                />
                <View style={styles.eventTypePillWrap}>
                  <View
                    style={[
                      styles.eventTypePill,
                      selectedEventForView?.type === 'webinar'
                        ? styles.eventTypePillWebinar
                        : styles.eventTypePillEvent,
                    ]}
                  >
                    <Ionicons
                      name={selectedEventForView?.type === 'webinar' ? 'videocam' : 'calendar'}
                      size={11}
                      color={selectedEventForView?.type === 'webinar' ? '#4338CA' : '#0A5554'}
                    />
                    <Text
                      style={[
                        styles.eventTypePillText,
                        selectedEventForView?.type === 'webinar'
                          ? styles.eventTypePillTextWebinar
                          : styles.eventTypePillTextEvent,
                      ]}
                    >
                      {selectedEventForView?.type === 'webinar' ? 'Webinar' : 'Event'}
                    </Text>
                  </View>

                  {selectedEventForView?.show_on_landing ? (
                    <View style={styles.eventLandingBadge}>
                      <Ionicons name="star" size={10} color="#065F46" />
                      <Text style={styles.eventLandingBadgeText}>Homepage</Text>
                    </View>
                  ) : null}
                </View>
              </View>

              {/* Event Title */}
              <Text style={styles.blogReaderTitle}>{selectedEventForView?.title}</Text>

              {/* Quick Meta Grid */}
              <View style={styles.memberDetailsBox}>
                <View style={styles.memberDetailRow}>
                  <Ionicons name="calendar-outline" size={16} color="#0A5554" />
                  <Text style={styles.memberDetailText}>
                    Date: {selectedEventForView?.formatted_date_time || (selectedEventForView?.date ? String(selectedEventForView.date).slice(0, 10) : 'TBD')}
                  </Text>
                </View>

                {selectedEventForView?.formatted_time_range ? (
                  <View style={styles.memberDetailRow}>
                    <Ionicons name="time-outline" size={16} color="#0A5554" />
                    <Text style={styles.memberDetailText}>
                      Time: {selectedEventForView.formatted_time_range}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.memberDetailRow}>
                  <Ionicons name="location-outline" size={16} color="#0A5554" />
                  <Text style={styles.memberDetailText}>
                    Location: {selectedEventForView?.location || 'Online'}
                  </Text>
                </View>

                <View style={styles.memberDetailRow}>
                  <Ionicons name="cash-outline" size={16} color="#0A5554" />
                  <Text style={styles.memberDetailText}>
                    Registration Fee: {selectedEventForView?.registration_fee ? `৳${selectedEventForView.registration_fee}` : 'Free'}
                  </Text>
                </View>

                {selectedEventForView?.cta_link ? (
                  <TouchableOpacity
                    style={[styles.memberDetailRow, { marginTop: 4 }]}
                    onPress={() => {
                      Linking.openURL(selectedEventForView.cta_link).catch(() => {
                        Alert.alert('Notice', `Could not open ${selectedEventForView.cta_link}`);
                      });
                    }}
                  >
                    <Ionicons name="open-outline" size={16} color="#0284C7" />
                    <Text style={[styles.memberDetailText, { color: '#0284C7', fontWeight: '700' }]} numberOfLines={1}>
                      RSVP Link: {selectedEventForView.cta_link}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Description */}
              <View style={styles.pubSummarySection}>
                <Text style={styles.pubSummarySectionTitle}>EVENT OVERVIEW</Text>
                <Text style={styles.pubSummaryText}>
                  {selectedEventForView?.description}
                </Text>
              </View>

              {/* Registration Details (if any) */}
              {selectedEventForView?.registration_details ? (
                <View style={styles.pubSummarySection}>
                  <Text style={styles.pubSummarySectionTitle}>REGISTRATION DETAILS</Text>
                  <Text style={styles.pubSummaryText}>
                    {selectedEventForView.registration_details}
                  </Text>
                </View>
              ) : null}

              {/* Benefits */}
              {Array.isArray(selectedEventForView?.benefits) && selectedEventForView.benefits.length > 0 ? (
                <View style={styles.pubSummarySection}>
                  <Text style={styles.pubSummarySectionTitle}>KEY BENEFITS</Text>
                  <View style={{ gap: 8 }}>
                    {selectedEventForView.benefits.map((b, bIdx) => (
                      <View key={bIdx} style={styles.eventChecklistItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#0A5554" />
                        <Text style={styles.eventChecklistText}>{b}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {/* Highlights */}
              {Array.isArray(selectedEventForView?.event_highlights) && selectedEventForView.event_highlights.length > 0 ? (
                <View style={styles.pubSummarySection}>
                  <Text style={styles.pubSummarySectionTitle}>EVENT HIGHLIGHTS</Text>
                  <View style={{ gap: 8 }}>
                    {selectedEventForView.event_highlights.map((h, hIdx) => (
                      <View key={hIdx} style={styles.eventChecklistItem}>
                        <Ionicons name="sparkles" size={15} color="#D97706" />
                        <Text style={styles.eventChecklistText}>{h}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {/* Target Audience */}
              {Array.isArray(selectedEventForView?.target_audience) && selectedEventForView.target_audience.length > 0 ? (
                <View style={styles.pubSummarySection}>
                  <Text style={styles.pubSummarySectionTitle}>TARGET AUDIENCE</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {selectedEventForView.target_audience.map((a, aIdx) => (
                      <View key={aIdx} style={styles.metaPill}>
                        <Text style={styles.metaPillText}>{a}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {/* Speakers */}
              {Array.isArray(selectedEventForView?.speakers) && selectedEventForView.speakers.length > 0 ? (
                <View style={styles.pubSummarySection}>
                  <Text style={styles.pubSummarySectionTitle}>SPEAKERS & PANELISTS</Text>
                  <View style={{ gap: 10 }}>
                    {selectedEventForView.speakers.map((spk, spkIdx) => (
                      <View key={spkIdx} style={styles.eventSpeakerCard}>
                        <View style={styles.eventSpeakerAvatar}>
                          <Ionicons name="person" size={16} color="#0A5554" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.eventSpeakerName}>{spk.name || 'Unnamed Speaker'}</Text>
                          {spk.designation ? (
                            <Text style={styles.eventSpeakerRole}>{spk.designation}</Text>
                          ) : null}
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
            </ScrollView>

            {/* Footer Actions */}
            <View style={styles.blogReaderFooter}>
              <TouchableOpacity
                style={styles.blogReaderBtnOutline}
                onPress={() => {
                  const ev = selectedEventForView;
                  setViewEventModalVisible(false);
                  handleOpenEditEvent(ev);
                }}
              >
                <Ionicons name="create-outline" size={15} color="#0A5554" />
                <Text style={styles.blogReaderBtnOutlineText}>Edit Event</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.blogReaderBtnClose}
                onPress={() => setViewEventModalVisible(false)}
              >
                <Text style={styles.blogReaderBtnCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* CREATE / EDIT EVENT MODAL */}
      <Modal
        visible={createEventModalVisible || editEventModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!eventsSaving) {
            setCreateEventModalVisible(false);
            setEditEventModalVisible(false);
            setEditingEvent(null);
          }
        }}
      >
        <SafeAreaView style={styles.editModalSafeArea}>
          <View style={styles.editModalContainer}>
            {/* Modal Header */}
            <View style={styles.editModalHeader}>
              <View style={styles.editModalHeaderLeft}>
                <View style={styles.editModalIconWrap}>
                  <Ionicons name="calendar" size={20} color="#0A5554" />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.editModalTitle}>
                    {editingEvent ? 'Edit Event' : 'Create New Event'}
                  </Text>
                  <Text style={styles.editModalSubtitle}>
                    {editingEvent ? 'Update details, agenda, and speakers' : 'Publish an upcoming event or webinar'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => {
                  if (!eventsSaving) {
                    setCreateEventModalVisible(false);
                    setEditEventModalVisible(false);
                    setEditingEvent(null);
                  }
                }}
                disabled={eventsSaving}
                accessibilityLabel="Close editor"
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Modal Form ScrollView */}
            <ScrollView
              style={styles.editModalScrollView}
              contentContainerStyle={styles.editModalFormContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Field 1: Title */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Event Title *</Text>
                <TextInput
                  style={styles.formInput}
                  value={eventFormData.title}
                  onChangeText={(text) => setEventFormData((prev) => ({ ...prev, title: text }))}
                  placeholder="e.g. BAN Virtual Showcase October"
                  placeholderTextColor="#94A3B8"
                  maxLength={255}
                />
              </View>

              {/* Field 2: Type (Segmented control) */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Event Format *</Text>
                <View style={styles.editorModeSwitchGroup}>
                  <TouchableOpacity
                    style={[
                      styles.editorModeSwitchBtn,
                      eventFormData.type === 'event' && styles.editorModeSwitchBtnActive,
                      { flex: 1, justifyContent: 'center' },
                    ]}
                    onPress={() => setEventFormData((prev) => ({ ...prev, type: 'event' }))}
                  >
                    <Ionicons
                      name="calendar"
                      size={14}
                      color={eventFormData.type === 'event' ? '#FFFFFF' : '#64748B'}
                    />
                    <Text
                      style={[
                        styles.editorModeSwitchText,
                        eventFormData.type === 'event' && styles.editorModeSwitchTextActive,
                      ]}
                    >
                      In-Person / Virtual Event
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.editorModeSwitchBtn,
                      eventFormData.type === 'webinar' && styles.editorModeSwitchBtnActive,
                      { flex: 1, justifyContent: 'center' },
                    ]}
                    onPress={() => setEventFormData((prev) => ({ ...prev, type: 'webinar' }))}
                  >
                    <Ionicons
                      name="videocam"
                      size={14}
                      color={eventFormData.type === 'webinar' ? '#FFFFFF' : '#64748B'}
                    />
                    <Text
                      style={[
                        styles.editorModeSwitchText,
                        eventFormData.type === 'webinar' && styles.editorModeSwitchTextActive,
                      ]}
                    >
                      Webinar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Field 3: Banner Photo */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Banner Image</Text>
                <View style={styles.teamAboutPhotoPickerBox}>
                  {eventFormData.banner_file ? (
                    <View style={styles.pubPickedFileCard}>
                      <View style={[styles.pubPickedFileIconWrap, { backgroundColor: '#E6F4F1' }]}>
                        <Ionicons name="image" size={20} color="#0A5554" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.pubPickedFileName} numberOfLines={1}>
                          {eventFormData.banner_file.name || 'Selected banner'}
                        </Text>
                        <Text style={styles.pubPickedFileSize}>
                          {eventFormData.banner_file.size
                            ? `${(eventFormData.banner_file.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload`
                            : 'New image chosen'}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.pubChangeFileBtn}
                        onPress={handleCancelEventBannerChange}
                      >
                        <Ionicons name="close" size={14} color="#0A5554" />
                        <Text style={styles.pubChangeFileText}>Clear</Text>
                      </TouchableOpacity>
                    </View>
                  ) : eventFormData.remove_banner ? (
                    <View style={styles.teamAboutPhotoRemovedNotice}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                        <Ionicons name="alert-circle" size={16} color="#D97706" />
                        <Text style={styles.teamAboutPhotoRemovedText}>
                          Banner will be removed and reset to default placeholder.
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.teamAboutPhotoUndoBtn}
                        onPress={handleCancelEventBannerChange}
                      >
                        <Text style={styles.teamAboutPhotoUndoBtnText}>Undo</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.teamAboutPhotoPickerRow}>
                      <Image
                        source={{
                          uri:
                            editingEvent?.banner_url ||
                            (editingEvent?.media && editingEvent.media[0] ? editingEvent.media[0].original_url : null) ||
                            'https://bdangels.co/what-we-do-placeholder.svg',
                        }}
                        style={styles.teamAboutPhotoThumb}
                        resizeMode="cover"
                      />
                      <View style={styles.teamAboutPhotoActionsCol}>
                        <TouchableOpacity
                          style={styles.teamAboutPhotoChooseBtn}
                          onPress={handlePickEventBanner}
                        >
                          <Ionicons name="cloud-upload-outline" size={15} color="#0A5554" />
                          <Text style={styles.teamAboutPhotoChooseBtnText}>
                            {editingEvent?.banner_url ? 'Replace Banner' : 'Upload Banner'}
                          </Text>
                        </TouchableOpacity>
                        {editingEvent?.banner_url ? (
                          <TouchableOpacity
                            style={styles.teamAboutPhotoRemoveBtn}
                            onPress={handleRemoveEventBanner}
                          >
                            <Ionicons name="trash-outline" size={14} color="#DC2626" />
                            <Text style={styles.teamAboutPhotoRemoveBtnText}>Remove Banner</Text>
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    </View>
                  )}
                </View>
                <Text style={styles.editorHelperText}>
                  Max size: 5 MB (JPEG, PNG, WebP).
                </Text>
              </View>

              {/* Field 4: Date & Times Row */}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={[styles.formField, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Date</Text>
                  <TextInput
                    style={styles.formInput}
                    value={eventFormData.date}
                    onChangeText={(text) => setEventFormData((prev) => ({ ...prev, date: text }))}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#94A3B8"
                    maxLength={10}
                  />
                </View>

                <View style={[styles.formField, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Start Time</Text>
                  <TextInput
                    style={styles.formInput}
                    value={eventFormData.start_time}
                    onChangeText={(text) => setEventFormData((prev) => ({ ...prev, start_time: text }))}
                    placeholder="e.g. 20:00"
                    placeholderTextColor="#94A3B8"
                    maxLength={5}
                  />
                </View>

                <View style={[styles.formField, { flex: 1 }]}>
                  <Text style={styles.formLabel}>End Time</Text>
                  <TextInput
                    style={styles.formInput}
                    value={eventFormData.end_time}
                    onChangeText={(text) => setEventFormData((prev) => ({ ...prev, end_time: text }))}
                    placeholder="e.g. 22:00"
                    placeholderTextColor="#94A3B8"
                    maxLength={5}
                  />
                </View>
              </View>

              {/* Field 5: Location & Fee */}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={[styles.formField, { flex: 2 }]}>
                  <Text style={styles.formLabel}>Location</Text>
                  <TextInput
                    style={styles.formInput}
                    value={eventFormData.location}
                    onChangeText={(text) => setEventFormData((prev) => ({ ...prev, location: text }))}
                    placeholder="e.g. Online (Zoom) or Venue"
                    placeholderTextColor="#94A3B8"
                    maxLength={255}
                  />
                </View>

                <View style={[styles.formField, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Fee (BDT)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={eventFormData.registration_fee}
                    onChangeText={(text) => setEventFormData((prev) => ({ ...prev, registration_fee: text }))}
                    placeholder="0 for Free"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Field 6: CTA Link */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>RSVP / CTA Link</Text>
                <TextInput
                  style={styles.formInput}
                  value={eventFormData.cta_link}
                  onChangeText={(text) => setEventFormData((prev) => ({ ...prev, cta_link: text }))}
                  placeholder="https://luma.com/… or https://forms.gle/…"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  keyboardType="url"
                />
                <Text style={styles.editorHelperText}>
                  When set, a Register / RSVP button appears on the event card.
                </Text>
              </View>

              {/* Field 7: Featured on Homepage Toggle */}
              <View style={styles.formField}>
                <TouchableOpacity
                  style={[
                    styles.batchDealItemCard,
                    eventFormData.show_on_landing && styles.batchDealItemCardActive,
                    { padding: 12 },
                  ]}
                  onPress={() => setEventFormData((prev) => ({ ...prev, show_on_landing: !prev.show_on_landing }))}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.batchCheckbox,
                      eventFormData.show_on_landing && styles.batchCheckboxActive,
                    ]}
                  >
                    {eventFormData.show_on_landing && (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.formLabel, { marginBottom: 2 }]}>Feature on Homepage</Text>
                    <Text style={styles.editorHelperText}>
                      When checked, this event will be featured in the homepage BAN Events carousel section.
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Field 8: Description */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Description *</Text>
                <TextInput
                  style={[styles.formInput, { minHeight: 120, textAlignVertical: 'top', paddingTop: 10 }]}
                  value={eventFormData.description}
                  onChangeText={(text) => setEventFormData((prev) => ({ ...prev, description: text }))}
                  placeholder="Provide detailed description of the event..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={5}
                />
              </View>

              {/* Field 9: Registration Details */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Registration Details (Optional)</Text>
                <TextInput
                  style={[styles.formInput, { minHeight: 70, textAlignVertical: 'top', paddingTop: 8 }]}
                  value={eventFormData.registration_details}
                  onChangeText={(text) => setEventFormData((prev) => ({ ...prev, registration_details: text }))}
                  placeholder="Instructions for attendees on registration, joining links, etc."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Field 10: Benefits Checklist */}
              <View style={styles.pubSummarySection}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={styles.pubSummarySectionTitle}>BENEFITS</Text>
                  <TouchableOpacity
                    style={styles.dynamicListAddBtn}
                    onPress={handleAddEventBenefit}
                  >
                    <Ionicons name="add" size={14} color="#0A5554" />
                    <Text style={styles.dynamicListAddBtnText}>Add Benefit</Text>
                  </TouchableOpacity>
                </View>
                {eventFormData.benefits.map((b, idx) => (
                  <View key={`benefit-${idx}`} style={styles.dynamicListRow}>
                    <TextInput
                      style={[styles.formInput, { flex: 1 }]}
                      value={b}
                      onChangeText={(val) => handleUpdateEventBenefit(idx, val)}
                      placeholder="e.g. Exclusive networking opportunities"
                      placeholderTextColor="#94A3B8"
                    />
                    {eventFormData.benefits.length > 1 && (
                      <TouchableOpacity
                        style={styles.dynamicListRemoveBtn}
                        onPress={() => handleRemoveEventBenefit(idx)}
                      >
                        <Ionicons name="trash-outline" size={16} color="#DC2626" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>

              {/* Field 11: Highlights */}
              <View style={styles.pubSummarySection}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={styles.pubSummarySectionTitle}>EVENT HIGHLIGHTS</Text>
                  <TouchableOpacity
                    style={styles.dynamicListAddBtn}
                    onPress={handleAddEventHighlight}
                  >
                    <Ionicons name="add" size={14} color="#0A5554" />
                    <Text style={styles.dynamicListAddBtnText}>Add Highlight</Text>
                  </TouchableOpacity>
                </View>
                {eventFormData.event_highlights.map((h, idx) => (
                  <View key={`highlight-${idx}`} style={styles.dynamicListRow}>
                    <TextInput
                      style={[styles.formInput, { flex: 1 }]}
                      value={h}
                      onChangeText={(val) => handleUpdateEventHighlight(idx, val)}
                      placeholder="e.g. Fireside chat with top angels"
                      placeholderTextColor="#94A3B8"
                    />
                    {eventFormData.event_highlights.length > 1 && (
                      <TouchableOpacity
                        style={styles.dynamicListRemoveBtn}
                        onPress={() => handleRemoveEventHighlight(idx)}
                      >
                        <Ionicons name="trash-outline" size={16} color="#DC2626" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>

              {/* Field 12: Target Audience */}
              <View style={styles.pubSummarySection}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={styles.pubSummarySectionTitle}>TARGET AUDIENCE</Text>
                  <TouchableOpacity
                    style={styles.dynamicListAddBtn}
                    onPress={handleAddEventAudience}
                  >
                    <Ionicons name="add" size={14} color="#0A5554" />
                    <Text style={styles.dynamicListAddBtnText}>Add Audience</Text>
                  </TouchableOpacity>
                </View>
                {eventFormData.target_audience.map((a, idx) => (
                  <View key={`audience-${idx}`} style={styles.dynamicListRow}>
                    <TextInput
                      style={[styles.formInput, { flex: 1 }]}
                      value={a}
                      onChangeText={(val) => handleUpdateEventAudience(idx, val)}
                      placeholder="e.g. Angel Investors, Founders"
                      placeholderTextColor="#94A3B8"
                    />
                    {eventFormData.target_audience.length > 1 && (
                      <TouchableOpacity
                        style={styles.dynamicListRemoveBtn}
                        onPress={() => handleRemoveEventAudience(idx)}
                      >
                        <Ionicons name="trash-outline" size={16} color="#DC2626" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>

              {/* Field 13: Speakers */}
              <View style={styles.pubSummarySection}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={styles.pubSummarySectionTitle}>SPEAKERS</Text>
                  <TouchableOpacity
                    style={styles.dynamicListAddBtn}
                    onPress={handleAddEventSpeaker}
                  >
                    <Ionicons name="add" size={14} color="#0A5554" />
                    <Text style={styles.dynamicListAddBtnText}>Add Speaker</Text>
                  </TouchableOpacity>
                </View>
                {eventFormData.speakers.map((spk, idx) => (
                  <View key={`speaker-${idx}`} style={styles.dynamicSpeakerBox}>
                    <View style={styles.dynamicSpeakerHeader}>
                      <Text style={styles.dynamicSpeakerTitle}>Speaker #{idx + 1}</Text>
                      {eventFormData.speakers.length > 1 && (
                        <TouchableOpacity
                          style={styles.dynamicListRemoveBtn}
                          onPress={() => handleRemoveEventSpeaker(idx)}
                        >
                          <Ionicons name="trash-outline" size={15} color="#DC2626" />
                        </TouchableOpacity>
                      )}
                    </View>
                    <TextInput
                      style={[styles.formInput, { marginBottom: 6 }]}
                      value={spk.name}
                      onChangeText={(val) => handleUpdateEventSpeaker(idx, 'name', val)}
                      placeholder="Speaker Full Name"
                      placeholderTextColor="#94A3B8"
                    />
                    <TextInput
                      style={styles.formInput}
                      value={spk.designation}
                      onChangeText={(val) => handleUpdateEventSpeaker(idx, 'designation', val)}
                      placeholder="Designation / Role / Company"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.editModalFooter}>
              <TouchableOpacity
                style={styles.editModalCancelBtn}
                onPress={() => {
                  if (!eventsSaving) {
                    setCreateEventModalVisible(false);
                    setEditEventModalVisible(false);
                    setEditingEvent(null);
                  }
                }}
                disabled={eventsSaving}
              >
                <Text style={styles.editModalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editModalSaveBtn}
                onPress={editingEvent ? handleSaveEditEvent : handleSaveCreateEvent}
                disabled={eventsSaving}
                activeOpacity={0.85}
              >
                {eventsSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.editModalSaveBtnText}>
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* DELETE EVENT CONFIRMATION MODAL */}
      <Modal
        visible={deleteEventModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !isDeletingEvent && setDeleteEventModalVisible(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalBox}>
            <View style={[styles.deleteModalIconWrap, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="trash-outline" size={26} color="#DC2626" />
            </View>
            <Text style={styles.deleteModalTitle}>Delete Event?</Text>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to permanently delete &ldquo;{selectedEventForDelete?.title}&rdquo;? This action cannot be undone.
            </Text>
            <View style={styles.deleteModalBtnRow}>
              <TouchableOpacity
                style={styles.deleteModalCancelBtn}
                onPress={() => setDeleteEventModalVisible(false)}
                disabled={isDeletingEvent}
              >
                <Text style={styles.deleteModalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteModalConfirmBtn}
                onPress={handleConfirmDeleteEvent}
                disabled={isDeletingEvent}
              >
                {isDeletingEvent ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.deleteModalConfirmBtnText}>Delete Event</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================== */}
      {/* 1. VIEW STARTUP SERVICE DETAILS MODAL      */}
      {/* ========================================== */}
      <Modal
        visible={viewStartupServiceModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setViewStartupServiceModalVisible(false)}
      >
        <SafeAreaView style={styles.editModalSafeArea}>
          <View style={styles.editModalContainer}>
            {/* Modal Header */}
            <View style={styles.editModalHeader}>
              <View style={styles.editModalHeaderLeft}>
                <View style={styles.editModalIconWrap}>
                  <Ionicons name="briefcase-outline" size={20} color="#0A5554" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.editModalTitle} numberOfLines={1}>
                    Service Details
                  </Text>
                  <Text style={styles.editModalSubtitle} numberOfLines={1}>
                    Public /startups offering card
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {selectedStartupServiceForView?.id ? (
                  <View style={styles.editModalIdBadge}>
                    <Text style={styles.editModalIdBadgeText}>
                      #{selectedStartupServiceForView.id}
                    </Text>
                  </View>
                ) : null}
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setViewStartupServiceModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Modal Body */}
            <ScrollView
              style={styles.editModalScrollView}
              contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            >
              {selectedStartupServiceForView ? (
                <View style={{ gap: 16 }}>
                  {/* Hero Card */}
                  <View style={[styles.eventCard, { padding: 14, gap: 12 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      {selectedStartupServiceForView.logo_url || selectedStartupServiceForView.icon_url ? (
                        <Image
                          source={{ uri: selectedStartupServiceForView.logo_url || selectedStartupServiceForView.icon_url }}
                          style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#E2E8F0', borderWidth: 1, borderColor: '#CBD5E1' }}
                        />
                      ) : (
                        <View
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: 28,
                            backgroundColor: '#E6F4F1',
                            borderWidth: 1,
                            borderColor: '#B4E6DA',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text style={{ fontSize: 22, fontWeight: '800', color: '#0A5554' }}>
                            {(selectedStartupServiceForView.title || 'S').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}

                      <View style={{ flex: 1 }}>
                        <Text style={[styles.eventTitle, { fontSize: 18, marginBottom: 4 }]}>
                          {selectedStartupServiceForView.title}
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                          <View style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                            <Text style={{ fontSize: 11, fontWeight: '800', color: '#475569' }}>
                              Order #{selectedStartupServiceForView.sort_order || 1}
                            </Text>
                          </View>
                          {selectedStartupServiceForView.show_brochure_link ? (
                            <View style={styles.eventLandingBadge}>
                              <Ionicons name="document-text-outline" size={12} color="#065F46" />
                              <Text style={styles.eventLandingBadgeText}>Brochure Enabled</Text>
                            </View>
                          ) : (
                            <View style={[styles.eventLandingBadge, { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }]}>
                              <Text style={[styles.eventLandingBadgeText, { color: '#64748B' }]}>Brochure Disabled</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Introduction Section */}
                  <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 14 }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#0A5554', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                      Introduction / Summary
                    </Text>
                    <Text style={{ fontSize: 13, color: '#334155', lineHeight: 20 }}>
                      {selectedStartupServiceForView.intro || selectedStartupServiceForView.description}
                    </Text>
                  </View>

                  {/* Bullet Points Section */}
                  {Array.isArray(selectedStartupServiceForView.bullets) && selectedStartupServiceForView.bullets.length > 0 ? (
                    <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 14 }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#0A5554', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
                        Key Offerings & Deliverables ({selectedStartupServiceForView.bullets.length})
                      </Text>
                      {selectedStartupServiceForView.bullets.map((b, bIdx) => (
                        <View key={bIdx} style={styles.eventChecklistItem}>
                          <Ionicons name="checkmark-circle" size={16} color="#0D9488" style={{ marginTop: 2 }} />
                          <Text style={styles.eventChecklistText}>{b}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  {/* Footer Note */}
                  {selectedStartupServiceForView.footer_note ? (
                    <View style={{ backgroundColor: '#FFFBEB', borderRadius: 12, borderWidth: 1, borderColor: '#FEF3C7', padding: 14 }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#B45309', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                        Footer Notice / Small Print
                      </Text>
                      <Text style={{ fontSize: 12, color: '#92400E', fontStyle: 'italic', lineHeight: 18 }}>
                        {selectedStartupServiceForView.footer_note}
                      </Text>
                    </View>
                  ) : null}

                  {/* CTA Action Bar */}
                  <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 14, gap: 10 }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#0A5554', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Call to Action (CTA)
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View style={{ backgroundColor: '#E6F4F1', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
                        <Text style={{ fontSize: 12, fontWeight: '800', color: '#0A5554' }}>
                          {selectedStartupServiceForView.cta_label || 'Get in touch'}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 12, color: '#64748B', flex: 1 }} numberOfLines={1}>
                        → {selectedStartupServiceForView.link || selectedStartupServiceForView.cta_url}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.eventActionBtn, { alignSelf: 'flex-start', marginTop: 4 }]}
                      onPress={() => {
                        const target = selectedStartupServiceForView.link || selectedStartupServiceForView.cta_url;
                        if (target) {
                          Linking.openURL(target).catch(() => Alert.alert('Notice', `Could not open link: ${target}`));
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="open-outline" size={14} color="#0A5554" />
                      <Text style={styles.eventActionBtnText}>Test Open Link</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Brochure Section */}
                  {selectedStartupServiceForView.show_brochure_link ? (
                    <View style={{ backgroundColor: '#F0FDF4', borderRadius: 12, borderWidth: 1, borderColor: '#BBF7D0', padding: 14, gap: 8 }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#166534', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Brochure Destination
                      </Text>
                      <Text style={{ fontSize: 12, color: '#15803D' }} numberOfLines={1}>
                        Target: {selectedStartupServiceForView.brochure_public_href || selectedStartupServiceForView.brochure_url || 'Default /MoU.pdf'}
                      </Text>
                      {selectedStartupServiceForView.brochure_pdf_url ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Ionicons name="document-attach-outline" size={14} color="#166534" />
                          <Text style={{ fontSize: 11, fontWeight: '700', color: '#166534' }}>Custom PDF File Uploaded</Text>
                        </View>
                      ) : null}
                    </View>
                  ) : null}
                </View>
              ) : null}
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.editModalFooter}>
              <TouchableOpacity
                style={styles.editModalCancelBtn}
                onPress={() => setViewStartupServiceModalVisible(false)}
              >
                <Text style={styles.editModalCancelBtnText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editModalSaveBtn, { backgroundColor: '#0284C7' }]}
                onPress={() => {
                  setViewStartupServiceModalVisible(false);
                  handleOpenEditStartupService(selectedStartupServiceForView);
                }}
              >
                <Ionicons name="create-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.editModalSaveBtnText}>Edit Service</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ========================================== */}
      {/* 2. CREATE / EDIT STARTUP SERVICE MODAL     */}
      {/* ========================================== */}
      <Modal
        visible={createStartupServiceModalVisible || editStartupServiceModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setCreateStartupServiceModalVisible(false);
          setEditStartupServiceModalVisible(false);
          setEditingStartupService(null);
        }}
      >
        <SafeAreaView style={styles.editModalSafeArea}>
          <View style={styles.editModalContainer}>
            {/* Modal Header */}
            <View style={styles.editModalHeader}>
              <View style={styles.editModalHeaderLeft}>
                <View style={styles.editModalIconWrap}>
                  <Ionicons name={editingStartupService ? 'create-outline' : 'add-circle-outline'} size={20} color="#0A5554" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.editModalTitle} numberOfLines={1}>
                    {editingStartupService ? 'Edit Startup Service' : 'Add Startup Service'}
                  </Text>
                  <Text style={styles.editModalSubtitle} numberOfLines={1}>
                    Configure service card for public /startups
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => {
                  setCreateStartupServiceModalVisible(false);
                  setEditStartupServiceModalVisible(false);
                  setEditingStartupService(null);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Form Scroll View */}
            <ScrollView
              style={styles.editModalScrollView}
              contentContainerStyle={styles.editModalFormContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Field 1: Logo Upload Section */}
              <View style={styles.teamAboutPhotoPickerBox}>
                <Text style={styles.formLabel}>Service Logo (Optional)</Text>
                <View style={styles.teamAboutPhotoPickerRow}>
                  {startupServiceFormData.logo_file ? (
                    <Image
                      source={{ uri: startupServiceFormData.logo_file.uri }}
                      style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#E2E8F0', borderWidth: 1, borderColor: '#CBD5E1' }}
                    />
                  ) : editingStartupService && (editingStartupService.logo_url || editingStartupService.icon_url) && !startupServiceFormData.remove_logo ? (
                    <Image
                      source={{ uri: editingStartupService.logo_url || editingStartupService.icon_url }}
                      style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#E2E8F0', borderWidth: 1, borderColor: '#CBD5E1' }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 32,
                        backgroundColor: '#E6F4F1',
                        borderWidth: 1,
                        borderColor: '#B4E6DA',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="image-outline" size={24} color="#0A5554" />
                    </View>
                  )}

                  <View style={styles.teamAboutPhotoActionsCol}>
                    <TouchableOpacity
                      style={styles.teamAboutPhotoChooseBtn}
                      onPress={handlePickStartupServiceLogo}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="cloud-upload-outline" size={14} color="#0A5554" />
                      <Text style={styles.teamAboutPhotoChooseBtnText}>
                        {startupServiceFormData.logo_file ? 'Change Photo' : 'Choose Photo'}
                      </Text>
                    </TouchableOpacity>

                    {startupServiceFormData.logo_file ? (
                      <TouchableOpacity
                        style={styles.teamAboutPhotoRemoveBtn}
                        onPress={handleCancelStartupServiceLogoChange}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="close-circle-outline" size={14} color="#DC2626" />
                        <Text style={styles.teamAboutPhotoRemoveBtnText}>Cancel Selected</Text>
                      </TouchableOpacity>
                    ) : editingStartupService && (editingStartupService.logo_url || editingStartupService.icon_url) && !startupServiceFormData.remove_logo ? (
                      <TouchableOpacity
                        style={styles.teamAboutPhotoRemoveBtn}
                        onPress={handleRemoveStartupServiceLogo}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="trash-outline" size={14} color="#DC2626" />
                        <Text style={styles.teamAboutPhotoRemoveBtnText}>Remove Logo</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
                {startupServiceFormData.remove_logo ? (
                  <View style={styles.teamAboutPhotoRemovedNotice}>
                    <Text style={styles.teamAboutPhotoRemovedText}>Logo marked for removal on save.</Text>
                    <TouchableOpacity
                      style={styles.teamAboutPhotoUndoBtn}
                      onPress={() => setStartupServiceFormData((prev) => ({ ...prev, remove_logo: false }))}
                    >
                      <Text style={styles.teamAboutPhotoUndoBtnText}>Undo</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
                <Text style={{ fontSize: 11, color: '#94A3B8' }}>
                  Square logos work best in the circular frame. Max 4 MB.
                </Text>
              </View>

              {/* Field 2: Title */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Service Title *</Text>
                <TextInput
                  style={styles.formInput}
                  value={startupServiceFormData.title}
                  onChangeText={(text) => setStartupServiceFormData((prev) => ({ ...prev, title: text }))}
                  placeholder="e.g. Pre-seed Founder Services"
                  placeholderTextColor="#94A3B8"
                  maxLength={255}
                />
              </View>

              {/* Field 3: Introduction */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Introduction / Overview *</Text>
                <TextInput
                  style={[styles.formInput, { minHeight: 80, textAlignVertical: 'top' }]}
                  value={startupServiceFormData.intro}
                  onChangeText={(text) => setStartupServiceFormData((prev) => ({ ...prev, intro: text }))}
                  placeholder="Short paragraph below the title explaining the service scope..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={4}
                  maxLength={5000}
                />
                <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                  Short paragraph displayed on the card on the public /startups page.
                </Text>
              </View>

              {/* Field 4: Dynamic Bullet Points Builder */}
              <View style={styles.formField}>
                <View style={styles.formSectionHeaderRow}>
                  <Text style={styles.formLabel}>Bullet Points (Deliverables)</Text>
                  <TouchableOpacity
                    style={styles.dynamicListAddBtn}
                    onPress={handleAddStartupServiceBullet}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add" size={14} color="#0A5554" />
                    <Text style={styles.dynamicListAddBtnText}>Add Bullet</Text>
                  </TouchableOpacity>
                </View>

                {startupServiceFormData.bullets.map((b, idx) => (
                  <View key={`svc-bullet-${idx}`} style={styles.dynamicListRow}>
                    <TextInput
                      style={[styles.formInput, { flex: 1 }]}
                      value={b}
                      onChangeText={(text) => handleUpdateStartupServiceBullet(text, idx)}
                      placeholder={`Bullet #${idx + 1} (e.g. Cap table cleanup)`}
                      placeholderTextColor="#94A3B8"
                      maxLength={1000}
                    />
                    <TouchableOpacity
                      style={styles.dynamicListRemoveBtn}
                      onPress={() => handleRemoveStartupServiceBullet(idx)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="trash-outline" size={16} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                ))}
                <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                  Each bullet is rendered with a checkmark on the public card.
                </Text>
              </View>

              {/* Field 5: Footer Note (Optional) */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Footer Note (Optional)</Text>
                <TextInput
                  style={[styles.formInput, { minHeight: 60, textAlignVertical: 'top' }]}
                  value={startupServiceFormData.footer_note}
                  onChangeText={(text) => setStartupServiceFormData((prev) => ({ ...prev, footer_note: text }))}
                  placeholder="Small print below the bullet list (e.g. Delivered as scoped packages...)"
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={2}
                  maxLength={2000}
                />
              </View>

              {/* Field 6: CTA Link & Button Text */}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={[styles.formField, { flex: 1 }]}>
                  <Text style={styles.formLabel}>CTA Link *</Text>
                  <TextInput
                    style={styles.formInput}
                    value={startupServiceFormData.link}
                    onChangeText={(text) => setStartupServiceFormData((prev) => ({ ...prev, link: text }))}
                    placeholder="https://… or mailto:…"
                    placeholderTextColor="#94A3B8"
                    maxLength={2048}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </View>

                <View style={[styles.formField, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Button Text (CTA) *</Text>
                  <TextInput
                    style={styles.formInput}
                    value={startupServiceFormData.cta_label}
                    onChangeText={(text) => setStartupServiceFormData((prev) => ({ ...prev, cta_label: text }))}
                    placeholder="Get in touch"
                    placeholderTextColor="#94A3B8"
                    maxLength={120}
                  />
                </View>
              </View>

              {/* Field 7: Display Order */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Display Order (sort_order)</Text>
                <TextInput
                  style={styles.formInput}
                  value={startupServiceFormData.sort_order}
                  onChangeText={(text) => setStartupServiceFormData((prev) => ({ ...prev, sort_order: text.replace(/[^0-9]/g, '') }))}
                  placeholder="e.g. 1"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  maxLength={6}
                />
                <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                  Lower numbers appear first. Leave blank to append to end.
                </Text>
              </View>

              {/* Field 8: Brochure Settings Box */}
              <View style={{ backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 12, gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>
                      Show Brochure Link
                    </Text>
                    <Text style={{ fontSize: 11, color: '#64748B' }}>
                      Show &ldquo;Click here to see our brochure&rdquo; under the card CTA
                    </Text>
                  </View>
                  <Switch
                    value={startupServiceFormData.show_brochure_link}
                    onValueChange={(val) => setStartupServiceFormData((prev) => ({ ...prev, show_brochure_link: val }))}
                    trackColor={{ false: '#CBD5E1', true: '#B4E6DA' }}
                    thumbColor={startupServiceFormData.show_brochure_link ? '#0A5554' : '#FFFFFF'}
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Brochure URL (Optional)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={startupServiceFormData.brochure_url}
                    onChangeText={(text) => setStartupServiceFormData((prev) => ({ ...prev, brochure_url: text }))}
                    placeholder="https://example.com/brochure.pdf"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                  <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                    If both link and upload are empty, the public page defaults to /MoU.pdf.
                  </Text>
                </View>

                {editingStartupService && editingStartupService.brochure_pdf_url ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FEF3C7', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#FDE68A' }}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#92400E' }}>
                        Custom PDF File Uploaded
                      </Text>
                      <Text style={{ fontSize: 10, color: '#B45309' }}>
                        {startupServiceFormData.remove_brochure ? 'Marked to be removed on save.' : 'Active on site.'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: startupServiceFormData.remove_brochure ? '#FFFFFF' : '#FEE2E2' }}
                      onPress={() => setStartupServiceFormData((prev) => ({ ...prev, remove_brochure: !prev.remove_brochure }))}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '800', color: startupServiceFormData.remove_brochure ? '#0A5554' : '#DC2626' }}>
                        {startupServiceFormData.remove_brochure ? 'Keep PDF' : 'Remove PDF'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.editModalFooter}>
              <TouchableOpacity
                style={styles.editModalCancelBtn}
                onPress={() => {
                  setCreateStartupServiceModalVisible(false);
                  setEditStartupServiceModalVisible(false);
                  setEditingStartupService(null);
                }}
                disabled={startupServicesSaving}
              >
                <Text style={styles.editModalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editModalSaveBtn}
                onPress={editingStartupService ? handleSaveEditStartupService : handleSaveCreateStartupService}
                disabled={startupServicesSaving}
              >
                {startupServicesSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-sharp" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.editModalSaveBtnText}>
                      {editingStartupService ? 'Save Changes' : 'Create Service'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ========================================== */}
      {/* 3. DELETE STARTUP SERVICE MODAL           */}
      {/* ========================================== */}
      <Modal
        visible={deleteStartupServiceModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDeleteStartupServiceModalVisible(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalBox}>
            <View style={[styles.deleteModalIconWrap, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="trash-outline" size={26} color="#DC2626" />
            </View>
            <Text style={styles.deleteModalTitle}>Delete Service?</Text>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to permanently delete &ldquo;{selectedStartupServiceForDelete?.title}&rdquo;? It will be removed from the public /startups page.
            </Text>
            <View style={styles.deleteModalBtnRow}>
              <TouchableOpacity
                style={styles.deleteModalCancelBtn}
                onPress={() => setDeleteStartupServiceModalVisible(false)}
                disabled={isDeletingStartupService}
              >
                <Text style={styles.deleteModalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteModalConfirmBtn}
                onPress={handleConfirmDeleteStartupService}
                disabled={isDeletingStartupService}
              >
                {isDeletingStartupService ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.deleteModalConfirmBtnText}>Delete Service</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================== */}
      {/* 1. VIEW TEAM MEMBER DETAILS MODAL         */}
      {/* ========================================== */}
      <Modal
        visible={viewTeamMemberModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setViewTeamMemberModalVisible(false)}
      >
        <SafeAreaView style={styles.editModalSafeArea}>
          <View style={styles.editModalContainer}>
            {/* Modal Header */}
            <View style={styles.editModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: '#E6F4F1',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="people-outline" size={20} color="#0A5554" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.editModalTitle} numberOfLines={1}>
                    Team Member Details
                  </Text>
                  <Text style={styles.editModalSubtitle} numberOfLines={1}>
                    Leadership & Governing Board roster
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {selectedTeamMemberForView?.id ? (
                  <View style={styles.editModalIdBadge}>
                    <Text style={styles.editModalIdBadgeText}>
                      #{selectedTeamMemberForView.id}
                    </Text>
                  </View>
                ) : null}
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setViewTeamMemberModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Modal Body */}
            <ScrollView
              style={styles.editModalScrollView}
              contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            >
              {selectedTeamMemberForView ? (
                <View style={{ gap: 16 }}>
                  {/* Hero Card */}
                  <View style={[styles.eventCard, { padding: 16, alignItems: 'center', gap: 10 }]}>
                    {selectedTeamMemberForView.photo_url ? (
                      <Image
                        source={{ uri: selectedTeamMemberForView.photo_url }}
                        style={{
                          width: 88,
                          height: 88,
                          borderRadius: 44,
                          backgroundColor: '#E2E8F0',
                          borderWidth: 2,
                          borderColor: '#CBD5E1',
                        }}
                      />
                    ) : (
                      <View
                        style={{
                          width: 88,
                          height: 88,
                          borderRadius: 44,
                          backgroundColor: '#E6F4F1',
                          borderWidth: 2,
                          borderColor: '#B4E6DA',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 32, fontWeight: '800', color: '#0A5554' }}>
                          {(selectedTeamMemberForView.name || 'M').charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}

                    <Text style={[styles.eventTitle, { fontSize: 20, textAlign: 'center', marginTop: 4 }]}>
                      {selectedTeamMemberForView.name}
                    </Text>

                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#0A5554', textAlign: 'center' }}>
                      {selectedTeamMemberForView.title}
                    </Text>

                    {selectedTeamMemberForView.subtitle ? (
                      <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center' }}>
                        {selectedTeamMemberForView.subtitle}
                      </Text>
                    ) : null}

                    {/* Section & Sort Order Badges */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                      <View
                        style={[
                          styles.eventLandingBadge,
                          selectedTeamMemberForView.section === 'management'
                            ? { backgroundColor: '#E6F4F1', borderColor: '#B4E6DA' }
                            : { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' },
                        ]}
                      >
                        <Ionicons
                          name={selectedTeamMemberForView.section === 'management' ? 'briefcase-outline' : 'shield-checkmark-outline'}
                          size={13}
                          color={selectedTeamMemberForView.section === 'management' ? '#0A5554' : '#4338CA'}
                        />
                        <Text
                          style={[
                            styles.eventLandingBadgeText,
                            { color: selectedTeamMemberForView.section === 'management' ? '#0A5554' : '#4338CA' },
                          ]}
                        >
                          {selectedTeamMemberForView.section === 'management' ? 'Management Team' : 'Governing Board'}
                        </Text>
                      </View>

                      <View style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
                        <Text style={{ fontSize: 12, fontWeight: '800', color: '#475569' }}>
                          Order #{selectedTeamMemberForView.sort_order || 1}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Member Details List */}
                  <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 14, gap: 12 }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#0A5554', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Member Information
                    </Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                      <Text style={{ fontSize: 13, color: '#64748B' }}>Full Name</Text>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A', flex: 1, textAlign: 'right' }}>
                        {selectedTeamMemberForView.name}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                      <Text style={{ fontSize: 13, color: '#64748B' }}>Designation / Title</Text>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A', flex: 1, textAlign: 'right' }}>
                        {selectedTeamMemberForView.title}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                      <Text style={{ fontSize: 13, color: '#64748B' }}>Subtitle / Affiliation</Text>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: selectedTeamMemberForView.subtitle ? '#0F172A' : '#94A3B8', flex: 1, textAlign: 'right' }}>
                        {selectedTeamMemberForView.subtitle || 'None'}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                      <Text style={{ fontSize: 13, color: '#64748B' }}>Directory Section</Text>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: selectedTeamMemberForView.section === 'management' ? '#0A5554' : '#4338CA' }}>
                        {selectedTeamMemberForView.section === 'management' ? 'Executive Management' : 'Governing Board'}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                      <Text style={{ fontSize: 13, color: '#64748B' }}>Roster Display Priority</Text>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>
                        #{selectedTeamMemberForView.sort_order || 1}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 }}>
                      <Text style={{ fontSize: 13, color: '#64748B' }}>LinkedIn Profile</Text>
                      {selectedTeamMemberForView.linkedin_url ? (
                        <TouchableOpacity
                          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: '#BFDBFE' }}
                          onPress={() => Linking.openURL(selectedTeamMemberForView.linkedin_url)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="logo-linkedin" size={14} color="#0284C7" />
                          <Text style={{ fontSize: 12, fontWeight: '700', color: '#0369A1' }}>Open Profile</Text>
                        </TouchableOpacity>
                      ) : (
                        <Text style={{ fontSize: 13, color: '#94A3B8' }}>Not provided</Text>
                      )}
                    </View>
                  </View>

                  {/* Public Display Context Info */}
                  <View style={{ backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Ionicons name="information-circle-outline" size={20} color="#0A5554" />
                    <Text style={{ fontSize: 12, color: '#475569', flex: 1, lineHeight: 18 }}>
                      Appears on the public <Text style={{ fontWeight: '700', color: '#0F172A' }}>/team</Text> page under the {selectedTeamMemberForView.section === 'management' ? 'Executive Management' : 'Governing Board'} section.
                    </Text>
                  </View>
                </View>
              ) : null}
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.editModalFooter}>
              <TouchableOpacity
                style={styles.editModalCancelBtn}
                onPress={() => setViewTeamMemberModalVisible(false)}
              >
                <Text style={styles.editModalCancelBtnText}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editModalSaveBtn}
                onPress={() => {
                  const m = selectedTeamMemberForView;
                  setViewTeamMemberModalVisible(false);
                  if (m) handleOpenEditTeamMember(m);
                }}
              >
                <Ionicons name="create-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.editModalSaveBtnText}>Edit Member</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ========================================== */}
      {/* 2. CREATE / EDIT TEAM MEMBER MODAL        */}
      {/* ========================================== */}
      <Modal
        visible={createTeamMemberModalVisible || editTeamMemberModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setCreateTeamMemberModalVisible(false);
          setEditTeamMemberModalVisible(false);
          setEditingTeamMember(null);
        }}
      >
        <SafeAreaView style={styles.editModalSafeArea}>
          <View style={styles.editModalContainer}>
            {/* Modal Header */}
            <View style={styles.editModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: '#E6F4F1',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="people-outline" size={20} color="#0A5554" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.editModalTitle} numberOfLines={1}>
                    {editingTeamMember ? 'Edit Team Member' : 'New Team Member'}
                  </Text>
                  <Text style={styles.editModalSubtitle} numberOfLines={1}>
                    {editingTeamMember ? 'Update leadership card info & photo' : 'Add member to leadership roster'}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {editingTeamMember?.id ? (
                  <View style={styles.editModalIdBadge}>
                    <Text style={styles.editModalIdBadgeText}>
                      #{editingTeamMember.id}
                    </Text>
                  </View>
                ) : null}
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => {
                    setCreateTeamMemberModalVisible(false);
                    setEditTeamMemberModalVisible(false);
                    setEditingTeamMember(null);
                  }}
                  activeOpacity={0.7}
                  disabled={teamMembersSaving}
                >
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Modal Body */}
            <ScrollView
              style={styles.editModalScrollView}
              contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={{ gap: 16 }}>
                {/* Field 1: Section Selector */}
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Directory Section *</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    {[
                      { key: 'management', label: 'Management', icon: 'briefcase-outline', desc: 'Core executive & operations team' },
                      { key: 'governing_board', label: 'Governing Board', icon: 'shield-checkmark-outline', desc: 'Advisory board & directors' },
                    ].map((sec) => {
                      const isSelected = teamMemberFormData.section === sec.key;
                      return (
                        <TouchableOpacity
                          key={`sec-select-${sec.key}`}
                          style={{
                            flex: 1,
                            backgroundColor: isSelected ? '#E6F4F1' : '#FFFFFF',
                            borderRadius: 10,
                            borderWidth: 1.5,
                            borderColor: isSelected ? '#0A5554' : '#E2E8F0',
                            padding: 12,
                            alignItems: 'center',
                            gap: 4,
                          }}
                          onPress={() => setTeamMemberFormData((prev) => ({ ...prev, section: sec.key }))}
                          activeOpacity={0.8}
                        >
                          <Ionicons
                            name={sec.icon}
                            size={20}
                            color={isSelected ? '#0A5554' : '#64748B'}
                          />
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: '700',
                              color: isSelected ? '#0A5554' : '#334155',
                              textAlign: 'center',
                            }}
                          >
                            {sec.label}
                          </Text>
                          <Text
                            style={{
                              fontSize: 10,
                              color: isSelected ? '#065F46' : '#94A3B8',
                              textAlign: 'center',
                            }}
                            numberOfLines={2}
                          >
                            {sec.desc}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Field 2: Photo Upload */}
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Member Photo (Optional)</Text>
                  <View style={styles.teamAboutPhotoPickerBox}>
                    <View style={styles.teamAboutPhotoPickerRow}>
                      {teamMemberFormData.photo_file ? (
                        <Image
                          source={{ uri: teamMemberFormData.photo_file.uri }}
                          style={[styles.teamAboutPhotoThumb, { borderRadius: 36 }]}
                        />
                      ) : editingTeamMember && editingTeamMember.photo_url && !teamMemberFormData.remove_photo ? (
                        <Image
                          source={{ uri: editingTeamMember.photo_url }}
                          style={[styles.teamAboutPhotoThumb, { borderRadius: 36 }]}
                        />
                      ) : (
                        <View
                          style={[
                            styles.teamAboutPhotoThumb,
                            {
                              borderRadius: 36,
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#F1F5F9',
                              borderColor: '#CBD5E1',
                            },
                          ]}
                        >
                          <Ionicons name="person-outline" size={28} color="#94A3B8" />
                        </View>
                      )}

                      <View style={styles.teamAboutPhotoActionsCol}>
                        <TouchableOpacity
                          style={styles.teamAboutPhotoChooseBtn}
                          onPress={handlePickTeamMemberPhoto}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="camera-outline" size={16} color="#0A5554" />
                          <Text style={styles.teamAboutPhotoChooseBtnText}>
                            {teamMemberFormData.photo_file ? 'Change Photo' : 'Choose Photo'}
                          </Text>
                        </TouchableOpacity>

                        {teamMemberFormData.photo_file ? (
                          <TouchableOpacity
                            style={styles.teamAboutPhotoRemoveBtn}
                            onPress={handleCancelTeamMemberPhotoChange}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="close-circle-outline" size={14} color="#DC2626" />
                            <Text style={styles.teamAboutPhotoRemoveBtnText}>Cancel Selected</Text>
                          </TouchableOpacity>
                        ) : editingTeamMember && editingTeamMember.photo_url && !teamMemberFormData.remove_photo ? (
                          <TouchableOpacity
                            style={styles.teamAboutPhotoRemoveBtn}
                            onPress={handleRemoveTeamMemberPhoto}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="trash-outline" size={14} color="#DC2626" />
                            <Text style={styles.teamAboutPhotoRemoveBtnText}>Remove Photo</Text>
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    </View>

                    {teamMemberFormData.remove_photo ? (
                      <View style={styles.teamAboutPhotoRemovedNotice}>
                        <Text style={styles.teamAboutPhotoRemovedText}>Photo marked for removal on save.</Text>
                        <TouchableOpacity
                          style={styles.teamAboutPhotoUndoBtn}
                          onPress={() => setTeamMemberFormData((prev) => ({ ...prev, remove_photo: false }))}
                        >
                          <Text style={styles.teamAboutPhotoUndoBtnText}>Undo</Text>
                        </TouchableOpacity>
                      </View>
                    ) : null}

                    <Text style={{ fontSize: 11, color: '#94A3B8' }}>
                      Square portrait photos (JPG, PNG, WebP) work best. Max 5 MB.
                    </Text>
                  </View>
                </View>

                {/* Field 3: Full Name */}
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Full Name *</Text>
                  <TextInput
                    style={styles.formInput}
                    value={teamMemberFormData.name}
                    onChangeText={(text) => setTeamMemberFormData((prev) => ({ ...prev, name: text }))}
                    placeholder="e.g. Sarah Jenkins"
                    placeholderTextColor="#94A3B8"
                    maxLength={255}
                  />
                </View>

                {/* Field 4: Title / Designation */}
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Title / Role Designation *</Text>
                  <TextInput
                    style={styles.formInput}
                    value={teamMemberFormData.title}
                    onChangeText={(text) => setTeamMemberFormData((prev) => ({ ...prev, title: text }))}
                    placeholder="e.g. Managing Director or Board Member"
                    placeholderTextColor="#94A3B8"
                    maxLength={255}
                  />
                  <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                    Shown directly beneath the member name in cards and roster listings.
                  </Text>
                </View>

                {/* Field 5: Subtitle / Affiliation */}
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Subtitle / Affiliation (Optional)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={teamMemberFormData.subtitle}
                    onChangeText={(text) => setTeamMemberFormData((prev) => ({ ...prev, subtitle: text }))}
                    placeholder="e.g. Founder & CEO, Anchor Ventures"
                    placeholderTextColor="#94A3B8"
                    maxLength={255}
                  />
                  <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                    Optional secondary title or company affiliation.
                  </Text>
                </View>

                {/* Field 6: LinkedIn URL */}
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>LinkedIn Profile URL (Optional)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={teamMemberFormData.linkedin_url}
                    onChangeText={(text) => setTeamMemberFormData((prev) => ({ ...prev, linkedin_url: text }))}
                    placeholder="https://www.linkedin.com/in/username"
                    placeholderTextColor="#94A3B8"
                    keyboardType="url"
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={500}
                  />
                </View>

                {/* Field 7: Sort Order */}
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Display Priority / Sort Order</Text>
                  <TextInput
                    style={styles.formInput}
                    value={String(teamMemberFormData.sort_order ?? '')}
                    onChangeText={(text) => setTeamMemberFormData((prev) => ({ ...prev, sort_order: text }))}
                    placeholder="1"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    maxLength={5}
                  />
                  <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                    Lower numbers appear first within the section roster on the public page.
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.editModalFooter}>
              <TouchableOpacity
                style={styles.editModalCancelBtn}
                onPress={() => {
                  setCreateTeamMemberModalVisible(false);
                  setEditTeamMemberModalVisible(false);
                  setEditingTeamMember(null);
                }}
                disabled={teamMembersSaving}
              >
                <Text style={styles.editModalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editModalSaveBtn}
                onPress={editingTeamMember ? handleSaveEditTeamMember : handleSaveCreateTeamMember}
                disabled={teamMembersSaving}
              >
                {teamMembersSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-sharp" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.editModalSaveBtnText}>
                      {editingTeamMember ? 'Save Changes' : 'Create Member'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ========================================== */}
      {/* 3. DELETE TEAM MEMBER MODAL               */}
      {/* ========================================== */}
      <Modal
        visible={deleteTeamMemberModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDeleteTeamMemberModalVisible(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalBox}>
            <View style={[styles.deleteModalIconWrap, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="trash-outline" size={26} color="#DC2626" />
            </View>
            <Text style={styles.deleteModalTitle}>Delete Team Member?</Text>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to permanently delete &ldquo;{selectedTeamMemberForDelete?.name}&rdquo; ({selectedTeamMemberForDelete?.title})? It will be removed from the public /team page roster.
            </Text>
            <View style={styles.deleteModalBtnRow}>
              <TouchableOpacity
                style={styles.deleteModalCancelBtn}
                onPress={() => setDeleteTeamMemberModalVisible(false)}
                disabled={isDeletingTeamMember}
              >
                <Text style={styles.deleteModalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteModalConfirmBtn}
                onPress={handleConfirmDeleteTeamMember}
                disabled={isDeletingTeamMember}
              >
                {isDeletingTeamMember ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.deleteModalConfirmBtnText}>Delete Member</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sidebarToggleBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#0A5554',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 3,
    elevation: 3,
  },
  headerGreetingWrap: {
    marginLeft: 10,
    flex: 1,
  },
  greetingTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.ink,
  },
  greetingSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0A5554',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationBellBtn: {
    position: 'relative',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerUnreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  headerUnreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgLight,
  },
  headerPublicBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgLight,
  },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
  },
  tabsBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  tabsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  menuQuickPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radii.pill,
    backgroundColor: '#E6F4F1',
    borderWidth: 1,
    borderColor: '#B4E6DA',
  },
  menuQuickPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0A5554',
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radii.pill,
    backgroundColor: Colors.bgLight,
  },
  tabItemActive: {
    backgroundColor: '#0A5554',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.ink,
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },
  tabBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: Radii.pill,
  },
  tabBadgeActive: {
    backgroundColor: '#FFFFFF',
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  tabContent: {
    gap: 16,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.muted,
    fontWeight: '600',
  },
  welcomeBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.md,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.line,
    ...Shadows.card,
  },
  welcomeHeader: {
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.forest,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 19,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.lineLight,
  },
  quickActionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.forest,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radii.sm,
  },
  quickActionBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  quickActionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.cream,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  quickActionBtnSecondaryText: {
    color: Colors.forest,
    fontSize: 12,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.md,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.line,
    ...Shadows.card,
  },
  metricCardTeal: {
    borderLeftWidth: 4,
    borderLeftColor: '#0F7359',
  },
  metricCardBlue: {
    borderLeftWidth: 4,
    borderLeftColor: '#0284C7',
  },
  metricCardPlum: {
    borderLeftWidth: 4,
    borderLeftColor: '#7E22CE',
  },
  metricCardGold: {
    borderLeftWidth: 4,
    borderLeftColor: '#D97706',
  },
  metricTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.muted,
  },
  metricIconWrap: {
    width: 28,
    height: 28,
    borderRadius: Radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 8,
  },
  currencyValue: {
    fontSize: 17,
  },
  metricBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricDetail: {
    fontSize: 11,
    color: Colors.muted,
    fontWeight: '600',
  },
  panelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.md,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    ...Shadows.card,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 2,
  },
  panelSubtitle: {
    fontSize: 12,
    color: Colors.muted,
  },
  pillCount: {
    backgroundColor: Colors.bgLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  pillCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.muted,
  },
  distributionList: {
    gap: 12,
  },
  distributionRow: {
    gap: 6,
  },
  distributionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distributionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.ink,
  },
  distributionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.muted,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: Radii.pill,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: Radii.pill,
  },
  tableList: {
    gap: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lineLight,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: Radii.pill,
    backgroundColor: '#DFF4EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.forest,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentMemberName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 2,
  },
  paymentDate: {
    fontSize: 11,
    color: Colors.muted,
  },
  paymentRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  paymentAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.forest,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radii.pill,
  },
  statusCompleted: {
    backgroundColor: '#DCFCE7',
  },
  statusCompletedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  statusWarning: {
    backgroundColor: '#FEF3C7',
  },
  statusWarningText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  statusFailed: {
    backgroundColor: '#FEE2E2',
  },
  statusFailedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  statusNeutral: {
    backgroundColor: '#E5E7EB',
  },
  statusNeutralText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4B5563',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 2,
  },
  sectionSubheading: {
    fontSize: 12,
    color: Colors.muted,
  },
  sectionHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addMemberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F7359',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: Radii.sm,
    shadowColor: '#0F7359',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 3,
    elevation: 2,
  },
  addMemberBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  refreshIconBtn: {
    padding: 8,
    borderRadius: Radii.sm,
    backgroundColor: Colors.bgLight,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radii.sm,
    paddingHorizontal: 12,
    height: 44,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    marginBottom: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.ink,
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.line,
  },
  filterChipActive: {
    backgroundColor: '#0F7359',
    borderColor: '#0F7359',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.ink,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  filterChipBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radii.pill,
    marginLeft: 6,
  },
  filterChipBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  filterChipBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  filterChipBadgeTextActive: {
    color: '#FFFFFF',
  },
  cardsList: {
    gap: 12,
  },
  listLoadingBox: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberListUpdatingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 4,
  },
  memberListUpdatingText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#166534',
  },
  memberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.md,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    ...Shadows.card,
    gap: 12,
  },
  memberCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatarCircleLarge: {
    width: 44,
    height: 44,
    borderRadius: Radii.pill,
    backgroundColor: '#C9F3DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTextLarge: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B4A3E',
  },
  memberInfo: {
    flex: 1,
  },
  memberTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.ink,
  },
  adminRolePill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radii.pill,
  },
  adminRolePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
  },
  memberEmail: {
    fontSize: 12,
    color: Colors.muted,
    marginBottom: 2,
  },
  memberPhone: {
    fontSize: 11,
    color: Colors.muted,
  },
  memberCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.lineLight,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  tierBadge: {
    backgroundColor: Colors.bgLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.sm,
  },
  tierBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.ink,
  },
  memberJoined: {
    fontSize: 11,
    color: Colors.mutedLight,
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0F7359',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.sm,
  },
  approveButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  dealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.md,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    ...Shadows.card,
    gap: 10,
  },
  dealCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dealTitleWrap: {
    flex: 1,
    marginRight: 8,
  },
  dealTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.ink,
  },
  dealCompany: {
    fontSize: 12,
    color: Colors.muted,
    marginTop: 1,
  },
  dealMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  metaPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  metaPillStage: {
    backgroundColor: '#E0F2FE',
  },
  metaPillStageText: {
    color: '#0369A1',
  },
  metaPillType: {
    backgroundColor: '#F3E8FF',
  },
  metaPillTypeText: {
    color: '#7E22CE',
  },
  dealPitch: {
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 18,
  },
  dealStatsBox: {
    flexDirection: 'row',
    backgroundColor: Colors.bgLight,
    padding: 10,
    borderRadius: Radii.sm,
    gap: 20,
    marginTop: 4,
  },
  dealStatItem: {
    gap: 2,
  },
  dealStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.muted,
  },
  dealStatValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.ink,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.sm,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.line,
    gap: 6,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: Radii.sm,
  },
  toggleBtnActive: {
    backgroundColor: '#0F7359',
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.muted,
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
  },
  submissionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.md,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    ...Shadows.card,
    gap: 10,
  },
  submissionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  submissionTitleBox: {
    flex: 1,
    marginRight: 8,
  },
  submissionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.ink,
  },
  submissionFounder: {
    fontSize: 12,
    color: Colors.muted,
    marginTop: 2,
  },
  dateBadge: {
    backgroundColor: Colors.bgLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  dateBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.muted,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  contactItem: {
    fontSize: 12,
    color: Colors.muted,
  },
  submissionDesc: {
    fontSize: 13,
    color: Colors.ink,
    lineHeight: 18,
  },
  submissionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.lineLight,
  },
  metaPillRow: {
    flexDirection: 'row',
    gap: 6,
  },
  deckIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F4F1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  deckIndicatorText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.forest,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.md,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.line,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.ink,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.muted,
    textAlign: 'center',
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F7359',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: Radii.sm,
    marginTop: 8,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  addTogglesContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 12,
    marginTop: 6,
  },
  addToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  addToggleTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  addToggleSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  // Notifications styles
  notifActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  notifMetaPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  notifMetaPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.ink,
  },
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.sm,
    backgroundColor: '#E6F4F1',
  },
  markReadBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0A5554',
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.md,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.line,
    ...Shadows.card,
  },
  notificationCardUnread: {
    backgroundColor: '#FFFDF0',
    borderColor: '#FDE68A',
  },
  notificationCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  notificationAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0A5554',
  },
  notificationInfo: {
    flex: 1,
  },
  notificationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notificationUserName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ink,
  },
  unreadAmberDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#F59E0B',
  },
  notificationEmail: {
    fontSize: 11,
    color: Colors.muted,
  },
  notificationDate: {
    fontSize: 11,
    color: Colors.muted,
  },
  notificationBody: {
    paddingLeft: 44,
  },
  notificationMessage: {
    fontSize: 13,
    color: Colors.ink,
    lineHeight: 18,
  },
  notificationDealBold: {
    fontWeight: '800',
    color: '#0A5554',
  },
  notificationAmountPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
    marginTop: 6,
  },
  notificationAmountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
  },

  // Subscriptions & Tiers styles
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.ink,
    marginTop: 8,
    marginBottom: 4,
  },
  tiersGrid: {
    gap: 10,
  },
  tierCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.md,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.line,
    ...Shadows.card,
  },
  tierName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0A5554',
  },
  tierPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ink,
    marginVertical: 4,
  },
  tierDesc: {
    fontSize: 12,
    color: Colors.muted,
    lineHeight: 16,
  },
  subCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.md,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.line,
    gap: 8,
    ...Shadows.card,
  },
  subCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subUserName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.ink,
  },
  subUserEmail: {
    fontSize: 11,
    color: Colors.muted,
  },
  subCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.lineLight,
  },
  subDate: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.muted,
  },
  subAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.forest,
  },

  // CMS Cards & stats styles
  cmsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.md,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    gap: 6,
    ...Shadows.card,
  },
  cmsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cmsCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.ink,
  },
  cmsCardDesc: {
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 18,
  },
  cmsCardAuthor: {
    fontSize: 11,
    color: Colors.muted,
    fontWeight: '600',
  },
  statsGrid: {
    gap: 10,
  },
  statBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.md,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  statBoxVal: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0A5554',
    marginBottom: 4,
  },
  statBoxLbl: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.muted,
    textAlign: 'center',
  },

  // Homepage Statistics Editor & Live Preview Styles
  statsUnsavedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: Radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  statsUnsavedBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    lineHeight: 16,
  },
  statsPreviewContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 16,
    ...Shadows.card,
  },
  statsPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statsPreviewHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statsPreviewHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0A5554',
    letterSpacing: 0.8,
  },
  statsPreviewLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E6F4F1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  statsPreviewLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statsPreviewLiveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0A5554',
  },
  heroStripBanner: {
    backgroundColor: '#022B27',
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    padding: 14,
  },
  heroStripTopline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
  },
  heroStripDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  heroStripNetworkText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 1,
  },
  heroStripSiteText: {
    marginLeft: 'auto',
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  heroProofRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heroProofItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  heroProofItemBorder: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.12)',
  },
  heroProofVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 4,
    textAlign: 'center',
  },
  heroProofLbl: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 14,
  },
  statsEditorSection: {
    marginBottom: 6,
  },
  statsEditorHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  statsEditorHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.8,
  },
  statsEditorSubheading: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.muted,
  },
  statEditCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 14,
    ...Shadows.card,
  },
  statEditCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 14,
  },
  statEditCardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E6F4F1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.pill,
  },
  statEditCardBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0A5554',
    letterSpacing: 0.5,
  },
  statEditCardRightTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statModifiedBadge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radii.pill,
  },
  statModifiedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  statOrderPill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  statOrderPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  statFieldGroup: {
    marginBottom: 14,
  },
  statFieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statFieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ink,
  },
  statCharCount: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.muted,
  },
  statInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: Radii.md,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.ink,
  },
  statFieldHint: {
    fontSize: 11,
    color: Colors.muted,
    marginTop: 4,
  },
  statTextarea: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: Radii.md,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.ink,
    minHeight: 74,
  },
  statTextareaHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 5,
  },
  statFieldHintLine: {
    flex: 1,
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  statActionButtonsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    marginBottom: 14,
  },
  statDiscardBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: Radii.md,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  statDiscardBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  statSaveBtn: {
    flex: 1.6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: Radii.md,
    backgroundColor: '#0A5554',
    ...Shadows.sm,
  },
  statSaveBtnDisabled: {
    opacity: 0.5,
  },
  statSaveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statBtnDisabled: {
    opacity: 0.5,
  },
  statsExternalLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: Radii.md,
    padding: 12,
    marginBottom: 20,
  },
  statsExternalLinkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  statsExternalLinkTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0A5554',
  },
  statsExternalLinkDesc: {
    fontSize: 11,
    color: '#15803D',
    marginTop: 1,
  },

  // Homepage Programs Styles
  programsActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  programsCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E6F4F1',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: '#BFE7DE',
  },
  programsCountPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0A5554',
  },
  programsAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0A5554',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: Radii.md,
    ...Shadows.sm,
  },
  programsAddBtnDisabled: {
    opacity: 0.45,
    backgroundColor: '#94A3B8',
  },
  programsAddBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  programsMaxBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: Radii.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 14,
  },
  programsMaxBannerText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    lineHeight: 16,
  },
  programsPreviewContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 16,
    ...Shadows.card,
  },
  programsPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  programsPreviewHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  programsPreviewHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0A5554',
    letterSpacing: 0.8,
  },
  programsPreviewBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  programsPreviewBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  programsPreviewScrollContent: {
    gap: 12,
    paddingRight: 6,
  },
  liveProgramPreviewCard: {
    width: 250,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    padding: 16,
    justifyContent: 'space-between',
    ...Shadows.card,
  },
  liveProgramPreviewTop: {
    marginBottom: 14,
  },
  liveProgramEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  liveProgramTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  liveProgramDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  liveProgramActions: {
    gap: 6,
  },
  liveProgramActionBtn: {
    borderRadius: Radii.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveProgramActionBtnDark: {
    backgroundColor: '#10B981',
  },
  liveProgramActionBtnLight: {
    backgroundColor: '#E6F4F1',
    borderWidth: 1,
    borderColor: '#0A5554',
  },
  liveProgramActionText: {
    fontSize: 12,
    fontWeight: '800',
  },
  liveProgramSecBtn: {
    borderRadius: Radii.md,
    paddingVertical: 7,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveProgramSecBtnDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  liveProgramSecBtnLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  liveProgramDropBtn: {
    borderRadius: Radii.md,
    paddingVertical: 7,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveProgramSecText: {
    fontSize: 11,
    fontWeight: '700',
  },
  programCardsListWrap: {
    marginBottom: 10,
  },
  programCardsListHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  programCardsListHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.8,
  },
  programCardsListSubheading: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.muted,
  },
  programCardItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 12,
    ...Shadows.card,
  },
  programCardItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  programCardItemBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  programOrderBadge: {
    backgroundColor: '#0A5554',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  programOrderBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  programEyebrowPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: Radii.pill,
    maxWidth: '70%',
  },
  programEyebrowPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  programCardThemeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  programThemeColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  programCardThemeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  programCardItemTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 6,
  },
  programCardItemDesc: {
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 18,
    marginBottom: 12,
  },
  programMetaInfoRow: {
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 12,
  },
  programActionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  programActionTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  programCardActionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  programOrderDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  programOrderDisplayText: {
    fontSize: 11,
    color: '#64748B',
  },
  programCardBtnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  programEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E6F4F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.md,
  },
  programEditBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0A5554',
  },
  programDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radii.md,
  },
  programDeleteBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  themeSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    marginTop: 6,
  },
  themeSelectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: Radii.md,
    borderWidth: 1.5,
    position: 'relative',
  },
  themeSelectorCardActive: {
    borderWidth: 2,
    borderColor: '#0A5554',
  },
  themeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  themeSelectorLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  themeSelectedCheck: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0A5554',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  dropdownItemsEditorBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  dropdownItemsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dropdownItemsHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  dropdownAddOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#E6F4F1',
    borderRadius: Radii.pill,
  },
  dropdownAddOptionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0A5554',
  },
  dropdownItemFieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
  },
  dropdownItemNumberBadge: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: Radii.xs,
    marginTop: 6,
  },
  dropdownItemNumberText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  dropdownItemInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: Radii.xs,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
    color: Colors.ink,
    backgroundColor: '#FFFFFF',
  },
  dropdownItemRemoveBtn: {
    padding: 8,
    marginTop: 18,
  },
  dealDateText: {
    fontSize: 11,
    color: Colors.muted,
    alignSelf: 'center',
  },

  // Homepage Selected Portfolios Management Styles
  portfolioKpiContainer: {
    gap: 10,
    marginBottom: 16,
  },
  portfolioKpiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#0A5554',
  },
  portfolioKpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  portfolioKpiLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  portfolioKpiValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
  },
  portfolioKpiSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 15,
  },
  portfolioProgressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  portfolioProgressFill: {
    height: 6,
    backgroundColor: '#0A5554',
    borderRadius: 3,
  },
  portfolioActiveBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radii.pill,
    backgroundColor: '#E6F4F1',
  },
  portfolioActiveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0A5554',
  },
  portfolioDefaultBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radii.pill,
    backgroundColor: '#FEF3C7',
  },
  portfolioDefaultBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
  },
  portfolioActionToolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  portfolioToolbarBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0A5554',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: Radii.md,
  },
  portfolioToolbarBtnPrimaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  portfolioToolbarBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radii.md,
  },
  portfolioToolbarBtnSecondaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  portfolioToolbarBtnDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radii.md,
  },
  portfolioToolbarBtnDangerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  portfolioCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  portfolioCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  portfolioRankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#0A5554',
  },
  portfolioRankBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0A5554',
  },
  portfolioLogoImage: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  portfolioLogoPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  portfolioLogoPlaceholderText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0A5554',
  },
  portfolioCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  portfolioCardSector: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  portfolioCardDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    marginBottom: 10,
  },
  portfolioCardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  portfolioReorderButtonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  portfolioReorderBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  portfolioReorderBtnDisabled: {
    opacity: 0.35,
  },
  portfolioDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  portfolioDeleteBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  portfolioEmptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
    gap: 10,
    marginVertical: 12,
  },
  portfolioEmptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  portfolioEmptyDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 300,
  },
  batchModalSearchBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    fontSize: 12,
    color: '#0F172A',
  },
  batchDealItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  batchDealItemCardActive: {
    borderColor: '#0A5554',
    backgroundColor: '#F0F9F8',
  },
  batchCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  batchCheckboxActive: {
    borderColor: '#0A5554',
    backgroundColor: '#0A5554',
  },
  batchRadioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  batchRadioCircleActive: {
    borderColor: '#0A5554',
    backgroundColor: '#FFFFFF',
  },
  batchRadioInnerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0A5554',
  },

  // Member Filter Tabs (matching web)
  memberFilterScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  memberFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radii.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  memberFilterChipActive: {
    backgroundColor: '#E6F4F1',
    borderColor: '#0A5554',
  },
  memberFilterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  memberFilterChipTextActive: {
    color: '#0A5554',
  },
  memberFilterBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radii.pill,
  },
  memberFilterBadgeInactive: {
    backgroundColor: '#F1F5F9',
  },
  memberFilterBadgeActive: {
    backgroundColor: '#0A5554',
  },
  memberFilterBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  memberFilterBadgeTextActive: {
    color: '#FFFFFF',
  },

  // Enhanced Member Card
  memberCardEnhanced: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.md,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
    gap: 12,
  },
  avatarPhoto: {
    width: 44,
    height: 44,
    borderRadius: Radii.pill,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  youBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  youBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  memberMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  memberMetaText: {
    fontSize: 11,
    color: '#94A3B8',
  },

  // Professional details box
  memberDetailsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: Radii.sm,
    padding: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  memberDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  memberDetailText: {
    fontSize: 12,
    color: '#334155',
    flex: 1,
    lineHeight: 16,
  },
  emailVerifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  emailVerifiedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  unverifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  unverifiedTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  inlineVerifyBtn: {
    backgroundColor: '#E6F4F1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  inlineVerifyBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0A5554',
  },

  // Interactive Status & Mode Selectors
  statusAndModeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  selectorColumn: {
    flex: 1,
  },
  selectorLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  interactivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  interactivePillText: {
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },

  // Member Action Buttons Row
  memberActionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionBtnApprove: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0A5554',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  actionBtnApproveText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  actionBtnEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnEditText: {
    color: '#0A5554',
    fontSize: 11,
    fontWeight: '700',
  },
  actionBtnDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnDeleteText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '700',
  },

  // Pagination navigation bar
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 4,
  },
  paginationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  paginationBtnDisabled: {
    opacity: 0.4,
    backgroundColor: '#F8FAFC',
    borderColor: '#F1F5F9',
  },
  paginationBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0A5554',
  },
  paginationBtnTextDisabled: {
    color: '#94A3B8',
  },
  paginationInfoBox: {
    alignItems: 'center',
  },
  paginationInfoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },

  // Modal common styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCardCenter: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTopBarTeal: {
    height: 5,
    backgroundColor: '#0A5554',
  },
  modalTopBarRed: {
    height: 5,
    backgroundColor: '#DC2626',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalHeaderTitleDanger: {
    fontSize: 16,
    fontWeight: '800',
    color: '#DC2626',
  },
  modalHeaderSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  modalDangerHeaderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  modalDangerIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tier Selector modal options
  tierOptionsList: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 12,
  },
  tierOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  tierOptionItemSelected: {
    backgroundColor: '#F0FDFA',
    borderColor: '#0A5554',
  },
  tierOptionLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  tierDotLarge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  tierOptionTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  tierOptionDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  tierRadioUnchecked: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  modalCancelBtn: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },

  // Preview card inside modal
  memberPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewAvatarPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  previewAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0A5554',
  },
  previewMemberName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  previewMemberEmail: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  previewMemberMeta: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },

  // Warning & notice boxes inside modal
  modalWarningBox: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  modalWarningText: {
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  modalDangerNoticeBox: {
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  modalDangerNoticeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 2,
  },
  modalDangerNoticeDesc: {
    fontSize: 11,
    color: '#B91C1C',
    lineHeight: 16,
  },

  // Modal footer actions
  modalFooterActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  modalSecondaryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  modalSecondaryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  modalPrimaryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#0A5554',
  },
  modalPrimaryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalDangerBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#DC2626',
  },
  modalDangerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Edit Member Modal
  editModalSafeArea: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
  },
  editModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 20,
    overflow: 'hidden',
  },
  editModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  editModalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  editModalIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  editModalSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  editModalIdBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  editModalIdBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  editModalScrollView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  editModalFormContent: {
    padding: 16,
    gap: 14,
  },
  editAvatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  editAvatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#0A5554',
  },
  editAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0A5554',
  },
  editAvatarPlaceholderText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0A5554',
  },
  editAvatarName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  editAvatarEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  editMetaBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  editMetaBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#475569',
  },
  formSectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginTop: 6,
    marginBottom: -4,
  },
  formField: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  requiredStar: {
    color: '#DC2626',
  },
  fieldInput: {
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    fontSize: 12,
    color: '#0F172A',
  },
  fieldTextArea: {
    height: 'auto',
    minHeight: 88,
    paddingTop: 10,
    paddingBottom: 10,
    textAlignVertical: 'top',
  },
  fieldHelperText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  chipButtonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipBtnActive: {
    backgroundColor: '#E6F4F1',
    borderColor: '#0A5554',
  },
  chipBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  chipBtnTextActive: {
    color: '#0A5554',
  },
  chipBtnSmall: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipBtnSmallActive: {
    backgroundColor: '#E6F4F1',
    borderColor: '#0A5554',
  },
  chipBtnSmallText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  chipBtnSmallTextActive: {
    color: '#0A5554',
  },
  editVerificationBanner: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  editVerificationTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  editVerificationTitleWarning: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D97706',
  },
  editVerificationSubtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  editManualVerifyBtn: {
    backgroundColor: '#E6F4F1',
    borderWidth: 1,
    borderColor: '#99F6E4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  editManualVerifyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0A5554',
  },
  editModalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  editModalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  editModalCancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  editModalSaveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#0A5554',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  editModalSaveBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ----------------------------------------------------
  // Blog Management & Reader Styles
  // ----------------------------------------------------
  fieldHint: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  blogCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  blogCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  blogCategoryPill: {
    backgroundColor: '#E6F4F1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: '#B4E6DA',
  },
  blogCategoryPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0A5554',
  },
  blogStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
    borderWidth: 1,
  },
  blogStatusPillPublished: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  blogStatusPillArchived: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  blogStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  blogStatusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  blogReadTimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  blogReadTimeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  blogCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 21,
    marginBottom: 6,
  },
  blogCardExcerpt: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 10,
  },
  blogMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  blogMetaAuthorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '65%',
  },
  blogMetaAuthorText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  blogMetaDot: {
    fontSize: 11,
    color: '#94A3B8',
  },
  blogMetaDateText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  blogSlugText: {
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 12,
  },
  blogActionsToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  blogActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E6F4F1',
    borderWidth: 1,
    borderColor: '#B4E6DA',
  },
  blogActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0A5554',
  },
  blogActionBtnArchive: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  blogActionBtnPublish: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  blogActionDeleteBtn: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginLeft: 'auto',
  },

  // Reader Modal Styles
  blogReaderContent: {
    padding: 16,
    paddingBottom: 32,
  },
  blogReaderTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 26,
    marginBottom: 12,
  },
  blogReaderAuthorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  blogReaderAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#B4E6DA',
  },
  blogReaderAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0A5554',
  },
  blogReaderAuthorName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  blogReaderAuthorRole: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  blogReaderDate: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  blogReaderExcerptBox: {
    backgroundColor: '#F0FDFA',
    borderLeftWidth: 3,
    borderLeftColor: '#0A5554',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  blogReaderExcerptText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#134E4A',
    lineHeight: 18,
  },
  blogReaderBodyBox: {
    gap: 12,
  },
  blogReaderParagraph: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 22,
  },
  blogReaderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  blogReaderBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  blogReaderBtnOutlineText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0A5554',
  },
  blogReaderBtnClose: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  blogReaderBtnCloseText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },

  // Delete Blog Modal
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  deleteModalBox: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  deleteModalIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  deleteModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  deleteModalMessage: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 18,
  },
  deleteModalBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  deleteModalCancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  deleteModalCancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  deleteModalConfirmBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#DC2626',
    alignItems: 'center',
  },
  deleteModalConfirmBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ----------------------------------------------------
  // Blog Rich HTML Editor Styles (Web Blade parity)
  // ----------------------------------------------------
  editorContainerBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 8,
  },
  editorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  editorModeSwitchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  editorModeSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  editorModeSwitchBtnActive: {
    backgroundColor: '#0A5554',
  },
  editorModeSwitchText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  editorModeSwitchTextActive: {
    color: '#FFFFFF',
  },
  editorContentWrapper: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  editorToolbarBar: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  editorToolbarContent: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editorToolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  editorToolBtnClear: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  editorToolBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  editorTextInput: {
    minHeight: 180,
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
    lineHeight: 20,
    textAlignVertical: 'top',
  },
  editorPreviewContainer: {
    minHeight: 180,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  editorPreviewEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    gap: 8,
  },
  editorPreviewEmptyText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 18,
  },
  editorHelperText: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 14,
    marginTop: 2,
  },
  // Publications Styles
  pubCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  pubCategoryPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  pubCategoryPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4338CA',
  },
  pubDatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  pubDateText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  pubPdfBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
    marginBottom: 12,
    gap: 10,
  },
  pubPdfIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pubPdfName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  pubPdfActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F4F1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#B4E6DA',
  },
  pubPdfActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0A5554',
  },
  pubDetailMetaBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  pubDetailMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pubDetailMetaLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  pubDetailMetaValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  pubDownloadHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  pubDownloadHeroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  pubDownloadHeroTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991B1B',
  },
  pubDownloadHeroSubtitle: {
    fontSize: 11,
    color: '#B91C1C',
    marginTop: 2,
  },
  pubDownloadHeroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pubDownloadHeroBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pubSummarySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pubSummarySectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  pubSummaryText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#334155',
  },
  pubPublicNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    gap: 10,
  },
  pubPublicNoticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
  },
  pubPublicNoticeText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#15803D',
    marginTop: 2,
  },
  pubCurrentFileBanner: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  pubCurrentFileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pubCurrentFileTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#166534',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pubCurrentFileName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803D',
    marginTop: 1,
  },
  pubPickedFileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0A5554',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  pubPickedFileIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pubPickedFileName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  pubPickedFileSize: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
    marginTop: 2,
  },
  pubChangeFileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F4F1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#B4E6DA',
  },
  pubChangeFileText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0A5554',
  },
  pubUploadDropzone: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 6,
  },
  pubUploadDropzoneIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  pubUploadDropzoneTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  pubUploadDropzoneSubtitle: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 16,
  },
  pubUploadDropzoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0A5554',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  pubUploadDropzoneBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Team About Section Styles
  teamAboutOverviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    ...Shadows.card,
    gap: 12,
  },
  teamAboutHeaderPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamAboutLivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  teamAboutLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  teamAboutLiveText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
  },
  teamAboutEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0A5554',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  teamAboutEditBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  teamAboutMetaGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  teamAboutMetaItem: {
    flex: 1,
    alignItems: 'center',
  },
  teamAboutMetaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  teamAboutMetaValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  teamAboutMetaDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#CBD5E1',
  },
  teamAboutPreviewBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    ...Shadows.card,
    gap: 14,
  },
  teamAboutPreviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  teamAboutPreviewTopTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0A5554',
    letterSpacing: 0.8,
  },
  teamAboutPreviewTopBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  teamAboutPreviewTopBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  teamAboutKickerPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#E6F4F1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: '#B4E6DA',
    marginBottom: 6,
  },
  teamAboutKickerText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0A5554',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  teamAboutHeadingText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 28,
    marginBottom: 10,
  },
  teamAboutParagraphsWrap: {
    gap: 12,
  },
  teamAboutParagraphCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#0A5554',
  },
  teamAboutParagraphText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 22,
  },
  teamAboutHeroImageCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginTop: 6,
  },
  teamAboutHeroImg: {
    width: '100%',
    height: 200,
    backgroundColor: '#E2E8F0',
  },
  teamAboutHeroBadgeOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(10, 85, 84, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  teamAboutHeroBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  teamAboutHeroAltBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  teamAboutHeroAltText: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
    flex: 1,
  },
  teamAboutEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  teamAboutEmptyStateText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  teamAboutPhotoPickerBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 10,
  },
  teamAboutPhotoPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  teamAboutPhotoThumb: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  teamAboutPhotoActionsCol: {
    flex: 1,
    gap: 6,
  },
  teamAboutPhotoChooseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E6F4F1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B4E6DA',
    alignSelf: 'flex-start',
  },
  teamAboutPhotoChooseBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0A5554',
  },
  teamAboutPhotoRemoveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    alignSelf: 'flex-start',
  },
  teamAboutPhotoRemoveBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  teamAboutPhotoRemovedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  teamAboutPhotoRemovedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    flex: 1,
  },
  teamAboutPhotoUndoBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  teamAboutPhotoUndoBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  teamAboutCharCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  // Form common styles
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  formSectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  // Event card & list styles
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  eventBannerWrap: {
    width: '100%',
    height: 160,
    backgroundColor: '#E2E8F0',
    position: 'relative',
    overflow: 'hidden',
  },
  eventBannerImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  eventTypePillWrap: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 2,
  },
  eventTypePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  eventTypePillEvent: {
    backgroundColor: '#E6F4F1',
    borderColor: '#B4E6DA',
  },
  eventTypePillWebinar: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  eventTypePillText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  eventTypePillTextEvent: {
    color: '#0A5554',
  },
  eventTypePillTextWebinar: {
    color: '#4338CA',
  },
  eventLandingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  eventLandingBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
  },
  eventFeePill: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 2,
  },
  eventFeePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  eventBody: {
    padding: 14,
    gap: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 22,
  },
  eventMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  eventMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    maxWidth: '100%',
  },
  eventMetaChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  eventDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  eventCtaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  eventCtaBarText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0D9488',
    flex: 1,
  },
  eventSpeakersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventSpeakersPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  eventSpeakersPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  eventActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  eventActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#E6F4F1',
  },
  eventActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0A5554',
  },
  eventActionBtnEdit: {
    backgroundColor: '#E0F2FE',
  },
  eventActionBtnDelete: {
    backgroundColor: '#FEE2E2',
  },
  // Event details view modal
  eventChecklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  eventChecklistText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
    flex: 1,
  },
  eventSpeakerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  eventSpeakerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventSpeakerName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  eventSpeakerRole: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  // Dynamic list builders (benefits, highlights, audience, speakers)
  dynamicListAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#E6F4F1',
  },
  dynamicListAddBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0A5554',
  },
  dynamicListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dynamicListRemoveBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
  },
  dynamicSpeakerBox: {
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    gap: 6,
  },
  dynamicSpeakerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  dynamicSpeakerTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0A5554',
  },
  // Additional utility and tab styles
  blogActionBtnTextArchive: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: '700',
  },
  blogActionBtnTextPublish: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0A5554',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 14,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  memberFilterTabsScroll: {
    marginBottom: 12,
  },
  memberFilterTabsContent: {
    gap: 8,
  },
  paginationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  paginationInfo: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  programCategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  programCategoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  searchClearBtn: {
    padding: 4,
  },
  statsEmptyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statsLoadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    gap: 10,
  },
  statsLoadingText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  statsRefreshBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

