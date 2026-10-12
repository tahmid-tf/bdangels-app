import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radii, Shadows } from '../constants/theme';
import { initAuth, logoutUser } from '../services/auth';
import AdminSidebar from '../components/admin/AdminSidebar';
import {
  fetchAdminDashboard,
  fetchAdminMembers,
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
  fetchPublicationsPageData,
  fetchTeamPageData,
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
      return 'Featured Portfolios';
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
  const [cmsData, setCmsData] = useState(null);
  const [cmsLoading, setCmsLoading] = useState(false);

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
    async (token = authToken, search = memberSearch, status = memberStatusFilter, page = 1) => {
      if (!token) return;
      setMembersLoading(true);
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
        setMembersLoading(false);
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

  // Handle Tab / Sidebar View Selection
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'notifications') {
      loadNotifications(authToken);
    } else if (tab === 'members') {
      if (members.length === 0) loadMembers(authToken);
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
    } else if (
      [
        'blogs',
        'publications',
        'landing-stats',
        'landing-programs',
        'homepage-portfolios',
        'team-about',
        'events',
        'startup-services',
        'team-members',
      ].includes(tab)
    ) {
      if (!cmsData) loadCmsData();
    }
  };

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard(authToken);
    await loadNotifications(authToken);
    if (activeTab === 'members') await loadMembers(authToken);
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
        'blogs',
        'publications',
        'landing-stats',
        'landing-programs',
        'homepage-portfolios',
        'team-about',
        'events',
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
                Alert.alert('Success', res.message || `${memberName} has been approved.`);
                // Update local state immediately
                setMembers((prev) =>
                  prev.map((m) => (m.id === userId ? { ...m, is_approved: true } : m))
                );
                loadMembers(authToken, memberSearch, memberStatusFilter, memberPagination.currentPage);
                // Also update dashboard data if loaded
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
                Alert.alert('Success', res.message || 'Member email marked as verified.');
                setMembers((prev) =>
                  prev.map((m) => (m.id === userId ? { ...m, is_email_verified: true } : m))
                );
                loadMembers(authToken, memberSearch, memberStatusFilter, memberPagination.currentPage);
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
    setUpdatingTierUserId(memberId);
    setTierModalVisible(false);
    try {
      const res = await updateAdminMemberStatus(authToken, memberId, { account_status: newTier });
      if (res.ok) {
        setMembers((prev) =>
          prev.map((m) => (m.id === memberId ? { ...m, account_status: newTier, tier_name: newTier } : m))
        );
        loadMembers(authToken, memberSearch, memberStatusFilter, memberPagination.currentPage);
      } else {
        Alert.alert('Update Failed', res.message || 'Could not update status tier.');
      }
    } catch (err) {
      console.log('Error updating tier:', err);
      Alert.alert('Error', 'An unexpected error occurred while updating status tier.');
    } finally {
      setUpdatingTierUserId(null);
      setSelectedMemberForTier(null);
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
        setMembers((prev) =>
          prev.map((m) => (m.id === memberId ? { ...m, status: targetMode, is_active: targetMode === 'active' } : m))
        );
        setModeModalVisible(false);
        loadMembers(authToken, memberSearch, memberStatusFilter, memberPagination.currentPage);
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
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
        setMemberPagination((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));
        setDeleteModalVisible(false);
        Alert.alert('Member Removed', 'The member has been deleted successfully.');
        loadMembers(authToken, memberSearch, memberStatusFilter, memberPagination.currentPage);
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
        Alert.alert('Success', 'Member details updated successfully.');
        setEditModalVisible(false);
        setEditingMember(null);
        loadMembers(authToken, memberSearch, memberStatusFilter, memberPagination.currentPage);
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
                    onPress={() => handleTabChange('members')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="person-add-outline" size={15} color="#FFFFFF" />
                    <Text style={styles.quickActionBtnPrimaryText}>Manage Members</Text>
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
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionHeading}>Member Management</Text>
                  <Text style={styles.sectionSubheading}>
                    {memberPagination.total > 0
                      ? `Showing ${memberPagination.from}–${memberPagination.to} of ${memberPagination.total} members`
                      : 'Directory of angel investors, access tiers & statuses'}
                  </Text>
                </View>
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
              {membersLoading ? (
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
                </View>
              ) : (
                <View style={styles.cardsList}>
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

          {/* TAB: BLOGS */}
          {activeTab === 'blogs' && (
            <View style={styles.tabContent}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionHeading}>Editorial Blogs</Text>
                  <Text style={styles.sectionSubheading}>Ecosystem insights, market analysis, and guides</Text>
                </View>
                <TouchableOpacity style={styles.refreshIconBtn} onPress={loadCmsData}>
                  <Ionicons name="refresh" size={18} color={Colors.forest} />
                </TouchableOpacity>
              </View>

              {cmsLoading ? (
                <View style={styles.listLoadingBox}>
                  <ActivityIndicator size="small" color={Colors.forest} />
                  <Text style={styles.loadingText}>Fetching blogs...</Text>
                </View>
              ) : (
                <View style={styles.cardsList}>
                  {(cmsData?.blogs?.blogs?.data || [
                    {
                      id: 7,
                      title: 'Bangladesh Makes It Easier for Foreign Investors to Repatriate',
                      author_name: 'Nadim Abrar',
                      category: 'Educational',
                      excerpt: 'Analysis of Bangladesh Bank FEID Circular No. 01 on transfer of shares.',
                    },
                  ]).map((blog, idx) => (
                    <View key={`blog-${blog.id || idx}`} style={styles.cmsCard}>
                      <View style={styles.cmsCardHeader}>
                        <View style={styles.metaPill}>
                          <Text style={styles.metaPillText}>{blog.category || 'Article'}</Text>
                        </View>
                        <Text style={styles.cmsCardAuthor}>By {blog.author_name || 'BAN Team'}</Text>
                      </View>
                      <Text style={styles.cmsCardTitle}>{blog.title}</Text>
                      <Text style={styles.cmsCardDesc} numberOfLines={2}>
                        {blog.excerpt || 'Insightful publication from the BAN investment desk.'}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* TAB: PUBLICATIONS */}
          {activeTab === 'publications' && (
            <View style={styles.tabContent}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionHeading}>Research Publications</Text>
                  <Text style={styles.sectionSubheading}>Whitepapers, legal guides, and ecosystem reports</Text>
                </View>
                <TouchableOpacity style={styles.refreshIconBtn} onPress={loadCmsData}>
                  <Ionicons name="refresh" size={18} color={Colors.forest} />
                </TouchableOpacity>
              </View>

              <View style={styles.cardsList}>
                {(cmsData?.publications?.publications?.data || [
                  {
                    id: 1,
                    title: 'Bangladesh Startup Ecosystem Report 2024–2025',
                    category: 'Market Research',
                    excerpt: 'Comprehensive data on seed funding, deal sizes, active sectors, and exit horizons.',
                  },
                  {
                    id: 2,
                    title: 'Angel Investing in Bangladesh: A Legal & Regulatory Handbook',
                    category: 'Legal Guide',
                    excerpt: 'RJSC filings, foreign currency remittances, SPV formations, and investor rights.',
                  },
                ]).map((pub, idx) => (
                  <View key={`pub-${pub.id || idx}`} style={styles.cmsCard}>
                    <View style={styles.cmsCardHeader}>
                      <View style={styles.metaPill}>
                        <Text style={styles.metaPillText}>{pub.category || 'Research'}</Text>
                      </View>
                      <Ionicons name="document-text-outline" size={18} color={Colors.forest} />
                    </View>
                    <Text style={styles.cmsCardTitle}>{pub.title}</Text>
                    <Text style={styles.cmsCardDesc}>{pub.excerpt}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAB: HOMEPAGE STATS */}
          {activeTab === 'landing-stats' && (
            <View style={styles.tabContent}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionHeading}>Homepage Statistics</Text>
                  <Text style={styles.sectionSubheading}>Key ecosystem numbers shown on landing screen</Text>
                </View>
                <TouchableOpacity style={styles.refreshIconBtn} onPress={loadCmsData}>
                  <Ionicons name="refresh" size={18} color={Colors.forest} />
                </TouchableOpacity>
              </View>

              <View style={styles.statsGrid}>
                {[
                  { value: '500+', label: 'Angel Investors in Community' },
                  { value: '$11.5M+', label: 'Capital Facilitated & Invested' },
                  { value: '54+', label: 'Active Portfolio Startups' },
                ].map((stat, idx) => (
                  <View key={`stat-${idx}`} style={styles.statBox}>
                    <Text style={styles.statBoxVal}>{stat.value}</Text>
                    <Text style={styles.statBoxLbl}>{stat.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAB: HOMEPAGE PROGRAMS */}
          {activeTab === 'landing-programs' && (
            <View style={styles.tabContent}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionHeading}>Homepage Programs</Text>
                  <Text style={styles.sectionSubheading}>Flagship initiatives and educational cohorts</Text>
                </View>
              </View>

              <View style={styles.cardsList}>
                {[
                  {
                    title: 'BWIN',
                    badge: 'Initiative',
                    desc: 'Building a more diverse pipeline of female investors and entrepreneurs across Bangladesh.',
                  },
                  {
                    title: 'Angel Academy',
                    badge: 'Education',
                    desc: 'Practical masterclasses for aspiring and active angels—from first principles to syndicate committee.',
                  },
                ].map((prog, idx) => (
                  <View key={`prog-${idx}`} style={styles.cmsCard}>
                    <View style={styles.cmsCardHeader}>
                      <View style={styles.metaPill}>
                        <Text style={styles.metaPillText}>{prog.badge}</Text>
                      </View>
                      <Ionicons name="school" size={18} color={Colors.forest} />
                    </View>
                    <Text style={styles.cmsCardTitle}>{prog.title}</Text>
                    <Text style={styles.cmsCardDesc}>{prog.desc}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAB: HOMEPAGE PORTFOLIOS */}
          {activeTab === 'homepage-portfolios' && (
            <View style={styles.tabContent}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionHeading}>Featured Portfolios</Text>
                  <Text style={styles.sectionSubheading}>Companies highlighted in the public showcase</Text>
                </View>
              </View>

              <View style={styles.cardsList}>
                {deals.slice(0, 6).map((deal, idx) => (
                  <View key={`hp-deal-${deal.id || idx}`} style={styles.cmsCard}>
                    <Text style={styles.cmsCardTitle}>{deal.title || deal.company_name}</Text>
                    <Text style={styles.cmsCardDesc}>
                      {deal.sector || 'Technology'} • Stage: {deal.stage || 'Seed'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAB: TEAM ABOUT */}
          {activeTab === 'team-about' && (
            <View style={styles.tabContent}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionHeading}>Team About Section</Text>
                  <Text style={styles.sectionSubheading}>Mission, overview body, and branding badge</Text>
                </View>
              </View>

              <View style={styles.cmsCard}>
                <Text style={styles.eyebrow}>ABOUT BANGLADESH ANGELS</Text>
                <Text style={styles.cmsCardTitle}>Capital. Community. Conviction.</Text>
                <Text style={styles.cmsCardDesc}>
                  BAN is the country’s first and largest angel-investing platform, connecting visionary entrepreneurs with seasoned investors and fostering an ecosystem that drives innovation and economic growth.
                </Text>
              </View>
            </View>
          )}

          {/* TAB: EVENTS */}
          {activeTab === 'events' && (
            <View style={styles.tabContent}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionHeading}>Community Events</Text>
                  <Text style={styles.sectionSubheading}>Upcoming and featured investor showcases</Text>
                </View>
              </View>

              <View style={styles.cmsCard}>
                <View style={styles.cmsCardHeader}>
                  <View style={styles.metaPill}>
                    <Text style={styles.metaPillText}>Showcase</Text>
                  </View>
                  <Ionicons name="calendar-outline" size={18} color={Colors.forest} />
                </View>
                <Text style={styles.cmsCardTitle}>BAN Virtual Showcase</Text>
                <Text style={styles.cmsCardDesc}>
                  Monthly virtual showcase bringing curated high-potential startups to pitch directly to active angels.
                </Text>
              </View>
            </View>
          )}

          {/* TAB: STARTUP SERVICES */}
          {activeTab === 'startup-services' && (
            <View style={styles.tabContent}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionHeading}>Startup Services</Text>
                  <Text style={styles.sectionSubheading}>Value-add advisory for portfolio companies</Text>
                </View>
              </View>

              <View style={styles.cardsList}>
                {[
                  { title: 'Founder Readiness Advisory', desc: 'Financial modeling, valuation review, and pitch sharpening.' },
                  { title: 'Legal & Structuring Advisory', desc: 'Term sheet review, cap table clean up, and cross-border holding setups.' },
                  { title: 'DeckVue Due Diligence', desc: 'AI-assisted pitch deck analysis and instant market intel enrichment.' },
                ].map((s, idx) => (
                  <View key={`serv-${idx}`} style={styles.cmsCard}>
                    <Text style={styles.cmsCardTitle}>{s.title}</Text>
                    <Text style={styles.cmsCardDesc}>{s.desc}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAB: TEAM DIRECTORY */}
          {activeTab === 'team-members' && (
            <View style={styles.tabContent}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionHeading}>Team Directory</Text>
                  <Text style={styles.sectionSubheading}>Management team and governing board</Text>
                </View>
                <TouchableOpacity style={styles.refreshIconBtn} onPress={loadCmsData}>
                  <Ionicons name="refresh" size={18} color={Colors.forest} />
                </TouchableOpacity>
              </View>

              <View style={styles.cardsList}>
                {(cmsData?.team?.management || [
                  { name: 'Nirjhor Rahman', title: 'Chief Executive Officer' },
                  { name: 'Sajid Rahman', title: 'Investment Advisor' },
                  { name: 'Tahmid Ferdous', title: 'Tech Analyst & Developer' },
                ]).map((tm, idx) => (
                  <View key={`tm-${idx}`} style={styles.memberCard}>
                    <View style={styles.memberCardTop}>
                      <View style={styles.avatarCircleLarge}>
                        <Text style={styles.avatarTextLarge}>{tm.name.charAt(0)}</Text>
                      </View>
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{tm.name}</Text>
                        <Text style={styles.memberEmail}>{tm.title}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
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
  cardsList: {
    gap: 12,
  },
  listLoadingBox: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
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
  dealDateText: {
    fontSize: 11,
    color: Colors.muted,
    alignSelf: 'center',
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
});
