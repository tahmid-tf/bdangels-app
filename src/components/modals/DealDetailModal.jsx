import React from 'react';
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radii, Shadows, Spacing } from '../../constants/theme';
import { resolvePortfolioLogo } from '../../utils/imageResolver';

export default function DealDetailModal({ visible, deal, onClose }) {
  if (!deal) return null;

  const resolved = resolvePortfolioLogo(deal);

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
            <View style={styles.titleRow}>
              {resolved && resolved.source ? (
                <Image
                  source={resolved.source}
                  style={styles.logo}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>
                    {(deal.title || 'BA').substring(0, 2).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.titleTextWrap}>
                <Text style={styles.title}>{deal.title}</Text>
                <Text style={styles.sector}>{deal.sector || 'Portfolio Company'}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.ink} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>PORTFOLIO COMPANY · BACKED BY BAN</Text>
            </View>

            <Text style={styles.sectionHeading}>About the Company</Text>
            <Text style={styles.description}>
              {deal.description || 'Technology company supported by the Bangladesh Angels Network community.'}
            </Text>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Sector / Industry</Text>
                <Text style={styles.infoValue}>{deal.sector || 'Technology & Innovation'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Investment Network</Text>
                <Text style={styles.infoValue}>Bangladesh Angels Network (BAN)</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status</Text>
                <Text style={styles.infoValue}>Active Ecosystem Portfolio</Text>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.85} onPress={onClose}>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.lineLight,
    backgroundColor: '#FFFFFF',
    padding: 4,
  },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: Radii.md,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  sector: {
    fontSize: 12,
    color: Colors.green,
    fontWeight: '700',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: Radii.pill,
    backgroundColor: Colors.bgLight,
  },
  content: {
    marginVertical: Spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F3ED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.bright,
  },
  statusText: {
    color: '#0B654E',
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
    fontSize: 15,
    color: Colors.muted,
    lineHeight: 23,
    marginBottom: Spacing.lg,
  },
  infoCard: {
    backgroundColor: Colors.paper,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.line,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.muted,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ink,
  },
  actionBtn: {
    backgroundColor: Colors.ink,
    minHeight: 48,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
