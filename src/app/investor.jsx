import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Image,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchInvestorDashboard,
  fetchInvestorInvestments,
  fetchInvestorPortfolioInvestments,
  fetchInvestorOrders,
  fetchPublicDeals,
  updateInvestorProfile,
  updateInvestorPassword,
} from '../services/api';
import { authState, logoutUser } from '../services/auth';
import { Colors, Radii, Shadows } from '../constants/theme';
import InvestorSidebar from '../components/investor/InvestorSidebar';
import DealDetailModal from '../components/modals/DealDetailModal';
import FooterSection from '../components/home/FooterSection';

export default function InvestorScreen() {
  const [user, setUser] = useState(() => authState.getUser());
  const [token, setToken] = useState(() => authState.getToken());

  const [loading, setLoading] = useState(() => Boolean(authState.getToken()));
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Active View: 'overview' | 'investments' | 'portfolio' | 'deals' | 'orders' | 'profile'
  const [activeView, setActiveView] = useState('overview');

  // Dashboard Overview Data
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [startupAllocation, setStartupAllocation] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // Detailed views data
  const [investments, setInvestments] = useState([]);
  const [portfolioCompanies, setPortfolioCompanies] = useState([]);
  const [deals, setDeals] = useState([]);
  const [orders, setOrders] = useState([]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('All');
  const [selectedDeal, setSelectedDeal] = useState(null);

  // Profile Form State
  const [profileName, setProfileName] = useState(user?.name || '');
  const profileEmail = user?.email || '';
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileCompany, setProfileCompany] = useState(user?.company_name || '');
  const [profileDesignation, setProfileDesignation] = useState(user?.designation || '');
  const [profileExpertise, setProfileExpertise] = useState(user?.investment_expertise || 'intermediate');
  const [profileLinkedin, setProfileLinkedin] = useState(user?.linkedin || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Update State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const loadAllData = useCallback(async () => {
    const currentToken = authState.getToken();
    const currentUser = authState.getUser();
    setUser(currentUser);
    setToken(currentToken);

    if (!currentToken) {
      setLoading(false);
      return;
    }

    try {
      const [dashRes, investRes, portRes, dealsRes, ordersRes] = await Promise.allSettled([
        fetchInvestorDashboard(currentToken),
        fetchInvestorInvestments(currentToken),
        fetchInvestorPortfolioInvestments(currentToken),
        fetchPublicDeals(currentToken, { per_page: 20 }),
        fetchInvestorOrders(currentToken),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value.ok) {
        setSummary(dashRes.value.data?.summary || null);
        setChartData(dashRes.value.data?.chart || null);
        setStartupAllocation(dashRes.value.data?.startup_allocation || []);
        setRecentActivity(dashRes.value.data?.recent_activity || []);
      }

      if (investRes.status === 'fulfilled' && investRes.value?.data) {
        setInvestments(investRes.value.data || []);
      }

      if (portRes.status === 'fulfilled' && portRes.value?.data) {
        setPortfolioCompanies(portRes.value.data || []);
      }

      if (dealsRes.status === 'fulfilled' && dealsRes.value?.deals) {
        setDeals(dealsRes.value.deals || []);
      }

      if (ordersRes.status === 'fulfilled' && ordersRes.value?.data) {
        setOrders(ordersRes.value.data || []);
      }
    } catch (err) {
      console.log('Investor data load notice:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const currentToken = authState.getToken();

    if (!currentToken) {
      return () => {
        isMounted = false;
      };
    }

    Promise.allSettled([
      fetchInvestorDashboard(currentToken),
      fetchInvestorInvestments(currentToken),
      fetchInvestorPortfolioInvestments(currentToken),
      fetchPublicDeals(currentToken, { per_page: 20 }),
      fetchInvestorOrders(currentToken),
    ]).then(([dashRes, investRes, portRes, dealsRes, ordersRes]) => {
      if (!isMounted) return;

      if (dashRes.status === 'fulfilled' && dashRes.value.ok) {
        setSummary(dashRes.value.data?.summary || null);
        setChartData(dashRes.value.data?.chart || null);
        setStartupAllocation(dashRes.value.data?.startup_allocation || []);
        setRecentActivity(dashRes.value.data?.recent_activity || []);
      }

      if (investRes.status === 'fulfilled' && investRes.value?.data) {
        setInvestments(investRes.value.data || []);
      }

      if (portRes.status === 'fulfilled' && portRes.value?.data) {
        setPortfolioCompanies(portRes.value.data || []);
      }

      if (dealsRes.status === 'fulfilled' && dealsRes.value?.deals) {
        setDeals(dealsRes.value.deals || []);
      }

      if (ordersRes.status === 'fulfilled' && ordersRes.value?.data) {
        setOrders(ordersRes.value.data || []);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await logoutUser();
    router.replace('/');
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      Alert.alert('Required', 'Please enter your full name.');
      return;
    }
    setSavingProfile(true);
    const res = await updateInvestorProfile(token, {
      name: profileName.trim(),
      email: profileEmail.trim(),
      phone: profilePhone.trim(),
      company_name: profileCompany.trim(),
      designation: profileDesignation.trim(),
      investment_expertise: profileExpertise,
      linkedin: profileLinkedin.trim(),
    });
    setSavingProfile(false);
    if (res.ok) {
      if (res.data) {
        setUser((prev) => ({ ...prev, ...res.data }));
      }
      Alert.alert('Success', 'Profile settings updated successfully.');
    } else {
      Alert.alert('Update Notice', res.message || 'Could not update profile.');
    }
  };

  const handleSavePassword = async () => {
    if (!currentPassword) {
      Alert.alert('Required', 'Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Validation', 'New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Validation', 'New passwords do not match.');
      return;
    }
    setSavingPassword(true);
    const res = await updateInvestorPassword(token, {
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: confirmPassword,
    });
    setSavingPassword(false);
    if (res.ok) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Your password has been changed successfully.');
    } else {
      Alert.alert('Notice', res.message || 'Could not update password.');
    }
  };

  // Filtered investments for Personal Ledger
  const filteredInvestments = useMemo(() => {
    return investments.filter((item) => {
      const name = item.deal?.title || item.deal_name || item.title || item.company_name || '';
      const currency = item.currency || 'USD';
      const matchesSearch = !searchQuery || name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCurr = currencyFilter === 'All' || currency.toUpperCase() === currencyFilter.toUpperCase();
      return matchesSearch && matchesCurr;
    });
  }, [investments, searchQuery, currencyFilter]);

  // If unauthenticated, show sign-in prompt
  if (!token || !user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.menuToggle}
            onPress={() => router.push('/')}
            accessibilityLabel="Back to home"
          >
            <Ionicons name="arrow-back" size={22} color={Colors.ink} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>INVESTOR DASHBOARD</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.authPromptContainer}>
          <View style={styles.authPromptCard}>
            <View style={styles.authPromptIconBox}>
              <Ionicons name="lock-closed" size={32} color={Colors.forest} />
            </View>
            <Text style={styles.authPromptTitle}>Investor Workspace</Text>
            <Text style={styles.authPromptSubtitle}>
              Please sign in with your angel investor account to access your private portfolio workspace,
              completed investments ledger, and active deal flow.
            </Text>

            <TouchableOpacity
              style={styles.authPromptButton}
              activeOpacity={0.88}
              onPress={() => router.push('/login')}
            >
              <Text style={styles.authPromptButtonText}>Sign In to Workspace</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.authPromptSecondaryButton}
              activeOpacity={0.88}
              onPress={() => router.push('/register')}
            >
              <Text style={styles.authPromptSecondaryButtonText}>Apply as Angel Investor</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const currentDateFormatted = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const firstName = (user.name || 'Member').split(' ')[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Investor Panel Topbar with Hamburger Menu Toggle */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.menuToggle}
          onPress={() => setSidebarVisible(true)}
          accessibilityLabel="Open investor sidebar navigation"
          activeOpacity={0.8}
        >
          <Ionicons name="menu" size={24} color={Colors.ink} />
          <View style={styles.menuIndicatorDot} />
        </TouchableOpacity>

        <View style={styles.topBarCenter}>
          <Text style={styles.topBarGreeting} numberOfLines={1}>
            {activeView === 'overview'
              ? `Hi ${firstName},`
              : activeView === 'investments'
              ? 'My Investments'
              : activeView === 'portfolio'
              ? 'Portfolio Companies'
              : activeView === 'deals'
              ? 'Active Deals'
              : activeView === 'orders'
              ? 'Membership Receipts'
              : 'Profile Settings'}
          </Text>
          <Text style={styles.topBarSub}>
            {activeView === 'overview' ? 'Welcome back!' : 'Investor Workspace'}
          </Text>
        </View>

        {/* User profile avatar in topbar */}
        <TouchableOpacity
          style={styles.topBarAvatarWrap}
          activeOpacity={0.8}
          onPress={() => {
            setActiveView('profile');
          }}
          accessibilityLabel="Go to profile settings"
        >
          {user.profile_photo_url ? (
            <Image source={{ uri: user.profile_photo_url }} style={styles.topBarAvatar} />
          ) : (
            <View style={styles.topBarAvatarFallback}>
              <Text style={styles.topBarAvatarText}>
                {firstName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.green}
            colors={[Colors.green]}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={Colors.green} />
            <Text style={styles.loadingText}>Syncing your portfolio workspace...</Text>
          </View>
        ) : (
          <>
            {/* ======================================================== */}
            {/* VIEW 1: OVERVIEW DASHBOARD                               */}
            {/* ======================================================== */}
            {activeView === 'overview' && (
              <View style={styles.viewContent}>
                {/* Hero Banner Header */}
                <View style={styles.overviewHero}>
                  <View style={styles.overviewHeroLeft}>
                    <Text style={styles.eyebrow}>PRIVATE PORTFOLIO WORKSPACE</Text>
                    <Text style={styles.overviewTitle}>Welcome back, {firstName}.</Text>
                    <Text style={styles.overviewSubtitle}>
                      Track your completed investments and portfolio activity in one place.
                    </Text>
                  </View>

                  <View style={styles.overviewDateBadge}>
                    <Text style={styles.overviewDateLabel}>AS OF</Text>
                    <Text style={styles.overviewDateValue}>{currentDateFormatted}</Text>
                  </View>
                </View>

                {/* Key Metrics Grid */}
                <View style={styles.metricsGrid}>
                  {/* Primary Metric: Invested Value */}
                  <View style={[styles.metricCard, styles.metricCardPrimary]}>
                    <View style={styles.metricIconBoxPrimary}>
                      <Text style={styles.metricIconTextPrimary}>↗</Text>
                    </View>
                    <View style={styles.metricData}>
                      <Text style={styles.metricLabelPrimary}>INVESTED VALUE</Text>
                      {summary?.currency_totals && summary.currency_totals.length > 0 ? (
                        summary.currency_totals.map((tot, idx) => (
                          <Text key={tot.currency || idx} style={styles.metricValPrimary}>
                            {tot.currency || 'USD'}{' '}
                            {Number(tot.total || 0).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </Text>
                        ))
                      ) : (
                        <Text style={styles.metricValPrimary}>—</Text>
                      )}
                      <Text style={styles.metricNotePrimary}>Shown separately by currency</Text>
                    </View>
                  </View>

                  {/* Metric 2: Completed Investments */}
                  <View style={styles.metricCard}>
                    <View style={styles.metricIconBox}>
                      <Text style={styles.metricIconText}>#</Text>
                    </View>
                    <View style={styles.metricData}>
                      <Text style={styles.metricLabel}>INVESTMENTS</Text>
                      <Text style={styles.metricVal}>{summary?.total_investments || 0}</Text>
                      <Text style={styles.metricNote}>Completed transactions</Text>
                    </View>
                  </View>

                  {/* Metric 3: Backed Startups */}
                  <View style={styles.metricCard}>
                    <View style={styles.metricIconBox}>
                      <Text style={styles.metricIconText}>◇</Text>
                    </View>
                    <View style={styles.metricData}>
                      <Text style={styles.metricLabel}>STARTUPS</Text>
                      <Text style={styles.metricVal}>{summary?.startups_backed || 0}</Text>
                      <Text style={styles.metricNote}>Portfolio companies</Text>
                    </View>
                  </View>

                  {/* Metric 4: Latest Activity */}
                  <View style={styles.metricCard}>
                    <View style={styles.metricIconBox}>
                      <Text style={styles.metricIconText}>✓</Text>
                    </View>
                    <View style={styles.metricData}>
                      <Text style={styles.metricLabel}>LATEST ACTIVITY</Text>
                      <Text style={styles.metricValDate}>
                        {summary?.last_investment_date
                          ? new Date(summary.last_investment_date).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'No activity'}
                      </Text>
                      <Text style={styles.metricNote}>Last completion date</Text>
                    </View>
                  </View>
                </View>

                {/* Live Deal Flow Action Banner */}
                <View style={styles.dealsCtaCard}>
                  <View style={styles.dealsCtaCopy}>
                    <View style={styles.liveDealsBadge}>
                      <View style={styles.livePulseDot} />
                      <Text style={styles.liveDealsBadgeText}>
                        {summary?.active_deals_available || deals.length || '3'} DEALS OPEN
                      </Text>
                    </View>
                    <Text style={styles.dealsCtaTitle}>Ready to back the next high-growth venture?</Text>
                    <Text style={styles.dealsCtaDesc}>
                      Explore active syndicate opportunities screened by Bangladesh Angels Network.
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.dealsCtaBtn}
                    activeOpacity={0.85}
                    onPress={() => setActiveView('deals')}
                  >
                    <Text style={styles.dealsCtaBtnText}>Explore Live Deals</Text>
                    <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                {/* Capital Deployment Trend / Diversification Cards */}
                {chartData && chartData.datasets && chartData.datasets.length > 0 ? (
                  <View style={styles.analyticsSection}>
                    <View style={styles.analyticsCard}>
                      <View style={styles.analyticsHeader}>
                        <View>
                          <Text style={styles.eyebrow}>CAPITAL DEPLOYMENT</Text>
                          <Text style={styles.analyticsTitle}>Investment Trend</Text>
                        </View>
                        <Text style={styles.analyticsBadge}>12 MONTHS</Text>
                      </View>

                      <View style={styles.chartPillsWrap}>
                        {chartData.datasets.map((ds, idx) => (
                          <View key={ds.label || idx} style={styles.chartCurrencyPill}>
                            <View style={[styles.chartColorDot, { backgroundColor: idx === 0 ? '#15966F' : '#D7A348' }]} />
                            <Text style={styles.chartCurrencyText}>
                              {ds.label}: {ds.data?.reduce((a, b) => a + Number(b), 0).toLocaleString()}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {startupAllocation && startupAllocation.length > 0 && (
                      <View style={styles.analyticsCard}>
                        <View style={styles.analyticsHeader}>
                          <View>
                            <Text style={styles.eyebrow}>DIVERSIFICATION</Text>
                            <Text style={styles.analyticsTitle}>Startup Activity</Text>
                          </View>
                          <Text style={styles.analyticsBadge}>TRANSACTIONS</Text>
                        </View>

                        <View style={styles.allocationList}>
                          {startupAllocation.map((item, idx) => (
                            <View key={item.startup_name || idx} style={styles.allocationRow}>
                              <Text style={styles.allocationName} numberOfLines={1}>
                                {item.startup_name}
                              </Text>
                              <View style={styles.allocationBadge}>
                                <Text style={styles.allocationBadgeText}>
                                  {item.investment_count} {item.investment_count === 1 ? 'deal' : 'deals'}
                                </Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                ) : null}

                {/* Recent Activity / Personal Ledger Preview */}
                <View style={styles.ledgerPreviewSection}>
                  <View style={styles.ledgerHeaderRow}>
                    <View>
                      <Text style={styles.eyebrow}>PERSONAL LEDGER</Text>
                      <Text style={styles.sectionHeading}>Recent Transactions</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setActiveView('investments')}
                      style={styles.seeAllLedgerBtn}
                    >
                      <Text style={styles.seeAllLedgerText}>View full ledger</Text>
                      <Ionicons name="arrow-forward" size={13} color={Colors.green} />
                    </TouchableOpacity>
                  </View>

                  {recentActivity.length === 0 && investments.length === 0 ? (
                    <View style={styles.emptyLedgerBox}>
                      <View style={styles.emptyIconCircle}>
                        <Ionicons name="documents-outline" size={32} color={Colors.muted} />
                      </View>
                      <Text style={styles.emptyLedgerTitle}>Your investment dashboard is ready.</Text>
                      <Text style={styles.emptyLedgerSubtitle}>
                        Completed investments recorded by the Bangladesh Angels team will appear here
                        automatically, including currency-separated totals and portfolio charts.
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.ledgerList}>
                      {(recentActivity.length > 0 ? recentActivity : investments.slice(0, 4)).map((item, idx) => (
                        <View key={item.id || idx} style={styles.ledgerItemCard}>
                          <View style={styles.ledgerItemLeft}>
                            <View style={styles.ledgerAvatar}>
                              <Text style={styles.ledgerAvatarText}>
                                {(item.deal?.title || item.startup_name || 'BA').substring(0, 2).toUpperCase()}
                              </Text>
                            </View>
                            <View style={styles.ledgerItemInfo}>
                              <Text style={styles.ledgerItemTitle} numberOfLines={1}>
                                {item.deal?.title || item.startup_name || 'Portfolio Deal'}
                              </Text>
                              <Text style={styles.ledgerItemDate}>
                                {item.created_at || item.completed_at
                                  ? new Date(item.created_at || item.completed_at).toLocaleDateString('en-GB', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                    })
                                  : 'Completed'}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.ledgerItemRight}>
                            <View style={styles.statusBadgeCompleted}>
                              <Text style={styles.statusBadgeText}>COMPLETED</Text>
                            </View>
                            {item.amount ? (
                              <Text style={styles.ledgerAmountText}>
                                {item.currency || 'USD'} {Number(item.amount).toLocaleString()}
                              </Text>
                            ) : null}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* ======================================================== */}
            {/* VIEW 2: MY INVESTMENTS (PERSONAL LEDGER)                 */}
            {/* ======================================================== */}
            {activeView === 'investments' && (
              <View style={styles.viewContent}>
                <View style={styles.viewHeader}>
                  <Text style={styles.eyebrow}>PERSONAL LEDGER</Text>
                  <Text style={styles.sectionHeading}>My Investments</Text>
                  <Text style={styles.viewDesc}>
                    Complete historical record of deals you have committed or invested in.
                  </Text>
                </View>

                {/* Search & Currency Filter */}
                <View style={styles.filterBar}>
                  <View style={styles.searchBox}>
                    <Ionicons name="search" size={17} color={Colors.muted} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search deals, companies..."
                      placeholderTextColor="#9CA3AF"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      autoCapitalize="none"
                    />
                    {searchQuery ? (
                      <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={16} color={Colors.muted} />
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  <View style={styles.currencyPills}>
                    {['All', 'USD', 'BDT'].map((curr) => (
                      <TouchableOpacity
                        key={curr}
                        style={[styles.currPill, currencyFilter === curr && styles.currPillActive]}
                        onPress={() => setCurrencyFilter(curr)}
                      >
                        <Text style={[styles.currPillText, currencyFilter === curr && styles.currPillTextActive]}>
                          {curr}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Investments Table / Cards */}
                {filteredInvestments.length === 0 ? (
                  <View style={styles.emptyStateBox}>
                    <Ionicons name="wallet-outline" size={40} color={Colors.muted} />
                    <Text style={styles.emptyStateTitle}>No investments found</Text>
                    <Text style={styles.emptyStateSubtitle}>
                      {investments.length === 0
                        ? 'Completed investment records maintained by Bangladesh Angels will appear here.'
                        : 'No investment matches the current filter.'}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.investmentsList}>
                    {filteredInvestments.map((inv, idx) => {
                      const title = inv.deal?.title || inv.startup_name || inv.title || 'Investment';
                      return (
                        <View key={inv.id || idx} style={styles.investmentCard}>
                          <View style={styles.investmentCardHeader}>
                            <View style={styles.investmentTitleCol}>
                              <Text style={styles.investmentTitle}>{title}</Text>
                              <Text style={styles.investmentDate}>
                                {inv.completed_at || inv.created_at
                                  ? new Date(inv.completed_at || inv.created_at).toLocaleDateString('en-GB', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                    })
                                  : 'Recorded'}
                              </Text>
                            </View>
                            <View style={styles.statusBadgeCompleted}>
                              <Text style={styles.statusBadgeText}>
                                {inv.type?.toUpperCase() || 'INVESTED'}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.investmentCardDetails}>
                            {inv.amount ? (
                              <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Invested Amount:</Text>
                                <Text style={styles.detailValBold}>
                                  {inv.currency || 'USD'} {Number(inv.amount).toLocaleString()}
                                </Text>
                              </View>
                            ) : null}

                            {inv.deal?.sector ? (
                              <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Sector:</Text>
                                <Text style={styles.detailVal}>{inv.deal.sector}</Text>
                              </View>
                            ) : null}
                          </View>

                          {inv.deal ? (
                            <TouchableOpacity
                              style={styles.viewDealBtn}
                              onPress={() => setSelectedDeal(inv.deal)}
                            >
                              <Text style={styles.viewDealBtnText}>View Deal Details</Text>
                              <Ionicons name="arrow-forward" size={13} color={Colors.green} />
                            </TouchableOpacity>
                          ) : null}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

            {/* ======================================================== */}
            {/* VIEW 3: PORTFOLIO COMPANIES                              */}
            {/* ======================================================== */}
            {activeView === 'portfolio' && (
              <View style={styles.viewContent}>
                <View style={styles.viewHeader}>
                  <Text style={styles.eyebrow}>BACKED STARTUPS</Text>
                  <Text style={styles.sectionHeading}>Portfolio Companies</Text>
                  <Text style={styles.viewDesc}>
                    Companies backed by Bangladesh Angels Network community members.
                  </Text>
                </View>

                {portfolioCompanies.length === 0 ? (
                  <View style={styles.emptyStateBox}>
                    <Ionicons name="briefcase-outline" size={40} color={Colors.muted} />
                    <Text style={styles.emptyStateTitle}>No portfolio holdings yet</Text>
                    <Text style={styles.emptyStateSubtitle}>
                      Once deal closing documents are formalized, portfolio companies you back will appear here.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.portfolioGrid}>
                    {portfolioCompanies.map((item, idx) => (
                      <View key={item.id || idx} style={styles.portfolioCard}>
                        <View style={styles.portfolioCardTop}>
                          <View style={styles.portfolioAvatar}>
                            <Text style={styles.portfolioAvatarText}>
                              {(item.deal?.title || item.startup_name || 'CO').substring(0, 2).toUpperCase()}
                            </Text>
                          </View>
                          <View style={styles.portfolioSectorBadge}>
                            <Text style={styles.portfolioSectorText} numberOfLines={1}>
                              {item.deal?.sector || item.sector || 'Portfolio'}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.portfolioTitle}>
                          {item.deal?.title || item.startup_name || 'Portfolio Company'}
                        </Text>
                        <Text style={styles.portfolioDesc} numberOfLines={2}>
                          {item.deal?.description || item.description || 'Active holding in network portfolio.'}
                        </Text>

                        {item.deal ? (
                          <TouchableOpacity
                            style={styles.portfolioLink}
                            onPress={() => setSelectedDeal(item.deal)}
                          >
                            <Text style={styles.portfolioLinkText}>View Company Details</Text>
                            <Ionicons name="arrow-forward" size={12} color={Colors.green} />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* ======================================================== */}
            {/* VIEW 4: ACTIVE DEALS                                     */}
            {/* ======================================================== */}
            {activeView === 'deals' && (
              <View style={styles.viewContent}>
                <View style={styles.viewHeader}>
                  <Text style={styles.eyebrow}>SYNDICATE OPPORTUNITIES</Text>
                  <Text style={styles.sectionHeading}>Active Deals</Text>
                  <Text style={styles.viewDesc}>
                    Browse deals currently open for allocations, review, and member pledges.
                  </Text>
                </View>

                {deals.length === 0 ? (
                  <View style={styles.emptyStateBox}>
                    <Ionicons name="rocket-outline" size={40} color={Colors.muted} />
                    <Text style={styles.emptyStateTitle}>No active deals right now</Text>
                    <Text style={styles.emptyStateSubtitle}>
                      New cohorts and venture showcases are published regularly. Check back soon.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.dealsList}>
                    {deals.map((deal) => (
                      <View key={deal.id || deal.slug} style={styles.dealCard}>
                        <View style={styles.dealCardTop}>
                          <View style={styles.dealTitleWrap}>
                            <Text style={styles.dealTitle}>{deal.title}</Text>
                            <View style={styles.dealStageBadge}>
                              <Text style={styles.dealStageText}>
                                {deal.investment_stage || deal.type?.toUpperCase() || 'ACTIVE'}
                              </Text>
                            </View>
                          </View>
                          {deal.sector ? (
                            <View style={styles.dealSectorPill}>
                              <Text style={styles.dealSectorText}>{deal.sector}</Text>
                            </View>
                          ) : null}
                        </View>

                        {deal.description ? (
                          <Text style={styles.dealDesc} numberOfLines={3}>
                            {deal.description}
                          </Text>
                        ) : null}

                        <View style={styles.dealActions}>
                          <TouchableOpacity
                            style={styles.dealDetailsBtn}
                            onPress={() => setSelectedDeal(deal)}
                          >
                            <Text style={styles.dealDetailsBtnText}>View Memo & Deck</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.dealPledgeBtn}
                            onPress={() => router.push({ pathname: '/startups', params: { deal: deal.slug } })}
                          >
                            <Text style={styles.dealPledgeBtnText}>Commit</Text>
                            <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* ======================================================== */}
            {/* VIEW 5: MEMBERSHIP RECEIPTS                              */}
            {/* ======================================================== */}
            {activeView === 'orders' && (
              <View style={styles.viewContent}>
                <View style={styles.viewHeader}>
                  <Text style={styles.eyebrow}>ACCOUNT & BILLING</Text>
                  <Text style={styles.sectionHeading}>Membership Receipts</Text>
                  <Text style={styles.viewDesc}>
                    Invoices and payment receipts for your BAN membership subscriptions.
                  </Text>
                </View>

                {orders.length === 0 ? (
                  <View style={styles.emptyStateBox}>
                    <Ionicons name="receipt-outline" size={40} color={Colors.muted} />
                    <Text style={styles.emptyStateTitle}>No receipts found</Text>
                    <Text style={styles.emptyStateSubtitle}>
                      Official receipts for your subscription plan renewals will be recorded here.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.ordersList}>
                    {orders.map((ord, idx) => (
                      <View key={ord.id || ord.reference || idx} style={styles.orderCard}>
                        <View style={styles.orderCardTop}>
                          <View>
                            <Text style={styles.orderRef}>
                              {ord.reference || `ORDER #${ord.id}`}
                            </Text>
                            <Text style={styles.orderDate}>
                              {ord.created_at
                                ? new Date(ord.created_at).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : ''}
                            </Text>
                          </View>
                          <View style={styles.statusBadgeCompleted}>
                            <Text style={styles.statusBadgeText}>PAID</Text>
                          </View>
                        </View>

                        <View style={styles.orderCardBody}>
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Plan / Tier:</Text>
                            <Text style={styles.detailValBold}>
                              {ord.tier_name || ord.plan_name || 'Investor Membership'}
                            </Text>
                          </View>
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Amount Paid:</Text>
                            <Text style={styles.detailValBold}>
                              {ord.currency || 'USD'} {Number(ord.amount || ord.total || 0).toLocaleString()}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* ======================================================== */}
            {/* VIEW 6: PROFILE & SETTINGS                               */}
            {/* ======================================================== */}
            {activeView === 'profile' && (
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.viewContent}
              >
                <View style={styles.viewHeader}>
                  <Text style={styles.eyebrow}>INVESTOR SETTINGS</Text>
                  <Text style={styles.sectionHeading}>Profile & Preferences</Text>
                  <Text style={styles.viewDesc}>
                    Keep your professional profile and credentials updated for syndicate allocation review.
                  </Text>
                </View>

                {/* Profile Form Card */}
                <View style={styles.formCard}>
                  <Text style={styles.formSectionTitle}>Personal Information</Text>

                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>Full Name</Text>
                    <TextInput
                      style={styles.formInput}
                      value={profileName}
                      onChangeText={setProfileName}
                      placeholder="Your name"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <TextInput
                      style={[styles.formInput, styles.formInputDisabled]}
                      value={profileEmail}
                      editable={false}
                      placeholder="Your email"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>Phone Number</Text>
                    <TextInput
                      style={styles.formInput}
                      value={profilePhone}
                      onChangeText={setProfilePhone}
                      placeholder="+880 1..."
                      placeholderTextColor="#9CA3AF"
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Company</Text>
                      <TextInput
                        style={styles.formInput}
                        value={profileCompany}
                        onChangeText={setProfileCompany}
                        placeholder="Company name"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Designation</Text>
                      <TextInput
                        style={styles.formInput}
                        value={profileDesignation}
                        onChangeText={setProfileDesignation}
                        placeholder="e.g. Managing Director"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>LinkedIn Profile</Text>
                    <TextInput
                      style={styles.formInput}
                      value={profileLinkedin}
                      onChangeText={setProfileLinkedin}
                      placeholder="https://linkedin.com/in/..."
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>Investment Expertise</Text>
                    <View style={styles.expertisePillRow}>
                      {['beginner', 'intermediate', 'expert'].map((exp) => (
                        <TouchableOpacity
                          key={exp}
                          style={[
                            styles.expertisePill,
                            profileExpertise === exp && styles.expertisePillActive,
                          ]}
                          onPress={() => setProfileExpertise(exp)}
                        >
                          <Text
                            style={[
                              styles.expertisePillText,
                              profileExpertise === exp && styles.expertisePillTextActive,
                            ]}
                          >
                            {exp.charAt(0).toUpperCase() + exp.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={handleSaveProfile}
                    disabled={savingProfile}
                  >
                    {savingProfile ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Text style={styles.saveBtnText}>Save Profile Changes</Text>
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Password Update Card */}
                <View style={styles.formCard}>
                  <Text style={styles.formSectionTitle}>Security & Password</Text>

                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>Current Password</Text>
                    <TextInput
                      style={styles.formInput}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      placeholder="••••••••"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>New Password</Text>
                    <TextInput
                      style={styles.formInput}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder="At least 8 characters"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>Confirm New Password</Text>
                    <TextInput
                      style={styles.formInput}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Re-type new password"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.savePasswordBtn}
                    onPress={handleSavePassword}
                    disabled={savingPassword}
                  >
                    {savingPassword ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Text style={styles.saveBtnText}>Update Password</Text>
                        <Ionicons name="key-outline" size={16} color="#FFFFFF" />
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            )}

            {/* Subpage Footer */}
            <FooterSection />
          </>
        )}
      </ScrollView>

      {/* Slide-in Investor Sidebar Navigation */}
      <InvestorSidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        activeView={activeView}
        onSelectView={(view) => setActiveView(view)}
        currentUser={user}
        onLogout={handleLogout}
      />

      {/* Deal Detail Modal */}
      <DealDetailModal
        deal={selectedDeal}
        visible={Boolean(selectedDeal)}
        onClose={() => setSelectedDeal(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F4EF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F2F4EF',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(9, 47, 41, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 3,
  },
  menuToggle: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  menuIndicatorDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.green,
  },
  topBarCenter: {
    flex: 1,
    paddingHorizontal: 14,
  },
  topBarGreeting: {
    fontSize: 15,
    fontWeight: '800',
    color: '#173C35',
  },
  topBarSub: {
    fontSize: 11,
    color: '#7A8A85',
    fontWeight: '600',
  },
  topBarTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: 0.5,
  },
  topBarAvatarWrap: {
    padding: 2,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#70D9A9',
  },
  topBarAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  topBarAvatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#073D35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarAvatarText: {
    color: '#70D9A9',
    fontSize: 13,
    fontWeight: '800',
  },
  viewContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  loadingWrap: {
    paddingVertical: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 14,
    color: Colors.muted,
    fontSize: 13.5,
    fontWeight: '600',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.green,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  overviewHero: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(9, 47, 41, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  overviewHeroLeft: {
    marginBottom: 12,
  },
  overviewTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0A302A',
    lineHeight: 30,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  overviewSubtitle: {
    fontSize: 13,
    color: '#687B75',
    lineHeight: 18,
  },
  overviewDateBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F4F7F5',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  overviewDateLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#82918D',
    letterSpacing: 0.8,
  },
  overviewDateValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#244B43',
    marginTop: 1,
  },
  metricsGrid: {
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(9, 47, 41, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  metricCardPrimary: {
    backgroundColor: '#073D35',
    borderColor: 'transparent',
  },
  metricIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E3F5EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricIconText: {
    color: '#0B654F',
    fontSize: 16,
    fontWeight: '800',
  },
  metricIconBoxPrimary: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#70D9A9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricIconTextPrimary: {
    color: '#082F29',
    fontSize: 16,
    fontWeight: '800',
  },
  metricData: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7B8D87',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  metricLabelPrimary: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(233, 250, 242, 0.7)',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  metricVal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0D342E',
    letterSpacing: -0.5,
  },
  metricValPrimary: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  metricValDate: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0D342E',
  },
  metricNote: {
    fontSize: 11,
    color: '#8A9995',
    marginTop: 4,
  },
  metricNotePrimary: {
    fontSize: 11,
    color: 'rgba(233, 250, 242, 0.55)',
    marginTop: 4,
  },
  dealsCtaCard: {
    backgroundColor: '#0C5C4C',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#70D9A9',
  },
  dealsCtaCopy: {
    marginBottom: 14,
  },
  liveDealsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: Radii.pill,
    marginBottom: 8,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#70D9A9',
  },
  liveDealsBadgeText: {
    color: '#70D9A9',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  dealsCtaTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
    marginBottom: 4,
  },
  dealsCtaDesc: {
    color: 'rgba(238, 251, 245, 0.8)',
    fontSize: 12.5,
    lineHeight: 18,
  },
  dealsCtaBtn: {
    backgroundColor: '#15966F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Radii.pill,
    gap: 8,
  },
  dealsCtaBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  analyticsSection: {
    gap: 14,
    marginBottom: 16,
  },
  analyticsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(9, 47, 41, 0.08)',
  },
  analyticsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#123B33',
  },
  analyticsBadge: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#899792',
    letterSpacing: 0.8,
    backgroundColor: '#F3F4F6',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  chartPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chartCurrencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F9FAFB',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chartColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chartCurrencyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  allocationList: {
    gap: 8,
  },
  allocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  allocationName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    marginRight: 10,
  },
  allocationBadge: {
    backgroundColor: '#E8F5EE',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: Radii.pill,
  },
  allocationBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.green,
  },
  ledgerPreviewSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(9, 47, 41, 0.08)',
    marginBottom: 20,
  },
  ledgerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#123B33',
  },
  seeAllLedgerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  seeAllLedgerText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.green,
  },
  emptyLedgerBox: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyLedgerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#123B33',
    textAlign: 'center',
    marginBottom: 4,
  },
  emptyLedgerSubtitle: {
    fontSize: 12.5,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  ledgerList: {
    gap: 10,
  },
  ledgerItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  ledgerItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  ledgerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E6F4EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ledgerAvatarText: {
    color: Colors.green,
    fontWeight: '800',
    fontSize: 12,
  },
  ledgerItemInfo: {
    flex: 1,
  },
  ledgerItemTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#111827',
  },
  ledgerItemDate: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  ledgerItemRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadgeCompleted: {
    backgroundColor: '#DEF7EC',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: '#03543F',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  ledgerAmountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  viewHeader: {
    marginBottom: 16,
  },
  viewDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginTop: 4,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.ink,
  },
  currencyPills: {
    flexDirection: 'row',
    gap: 6,
  },
  currPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  currPillActive: {
    backgroundColor: '#073D35',
    borderColor: '#073D35',
  },
  currPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#374151',
  },
  currPillTextActive: {
    color: '#FFFFFF',
  },
  investmentsList: {
    gap: 12,
    marginBottom: 20,
  },
  investmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  investmentCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  investmentTitleCol: {
    flex: 1,
    marginRight: 10,
  },
  investmentTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  investmentDate: {
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 2,
  },
  investmentCardDetails: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    gap: 6,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  detailVal: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '600',
  },
  detailValBold: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#111827',
  },
  viewDealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
  },
  viewDealBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.green,
  },
  emptyStateBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  portfolioGrid: {
    gap: 12,
    marginBottom: 20,
  },
  portfolioCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  portfolioCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  portfolioAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  portfolioAvatarText: {
    color: Colors.green,
    fontSize: 14,
    fontWeight: '800',
  },
  portfolioSectorBadge: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radii.pill,
  },
  portfolioSectorText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  portfolioTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  portfolioDesc: {
    fontSize: 12.5,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  portfolioLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  portfolioLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.green,
  },
  dealsList: {
    gap: 14,
    marginBottom: 20,
  },
  dealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dealCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dealTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  dealTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  dealStageBadge: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  dealStageText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#92400E',
  },
  dealSectorPill: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: Radii.pill,
  },
  dealSectorText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#6B7280',
  },
  dealDesc: {
    fontSize: 12.5,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 12,
  },
  dealActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dealDetailsBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  dealDetailsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.ink,
  },
  dealPledgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Colors.green,
  },
  dealPledgeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ordersList: {
    gap: 12,
    marginBottom: 20,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  orderCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderRef: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  orderDate: {
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 2,
  },
  orderCardBody: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 14,
  },
  formGroup: {
    marginBottom: 12,
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: Colors.ink,
  },
  formInputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  expertisePillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  expertisePill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  expertisePillActive: {
    backgroundColor: '#073D35',
    borderColor: '#073D35',
  },
  expertisePillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#4B5563',
  },
  expertisePillTextActive: {
    color: '#FFFFFF',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.green,
    paddingVertical: 12,
    borderRadius: Radii.pill,
    marginTop: 8,
  },
  savePasswordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    borderRadius: Radii.pill,
    marginTop: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  authPromptContainer: {
    padding: 24,
    minHeight: '80%',
    justifyContent: 'center',
  },
  authPromptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 26,
    alignItems: 'center',
    ...Shadows.medium,
  },
  authPromptIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  authPromptTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.ink,
    textAlign: 'center',
    marginBottom: 8,
  },
  authPromptSubtitle: {
    fontSize: 13.5,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  authPromptButton: {
    width: '100%',
    backgroundColor: Colors.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: Radii.pill,
    gap: 8,
    marginBottom: 12,
  },
  authPromptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  authPromptSecondaryButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: Radii.pill,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  authPromptSecondaryButtonText: {
    color: Colors.ink,
    fontSize: 13,
    fontWeight: '700',
  },
});
