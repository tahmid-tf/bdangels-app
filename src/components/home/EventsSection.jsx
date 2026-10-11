import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radii, Shadows, Spacing } from '../../constants/theme';
import { resolveEventBanner } from '../../utils/imageResolver';

export default function EventsSection({ events, onSelectEvent }) {
  const displayEvents = events && events.length > 0 ? events : [
    {
      id: 2,
      title: 'BAN October Showcase',
      type: 'event',
      location: 'Online',
      date: '2026-10-10',
      time: '8:00 PM – 10:00 PM BST',
      description: 'Bangladesh Angels Network invites you to our upcoming Virtual Showcase, bringing together a curated cohort of high-potential startups to pitch directly to our community of investors and ecosystem partners.',
      cta_link: 'https://luma.com/udyjysop',
    },
  ];

  const handleRegister = (ctaLink) => {
    if (ctaLink) {
      Linking.openURL(ctaLink).catch((err) => console.log('Link error:', err));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.kicker}>COMMUNITY CALENDAR</Text>
          <Text style={styles.heading}>BAN Events</Text>
          <Text style={styles.subtitle}>
            Meet founders, investors, and ecosystem leaders through BAN showcases, learning sessions, and community gatherings.
          </Text>
        </View>

        <View style={styles.list}>
          {displayEvents.map((evt) => {
            const bannerResolved = resolveEventBanner(evt);

            return (
              <View key={evt.id || evt.title} style={styles.card}>
                {/* Event Image Banner */}
                <View style={styles.bannerContainer}>
                  <Image
                    source={bannerResolved.source}
                    style={styles.bannerImage}
                    resizeMode="cover"
                  />
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{evt.type === 'webinar' ? 'WEBINAR' : 'EVENT'}</Text>
                  </View>
                </View>

                {/* Event Body */}
                <View style={styles.body}>
                  <Text style={styles.eventTitle}>{evt.title}</Text>

                  {/* Date & Location Meta */}
                  <View style={styles.metaRow}>
                    <Ionicons name="time-outline" size={15} color={Colors.green} />
                    <Text style={styles.metaText}>
                      {evt.date || 'Upcoming'} {evt.time ? `· ${evt.time}` : ''}
                    </Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={15} color={Colors.green} />
                    <Text style={styles.metaText}>{evt.location || 'Online'}</Text>
                  </View>

                  <Text style={styles.description} numberOfLines={3}>
                    {evt.description}
                  </Text>

                  {/* Action Buttons */}
                  <View style={styles.actions}>
                    {evt.cta_link && (
                      <TouchableOpacity
                        style={styles.registerButton}
                        activeOpacity={0.85}
                        onPress={() => handleRegister(evt.cta_link)}
                      >
                        <Text style={styles.registerText}>Register / RSVP</Text>
                        <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.detailsButton}
                      activeOpacity={0.85}
                      onPress={() => onSelectEvent && onSelectEvent(evt)}
                    >
                      <Text style={styles.detailsText}>Event details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgLight,
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.md,
  },
  inner: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: Spacing.xl,
  },
  kicker: {
    color: Colors.green,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  heading: {
    color: Colors.ink,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
    letterSpacing: -0.8,
    marginBottom: 10,
  },
  subtitle: {
    color: Colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  list: {
    gap: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xxl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.line,
    ...Shadows.card,
  },
  bannerContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: Colors.deep,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  typeBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: Colors.ink,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: Radii.sm,
  },
  typeText: {
    color: Colors.mint,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  body: {
    padding: Spacing.lg,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  metaText: {
    fontSize: 13,
    color: Colors.muted,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: Colors.muted,
    lineHeight: 21,
    marginVertical: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  registerButton: {
    flex: 1,
    minHeight: 46,
    backgroundColor: Colors.green,
    borderRadius: Radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
  },
  registerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  detailsButton: {
    paddingHorizontal: 16,
    minHeight: 46,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsText: {
    color: Colors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
});
