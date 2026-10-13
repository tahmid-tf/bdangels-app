import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  StatusBar,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SubpageHeader from '../components/SubpageHeader';
import MobileMenuModal from '../components/MobileMenuModal';
import FooterSection from '../components/home/FooterSection';
import { fetchPublicationsPageData } from '../services/api';
import { Colors, Radii, Shadows } from '../constants/theme';

export default function PublicationsScreen() {
  const [publications, setPublications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchPublicationsPageData();
      if (data?.publications?.data) {
        setPublications(data.publications.data);
      }
    } catch (err) {
      console.log('Publications load notice:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchPublicationsPageData().then((data) => {
      if (isMounted && data?.publications?.data) {
        setPublications(data.publications.data);
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

  const handleDownload = (url) => {
    if (url) {
      Linking.openURL(url).catch((err) => console.log('Download URL error:', err));
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Annual Report';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return 'Annual Report';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <SubpageHeader
        title="PUBLICATIONS & RESEARCH"
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
            <Text style={styles.kickerText}>RESEARCH AND RESOURCES</Text>
          </View>
          <Text style={styles.title}>Publications for the{"\n"}startup ecosystem.</Text>
          <Text style={styles.subtitle}>
            In-depth market reports, legal handbooks, and practical whitepapers authored by Bangladesh
            Angels Network and ecosystem partners.
          </Text>
        </View>

        {/* Publications List */}
        <View style={styles.listSection}>
          <View style={styles.cardsWrap}>
            {publications.map((pub) => (
              <View key={pub.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{pub.category || 'Report'}</Text>
                  </View>
                  <Text style={styles.dateText}>{formatDate(pub.published_at)}</Text>
                </View>

                <Text style={styles.pubTitle}>{pub.title}</Text>
                <Text style={styles.pubExcerpt}>{pub.excerpt}</Text>

                <TouchableOpacity
                  style={styles.downloadBtn}
                  onPress={() => handleDownload(pub.download_url)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="download-outline" size={17} color={Colors.green} />
                  <Text style={styles.downloadBtnText}>Download PDF Report</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Research Contribution Box */}
        <View style={styles.contribCard}>
          <Text style={styles.contribTitle}>Partner on Ecosystem Research</Text>
          <Text style={styles.contribDesc}>
            Are you an academic institution, development agency, or venture firm looking to collaborate on
            future market reports?
          </Text>
          <TouchableOpacity
            style={styles.contribBtn}
            onPress={() => Linking.openURL('mailto:hello@bdangels.co?subject=Research%20Collaboration')}
            activeOpacity={0.85}
          >
            <Text style={styles.contribBtnText}>Contact Research Team</Text>
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
  },
  listSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  cardsWrap: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.line,
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.sm,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.green,
  },
  dateText: {
    fontSize: 12,
    color: Colors.muted,
    fontWeight: '600',
  },
  pubTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.ink,
    lineHeight: 24,
    marginBottom: 8,
  },
  pubExcerpt: {
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 20,
    marginBottom: 16,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radii.md,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  downloadBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.green,
  },
  contribCard: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 28,
    backgroundColor: Colors.ink,
    borderRadius: Radii.xxl,
    padding: 22,
  },
  contribTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  contribDesc: {
    fontSize: 13,
    color: '#D1D5DB',
    lineHeight: 19,
    marginBottom: 16,
  },
  contribBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.green,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radii.md,
    gap: 8,
  },
  contribBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
