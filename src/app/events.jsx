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
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SubpageHeader from '../components/SubpageHeader';
import MobileMenuModal from '../components/MobileMenuModal';
import EventDetailModal from '../components/modals/EventDetailModal';
import FooterSection from '../components/home/FooterSection';
import { fetchEventsPageData } from '../services/api';
import { resolveEventBanner } from '../utils/imageResolver';
import { Colors, Radii } from '../constants/theme';

const EVENT_TYPES = ['All', 'Events', 'Webinars'];

function EventCard({ event, onSelectDetails }) {
  const bannerResolved = resolveEventBanner(event);

  const handleRegister = (ctaLink) => {
    if (ctaLink) {
      Linking.openURL(ctaLink).catch((err) => console.log('Link error:', err));
    }
  };

  const isWebinar = event?.type?.toLowerCase() === 'webinar';

  return (
    <View style={styles.card}>
      {/* Event Image Banner */}
      <View style={styles.bannerContainer}>
        {bannerResolved?.source ? (
          <Image
            source={bannerResolved.source}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.bannerFallback}>
            <Ionicons name="calendar-outline" size={48} color={Colors.muted} />
          </View>
        )}
        <View style={[styles.typeBadge, isWebinar && styles.typeBadgeWebinar]}>
          <Text style={styles.typeText}>{isWebinar ? 'WEBINAR' : 'BAN EVENT'}</Text>
        </View>
      </View>

      {/* Event Body */}
      <View style={styles.cardBody}>
        <Text style={styles.eventTitle}>{event.title}</Text>

        {/* Date & Location Meta */}
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={15} color={Colors.green} />
          <Text style={styles.metaText}>
            {event.date || 'Upcoming'} {event.time ? `· ${event.time}` : ''}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={15} color={Colors.green} />
          <Text style={styles.metaText}>{event.location || 'Online'}</Text>
        </View>

        {event.description ? (
          <Text style={styles.description} numberOfLines={3}>
            {event.description}
          </Text>
        ) : null}

        {/* Action Buttons */}
        <View style={styles.actions}>
          {event.cta_link ? (
            <TouchableOpacity
              style={styles.registerButton}
              activeOpacity={0.85}
              onPress={() => handleRegister(event.cta_link)}
              accessibilityRole="button"
              accessibilityLabel={`Register for ${event.title}`}
            >
              <Text style={styles.registerText}>Register / RSVP</Text>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.detailsButton}
            activeOpacity={0.85}
            onPress={() => onSelectDetails(event)}
            accessibilityRole="button"
            accessibilityLabel={`View details for ${event.title}`}
          >
            <Text style={styles.detailsText}>Event details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function EventsScreen() {
  const [events, setEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchEventsPageData();
      if (data && Array.isArray(data)) {
        setEvents(data);
      }
    } catch (err) {
      console.log('Events page load error:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchEventsPageData().then((data) => {
      if (isMounted && data && Array.isArray(data)) {
        setEvents(data);
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

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const title = evt.title || '';
      const desc = evt.description || '';
      const location = evt.location || '';
      const type = (evt.type || 'event').toLowerCase();

      const matchesSearch =
        !searchQuery ||
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        selectedType === 'All' ||
        (selectedType === 'Events' && type === 'event') ||
        (selectedType === 'Webinars' && type === 'webinar');

      return matchesSearch && matchesType;
    });
  }, [events, searchQuery, selectedType]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

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
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.kickerRow}>
            <View style={styles.kickerBar} />
            <Text style={styles.kickerText}>COMMUNITY CALENDAR</Text>
          </View>

          <Text style={styles.title}>BAN Events & Showcases</Text>
          <Text style={styles.subtitle}>
            Meet founders, investors, and ecosystem leaders through BAN showcases, learning sessions,
            and community gatherings.
          </Text>
        </View>

        {/* Search & Filter Section */}
        <View style={styles.filtersSection}>
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color={Colors.muted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search events, webinars, topics..."
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

          {/* Type Filter Pills */}
          <View style={styles.typePillRow}>
            {EVENT_TYPES.map((type) => {
              const active = selectedType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeChip, active && styles.typeChipActive]}
                  onPress={() => setSelectedType(type)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Events List */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.listCount}>
              Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
            </Text>
          </View>

          {filteredEvents.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="calendar-clear-outline" size={44} color={Colors.muted} />
              <Text style={styles.emptyTitle}>No matching events</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search terms or filter selection.
              </Text>
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedType('All');
                }}
              >
                <Text style={styles.clearBtnText}>Reset filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.eventsGrid}>
              {filteredEvents.map((evt) => (
                <EventCard
                  key={evt.id || evt.slug || evt.title}
                  event={evt}
                  onSelectDetails={setSelectedEvent}
                />
              ))}
            </View>
          )}
        </View>

        {/* Footer */}
        <FooterSection />
      </ScrollView>

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        visible={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
      />

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
    paddingTop: 28,
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
    marginBottom: 0,
  },
  filtersSection: {
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
  typePillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radii.pill,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeChipActive: {
    backgroundColor: Colors.ink,
    borderColor: Colors.ink,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.ink,
  },
  typeChipTextActive: {
    color: '#FFFFFF',
  },
  listSection: {
    paddingHorizontal: 22,
    paddingVertical: 24,
  },
  listHeader: {
    marginBottom: 16,
  },
  listCount: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.muted,
  },
  eventsGrid: {
    gap: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  bannerContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: Colors.green,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  typeBadgeWebinar: {
    backgroundColor: '#2563EB',
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  cardBody: {
    padding: 18,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.ink,
    lineHeight: 24,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  metaText: {
    fontSize: 13,
    color: Colors.muted,
    fontWeight: '500',
  },
  description: {
    fontSize: 13.5,
    color: '#4B5563',
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  registerButton: {
    backgroundColor: Colors.green,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Radii.pill,
    gap: 6,
  },
  registerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  detailsButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  detailsText: {
    color: Colors.ink,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
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
  emptySubtitle: {
    fontSize: 13,
    color: Colors.muted,
    textAlign: 'center',
    marginBottom: 16,
  },
  clearBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.ink,
  },
});
