import React from 'react';
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radii, Shadows, Spacing } from '../../constants/theme';

export default function EventDetailModal({ visible, event, onClose }) {
  if (!event) return null;

  const handleRegister = () => {
    if (event.cta_link) {
      Linking.openURL(event.cta_link).catch((err) => console.log('Link error:', err));
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleWrap}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>{event.type === 'webinar' ? 'WEBINAR' : 'BAN EVENT'}</Text>
              </View>
              <Text style={styles.title}>{event.title}</Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.ink} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {event.banner_url && (
              <Image
                source={{ uri: event.banner_url }}
                style={styles.banner}
                resizeMode="cover"
              />
            )}

            <View style={styles.metaBox}>
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={18} color={Colors.green} />
                <Text style={styles.metaText}>{event.date || 'Upcoming'}</Text>
              </View>
              {event.time && (
                <View style={styles.metaRow}>
                  <Ionicons name="time-outline" size={18} color={Colors.green} />
                  <Text style={styles.metaText}>{event.time}</Text>
                </View>
              )}
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={18} color={Colors.green} />
                <Text style={styles.metaText}>{event.location || 'Online'}</Text>
              </View>
            </View>

            <Text style={styles.sectionHeading}>About this event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </ScrollView>

          <View style={styles.footerActions}>
            {event.cta_link && (
              <TouchableOpacity
                style={styles.registerBtn}
                activeOpacity={0.85}
                onPress={handleRegister}
              >
                <Text style={styles.registerBtnText}>Register / RSVP Now</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.closeActionBtn} activeOpacity={0.85} onPress={onClose}>
              <Text style={styles.closeActionText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 47, 41, 0.65)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Radii.xxl,
    borderTopRightRadius: Radii.xxl,
    maxHeight: '85%',
    padding: Spacing.lg,
    ...Shadows.modal,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  titleWrap: {
    flex: 1,
    paddingRight: 12,
  },
  typeBadge: {
    backgroundColor: Colors.ink,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: Radii.sm,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  typeText: {
    color: Colors.mint,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.ink,
    lineHeight: 28,
  },
  closeBtn: {
    padding: 6,
    borderRadius: Radii.pill,
    backgroundColor: Colors.bgLight,
  },
  content: {
    marginVertical: Spacing.md,
  },
  banner: {
    width: '100%',
    height: 180,
    borderRadius: Radii.lg,
    marginBottom: Spacing.md,
  },
  metaBox: {
    backgroundColor: Colors.paper,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.line,
    gap: 8,
    marginBottom: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: Colors.ink,
    fontWeight: '600',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.muted,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  footerActions: {
    gap: 8,
  },
  registerBtn: {
    backgroundColor: Colors.green,
    minHeight: 48,
    borderRadius: Radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  registerBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  closeActionBtn: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeActionText: {
    color: Colors.muted,
    fontSize: 14,
    fontWeight: '700',
  },
});
