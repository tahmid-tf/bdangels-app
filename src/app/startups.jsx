import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import SubpageHeader from '../components/SubpageHeader';
import MobileMenuModal from '../components/MobileMenuModal';
import FooterSection from '../components/home/FooterSection';
import {
  submitFounderPitch,
  fetchPublicDeals,
  fetchServicesPageData,
  submitDealInvestmentInterest,
} from '../services/api';
import { authState } from '../services/auth';
import { Colors, Radii, Shadows } from '../constants/theme';

export default function StartupsScreen() {
  const [email, setEmail] = useState('');
  const [oneLine, setOneLine] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  // Deals state
  const [deals, setDeals] = useState([]);
  const [loadingDeals, setLoadingDeals] = useState(() => Boolean(authState.getToken()));
  const [dealsAccessStatus, setDealsAccessStatus] = useState(() =>
    authState.getToken() ? 'loading' : 'unauthenticated'
  );
  const [dealsMessage, setDealsMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Deal detail modal
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [interestSubmitting, setInterestSubmitting] = useState(false);

  // Services state
  const [services, setServices] = useState([]);

  const loadData = useCallback(async () => {
    const token = authState.getToken();
    const user = authState.getUser();

    const [servicesData, dealsRes] = await Promise.all([
      fetchServicesPageData().catch(() => null),
      token ? fetchPublicDeals(token).catch(() => null) : Promise.resolve(null),
    ]);

    if (servicesData?.services && Array.isArray(servicesData.services) && servicesData.services.length > 0) {
      setServices(servicesData.services);
    }

    if (!token) {
      setLoadingDeals(false);
      setDealsAccessStatus('unauthenticated');
      setDeals([]);
      return;
    }

    if (dealsRes && dealsRes.ok) {
      setDeals(dealsRes.deals || []);
      setDealsAccessStatus('authorized');
      setDealsMessage('');
    } else if (dealsRes) {
      setDeals([]);
      if (dealsRes.status === 403 && dealsRes.statusReason === 'pending_approval') {
        setDealsAccessStatus('pending_approval');
        setDealsMessage(dealsRes.message || 'Your account is pending administrator approval.');
      } else if (dealsRes.status === 403 || !user?.has_paid_membership) {
        setDealsAccessStatus('locked');
        setDealsMessage(dealsRes.message || 'Active deals require an approved paid membership tier.');
      } else if (dealsRes.status === 401) {
        setDealsAccessStatus('unauthenticated');
      } else {
        setDealsAccessStatus('locked');
        setDealsMessage(dealsRes.message || 'Unable to load active deals.');
      }
    } else {
      setDeals([]);
      setDealsAccessStatus('locked');
    }
    setLoadingDeals(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const token = authState.getToken();
    const user = authState.getUser();

    Promise.all([
      fetchServicesPageData().catch(() => null),
      token ? fetchPublicDeals(token).catch(() => null) : Promise.resolve(null),
    ]).then(([servicesData, dealsRes]) => {
      if (!isMounted) return;

      if (servicesData?.services && Array.isArray(servicesData.services) && servicesData.services.length > 0) {
        setServices(servicesData.services);
      }

      if (!token) {
        setLoadingDeals(false);
        setDealsAccessStatus('unauthenticated');
        setDeals([]);
        return;
      }

      if (dealsRes && dealsRes.ok) {
        setDeals(dealsRes.deals || []);
        setDealsAccessStatus('authorized');
        setDealsMessage('');
      } else if (dealsRes) {
        setDeals([]);
        if (dealsRes.status === 403 && dealsRes.statusReason === 'pending_approval') {
          setDealsAccessStatus('pending_approval');
          setDealsMessage(dealsRes.message || 'Your account is pending administrator approval.');
        } else if (dealsRes.status === 403 || !user?.has_paid_membership) {
          setDealsAccessStatus('locked');
          setDealsMessage(dealsRes.message || 'Active deals require an approved paid membership tier.');
        } else if (dealsRes.status === 401) {
          setDealsAccessStatus('unauthenticated');
        } else {
          setDealsAccessStatus('locked');
          setDealsMessage(dealsRes.message || 'Unable to load active deals.');
        }
      } else {
        setDeals([]);
        setDealsAccessStatus('locked');
      }
      setLoadingDeals(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handlePickDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        ],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        setSelectedFile(res.assets[0]);
      }
    } catch (err) {
      console.log('Doc picker notice:', err);
    }
  };

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Validation Error', 'Please enter a valid founder email address.');
      return;
    }
    if (!oneLine || oneLine.trim().length < 5) {
      Alert.alert('Validation Error', 'Please enter a brief one-line elevator pitch.');
      return;
    }

    setSubmitting(true);
    try {
      await submitFounderPitch({
        email: email.trim(),
        oneLine: oneLine.trim(),
        file: selectedFile,
      });
      setSubmitted(true);
    } catch (err) {
      Alert.alert('Submission Notice', err.message || 'Unable to submit pitch right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExpressInterest = async (deal) => {
    const token = authState.getToken();
    if (!token) {
      Alert.alert('Sign In Required', 'Please sign in to record your investment interest.', [
        { text: 'Sign In', onPress: () => router.push('/login') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    setInterestSubmitting(true);
    try {
      const res = await submitDealInvestmentInterest(token, deal.id, 'interested');
      if (res.ok) {
        Alert.alert('Interest Recorded', 'Your investment interest has been registered. The deal lead will follow up with you.');
        setSelectedDeal(null);
      } else {
        Alert.alert('Notice', res.message || 'Could not record interest.');
      }
    } catch (err) {
      console.log('Express interest notice:', err);
      Alert.alert('Notice', 'Unable to record interest at this moment.');
    } finally {
      setInterestSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <SubpageHeader
        title="STARTUPS & SERVICES"
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
            <Text style={styles.kickerText}>FOR FOUNDERS</Text>
          </View>
          <Text style={styles.title}>Built for founders{"\n"}ready to move.</Text>
          <Text style={styles.subtitle}>
            Discover live investment opportunities, share your pitch, and access focused support designed
            to help promising companies become investment-ready.
          </Text>

          <View style={styles.heroNav}>
            <TouchableOpacity style={styles.heroNavBtn} onPress={() => router.push('/plans')}>
              <Text style={styles.heroNavText}>Membership Plans</Text>
              <Ionicons name="card-outline" size={13} color={Colors.ink} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.heroNavBtnActive}
              onPress={() => {
                if (authState.isLoggedIn()) {
                  router.push('/startups');
                } else {
                  router.push('/login');
                }
              }}
            >
              <Text style={styles.heroNavTextActive}>
                {authState.isLoggedIn() ? 'Active Deals' : 'Sign In'}
              </Text>
              <Ionicons name={authState.isLoggedIn() ? 'arrow-down' : 'log-in-outline'} size={13} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 1. Active Deals Section */}
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>MEMBER WORKSPACE</Text>
          <Text style={styles.sectionTitle}>Active Deals</Text>
          <Text style={styles.sectionDesc}>
            Live investment opportunities for approved network members on a paid plan.
          </Text>

          {loadingDeals ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={Colors.green} />
              <Text style={styles.loadingText}>Checking active deal pipeline...</Text>
            </View>
          ) : dealsAccessStatus === 'authorized' ? (
            deals.length > 0 ? (
              <View style={styles.dealsList}>
                {deals.map((deal) => (
                  <TouchableOpacity
                    key={deal.id || deal.slug}
                    style={styles.dealCard}
                    activeOpacity={0.85}
                    onPress={() => setSelectedDeal(deal)}
                  >
                    <View style={styles.dealCardHeader}>
                      {deal.logo_url ? (
                        <Image source={{ uri: deal.logo_url }} style={styles.dealLogo} resizeMode="contain" />
                      ) : (
                        <View style={styles.dealLogoPlaceholder}>
                          <Ionicons name="business-outline" size={20} color={Colors.forest} />
                        </View>
                      )}
                      <View style={styles.dealHeaderMeta}>
                        <Text style={styles.dealTitle} numberOfLines={1}>
                          {deal.title}
                        </Text>
                        <Text style={styles.dealSector} numberOfLines={1}>
                          {deal.sector || 'General Tech'}
                        </Text>
                      </View>
                      <View style={styles.dealStatusBadge}>
                        <Text style={styles.dealStatusText}>
                          {deal.status === 'active' ? 'LIVE' : deal.status?.toUpperCase() || 'DEAL'}
                        </Text>
                      </View>
                    </View>

                    {Boolean(deal.description || deal.excerpt) && (
                      <Text style={styles.dealDescription} numberOfLines={2}>
                        {deal.description || deal.excerpt}
                      </Text>
                    )}

                    <View style={styles.dealFooter}>
                      <View style={styles.dealStatCol}>
                        <Text style={styles.dealStatLabel}>Target Raise</Text>
                        <Text style={styles.dealStatValue}>
                          {deal.amount_seeking_formatted && deal.amount_seeking_formatted !== '0'
                            ? `$${deal.amount_seeking_formatted}`
                            : deal.amount_seeking
                            ? `$${Number(deal.amount_seeking).toLocaleString()}`
                            : 'Inquire'}
                        </Text>
                      </View>
                      <View style={styles.dealViewBtn}>
                        <Text style={styles.dealViewBtnText}>View Details</Text>
                        <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Ionicons name="folder-open-outline" size={36} color={Colors.muted} />
                <Text style={styles.emptyTitle}>No Active Deals Listed</Text>
                <Text style={styles.emptyDesc}>
                  There are no active deals open for syndication right now. Check back soon for new founder showcases.
                </Text>
              </View>
            )
          ) : dealsAccessStatus === 'pending_approval' ? (
            <View style={styles.pendingCard}>
              <View style={styles.pendingBadge}>
                <Ionicons name="time-outline" size={24} color="#D97706" />
              </View>
              <Text style={styles.pendingTitle}>Account Pending Approval</Text>
              <Text style={styles.pendingDesc}>
                {dealsMessage || 'Your investor account has been registered and is pending administrator verification. You will receive access once approved.'}
              </Text>
              <TouchableOpacity
                style={styles.pendingBtn}
                onPress={() => router.push('/plans')}
                activeOpacity={0.85}
              >
                <Text style={styles.pendingBtnText}>Explore Membership Packages</Text>
                <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : dealsAccessStatus === 'locked' ? (
            <View style={styles.paywallCard}>
              <View style={styles.paywallBadge}>
                <Ionicons name="lock-closed" size={20} color={Colors.green} />
              </View>
              <Text style={styles.paywallTitle}>Unlock Deal Pipeline</Text>
              <Text style={styles.paywallSubtitle}>
                {dealsMessage || 'Membership packages unlock dataroom access, syndicate participation, and live investor pitch sessions.'}
              </Text>
              <TouchableOpacity
                style={styles.paywallBtn}
                onPress={() => router.push('/plans')}
                activeOpacity={0.85}
              >
                <Text style={styles.paywallBtnText}>View Membership Packages</Text>
                <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            /* Unauthenticated Preview (Matching Web) */
            <View style={styles.previewContainer}>
              <View style={styles.previewSkeletonGrid}>
                {[1, 2].map((idx) => (
                  <View key={idx} style={styles.skeletonCard}>
                    <View style={styles.skeletonImage} />
                    <View style={styles.skeletonBody}>
                      <View style={styles.skeletonTitle} />
                      <View style={styles.skeletonLine} />
                      <View style={styles.skeletonBtnRow} />
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.previewOverlay}>
                <Ionicons name="lock-closed" size={28} color={Colors.forest} />
                <Text style={styles.previewTitle}>Click to Unlock Active Deals</Text>
                <Text style={styles.previewDesc}>
                  Membership packages unlock full deal details, datarooms, and the BAN investor workspace.
                </Text>
                <View style={styles.previewActions}>
                  <TouchableOpacity
                    style={styles.previewSignInBtn}
                    onPress={() => router.push('/login')}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.previewSignInText}>Sign In to Access</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.previewRegisterBtn}
                    onPress={() => router.push('/register')}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.previewRegisterText}>Create Account</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.previewPlansLink}
                  onPress={() => router.push('/plans')}
                >
                  <Text style={styles.previewPlansLinkText}>View Membership Packages →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* 2. Tailored Services for Startups */}
        <View style={styles.sectionAlt}>
          <Text style={styles.sectionEyebrow}>WHAT WE DO</Text>
          <Text style={styles.sectionTitle}>Founder Services & Advisory</Text>
          <Text style={styles.sectionDesc}>
            BAN builds the connective tissue around early-stage investment.
          </Text>

          <View style={styles.servicesGrid}>
            {services.length > 0 ? (
              services.map((svc) => (
                <View key={svc.id} style={styles.serviceCard}>
                  <View style={styles.serviceIcon}>
                    <Ionicons name="briefcase-outline" size={22} color={Colors.green} />
                  </View>
                  <Text style={styles.serviceTitle}>{svc.title}</Text>
                  <Text style={styles.serviceDesc}>{svc.description}</Text>
                  {Boolean(svc.cta_url || svc.brochure_url) && (
                    <TouchableOpacity
                      style={styles.serviceLink}
                      onPress={() => {
                        if (svc.cta_url && svc.cta_url.startsWith('/')) {
                          router.push(svc.cta_url);
                        } else if (svc.cta_url) {
                          router.push('/plans');
                        }
                      }}
                    >
                      <Text style={styles.serviceLinkText}>{svc.cta_label || 'Learn More →'}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            ) : (
              <>
                <View style={styles.serviceCard}>
                  <View style={styles.serviceIcon}>
                    <Ionicons name="document-text-outline" size={22} color={Colors.green} />
                  </View>
                  <Text style={styles.serviceTitle}>Founder Readiness</Text>
                  <Text style={styles.serviceDesc}>
                    Pitch deck polish, financial projection stress-testing, and metrics positioning before meeting syndicates.
                  </Text>
                </View>

                <View style={styles.serviceCard}>
                  <View style={styles.serviceIcon}>
                    <Ionicons name="shield-checkmark-outline" size={22} color={Colors.green} />
                  </View>
                  <Text style={styles.serviceTitle}>Legal & Deal Structuring</Text>
                  <Text style={styles.serviceDesc}>
                    Standardized term sheets, convertible notes, RJSC regulatory filings, and cross-border SPVs.
                  </Text>
                </View>

                <View style={styles.serviceCard}>
                  <View style={styles.serviceIcon}>
                    <Ionicons name="sparkles-outline" size={22} color={Colors.green} />
                  </View>
                  <Text style={styles.serviceTitle}>DeckVue (AI Due Diligence)</Text>
                  <Text style={styles.serviceDesc}>
                    AI-driven pitch deck analysis that extracts key signals and market intelligence in minutes.
                  </Text>
                  <TouchableOpacity
                    style={styles.serviceLink}
                    onPress={() => router.push('/deckvue')}
                  >
                    <Text style={styles.serviceLinkText}>Learn about DeckVue →</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>

        {/* 3. Pitch Form Section */}
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>DIRECT APPLICATION</Text>
          <Text style={styles.sectionTitle}>Send Us Your Pitch</Text>
          <Text style={styles.sectionDesc}>
            Early-stage founders based in Bangladesh or building for frontier markets: share your company overview.
          </Text>

          <View style={styles.formCard}>
            {submitted ? (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={48} color={Colors.green} />
                <Text style={styles.successTitle}>Pitch Received!</Text>
                <Text style={styles.successText}>
                  Our investment team will review your submission and follow up with you at {email}.
                </Text>
                <TouchableOpacity
                  style={styles.resetBtn}
                  onPress={() => {
                    setSubmitted(false);
                    setEmail('');
                    setOneLine('');
                    setSelectedFile(null);
                  }}
                >
                  <Text style={styles.resetBtnText}>Submit Another Pitch</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Founder Contact Email *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="founder@yourcompany.com"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>One-Line Elevator Pitch *</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="e.g. B2B q-commerce platform connecting 50,000 neighborhood retailers..."
                    placeholderTextColor="#9CA3AF"
                    value={oneLine}
                    onChangeText={setOneLine}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Pitch Deck (Optional PDF / PPTX)</Text>
                  <TouchableOpacity
                    style={styles.uploadBtn}
                    onPress={handlePickDocument}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={selectedFile ? 'document-attach' : 'cloud-upload-outline'}
                      size={22}
                      color={Colors.green}
                    />
                    <Text style={styles.uploadBtnText} numberOfLines={1}>
                      {selectedFile ? selectedFile.name : 'Choose deck file (PDF/PPT)'}
                    </Text>
                  </TouchableOpacity>
                  {selectedFile ? (
                    <Text style={styles.fileSize}>
                      Size: {((selectedFile.size || 0) / 1024 / 1024).toFixed(2)} MB
                    </Text>
                  ) : null}
                </View>

                <TouchableOpacity
                  style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={submitting}
                  activeOpacity={0.85}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.submitBtnText}>Submit Pitch to BAN</Text>
                      <Ionicons name="paper-plane" size={16} color="#FFFFFF" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <FooterSection />
      </ScrollView>

      {/* Deal Details Modal */}
      {selectedDeal && (
        <Modal
          visible={Boolean(selectedDeal)}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedDeal(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderInfo}>
                  <Text style={styles.modalTitle} numberOfLines={1}>
                    {selectedDeal.title}
                  </Text>
                  <Text style={styles.modalSector}>
                    {selectedDeal.sector || 'Early Stage Startup'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedDeal(null)}
                >
                  <Ionicons name="close" size={22} color={Colors.ink} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll}>
                {selectedDeal.cover_url ? (
                  <Image
                    source={{ uri: selectedDeal.cover_url }}
                    style={styles.modalCover}
                    resizeMode="cover"
                  />
                ) : null}

                <View style={styles.modalMetaRow}>
                  <View style={styles.modalMetaItem}>
                    <Text style={styles.modalMetaLabel}>TARGET SEEKING</Text>
                    <Text style={styles.modalMetaVal}>
                      {selectedDeal.amount_seeking_formatted && selectedDeal.amount_seeking_formatted !== '0'
                        ? `$${selectedDeal.amount_seeking_formatted}`
                        : selectedDeal.amount_seeking
                        ? `$${Number(selectedDeal.amount_seeking).toLocaleString()}`
                        : 'Inquire'}
                    </Text>
                  </View>
                  <View style={styles.modalMetaItem}>
                    <Text style={styles.modalMetaLabel}>STAGE</Text>
                    <Text style={styles.modalMetaVal}>
                      {selectedDeal.investment_stage || 'Seed'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.modalDescTitle}>Executive Overview</Text>
                <Text style={styles.modalDescBody}>
                  {selectedDeal.description || selectedDeal.excerpt || 'No description provided.'}
                </Text>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalExpressBtn}
                  onPress={() => handleExpressInterest(selectedDeal)}
                  disabled={interestSubmitting}
                  activeOpacity={0.85}
                >
                  {interestSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="heart-outline" size={18} color="#FFFFFF" />
                      <Text style={styles.modalExpressBtnText}>Express Investment Interest</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      <MobileMenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
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
    paddingTop: 32,
    paddingBottom: 24,
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
    fontSize: 32,
    fontWeight: '800',
    color: Colors.ink,
    lineHeight: 38,
    letterSpacing: -0.8,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.muted,
    lineHeight: 22,
    marginBottom: 20,
  },
  heroNav: {
    flexDirection: 'row',
    gap: 10,
  },
  heroNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radii.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.line,
  },
  heroNavText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.ink,
  },
  heroNavBtnActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radii.lg,
    backgroundColor: Colors.ink,
  },
  heroNavTextActive: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 28,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  sectionAlt: {
    paddingHorizontal: 20,
    paddingVertical: 28,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.green,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 6,
  },
  sectionDesc: {
    fontSize: 14,
    color: Colors.muted,
    lineHeight: 20,
    marginBottom: 20,
  },
  loadingBox: {
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.muted,
  },
  dealsList: {
    gap: 14,
  },
  dealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Shadows.sm,
  },
  dealCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  dealLogo: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    backgroundColor: '#F9FAFB',
  },
  dealLogoPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dealHeaderMeta: {
    flex: 1,
  },
  dealTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 2,
  },
  dealSector: {
    fontSize: 12,
    color: Colors.muted,
    fontWeight: '500',
  },
  dealStatusBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.full,
  },
  dealStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.green,
    letterSpacing: 0.5,
  },
  dealDescription: {
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 18,
    marginBottom: 12,
  },
  dealFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  dealStatCol: {},
  dealStatLabel: {
    fontSize: 11,
    color: Colors.muted,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  dealStatValue: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.ink,
  },
  dealViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.forest,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radii.sm,
  },
  dealViewBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyCard: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ink,
    marginTop: 10,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 13,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  pendingCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: Radii.xl,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pendingBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  pendingTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 6,
    textAlign: 'center',
  },
  pendingDesc: {
    fontSize: 13,
    color: '#78350F',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  pendingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#92400E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radii.md,
  },
  pendingBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  paywallCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: Radii.xl,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  paywallBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...Shadows.card,
  },
  paywallTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 6,
    textAlign: 'center',
  },
  paywallSubtitle: {
    fontSize: 13,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
    maxWidth: 320,
  },
  paywallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.ink,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: Radii.lg,
  },
  paywallBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  previewContainer: {
    position: 'relative',
    borderRadius: Radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    backgroundColor: '#F0FDF4',
  },
  previewSkeletonGrid: {
    opacity: 0.25,
    padding: 16,
    gap: 12,
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.md,
    padding: 12,
    gap: 8,
  },
  skeletonImage: {
    height: 60,
    backgroundColor: '#D1D5DB',
    borderRadius: Radii.sm,
  },
  skeletonBody: {
    gap: 6,
  },
  skeletonTitle: {
    height: 14,
    width: '60%',
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  skeletonLine: {
    height: 10,
    width: '90%',
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  skeletonBtnRow: {
    height: 24,
    width: '40%',
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    textAlign: 'center',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.forest,
    marginTop: 8,
    marginBottom: 6,
    textAlign: 'center',
  },
  previewDesc: {
    fontSize: 13,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    maxWidth: 300,
  },
  previewActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  previewSignInBtn: {
    backgroundColor: Colors.forest,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radii.md,
  },
  previewSignInText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  previewRegisterBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.forest,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radii.md,
  },
  previewRegisterText: {
    color: Colors.forest,
    fontSize: 13,
    fontWeight: '700',
  },
  previewPlansLink: {
    paddingVertical: 4,
  },
  previewPlansLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.green,
  },
  servicesGrid: {
    gap: 14,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.line,
    ...Shadows.card,
  },
  serviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 6,
  },
  serviceDesc: {
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 19,
  },
  serviceLink: {
    marginTop: 10,
  },
  serviceLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.green,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.line,
    ...Shadows.card,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radii.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.ink,
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.green,
    borderRadius: Radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#F0FDF4',
  },
  uploadBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.green,
    flex: 1,
  },
  fileSize: {
    fontSize: 11,
    color: Colors.muted,
    marginTop: 4,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.green,
    paddingVertical: 14,
    borderRadius: Radii.md,
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.65,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.ink,
    marginTop: 12,
    marginBottom: 6,
  },
  successText: {
    fontSize: 13,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  resetBtn: {
    backgroundColor: Colors.ink,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: Radii.md,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Radii.xxl,
    borderTopRightRadius: Radii.xxl,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalHeaderInfo: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.ink,
  },
  modalSector: {
    fontSize: 12,
    color: Colors.muted,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalCover: {
    width: '100%',
    height: 160,
    borderRadius: Radii.lg,
    marginBottom: 16,
  },
  modalMetaRow: {
    flexDirection: 'row',
    gap: 16,
    padding: 14,
    backgroundColor: '#F9FAFB',
    borderRadius: Radii.md,
    marginBottom: 16,
  },
  modalMetaItem: {
    flex: 1,
  },
  modalMetaLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.muted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  modalMetaVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.forest,
  },
  modalDescTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 6,
  },
  modalDescBody: {
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 20,
    marginBottom: 20,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  modalExpressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.forest,
    paddingVertical: 14,
    borderRadius: Radii.md,
  },
  modalExpressBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
