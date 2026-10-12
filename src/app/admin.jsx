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
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radii, Shadows } from '../constants/theme';
import { initAuth, logoutUser } from '../services/auth';
import {
  fetchAdminDashboard,
  fetchAdminMembers,
  approveAdminMember,
  fetchAdminDeals,
  fetchAdminFounderPitches,
  fetchAdminAngelAcademy,
} from '../services/api';

export default function AdminScreen() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'members' | 'deals' | 'submissions'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Dashboard Data
  const [dashboardData, setDashboardData] = useState(null);

  // Members Tab State
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberStatusFilter, setMemberStatusFilter] = useState('all'); // 'all' | 'active' | 'pending_approval'
  const [approvingUserId, setApprovingUserId] = useState(null);

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
    }
    checkAuth();
  }, [loadDashboard]);

  // Fetch Members
  const loadMembers = useCallback(async (token = authToken, search = memberSearch, status = memberStatusFilter) => {
    if (!token) return;
    setMembersLoading(true);
    try {
      const filterStatus = status === 'all' ? '' : status;
      const res = await fetchAdminMembers(token, { search, status: filterStatus, per_page: 50 });
      const list = res?.data || (Array.isArray(res) ? res : []);
      setMembers(list);
    } catch (err) {
      console.log('Error loading members:', err);
    } finally {
      setMembersLoading(false);
    }
  }, [authToken, memberSearch, memberStatusFilter]);

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

  // Handle Tab Change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'members' && members.length === 0) {
      loadMembers(authToken);
    } else if (tab === 'deals' && deals.length === 0) {
      loadDeals(authToken);
    } else if (tab === 'submissions' && founderPitches.length === 0) {
      loadSubmissions(authToken);
    }
  };

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard(authToken);
    if (activeTab === 'members') await loadMembers(authToken);
    if (activeTab === 'deals') await loadDeals(authToken);
    if (activeTab === 'submissions') await loadSubmissions(authToken);
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
                  prev.map((m) => (m.id === userId ? { ...m, is_approved: true, account_status: 'active' } : m))
                );
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

      {/* Admin Top Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/')}
            accessibilityLabel="Return to public app"
          >
            <Ionicons name="arrow-back" size={20} color={Colors.ink} />
          </TouchableOpacity>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>ADMIN</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={onRefresh}
            accessibilityLabel="Refresh admin data"
          >
            <Ionicons name="refresh-outline" size={20} color={Colors.ink} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerIconBtn, styles.logoutBtn]}
            onPress={handleLogout}
            accessibilityLabel="Sign out of admin"
          >
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation Tabs Bar */}
      <View style={styles.tabsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'overview' && styles.tabItemActive]}
            onPress={() => handleTabChange('overview')}
          >
            <Ionicons
              name={activeTab === 'overview' ? 'grid' : 'grid-outline'}
              size={16}
              color={activeTab === 'overview' ? '#FFFFFF' : Colors.muted}
            />
            <Text style={[styles.tabLabel, activeTab === 'overview' && styles.tabLabelActive]}>Overview</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'members' && styles.tabItemActive]}
            onPress={() => handleTabChange('members')}
          >
            <Ionicons
              name={activeTab === 'members' ? 'people' : 'people-outline'}
              size={16}
              color={activeTab === 'members' ? '#FFFFFF' : Colors.muted}
            />
            <Text style={[styles.tabLabel, activeTab === 'members' && styles.tabLabelActive]}>Members</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'deals' && styles.tabItemActive]}
            onPress={() => handleTabChange('deals')}
          >
            <Ionicons
              name={activeTab === 'deals' ? 'briefcase' : 'briefcase-outline'}
              size={16}
              color={activeTab === 'deals' ? '#FFFFFF' : Colors.muted}
            />
            <Text style={[styles.tabLabel, activeTab === 'deals' && styles.tabLabelActive]}>Deals</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'submissions' && styles.tabItemActive]}
            onPress={() => handleTabChange('submissions')}
          >
            <Ionicons
              name={activeTab === 'submissions' ? 'document-text' : 'document-text-outline'}
              size={16}
              color={activeTab === 'submissions' ? '#FFFFFF' : Colors.muted}
            />
            <Text style={[styles.tabLabel, activeTab === 'submissions' && styles.tabLabelActive]}>Submissions</Text>
          </TouchableOpacity>
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

          {/* TAB 2: MEMBERS */}
          {activeTab === 'members' && (
            <View style={styles.tabContent}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionHeading}>Member Management</Text>
                  <Text style={styles.sectionSubheading}>Manage angel investors and account access</Text>
                </View>
                <TouchableOpacity
                  style={styles.refreshIconBtn}
                  onPress={() => loadMembers(authToken, memberSearch, memberStatusFilter)}
                >
                  <Ionicons name="refresh" size={18} color={Colors.forest} />
                </TouchableOpacity>
              </View>

              {/* Search Box */}
              <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color={Colors.muted} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by name, email, or phone..."
                  placeholderTextColor={Colors.mutedLight}
                  value={memberSearch}
                  onChangeText={(val) => {
                    setMemberSearch(val);
                    loadMembers(authToken, val, memberStatusFilter);
                  }}
                  autoCapitalize="none"
                  returnKeyType="search"
                />
                {memberSearch.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setMemberSearch('');
                      loadMembers(authToken, '', memberStatusFilter);
                    }}
                  >
                    <Ionicons name="close-circle" size={18} color={Colors.muted} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Filter Chips */}
              <View style={styles.filterChipsRow}>
                <TouchableOpacity
                  style={[styles.filterChip, memberStatusFilter === 'all' && styles.filterChipActive]}
                  onPress={() => {
                    setMemberStatusFilter('all');
                    loadMembers(authToken, memberSearch, 'all');
                  }}
                >
                  <Text style={[styles.filterChipText, memberStatusFilter === 'all' && styles.filterChipTextActive]}>
                    All
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.filterChip, memberStatusFilter === 'active' && styles.filterChipActive]}
                  onPress={() => {
                    setMemberStatusFilter('active');
                    loadMembers(authToken, memberSearch, 'active');
                  }}
                >
                  <Text style={[styles.filterChipText, memberStatusFilter === 'active' && styles.filterChipTextActive]}>
                    Active
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.filterChip, memberStatusFilter === 'pending_approval' && styles.filterChipActive]}
                  onPress={() => {
                    setMemberStatusFilter('pending_approval');
                    loadMembers(authToken, memberSearch, 'pending_approval');
                  }}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      memberStatusFilter === 'pending_approval' && styles.filterChipTextActive,
                    ]}
                  >
                    Pending Approval
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Members List */}
              {membersLoading ? (
                <View style={styles.listLoadingBox}>
                  <ActivityIndicator size="small" color={Colors.forest} />
                  <Text style={styles.loadingText}>Fetching members...</Text>
                </View>
              ) : members.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={40} color={Colors.mutedLight} />
                  <Text style={styles.emptyTitle}>No members found</Text>
                  <Text style={styles.emptyText}>Try adjusting your search query or status filter.</Text>
                </View>
              ) : (
                <View style={styles.cardsList}>
                  {members.map((member) => {
                    const isApproved = Boolean(member.is_approved);
                    const isApproving = approvingUserId === member.id;
                    const joinedDate = member.created_at
                      ? new Date(member.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'N/A';

                    return (
                      <View key={`member-${member.id}`} style={styles.memberCard}>
                        <View style={styles.memberCardTop}>
                          <View style={styles.avatarCircleLarge}>
                            <Text style={styles.avatarTextLarge}>
                              {(member.name || 'U').charAt(0).toUpperCase()}
                            </Text>
                          </View>
                          <View style={styles.memberInfo}>
                            <View style={styles.memberTitleRow}>
                              <Text style={styles.memberName}>{member.name}</Text>
                              {member.role === 'admin' && (
                                <View style={styles.adminRolePill}>
                                  <Text style={styles.adminRolePillText}>ADMIN</Text>
                                </View>
                              )}
                            </View>
                            <Text style={styles.memberEmail}>{member.email}</Text>
                            {Boolean(member.phone) && (
                              <Text style={styles.memberPhone}>📞 {member.phone}</Text>
                            )}
                          </View>
                        </View>

                        <View style={styles.memberCardFooter}>
                          <View style={styles.badgesRow}>
                            <View
                              style={[
                                styles.statusBadge,
                                isApproved ? styles.statusCompleted : styles.statusWarning,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.statusBadgeText,
                                  isApproved ? styles.statusCompletedText : styles.statusWarningText,
                                ]}
                              >
                                {isApproved ? 'Approved' : 'Pending'}
                              </Text>
                            </View>

                            <View style={styles.tierBadge}>
                              <Text style={styles.tierBadgeText}>
                                {String(member.account_status || 'free').toUpperCase()}
                              </Text>
                            </View>

                            <Text style={styles.memberJoined}>Joined {joinedDate}</Text>
                          </View>

                          {!isApproved && (
                            <TouchableOpacity
                              style={styles.approveButton}
                              onPress={() => handleApproveMember(member.id, member.name)}
                              disabled={isApproving}
                              activeOpacity={0.8}
                            >
                              {isApproving ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                              ) : (
                                <>
                                  <Ionicons name="checkmark-circle-outline" size={15} color="#FFFFFF" />
                                  <Text style={styles.approveButtonText}>Approve</Text>
                                </>
                              )}
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    );
                  })}
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

          {/* TAB 4: SUBMISSIONS */}
          {activeTab === 'submissions' && (
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
        </ScrollView>
      )}
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
    gap: 10,
  },
  backButton: {
    padding: 6,
    borderRadius: Radii.sm,
    backgroundColor: Colors.cream,
  },
  logo: {
    width: 110,
    height: 32,
  },
  adminBadge: {
    backgroundColor: '#0F7359',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.sm,
  },
  adminBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    padding: 8,
    borderRadius: Radii.sm,
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
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radii.pill,
    backgroundColor: Colors.bgLight,
  },
  tabItemActive: {
    backgroundColor: '#0A5554',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ink,
  },
  tabLabelActive: {
    color: '#FFFFFF',
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
});
