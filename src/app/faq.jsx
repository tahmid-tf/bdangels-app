import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SubpageHeader from '../components/SubpageHeader';
import MobileMenuModal from '../components/MobileMenuModal';
import FooterSection from '../components/home/FooterSection';
import { fetchFaqsPageData } from '../services/api';
import { Colors, Radii, Shadows } from '../constants/theme';

export default function FaqScreen() {
  const [faqs, setFaqs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndices, setOpenIndices] = useState(new Set([0]));
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchFaqsPageData();
      if (data && Array.isArray(data)) {
        setFaqs(data);
      }
    } catch (err) {
      console.log('FAQ load error:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchFaqsPageData().then((data) => {
      if (isMounted && data && Array.isArray(data)) {
        setFaqs(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const toggleIndex = (idx) => {
    setOpenIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const query = searchQuery.toLowerCase().trim();
    return faqs.filter((faq) => {
      const q = (faq.question || '').toLowerCase();
      const p = (faq.paragraphs || []).join(' ').toLowerCase();
      const b = (faq.bullets || []).join(' ').toLowerCase();
      const n = (faq.note || '').toLowerCase();
      return q.includes(query) || p.includes(query) || b.includes(query) || n.includes(query);
    });
  }, [faqs, searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <SubpageHeader
        title="FAQ & KNOWLEDGE BASE"
        onOpenMenu={() => setMenuVisible(true)}
      />

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
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.kickerRow}>
            <View style={styles.kickerBar} />
            <Text style={styles.kickerText}>BAN KNOWLEDGE BASE</Text>
          </View>
          <Text style={styles.title}>
            Frequently Asked Questions about BAN
          </Text>
          <Text style={styles.subtitle}>
            Clear answers about returns, regulation, exits, investor protection, foreign investment, SPVs,
            documentation, diligence, and portfolio support.
          </Text>

          {/* Search Box */}
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color={Colors.muted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Try &quot;SPV&quot;, &quot;tax&quot;, or &quot;exits&quot;..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={Colors.muted} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* FAQ Accordion List */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.countText}>
              Showing {filteredFaqs.length} {filteredFaqs.length === 1 ? 'answer' : 'essential answers'}
            </Text>
          </View>

          {filteredFaqs.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="help-circle-outline" size={38} color={Colors.muted} />
              <Text style={styles.emptyTitle}>No matching questions found</Text>
              <Text style={styles.emptyDesc}>Try a broader search keyword or contact our team directly.</Text>
            </View>
          ) : (
            <View style={styles.faqList}>
              {filteredFaqs.map((faq, index) => {
                const isOpen = openIndices.has(index);
                const numString = String(index + 1).padStart(2, '0');

                return (
                  <View key={index} style={[styles.faqItem, isOpen && styles.faqItemOpen]}>
                    <TouchableOpacity
                      style={styles.faqSummary}
                      onPress={() => toggleIndex(index)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.numWrap}>
                        <Text style={styles.numText}>{numString}</Text>
                      </View>
                      <Text style={styles.questionText}>{faq.question}</Text>
                      <Ionicons
                        name={isOpen ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={isOpen ? Colors.green : Colors.muted}
                      />
                    </TouchableOpacity>

                    {isOpen && (
                      <View style={styles.answerWrap}>
                        {faq.paragraphs &&
                          faq.paragraphs.map((para, pIdx) => (
                            <Text key={pIdx} style={styles.answerPara}>
                              {para}
                            </Text>
                          ))}

                        {faq.bullets && faq.bullets.length > 0 && (
                          <View style={styles.bulletsWrap}>
                            {faq.bullets.map((bullet, bIdx) => (
                              <View key={bIdx} style={styles.bulletItem}>
                                <Text style={styles.bulletDot}>•</Text>
                                <Text style={styles.bulletText}>{bullet}</Text>
                              </View>
                            ))}
                          </View>
                        )}

                        {faq.note ? (
                          <View style={styles.noteBox}>
                            <Text style={styles.noteLabel}>Important Note:</Text>
                            <Text style={styles.noteText}>{faq.note}</Text>
                          </View>
                        ) : null}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Contact Support */}
        <View style={styles.supportCard}>
          <Text style={styles.supportTitle}>Still have questions?</Text>
          <Text style={styles.supportDesc}>
            Our investment analysts and membership team are available to answer inquiries about syndicates,
            taxation, or membership tiers.
          </Text>
          <TouchableOpacity
            style={styles.supportBtn}
            onPress={() => Linking.openURL('mailto:hello@bdangels.co?subject=FAQ%20Question')}
            activeOpacity={0.85}
          >
            <Text style={styles.supportBtnText}>Write to hello@bdangels.co</Text>
            <Ionicons name="mail" size={15} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <FooterSection />
      </ScrollView>

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
    fontSize: 28,
    fontWeight: '800',
    color: Colors.ink,
    lineHeight: 34,
    letterSpacing: -0.6,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.muted,
    lineHeight: 22,
    marginBottom: 18,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    paddingHorizontal: 14,
    height: 46,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.ink,
    paddingVertical: 0,
  },
  listSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  listHeader: {
    marginBottom: 14,
  },
  countText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.green,
  },
  faqList: {
    gap: 12,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: Colors.line,
    overflow: 'hidden',
    ...Shadows.card,
  },
  faqItemOpen: {
    borderColor: Colors.green,
  },
  faqSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  numWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.ink,
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: Colors.ink,
    lineHeight: 21,
  },
  answerWrap: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 14,
  },
  answerPara: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 10,
  },
  bulletsWrap: {
    marginTop: 4,
    marginBottom: 10,
    gap: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    fontSize: 14,
    color: Colors.green,
    fontWeight: '800',
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    lineHeight: 19,
  },
  noteBox: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: Radii.md,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  noteLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 3,
  },
  noteText: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 18,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 44,
    backgroundColor: '#F9FAFB',
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: Colors.line,
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
  },
  supportCard: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 28,
    backgroundColor: Colors.ink,
    borderRadius: Radii.xxl,
    padding: 22,
  },
  supportTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  supportDesc: {
    fontSize: 13,
    color: '#D1D5DB',
    lineHeight: 19,
    marginBottom: 16,
  },
  supportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.green,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radii.md,
    gap: 8,
  },
  supportBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
