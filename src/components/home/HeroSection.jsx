import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Radii, Shadows, Spacing } from '../../constants/theme';

export default function HeroSection({ stats, onScrollToSection }) {
  const displayStats = stats && stats.length > 0 ? stats : [
    { id: 1, value: '500+', label: 'Angel Investors' },
    { id: 2, value: '$11.5M+', label: 'Capital Facilitated' },
    { id: 3, value: '54+', label: 'Portfolio Companies' },
  ];

  return (
    <View style={styles.container}>
      {/* Hero Copy */}
      <View style={styles.copyContainer}>
        <View style={styles.kickerRow}>
          <View style={styles.kickerBar} />
          <Text style={styles.kickerText}>BANGLADESH ANGELS NETWORK</Text>
        </View>

        <Text style={styles.title}>Join BAN</Text>

        <Text style={styles.lede}>
          {"Bangladesh's first and largest angel-investment platform brings together investors, operators, and entrepreneurs to build the country's next generation of enduring companies."}
        </Text>

        <View style={styles.promptRow}>
          <View style={styles.promptLine} />
          <Text style={styles.promptText}>{"I'M LOOKING TO"}</Text>
        </View>

        {/* CTA Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={() => onScrollToSection && onScrollToSection('plans')}
          >
            <Text style={styles.primaryButtonText}>Invest</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.85}
            onPress={() => onScrollToSection && onScrollToSection('pitch')}
          >
            <Text style={styles.secondaryButtonText}>Fundraise</Text>
          </TouchableOpacity>
        </View>

        {/* Proof / Stats */}
        <View style={styles.proofGrid}>
          {displayStats.map((item, index) => (
            <View key={item.id || index} style={[styles.proofItem, index === 0 && { paddingLeft: 0, borderLeftWidth: 0 }]}>
              <Text style={styles.proofValue}>{item.value}</Text>
              <Text style={styles.proofLabel} numberOfLines={2}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Hero Visual Frame */}
      <View style={styles.visualContainer}>
        <View style={styles.visualFrame}>
          <View style={styles.visualTopline}>
            <Text style={styles.visualToplineText}>THE BAN NETWORK</Text>
          </View>

          <Image
            source={require('../../../assets/images/landing.png')}
            style={styles.visualImage}
            resizeMode="contain"
          />

          <View style={styles.floatingPill}>
            <View style={styles.pulsingDot} />
            <Text style={styles.floatingPillText}>Investing across Bangladesh and beyond</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  copyContainer: {
    marginBottom: Spacing.xl,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  kickerBar: {
    width: 20,
    height: 2,
    backgroundColor: Colors.green,
  },
  kickerText: {
    color: Colors.green,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 44,
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -1.2,
    lineHeight: 48,
    marginBottom: Spacing.md,
  },
  lede: {
    fontSize: 16,
    color: Colors.muted,
    lineHeight: 25,
    marginBottom: Spacing.lg,
  },
  promptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  promptLine: {
    width: 18,
    height: 2,
    backgroundColor: Colors.green,
  },
  promptText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 1.2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Spacing.xl,
  },
  primaryButton: {
    flex: 1,
    minHeight: 52,
    backgroundColor: Colors.ink,
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    flex: 1,
    minHeight: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    color: Colors.ink,
    fontSize: 16,
    fontWeight: '800',
  },
  proofGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
  },
  proofItem: {
    flex: 1,
    paddingHorizontal: 8,
    borderLeftWidth: 1,
    borderLeftColor: Colors.line,
  },
  proofValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  proofLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    lineHeight: 14,
  },
  visualContainer: {
    alignItems: 'center',
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  visualFrame: {
    width: '100%',
    minHeight: 330,
    backgroundColor: '#DCEFE5',
    borderRadius: Radii.xxl,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: Spacing.md,
    paddingTop: 48,
    paddingBottom: 48,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    ...Shadows.card,
  },
  visualTopline: {
    position: 'absolute',
    top: 16,
    left: 20,
    right: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(9, 47, 41, 0.12)',
  },
  visualToplineText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: 1.2,
  },
  visualImage: {
    width: '100%',
    height: 230,
  },
  floatingPill: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.bright,
  },
  floatingPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.ink,
  },
});
