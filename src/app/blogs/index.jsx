import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SubpageHeader from '../../components/SubpageHeader';
import MobileMenuModal from '../../components/MobileMenuModal';
import FooterSection from '../../components/home/FooterSection';
import { fetchBlogsPageData, calculateReadingTime } from '../../services/api';
import { Colors, Radii, Shadows } from '../../constants/theme';

export default function BlogsScreen() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const applyData = (data) => {
    if (data?.blogs?.data) {
      setBlogs(data.blogs.data);
    }
    if (data?.categories && data.categories.length > 0) {
      const cats = ['All', ...data.categories.map((c) => c.category).filter(Boolean)];
      setCategories(Array.from(new Set(cats)));
    } else if (data?.blogs?.data && data.blogs.data.length > 0) {
      const cats = ['All', ...data.blogs.data.map((b) => b.category).filter(Boolean)];
      setCategories(Array.from(new Set(cats)));
    }
  };

  const loadData = useCallback(async () => {
    try {
      const data = await fetchBlogsPageData(searchQuery, selectedCat === 'All' ? '' : selectedCat);
      applyData(data);
    } catch (err) {
      console.log('Blogs load notice:', err);
    } finally {
      setRefreshing(false);
    }
  }, [searchQuery, selectedCat]);

  useEffect(() => {
    let isMounted = true;
    fetchBlogsPageData().then((data) => {
      if (isMounted) applyData(data);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((item) => {
      const title = item.title || '';
      const excerpt = item.excerpt || '';
      const category = item.category || '';
      const matchesSearch =
        !searchQuery ||
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat =
        selectedCat === 'All' || category.toLowerCase() === selectedCat.toLowerCase();

      return matchesSearch && matchesCat;
    });
  }, [blogs, searchQuery, selectedCat]);

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent Article';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recent Article';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Clean Header without redundant cramped sub-bar */}
      <SubpageHeader
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
        {/* Spacious Hero Section */}
        <View style={styles.hero}>
          <View style={styles.kickerRow}>
            <View style={styles.kickerBar} />
            <Text style={styles.kickerText}>IDEAS FROM THE ECOSYSTEM</Text>
          </View>
          <Text style={styles.title}>Insights for investors{"\n"}and founders.</Text>
          <Text style={styles.subtitle}>
            Perspectives, practical guidance, announcements, and stories shaping Bangladesh{"'"}s
            early-stage venture capital ecosystem.
          </Text>
        </View>

        {/* Search & Dynamic Category Filter Pills */}
        <View style={styles.filterSection}>
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color={Colors.muted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search articles and insights..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery ? (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={18} color={Colors.muted} />
              </TouchableOpacity>
            ) : null}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catList}
          >
            {categories.map((cat) => {
              const active = selectedCat === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, active && styles.catChipActive]}
                  onPress={() => setSelectedCat(cat)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.catChipText, active && styles.catChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Articles List */}
        <View style={styles.listSection}>
          <View style={styles.feedHeader}>
            <Text style={styles.feedCount}>
              Showing {filteredBlogs.length} {filteredBlogs.length === 1 ? 'article' : 'articles'}
            </Text>
            {selectedCat !== 'All' || searchQuery ? (
              <TouchableOpacity
                onPress={() => {
                  setSelectedCat('All');
                  setSearchQuery('');
                }}
              >
                <Text style={styles.clearFilterText}>Reset</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {filteredBlogs.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="newspaper-outline" size={38} color={Colors.muted} />
              <Text style={styles.emptyTitle}>No matching articles</Text>
              <Text style={styles.emptyDesc}>Try clearing your search or category filter.</Text>
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => {
                  setSelectedCat('All');
                  setSearchQuery('');
                }}
              >
                <Text style={styles.resetBtnText}>View all articles</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cardsWrap}>
              {filteredBlogs.map((blog) => {
                const readingTime = calculateReadingTime(blog.content, blog.excerpt);
                const authorDisplay = blog.author_name || blog.author || 'Bangladesh Angels Network';
                const roleDisplay = blog.author_role ? ` · ${blog.author_role}` : '';

                return (
                  <TouchableOpacity
                    key={blog.id || blog.slug}
                    style={styles.card}
                    activeOpacity={0.88}
                    onPress={() => router.push(`/blogs/${blog.slug || blog.id}`)}
                  >
                    <View style={styles.cardMeta}>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{blog.category || 'Educational'}</Text>
                      </View>
                      <View style={styles.metaRight}>
                        <Text style={styles.dateText}>{formatDate(blog.published_at)}</Text>
                        <Text style={styles.bulletDot}>·</Text>
                        <Text style={styles.readTimeText}>{readingTime}</Text>
                      </View>
                    </View>

                    <Text style={styles.blogTitle}>{blog.title}</Text>
                    <Text style={styles.blogExcerpt} numberOfLines={3}>
                      {blog.excerpt || 'Read the full analysis and insights from the team.'}
                    </Text>

                    <View style={styles.cardFooter}>
                      <View style={styles.authorGroup}>
                        <View style={styles.authorAvatar}>
                          <Text style={styles.authorAvatarText}>
                            {authorDisplay.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <Text style={styles.authorText} numberOfLines={1}>
                          {authorDisplay}
                          <Text style={styles.authorRole}>{roleDisplay}</Text>
                        </Text>
                      </View>

                      <View style={styles.readMore}>
                        <Text style={styles.readMoreText}>Read</Text>
                        <Ionicons name="arrow-forward" size={13} color={Colors.green} />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
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
    paddingHorizontal: 22,
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
    fontSize: 30,
    fontWeight: '800',
    color: Colors.ink,
    lineHeight: 38,
    letterSpacing: -0.8,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14.5,
    color: Colors.muted,
    lineHeight: 22,
  },
  filterSection: {
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    gap: 12,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    height: 46,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.ink,
    paddingVertical: 0,
  },
  catList: {
    gap: 8,
    paddingVertical: 2,
    paddingRight: 22,
  },
  catChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: Radii.pill,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  catChipActive: {
    backgroundColor: Colors.ink,
    borderColor: Colors.ink,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.ink,
  },
  catChipTextActive: {
    color: '#FFFFFF',
  },
  listSection: {
    paddingHorizontal: 22,
    paddingVertical: 24,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  feedCount: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.muted,
  },
  clearFilterText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.green,
  },
  cardsWrap: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Shadows.card,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.green,
  },
  metaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  bulletDot: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  readTimeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  blogTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.ink,
    lineHeight: 25,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  blogExcerpt: {
    fontSize: 13.5,
    color: Colors.muted,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  authorGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 10,
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorAvatarText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.green,
  },
  authorText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.ink,
    flex: 1,
  },
  authorRole: {
    fontWeight: '400',
    color: '#6B7280',
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMoreText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.green,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ink,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 13,
    color: Colors.muted,
    textAlign: 'center',
    marginBottom: 16,
  },
  resetBtn: {
    backgroundColor: Colors.ink,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radii.md,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
