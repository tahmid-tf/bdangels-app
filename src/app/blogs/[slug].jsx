import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Share,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SubpageHeader from '../../components/SubpageHeader';
import MobileMenuModal from '../../components/MobileMenuModal';
import FooterSection from '../../components/home/FooterSection';
import BlogContentRenderer from '../../components/BlogContentRenderer';
import { fetchBlogBySlug, calculateReadingTime } from '../../services/api';
import { Colors, Radii } from '../../constants/theme';

export default function BlogDetailScreen() {
  const { slug } = useLocalSearchParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (slug) {
      fetchBlogBySlug(slug).then((data) => {
        if (isMounted) {
          setBlog(data);
          setLoading(false);
        }
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

  if (loading || !blog) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <SubpageHeader onOpenMenu={() => setMenuVisible(true)} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.green} />
          <Text style={styles.loadingText}>Loading article...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const authorName = blog.author_name || blog.author || 'Bangladesh Angels Network';
  const readingTime = calculateReadingTime(blog.content, blog.excerpt);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Clean Header without redundant sub-bar */}
      <SubpageHeader
        onOpenMenu={() => setMenuVisible(true)}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.articleContainer}>
          {/* Back button link */}
          <TouchableOpacity
            style={styles.backRow}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={15} color={Colors.green} />
            <Text style={styles.backText}>All articles</Text>
          </TouchableOpacity>

          {/* Article Header */}
          <View style={styles.articleHeader}>
            <View style={styles.metaRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{blog.category || 'Educational'}</Text>
              </View>
              <Text style={styles.readTime}>{readingTime}</Text>
            </View>

            <Text style={styles.title}>{blog.title}</Text>

            {/* Byline with Full Author Role & Org */}
            <View style={styles.authorRow}>
              <View style={styles.authorAvatar}>
                <Text style={styles.avatarLetter}>
                  {authorName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{authorName}</Text>
                {blog.author_role ? (
                  <Text style={styles.authorRole}>
                    {blog.author_role}
                    {blog.author_organization ? ` · ${blog.author_organization}` : ''}
                  </Text>
                ) : null}
                <Text style={styles.dateText}>Published {formatDate(blog.published_at)}</Text>
              </View>
              <TouchableOpacity
                style={styles.shareBtn}
                onPress={handleShare}
                accessibilityLabel="Share article"
              >
                <Ionicons name="share-social-outline" size={18} color={Colors.ink} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Lead Excerpt */}
          {blog.excerpt ? (
            <View style={styles.excerptBox}>
              <Text style={styles.excerptText}>{blog.excerpt}</Text>
            </View>
          ) : null}

          {/* Rich HTML Content Body */}
          <View style={styles.bodySection}>
            <BlogContentRenderer content={blog.content} />
          </View>

          {/* Article Footer */}
          <View style={styles.articleFooter}>
            <View style={styles.footerCategoryBadge}>
              <Text style={styles.footerCategoryText}>{blog.category || 'Educational'}</Text>
            </View>
            <TouchableOpacity
              style={styles.footerLink}
              onPress={() => router.push('/blogs')}
            >
              <Text style={styles.footerLinkText}>Explore more insights</Text>
              <Ionicons name="arrow-forward" size={14} color={Colors.green} />
            </TouchableOpacity>
          </View>

          {/* Recent / Related Articles */}
          {blog.recent_blogs && blog.recent_blogs.length > 0 ? (
            <View style={styles.recentSection}>
              <Text style={styles.recentHeading}>Recent Posts</Text>
              <View style={styles.recentList}>
                {blog.recent_blogs.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.recentCard}
                    activeOpacity={0.8}
                    onPress={() => router.push(`/blogs/${item.slug || item.id}`)}
                  >
                    <Text style={styles.recentTitle}>{item.title}</Text>
                    <View style={styles.recentMeta}>
                      <Text style={styles.recentCat}>{item.category || 'Article'}</Text>
                      <Text style={styles.recentDate}>{formatDate(item.published_at)}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}
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
    padding: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  articleContainer: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 28,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  backText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.green,
  },
  articleHeader: {
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.green,
  },
  readTime: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.ink,
    lineHeight: 34,
    letterSpacing: -0.6,
    marginBottom: 18,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0F3D34',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: Colors.ink,
  },
  authorRole: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  dateText: {
    fontSize: 11.5,
    color: '#9CA3AF',
    marginTop: 2,
  },
  shareBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  excerptBox: {
    backgroundColor: '#F8FAF9',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.green,
    marginBottom: 20,
  },
  excerptText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 23,
    fontStyle: 'italic',
  },
  bodySection: {
    paddingBottom: 24,
  },
  articleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginBottom: 28,
  },
  footerCategoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radii.pill,
  },
  footerCategoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.ink,
  },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.green,
  },
  recentSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  recentHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  recentList: {
    gap: 10,
  },
  recentCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 14,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.ink,
    lineHeight: 19,
    marginBottom: 6,
  },
  recentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentCat: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.green,
  },
  recentDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});
