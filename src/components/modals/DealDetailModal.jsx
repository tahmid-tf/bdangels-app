import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radii, Shadows } from '../../constants/theme';
import { resolvePortfolioLogo } from '../../utils/imageResolver';

export default function DealDetailModal({ visible, deal, onClose }) {
  const [imageError, setImageError] = useState(false);

  if (!deal) return null;

  const resolved = resolvePortfolioLogo(deal);
  const initials = (deal.title || 'BA').substring(0, 2).toUpperCase();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop touch to dismiss */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
          accessibilityLabel="Dismiss modal"
        />

        <View style={styles.container}>
          {/* Top Drag Indicator */}
          <View style={styles.dragHandleWrap}>
            <View style={styles.dragHandle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              {/* Badge Container */}
              <View style={styles.logoBadge}>
                {!imageError && resolved?.source ? (
                  <Image
                    source={resolved.source}
                    style={styles.logoImage}
                    resizeMode="contain"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <Text style={styles.avatarText}>{initials}</Text>
                )}
              </View>

              <View style={styles.titleTextWrap}>
                <Text style={styles.title} numberOfLines={2}>
                  {deal.title}
                </Text>
                <View style={styles.sectorPill}>
                  <Text style={styles.sectorPillText} numberOfLines={1}>
                    {deal.sector || 'Portfolio Company'}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={20} color={Colors.ink} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.scrollInner}
            showsVerticalScrollIndicator={false}
          >
            {/* Ecosystem Badge */}
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>PORTFOLIO COMPANY · BACKED BY BAN</Text>
            </View>

            {/* About Heading & Description */}
            <Text style={styles.sectionHeading}>About the Company</Text>
            <Text style={styles.description}>
              {deal.description ||
                'Technology company supported by the Bangladesh Angels Network community.'}
            </Text>

            {/* Key Info Card with Structured Key-Value Rows */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Sector / Industry</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {deal.sector || 'Technology & Innovation'}
                </Text>
              </View>

              <View style={styles.infoDivider} />

              {deal.investment_stage ? (
                <>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Investment Stage</Text>
                    <Text style={styles.infoValue}>
                      {deal.investment_stage}
                    </Text>
                  </View>
                  <View style={styles.infoDivider} />
                </>
              ) : null}

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Investment Network</Text>
                <Text style={styles.infoValue} numberOfLines={2}>
                  Bangladesh Angels (BAN)
                </Text>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status</Text>
                <View style={styles.activeTag}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeTagText}>Active Ecosystem</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Action Button */}
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.85}
            onPress={onClose}
          >
            <Text style={styles.actionBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 47, 41, 0.65)',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    ...Shadows.modal,
  },
  dragHandleWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
    paddingRight: 8,
  },
  logoBadge: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.green,
  },
  titleTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -0.3,
  },
  sectorPill: {
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    maxWidth: 200,
  },
  sectorPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.green,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    marginTop: 16,
    marginBottom: 10,
  },
  scrollInner: {
    paddingBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    alignSelf: 'flex-start',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.green,
  },
  statusText: {
    color: Colors.green,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 6,
  },
  description: {
    fontSize: 14.5,
    color: Colors.muted,
    lineHeight: 22,
    marginBottom: 18,
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    flexShrink: 0,
    maxWidth: '45%',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ink,
    textAlign: 'right',
    flex: 1,
    flexShrink: 1,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.green,
  },
  activeTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.green,
  },
  actionBtn: {
    backgroundColor: Colors.ink,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
