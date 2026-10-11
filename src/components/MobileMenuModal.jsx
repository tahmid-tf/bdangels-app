import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radii, Spacing } from '../constants/theme';

export default function MobileMenuModal({ visible, onClose, onNavigate }) {
  const handleItemPress = (sectionKey) => {
    onClose();
    if (onNavigate) {
      setTimeout(() => {
        onNavigate(sectionKey);
      }, 250);
    }
  };

  const openUrl = (url) => {
    Linking.openURL(url).catch((err) => console.log('Link error:', err));
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.title}>Menu</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityLabel="Close navigation menu"
          >
            <Ionicons name="close" size={26} color={Colors.ink} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Main Navigation Section */}
          <View style={styles.group}>
            <Text style={styles.groupLabel}>NAVIGATION</Text>
            <TouchableOpacity style={styles.navItem} onPress={() => handleItemPress('hero')}>
              <Ionicons name="home-outline" size={20} color={Colors.green} />
              <Text style={styles.navLabel}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => handleItemPress('events')}>
              <Ionicons name="calendar-outline" size={20} color={Colors.green} />
              <Text style={styles.navLabel}>BAN Events</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => handleItemPress('plans')}>
              <Ionicons name="card-outline" size={20} color={Colors.green} />
              <Text style={styles.navLabel}>Membership Plans</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => handleItemPress('portfolio')}>
              <Ionicons name="briefcase-outline" size={20} color={Colors.green} />
              <Text style={styles.navLabel}>Portfolio Showcase</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => handleItemPress('team')}>
              <Ionicons name="people-outline" size={20} color={Colors.green} />
              <Text style={styles.navLabel}>Our Team</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => handleItemPress('partners')}>
              <Ionicons name="globe-outline" size={20} color={Colors.green} />
              <Text style={styles.navLabel}>Partners & Ecosystem</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => handleItemPress('faq')}>
              <Ionicons name="help-circle-outline" size={20} color={Colors.green} />
              <Text style={styles.navLabel}>FAQ & Support</Text>
            </TouchableOpacity>
          </View>

          {/* Programs */}
          <View style={styles.group}>
            <Text style={styles.groupLabel}>PROGRAMS</Text>
            <TouchableOpacity style={styles.navItem} onPress={() => handleItemPress('programs')}>
              <Ionicons name="sparkles-outline" size={20} color={Colors.green} />
              <Text style={styles.navLabel}>BWIN (Women Investors)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => handleItemPress('programs')}>
              <Ionicons name="school-outline" size={20} color={Colors.green} />
              <Text style={styles.navLabel}>Angel Academy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => handleItemPress('programs')}>
              <Ionicons name="layers-outline" size={20} color={Colors.green} />
              <Text style={styles.navLabel}>DeckVue & Services</Text>
            </TouchableOpacity>
          </View>

          {/* For Founders */}
          <View style={styles.group}>
            <Text style={styles.groupLabel}>FOR STARTUPS</Text>
            <TouchableOpacity style={styles.pitchCard} onPress={() => handleItemPress('pitch')}>
              <View style={styles.pitchCardHeader}>
                <Ionicons name="paper-plane-outline" size={22} color="#FFFFFF" />
                <Text style={styles.pitchCardTitle}>Pitch Your Startup</Text>
              </View>
              <Text style={styles.pitchCardDesc}>
                Submit your one-line elevator pitch and investor deck for screening.
              </Text>
              <Text style={styles.pitchCardAction}>Open Submission Form →</Text>
            </TouchableOpacity>
          </View>

          {/* Contact */}
          <View style={styles.footerNote}>
            <Text style={styles.footerText}>Bangladesh Angels Network</Text>
            <TouchableOpacity onPress={() => openUrl('mailto:hello@bdangels.co')}>
              <Text style={styles.footerEmail}>hello@bdangels.co</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.ink,
  },
  closeButton: {
    padding: 6,
    borderRadius: Radii.pill,
    backgroundColor: Colors.cream,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  group: {
    marginBottom: Spacing.xl,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.muted,
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lineLight,
  },
  navLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.ink,
  },
  pitchCard: {
    backgroundColor: Colors.deep,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginTop: 4,
  },
  pitchCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  pitchCardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  pitchCardDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  pitchCardAction: {
    color: Colors.mint,
    fontSize: 13,
    fontWeight: '800',
  },
  footerNote: {
    paddingTop: Spacing.lg,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.line,
  },
  footerText: {
    fontSize: 13,
    color: Colors.muted,
  },
  footerEmail: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.green,
    marginTop: 4,
  },
});
