import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchInvestorDashboard,
  fetchInvestorInvestments,
  fetchInvestorPortfolioInvestments,
  fetchInvestorCommits,
} from '../services/api';
import { authState, logoutUser } from '../services/auth';
import { Colors, Radii, Shadows } from '../constants/theme';
import SubpageHeader from '../components/SubpageHeader';
import MobileMenuModal from '../components/MobileMenuModal';
import FooterSection from '../components/home/FooterSection';

export default function InvestorScreen() {
  const [user, setUser] = useState(() => authState.getUser());
  const [token, setToken] = useState(() => authState.getToken());

  const [loading, setLoading] = useState(() => Boolean(authState.getToken()));
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  // Active Tab: 'investments' | 'portfolio' | 'commits'
  const [activeTab, setActiveTab] = useState('investments');

  // Dashboard Data
  const [summary, setSummary] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [portfolioCompanies, setPortfolioCompanies] = useState([]);
  const [commits, setCommits] = useState([]);

  const loadDashboard = useCallback(async () => {
    const currentToken = authState.getToken();
    const currentUser = authState.getUser();
    setUser(currentUser);
    setToken(currentToken);

    if (!currentToken) {
      setLoading(false);
      return;
    }

    try {
      const [dashRes, investRes, portRes, commitRes] = await Promise.allSettled([
        fetchInvestorDashboard(currentToken),
        fetchInvestorInvestments(currentToken),
        fetchInvestorPortfolioInvestments(currentToken),
        fetchInvestorCommits(currentToken),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value.ok) {
        setSummary(dashRes.value.data?.summary || null);
      }

      if (investRes.status === 'fulfilled' && investRes.value?.data) {
        setInvestments(investRes.value.data || []);
      }

      if (portRes.status === 'fulfilled' && portRes.value?.data) {
        setPortfolioCompanies(portRes.value.data || []);
      }

      if (commitRes.status === 'fulfilled' && commitRes.value?.data) {
        setCommits(commitRes.value.data || []);
      }
    } catch (err) {
      console.log('Investor dashboard load notice:', err);
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
      fetchInvestorCommits(currentToken),
    ]).then(([dashRes, investRes, portRes, commitRes]) => {
      if (!isMounted) return;

      if (dashRes.status === 'fulfilled' && dashRes.value.ok) {
        setSummary(dashRes.value.data?.summary || null);
      }

      if (investRes.status === 'fulfilled' && investRes.value?.data) {
        setInvestments(investRes.value.data || []);
      }

      if (portRes.status === 'fulfilled' && portRes.value?.data) {
        setPortfolioCompanies(portRes.value.data || []);
      }

      if (commitRes.status === 'fulfilled' && commitRes.value?.data) {
        setCommits(commitRes.value.data || []);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await logoutUser();
    router.replace('/');
  };

  // If unauthenticated, show sign-in prompt
  if (!token || !user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <SubpageHeader title="INVESTOR DASHBOARD" onOpenMenu={() => setMenuVisible(true)} />

        <ScrollView contentContainerStyle={styles.authPromptContainer}>
          <View style={styles.authPromptCard}>
            <View style={styles.authPromptIconBox}>
              <Ionicons name="lock-closed" size={32} color={Colors.forest} />
            </View>
            <Text style={styles.authPromptTitle}>Investor Workspace</Text>
            <Text style={styles.authPromptSubtitle}>
              Please sign in to view your private portfolio workspace, investment ledgers, and deal participation.
            </Text>

            <TouchableOpacity
              style={styles.authPromptBtn}
              onPress={() => router.push('/login')}
              activeOpacity={0.85}
            >
              <Text style={styles.authPromptBtnText}>Sign In to Dashboard</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.authPromptSecondaryBtn}
              onPress={() => router.push('/register')}
              activeOpacity={0.85}
            >
              <Text style={styles.authPromptSecondaryBtnText}>Apply as an Angel Investor</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <MobileMenuModal visible={menuVisible} onClose={() => setMenuVisible(false)} />
      </SafeAreaView>
    );
  }

  const userFirstName = user?.name ? user.name.split(' ')[0] : 'Investor';
  const currentDateStr = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <SubpageHeader
        title="INVESTOR WORKSPACE"
        onOpenMenu={() => setMenuVisible(true)}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.green]} />
        }
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.kickerRow}>
            <View style={styles.kickerBar} />
            <Text style={styles.kickerText}>PRIVATE PORTFOLIO WORKSPACE</Text>
          </View>
          <Text style={styles.title}>Welcome back, {userFirstName}.</Text>
          <Text style={styles.subtitle}>
            Track your completed investments and portfolio activity in one place.
          </Text>

          {/* User Status Badges */}
          <View style={styles.statusPillsRow}>
            <View style={styles.statusPill}>
              <Ionicons name="calendar-outline" size={12} color={Colors.muted} />
              <Text style={styles.statusPillText}>As of {currentDateStr}</Text>
            </View>

            <View style={[styles.statusPill, styles.tierPill]}>
              <Ionicons name="ribbon-outline" size={12} color={Colors.forest} />
              <Text style={[styles.statusPillText, styles.tierPillText]}>
                {user.tier_name || (user.account_status === 'free' ? 'Free Tier' : 'Member')}
              </Text>
            </View>

            {user.is_approved ? (
              <View style={[styles.statusPill, styles.approvedPill]}>
                <Ionicons name="checkmark-circle" size={12} color={Colors.green} />
                <Text style={[styles.statusPillText, styles.approvedPillText]}>Approved</Text>
              </View>
            ) : (
              <View style={[styles.statusPill, styles.pendingPill]}>
                <Ionicons name="time-outline" size={12} color="#D97706" />
                <Text style={[styles.statusPillText, styles.pendingPillText]}>Pending Review</Text>
              </View>
            )}
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.green} />
            <Text style={styles.loadingText}>Loading portfolio overview...</Text>
          </View>
        ) : (
          <>
            {/* Key Portfolio Metrics Grid */}
            <View style={styles.metricsSection}>
              <View style={styles.metricsGrid}>
                {/* 1. Invested Value */}
                <View style={[styles.metricCard, styles.metricCardPrimary]}>
                  <View style={styles.metricTopRow}>
                    <Text style={[styles.metricLabel, styles.metricLabelPrimary]}>INVESTED VALUE</Text>
                    <Ionicons name="trending-up" size={16} color="#FFFFFF" />
                  </View>
                  {summary?.currency_totals && summary.currency_totals.length > 0 ? (
                    summary.currency_totals.map((t, idx) => (
                      <Text key={idx} style={[styles.metricValue, styles.metricValuePrimary]}>
                        {t.currency} {Number(t.total).toLocaleString()}
                      </Text>
                    ))
                  ) : (
                    <Text style={[styles.metricValue, styles.metricValuePrimary]}>$0.00</Text>
                  )}
                  <Text style={[styles.metricSub, styles.metricSubPrimary]}>
                    Recorded completed transactions
                  </Text>
                </View>

                {/* 2. Total Investments */}
                <View style={styles.metricCard}>
                  <View style={styles.metricTopRow}>
                    <Text style={styles.metricLabel}>INVESTMENTS</Text>
                    <Ionicons name="layers-outline" size={16} color={Colors.forest} />
                  </View>
                  <Text style={styles.metricValue}>{summary?.total_investments || 0}</Text>
                  <Text style={styles.metricSub}>Completed deals</Text>
                </View>

                {/* 3. Portfolio Companies */}
                <View style={styles.metricCard}>
                  <View style={styles.metricTopRow}>
                    <Text style={styles.metricLabel}>STARTUPS</Text>
                    <Ionicons name="business-outline" size={16} color={Colors.forest} />
                  </View>
                  <Text style={styles.metricValue}>{summary?.startups_backed || 0}</Text>
                  <Text style={styles.metricSub}>Backed companies</Text>
                </View>

                {/* 4. Latest Activity */}
                <View style={styles.metricCard}>
                  <View style={styles.metricTopRow}>
                    <Text style={styles.metricLabel}>LATEST ACTIVITY</Text>
                    <Ionicons name="time-outline" size={16} color={Colors.forest} />
                  </View>
                  <Text style={styles.metricValueSmall}>
                    {summary?.last_investment_date
                      ? new Date(summary.last_investment_date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'No activity yet'}
                  </Text>
                  <Text style={styles.metricSub}>Last completion date</Text>
                </View>
              </View>

              {/* Active Deals Callout Banner */}
              <TouchableOpacity
                style={styles.dealRoomCallout}
                onPress={() => router.push('/startups')}
                activeOpacity={0.88}
              >
                <View style={styles.dealRoomIcon}>
                  <Ionicons name="rocket-outline" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.dealRoomContent}>
                  <Text style={styles.dealRoomTitle}>Live Active Deals</Text>
                  <Text style={styles.dealRoomSubtitle}>
                    {summary?.active_deals_available
                      ? `${summary.active_deals_available} active investment opportunities are currently open for syndication.`
                      : 'Explore curated early-stage founder showcases.'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Content Tabs Navigation */}
            <View style={styles.tabsRow}>
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'investments' && styles.tabBtnActive]}
                onPress={() => setActiveTab('investments')}
              >
                <Text style={[styles.tabBtnText, activeTab === 'investments' && styles.tabBtnTextActive]}>
                  My Investments ({investments.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'portfolio' && styles.tabBtnActive]}
                onPress={() => setActiveTab('portfolio')}
              >
                <Text style={[styles.tabBtnText, activeTab === 'portfolio' && styles.tabBtnTextActive]}>
                  Portfolio ({portfolioCompanies.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'commits' && styles.tabBtnActive]}
                onPress={() => setActiveTab('commits')}
              >
                <Text style={[styles.tabBtnText, activeTab === 'commits' && styles.tabBtnTextActive]}>
                  Commits ({commits.length})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab 1: My Investments Ledger */}
            {activeTab === 'investments' && (
              <View style={styles.tabContentSection}>
                {investments.length > 0 ? (
                  <View style={styles.itemsList}>
                    {investments.map((inv, idx) => (
                      <View key={inv.id || idx} style={styles.itemCard}>
                        <View style={styles.itemCardTop}>
                          <View style={styles.itemIcon}>
                            <Ionicons name="briefcase-outline" size={20} color={Colors.forest} />
                          </View>
                          <View style={styles.itemInfo}>
                            <Text style={styles.itemTitle}>{inv.startup_name || 'Portfolio Startup'}</Text>
                            <Text style={styles.itemMeta}>
                              {inv.completed_at
                                ? new Date(inv.completed_at).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : 'Completed transaction'}
                            </Text>
                          </View>
                          <View style={styles.itemAmountBadge}>
                            <Text style={styles.itemAmountText}>
                              {inv.currency || '$'} {Number(inv.amount || 0).toLocaleString()}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyStateCard}>
                    <View style={styles.emptyIconBox}>
                      <Ionicons name="file-tray-outline" size={36} color={Colors.green} />
                    </View>
                    <Text style={styles.emptyStateTitle}>Your investment dashboard is ready.</Text>
                    <Text style={styles.emptyStateDesc}>
                      Completed investments recorded by the Bangladesh Angels team will appear here automatically, including currency-separated totals and transaction certificates.
                    </Text>
                    <View style={styles.emptyActionsRow}>
                      <TouchableOpacity
                        style={styles.emptyPrimaryBtn}
                        onPress={() => router.push('/startups')}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.emptyPrimaryBtnText}>Explore Active Deals</Text>
                        <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                      {user.account_status === 'free' && (
                        <TouchableOpacity
                          style={styles.emptySecondaryBtn}
                          onPress={() => router.push('/plans')}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.emptySecondaryBtnText}>View Membership Plans</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Tab 2: Portfolio Companies */}
            {activeTab === 'portfolio' && (
              <View style={styles.tabContentSection}>
                {portfolioCompanies.length > 0 ? (
                  <View style={styles.itemsList}>
                    {portfolioCompanies.map((port, idx) => (
                      <View key={port.id || idx} style={styles.itemCard}>
                        <View style={styles.itemCardTop}>
                          <Image
                            source={
                              port.logo_url
                                ? { uri: port.logo_url }
                                : require('../../assets/images/logo.png')
                            }
                            style={styles.itemLogo}
                            resizeMode="contain"
                          />
                          <View style={styles.itemInfo}>
                            <Text style={styles.itemTitle}>{port.title || port.name}</Text>
                            <Text style={styles.itemMeta}>{port.sector || 'Portfolio Company'}</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyStateCard}>
                    <View style={styles.emptyIconBox}>
                      <Ionicons name="business-outline" size={36} color={Colors.green} />
                    </View>
                    <Text style={styles.emptyStateTitle}>No Portfolio Companies Backed Yet</Text>
                    <Text style={styles.emptyStateDesc}>
                      Companies you syndicate with will appear here along with investor updates and quarterly performance reports.
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Tab 3: My Commits */}
            {activeTab === 'commits' && (
              <View style={styles.tabContentSection}>
                {commits.length > 0 ? (
                  <View style={styles.itemsList}>
                    {commits.map((c, idx) => (
                      <View key={c.id || idx} style={styles.itemCard}>
                        <View style={styles.itemCardTop}>
                          <View style={styles.itemIcon}>
                            <Ionicons name="document-text-outline" size={20} color={Colors.forest} />
                          </View>
                          <View style={styles.itemInfo}>
                            <Text style={styles.itemTitle}>{c.deal_title || 'Deal Commitment'}</Text>
                            <Text style={styles.itemMeta}>Status: {c.status || 'Submitted'}</Text>
                          </View>
                          <View style={styles.itemAmountBadge}>
                            <Text style={styles.itemAmountText}>
                              {c.currency || '$'} {Number(c.amount || 0).toLocaleString()}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyStateCard}>
                    <View style={styles.emptyIconBox}>
                      <Ionicons name="checkbox-outline" size={36} color={Colors.green} />
                    </View>
                    <Text style={styles.emptyStateTitle}>No Active Deal Commits</Text>
                    <Text style={styles.emptyStateDesc}>
                      When you submit an allocation commitment on an active deal, it will be tracked here.
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Account Settings / Logout Section */}
            <View style={styles.accountSection}>
              <View style={styles.accountCard}>
                <View style={styles.accountCardHeader}>
                  <Ionicons name="person-circle-outline" size={32} color={Colors.forest} />
                  <View style={styles.accountCardInfo}>
                    <Text style={styles.accountCardName}>{user.name}</Text>
                    <Text style={styles.accountCardEmail}>{user.email}</Text>
                  </View>
                </View>

                <View style={styles.accountActionsRow}>
                  <TouchableOpacity
                    style={styles.accountUpgradeBtn}
                    onPress={() => router.push('/plans')}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="card-outline" size={16} color={Colors.forest} />
                    <Text style={styles.accountUpgradeText}>Manage Membership</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.accountLogoutBtn}
                    onPress={handleLogout}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="log-out-outline" size={16} color={Colors.error} />
                    <Text style={styles.accountLogoutText}>Sign Out</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        )}

        <FooterSection />
      </ScrollView>

      <MobileMenuModal visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 22,
    backgroundColor: '#F8FAF9',
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  kickerBar: {
    width: 14,
    height: 3,
    backgroundColor: Colors.green,
    borderRadius: 2,
  },
  kickerText: {
    color: Colors.green,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.muted,
    lineHeight: 20,
    marginBottom: 14,
  },
  statusPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.full,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.muted,
  },
  tierPill: {
    borderColor: '#D1FAE5',
    backgroundColor: '#ECFDF5',
  },
  tierPillText: {
    color: Colors.forest,
    fontWeight: '700',
  },
  approvedPill: {
    borderColor: '#D1FAE5',
    backgroundColor: '#ECFDF5',
  },
  approvedPillText: {
    color: Colors.green,
    fontWeight: '700',
  },
  pendingPill: {
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
  },
  pendingPillText: {
    color: '#D97706',
    fontWeight: '700',
  },
  loadingBox: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.muted,
  },
  metricsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Shadows.sm,
  },
  metricCardPrimary: {
    width: '100%',
    backgroundColor: Colors.forest,
    borderColor: Colors.forest,
  },
  metricTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.muted,
    letterSpacing: 0.5,
  },
  metricLabelPrimary: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 2,
  },
  metricValueSmall: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 2,
  },
  metricValuePrimary: {
    fontSize: 26,
    color: '#FFFFFF',
  },
  metricSub: {
    fontSize: 11,
    color: Colors.muted,
  },
  metricSubPrimary: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  dealRoomCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a5554',
    borderRadius: Radii.lg,
    padding: 16,
    gap: 12,
    ...Shadows.sm,
  },
  dealRoomIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dealRoomContent: {
    flex: 1,
  },
  dealRoomTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  dealRoomSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 16,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  tabBtn: {
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: Colors.forest,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.muted,
  },
  tabBtnTextActive: {
    color: Colors.forest,
    fontWeight: '800',
  },
  tabContentSection: {
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  itemsList: {
    gap: 10,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.md,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Shadows.sm,
  },
  itemCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLogo: {
    width: 40,
    height: 40,
    borderRadius: Radii.sm,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.ink,
  },
  itemMeta: {
    fontSize: 12,
    color: Colors.muted,
    marginTop: 2,
  },
  itemAmountBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radii.sm,
  },
  itemAmountText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.forest,
  },
  emptyStateCard: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: Radii.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyStateDesc: {
    fontSize: 13,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
    maxWidth: 320,
  },
  emptyActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  emptyPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.forest,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radii.md,
  },
  emptyPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emptySecondaryBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radii.md,
  },
  emptySecondaryBtnText: {
    color: Colors.ink,
    fontSize: 13,
    fontWeight: '600',
  },
  accountSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  accountCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: Radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  accountCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  accountCardInfo: {
    flex: 1,
  },
  accountCardName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.ink,
  },
  accountCardEmail: {
    fontSize: 12,
    color: Colors.muted,
  },
  accountActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  accountUpgradeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 10,
    borderRadius: Radii.md,
  },
  accountUpgradeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.forest,
  },
  accountLogoutBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    paddingVertical: 10,
    borderRadius: Radii.md,
  },
  accountLogoutText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.error,
  },
  authPromptContainer: {
    paddingHorizontal: 20,
    paddingVertical: 60,
    alignItems: 'center',
  },
  authPromptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '100%',
    ...Shadows.sm,
  },
  authPromptIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  authPromptTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 8,
    textAlign: 'center',
  },
  authPromptSubtitle: {
    fontSize: 14,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  authPromptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.forest,
    width: '100%',
    paddingVertical: 14,
    borderRadius: Radii.md,
    marginBottom: 10,
  },
  authPromptBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  authPromptSecondaryBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    width: '100%',
    paddingVertical: 14,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authPromptSecondaryBtnText: {
    color: Colors.ink,
    fontSize: 13,
    fontWeight: '700',
  },
});
