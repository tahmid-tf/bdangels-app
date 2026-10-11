import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Share,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SubpageHeader from '../../components/SubpageHeader';
import MobileMenuModal from '../../components/MobileMenuModal';
import FooterSection from '../../components/home/FooterSection';
import { fetchBlogBySlug } from '../../services/api';
import { Colors, Radii } from '../../constants/theme';

export default function BlogDetailScreen() {
  const { slug } = useLocalSearchParams();
  const [blog, setBlog] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (slug) {
      fetchBlogBySlug(slug).then((data) => {
        if (isMounted && data) setBlog(data);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleShare = async () => {
    if (!blog) return;
    try {
      await Share.share({
        title: blog.title,
        message: `${blog.title} — Read on Bangladesh Angels Network: https://bdangels.co/blogs/${blog.slug}`,
      });
    } catch (err) {
      console.log('Share notice:', err);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent Article';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recent Article';
    }
  };

  if (!blog) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <SubpageHeader title="ARTICLE" onOpenMenu={() => setMenuVisible(true)} />
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading article...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <SubpageHeader
        title="BAN INSIGHTS"
        onOpenMenu={() => setMenuVisible(true)}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Article Header */}
        <View style={styles.articleHeader}>
          <View style={styles.metaRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{blog.category || 'Ecosystem'}</Text>
            </View>
            <Text style={styles.readTime}>{blog.reading_time || '5 min read'}</Text>
          </View>

          <Text style={styles.title}>{blog.title}</Text>

          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              <Text style={styles.avatarLetter}>
                {(blog.author || 'BAN').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.authorName}>{blog.author || 'Bangladesh Angels Team'}</Text>
              <Text style={styles.dateText}>{formatDate(blog.published_at)}</Text>
            </View>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={18} color={Colors.ink} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Lead Excerpt */}
        <View style={styles.excerptBox}>
          <Text style={styles.excerptText}>{blog.excerpt}</Text>
        </View>

        {/* Article Body Content */}
        <View style={styles.bodySection}>
          <Text style={styles.paragraph}>
            Early-stage venture capital in frontier ecosystems is defined by hands-on conviction, local market
            insight, and patient capital. Over the past five years, Bangladesh Angels Network has witnessed a
            profound transition from ad-hoc investing to institutional syndicate discipline.
          </Text>

          <Text style={styles.subheading}>1. The Role of Co-Investing Syndicates</Text>
          <Text style={styles.paragraph}>
            In markets where initial check sizes typically range from $10,000 to $50,000 per angel, forming
            syndicates allows founders to raise clean rounds ($100k–$300k) with a single cap table entry via
            special-purpose vehicles (SPVs) or representative proxies.
          </Text>

          <View style={styles.quoteBox}>
            <Text style={styles.quoteText}>
              {"“The best early-stage investors aren't just writing checks—they are actively opening regulatory doors, unblocking distribution partnerships, and recruiting core executives.”"}
            </Text>
          </View>

          <Text style={styles.subheading}>2. Sourcing Rigor & Diligence Hygiene</Text>
          <Text style={styles.paragraph}>
            Evaluating early-stage startups in South Asia requires assessing unit economics through an emerging-market
            lens. CAC/LTV benchmarks differ substantially from developed ecosystems, making customer retention,
            repeat purchase frequencies, and sustainable gross margins far more predictive of long-term survival.
          </Text>

          <Text style={styles.subheading}>3. Key Takeaways for Founders & Angels</Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.green} />
              <Text style={styles.bulletText}>
                Prioritize clean corporate governance and early RJSC compliance.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.green} />
              <Text style={styles.bulletText}>
                Use standardized term sheets (SAFE / Convertible notes) to minimize legal delays.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.green} />
              <Text style={styles.bulletText}>
                Maintain consistent monthly investor reporting on revenues, burn, and milestones.
              </Text>
            </View>
          </View>
        </View>

        {/* Back to blogs */}
        <View style={styles.backSection}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.push('/blogs')}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={16} color={Colors.green} />
            <Text style={styles.backBtnText}>Back to all insights & blogs</Text>
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: Colors.muted,
  },
  articleHeader: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  badge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radii.sm,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.green,
    textTransform: 'uppercase',
  },
  readTime: {
    fontSize: 12,
    color: Colors.muted,
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.ink,
    lineHeight: 34,
    marginBottom: 18,
    letterSpacing: -0.5,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DFF4EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.green,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.ink,
  },
  dateText: {
    fontSize: 11,
    color: Colors.muted,
  },
  shareBtn: {
    marginLeft: 'auto',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  excerptBox: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: Radii.lg,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.green,
  },
  excerptText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#374151',
    lineHeight: 22,
  },
  bodySection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  paragraph: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 25,
    marginBottom: 18,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.ink,
    marginTop: 10,
    marginBottom: 10,
  },
  quoteBox: {
    backgroundColor: '#F0FDF4',
    padding: 18,
    borderRadius: Radii.lg,
    marginVertical: 14,
    borderLeftWidth: 3,
    borderLeftColor: Colors.green,
  },
  quoteText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: Colors.ink,
    lineHeight: 22,
    fontWeight: '600',
  },
  bulletList: {
    gap: 10,
    marginTop: 6,
    marginBottom: 18,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  backSection: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: Radii.md,
    alignSelf: 'flex-start',
  },
  backBtnText: {
    color: Colors.green,
    fontSize: 13,
    fontWeight: '800',
  },
});
