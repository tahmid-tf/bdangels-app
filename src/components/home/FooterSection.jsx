import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing } from '../../constants/theme';

export default function FooterSection({ onScrollToTop, onNavigateSection }) {
  const openUrl = (url) => {
    Linking.openURL(url).catch((err) => console.log('Link error:', err));
  };

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {/* Brand column */}
        <View style={styles.brandCol}>
          <Image
            source={require('../../../assets/images/logo-white.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.brandDesc}>
            {"Bangladesh's first and largest angel investment platform connecting early-stage startups with investors."}
          </Text>

          {/* Social icons */}
          <View style={styles.socialsRow}>
            <TouchableOpacity
              style={styles.socialBtn}
              activeOpacity={0.8}
              onPress={() => openUrl('https://www.linkedin.com/company/bangladesh-angels/')}
            >
              <Image
                source={require('../../../assets/images/linkedIn.webp')}
                style={styles.socialIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialBtn}
              activeOpacity={0.8}
              onPress={() => openUrl('https://www.facebook.com/bdangels.co')}
            >
              <Image
                source={require('../../../assets/images/fb_icon.webp')}
                style={styles.socialIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialBtn}
              activeOpacity={0.8}
              onPress={() => openUrl('https://x.com/BDAngelsNetwork')}
            >
              <Image
                source={require('../../../assets/images/twitter.webp')}
                style={styles.socialIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Link Sections */}
        <View style={styles.linksGrid}>
          {/* Explore */}
          <View style={styles.linkCol}>
            <Text style={styles.colTitle}>Explore</Text>
            <TouchableOpacity onPress={() => router.push('/angel-academy')}>
              <Text style={styles.linkText}>Angel Academy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/bwin')}>
              <Text style={styles.linkText}>BWIN Initiative</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/portfolio')}>
              <Text style={styles.linkText}>Portfolio Companies</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/deckvue')}>
              <Text style={styles.linkText}>DeckVue Due Diligence</Text>
            </TouchableOpacity>
          </View>

          {/* Get Started */}
          <View style={styles.linkCol}>
            <Text style={styles.colTitle}>Get Started</Text>
            <TouchableOpacity onPress={() => router.push('/plans')}>
              <Text style={styles.linkText}>Services & Plans</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/startups')}>
              <Text style={styles.linkText}>Pitch Your Startup</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/blogs')}>
              <Text style={styles.linkText}>Insights & Blogs</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/publications')}>
              <Text style={styles.linkText}>Publications</Text>
            </TouchableOpacity>
          </View>

          {/* Company & Contact */}
          <View style={styles.linkCol}>
            <Text style={styles.colTitle}>Company</Text>
            <TouchableOpacity onPress={() => router.push('/team')}>
              <Text style={styles.linkText}>Our Team</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/about-us')}>
              <Text style={styles.linkText}>About BAN</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/faq')}>
              <Text style={styles.linkText}>FAQ</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openUrl('mailto:hello@bdangels.co')}>
              <Text style={styles.contactEmail}>hello@bdangels.co</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Business details and Back to Top */}
        <View style={styles.businessRow}>
          <View style={styles.businessTextWrap}>
            <Text style={styles.businessName}>Bangladesh Angels Network Ltd.</Text>
            <Text style={styles.businessSub}>Dhaka, Bangladesh · Trade licence verified</Text>
          </View>

          <TouchableOpacity
            style={styles.backToTopBtn}
            activeOpacity={0.8}
            onPress={onScrollToTop}
            accessibilityLabel="Back to top"
          >
            <Image
              source={require('../../../assets/images/up_arrow.webp')}
              style={styles.upArrow}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          <Text style={styles.copyright}>© Bangladesh Angels Network. All rights reserved.</Text>
          <View style={styles.policyRow}>
            <TouchableOpacity onPress={() => openUrl('https://bdangels.co/policies/terms-and-conditions')}>
              <Text style={styles.policyLink}>Terms</Text>
            </TouchableOpacity>
            <Text style={styles.policyDot}>·</Text>
            <TouchableOpacity onPress={() => openUrl('https://bdangels.co/policies/privacy-policy')}>
              <Text style={styles.policyLink}>Privacy</Text>
            </TouchableOpacity>
            <Text style={styles.policyDot}>·</Text>
            <TouchableOpacity onPress={() => openUrl('https://bdangels.co/policies/delivery-policy')}>
              <Text style={styles.policyLink}>Delivery</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#04221D',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: 22,
  },
  inner: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  brandCol: {
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 170,
    height: 44,
    marginBottom: 12,
  },
  brandDesc: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 420,
    marginBottom: 16,
  },
  socialsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    width: 18,
    height: 18,
  },
  linksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  linkCol: {
    minWidth: 140,
    flex: 1,
    gap: 10,
  },
  colTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  linkText: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 13,
  },
  contactEmail: {
    color: Colors.mint,
    fontSize: 13,
    fontWeight: '700',
  },
  businessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  businessTextWrap: {
    flex: 1,
  },
  businessName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  businessSub: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 11,
    marginTop: 2,
  },
  backToTopBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upArrow: {
    width: 22,
    height: 22,
  },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: Spacing.md,
    flexDirection: 'column',
    gap: 8,
  },
  copyright: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  policyLink: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 12,
  },
  policyDot: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 12,
  },
});
