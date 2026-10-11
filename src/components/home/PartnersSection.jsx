import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radii, Shadows, Spacing } from '../../constants/theme';

export default function PartnersSection() {
  const openUrl = (url) => {
    Linking.openURL(url).catch((err) => console.log('Link error:', err));
  };

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {/* Section Header */}
        <View style={styles.header}>
          <Text style={styles.kicker}>OUR PARTNERS</Text>
          <Text style={styles.heading}>A stronger ecosystem is built together.</Text>
          <Text style={styles.subtitle}>
            We collaborate with leading institutions, investment firms, and ecosystem builders to co-invest
            in high-potential startups and guide founders with meaningful industry expertise.
          </Text>
        </View>

        {/* Group 1: Founding Partners */}
        <View style={styles.group}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupNum}>01</Text>
            <Text style={styles.groupTitle}>Founding Partners</Text>
          </View>

          <View style={styles.partnerGrid}>
            <TouchableOpacity
              style={styles.partnerCard}
              activeOpacity={0.85}
              onPress={() => openUrl('https://www.government.nl/ministries/ministry-of-foreign-affairs')}
            >
              <Image
                source={require('../../../assets/images/foreignaffairsnetherland.webp')}
                style={styles.partnerLogo}
                resizeMode="contain"
              />
              <View style={styles.extIcon}>
                <Ionicons name="arrow-forward" size={13} color={Colors.ink} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.partnerCard}
              activeOpacity={0.85}
              onPress={() => openUrl('https://aavishkaarcapital.in/')}
            >
              <Image
                source={require('../../../assets/images/capital logo.webp')}
                style={styles.partnerLogo}
                resizeMode="contain"
              />
              <View style={styles.extIcon}>
                <Ionicons name="arrow-forward" size={13} color={Colors.ink} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Group 2: Industry Partners */}
        <View style={styles.group}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupNum}>02</Text>
            <Text style={styles.groupTitle}>Industry Partners</Text>
          </View>

          <View style={styles.partnerGrid}>
            <TouchableOpacity
              style={styles.partnerCard}
              activeOpacity={0.85}
              onPress={() => openUrl('https://bida.gov.bd/')}
            >
              <Image
                source={require('../../../assets/images/bidalogo.webp')}
                style={styles.partnerLogo}
                resizeMode="contain"
              />
              <View style={styles.extIcon}>
                <Ionicons name="arrow-forward" size={13} color={Colors.ink} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.partnerCard}
              activeOpacity={0.85}
              onPress={() => openUrl('https://venture.com.bd/')}
            >
              <Image
                source={require('../../../assets/images/bangladesh venture capital.webp')}
                style={styles.partnerLogo}
                resizeMode="contain"
              />
              <View style={styles.extIcon}>
                <Ionicons name="arrow-forward" size={13} color={Colors.ink} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.partnerCard}
              activeOpacity={0.85}
              onPress={() => openUrl('https://lightcastlepartners.com/')}
            >
              <View style={styles.textLogoWrap}>
                <Text style={styles.textLogoBold}>LightCastle</Text>
                <Text style={styles.textLogoMuted}>Partners</Text>
              </View>
              <View style={styles.extIcon}>
                <Ionicons name="arrow-forward" size={13} color={Colors.ink} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.deep, // Authentic web format deep emerald #05251F
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
    color: Colors.mint,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
    letterSpacing: -0.8,
    marginBottom: 12,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 15,
    lineHeight: 23,
  },
  group: {
    marginBottom: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.14)',
    paddingTop: Spacing.md,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  groupNum: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.mint,
    letterSpacing: 1,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  partnerGrid: {
    gap: 14,
  },
  partnerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    paddingVertical: 20,
    paddingHorizontal: 24,
    minHeight: 110,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...Shadows.card,
  },
  partnerLogo: {
    width: 220,
    height: 64,
  },
  textLogoWrap: {
    alignItems: 'center',
  },
  textLogoBold: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -0.5,
  },
  textLogoMuted: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.green,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  extIcon: {
    position: 'absolute',
    top: 10,
    right: 12,
    padding: 4,
  },
});
