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
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SubpageHeader from '../../components/SubpageHeader';
import MobileMenuModal from '../../components/MobileMenuModal';
import FooterSection from '../../components/home/FooterSection';
import { fetchBlogsPageData } from '../../services/api';
import { Colors, Radii, Shadows } from '../../constants/theme';

const CATEGORIES = ['All', 'Ecosystem', 'Investment', 'Portfolio', 'Legal & Governance'];

export default function BlogsScreen() {
  const [blogs, setBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchBlogsPageData(searchQuery, selectedCat === 'All' ? '' : selectedCat);
      if (data?.blogs?.data) {
        setBlogs(data.blogs.data);
      }
    } catch (err) {
      console.log('Blogs load notice:', err);
    } finally {
      setRefreshing(false);
    }
  }, [searchQuery, selectedCat]);

  useEffect(() => {
    let isMounted = true;
    fetchBlogsPageData().then((data) => {
      if (isMounted && data?.blogs?.data) {
        setBlogs(data.blogs.data);
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
        selectedCat === 'All' || category.toLowerCase().includes(selectedCat.toLowerCase());

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

      <SubpageHeader
        title="INSIGHTS & BLOGS"
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
            <Text style={styles.kickerText}>IDEAS FROM THE ECOSYSTEM</Text>
          </View>
          <Text style={styles.title}>Insights for investors{"\n"}and founders.</Text>
          <Text style={styles.subtitle}>
            Perspectives, practical guidance, announcements, and stories shaping Bangladesh{"'"}s
            early-stage venture capital ecosystem.
          </Text>
        </View>

        {/* Search & Category Filter Pills */}
        <View style={styles.filterSection}>
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color={Colors.muted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search articles and insights..."
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

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catList}
          >
            {CATEGORIES.map((cat) => {
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
          {filteredBlogs.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="newspaper-outline" size={38} color={Colors.muted} />
              <Text style={styles.emptyTitle}>No matching articles</Text>
              <Text style={styles.emptyDesc}>New articles will be published here soon.</Text>
            </View>
          ) : (
            <View style={styles.cardsWrap}>
              {filteredBlogs.map((blog) => (
                <TouchableOpacity
                  key={blog.id || blog.slug}
                  style={styles.card}
                  activeOpacity={0.85}
                  onPress={() => router.push(`/blogs/${blog.slug || blog.id}`)}
                >
                  <View style={styles.cardMeta}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{blog.category || 'Article'}</Text>
                    </View>
                    <Text style={styles.dateText}>{formatDate(blog.published_at)}</Text>
                  </View>

                  <Text style={styles.blogTitle}>{blog.title}</Text>
                  <Text style={styles.blogExcerpt} numberOfLines={3}>
                    {blog.excerpt}
                  </Text>

                  <View style={styles.cardFooter}>
                    <Text style={styles.authorText}>
                      By {blog.author || 'Bangladesh Angels Team'}
                    </Text>
                    <View style={styles.readMore}>
                      <Text style={styles.readMoreText}>Read Article</Text>
                      <Ionicons name="arrow-forward" size={13} color={Colors.green} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
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
    fontSize: 30,
    fontWeight: '800',
    color: Colors.ink,
    lineHeight: 36,
    letterSpacing: -0.7,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.muted,
    lineHeight: 22,
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    gap: 12,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: Radii.md,
    paddingHorizontal: 14,
    height: 44,
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
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radii.pill,
    backgroundColor: '#F3F4F6',
  },
  catChipActive: {
    backgroundColor: Colors.ink,
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
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  cardsWrap: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.line,
    ...Shadows.card,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
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
    fontSize: 11,
    color: Colors.muted,
    fontWeight: '600',
  },
  blogTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.ink,
    lineHeight: 23,
    marginBottom: 6,
  },
  blogExcerpt: {
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 19,
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  authorText: {
    fontSize: 11,
    color: Colors.muted,
    fontWeight: '600',
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.green,
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
});
