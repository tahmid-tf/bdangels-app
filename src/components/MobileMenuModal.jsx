import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radii, Spacing } from '../constants/theme';
import { authState, logoutUser } from '../services/auth';

export default function MobileMenuModal({ visible, onClose, onNavigate }) {
  const handleNavigate = (path, sectionKey) => {
    onClose();
    setTimeout(() => {
      if (path) {
        router.push(path);
      } else if (onNavigate && sectionKey) {
        onNavigate(sectionKey);
      }
    }, 200);
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
            <TouchableOpacity style={styles.navItem} onPress={() => handleNavigate('/', 'hero')}>
              <Ionicons name="home-outline" size={20} color={Colors.green} />
              <Text style={styles.navLabel}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => handleNavigate('/events', 'events')}>
              <Ionicons name="calendar-outline" size={20} color={Colors.green} />
              <Text style={styles.navLabel}>Events</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => handleNavigate('/portfolio', 'portfolio')}>
              <Ionicons name="briefcase-outline" size={20} color={Colors.green} />
              <Text style={styles.navLabel}>Portfolio Showcase</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => handleNavigate('/team', 'team')}>
              <Ionicons name="people-outline" size={20} color={Colors.green} />
              <Text style={styles.navLabel}>Our Team</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => handleNavigate('/startups', 'pitch')}>
              <Ionicons name="rocket-outline" size={20} color={Colors.green} />
              <Text style={styles.navLabel}>Featured Startups & Services</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => handleNavigate('/plans', 'plans')}>
              <Ionicons name="card-outline" size={20} color={Colors.green} />
              <Text style={styles.navLabel}>Membership Plans</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => handleNavigate('/about-us', 'about')}>
              <Ionicons name="information-circle-outline" size={20} color={Colors.green} />
              <Text style={styles.navLabel}>About BAN</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => handleNavigate('/faq', 'faq')}>
              <Ionicons name="help-circle-outline" size={20} color={Colors.green} />
              <Text style={styles.navLabel}>FAQ & Support</Text>
            </TouchableOpacity>
          </View>

          {/* Programs */}
          <View style={styles.group}>
            <Text style={styles.groupLabel}>PROGRAMS</Text>
            <TouchableOpacity style={styles.navItem} onPress={() => handleNavigate('/bwin', 'programs')}>
              <Ionicons name="sparkles-outline" size={20} color={Colors.green} />
              <Text style={styles.navLabel}>BWIN (Women Investors)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => handleNavigate('/angel-academy', 'programs')}>
              <Ionicons name="school-outline" size={20} color={Colors.green} />
              <Text style={styles.navLabel}>Angel Academy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => handleNavigate('/deckvue', 'programs')}>
              <Ionicons name="layers-outline" size={20} color={Colors.green} />
              <Text style={styles.navLabel}>DeckVue (AI Due Diligence)</Text>
            </TouchableOpacity>
          </View>

          {/* Learn & Insights */}
          <View style={styles.group}>
            <Text style={styles.groupLabel}>LEARN & INSIGHTS</Text>
            <TouchableOpacity style={styles.navItem} onPress={() => handleNavigate('/blogs')}>
              <Ionicons name="newspaper-outline" size={20} color={Colors.green} />
              <Text style={styles.navLabel}>Insights & Blogs</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => handleNavigate('/publications')}>
              <Ionicons name="document-text-outline" size={20} color={Colors.green} />
              <Text style={styles.navLabel}>Publications & Reports</Text>
            </TouchableOpacity>
          </View>

          {/* Account & Admin */}
          <View style={styles.group}>
            <Text style={styles.groupLabel}>ACCOUNT & MEMBERSHIP</Text>
            {authState.isLoggedIn() ? (
              <>
                <View style={styles.userProfilePill}>
                  <Ionicons name="person-circle-outline" size={24} color={Colors.forest} />
                  <View style={styles.userProfileInfo}>
                    <Text style={styles.userProfileName} numberOfLines={1}>
                      {authState.getUser()?.name || 'BAN Member'}
                    </Text>
                    <Text style={styles.userProfileEmail} numberOfLines={1}>
                      {authState.getUser()?.email || ''}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.navItem} onPress={() => handleNavigate('/investor')}>
                  <Ionicons name="pie-chart-outline" size={20} color={Colors.forest} />
                  <Text style={[styles.navLabel, { fontWeight: '700', color: Colors.forest }]}>
                    Investor Workspace
                  </Text>
                </TouchableOpacity>

                {authState.isAdmin() && (
                  <TouchableOpacity style={styles.navItem} onPress={() => handleNavigate('/admin')}>
                    <Ionicons name="shield-checkmark-outline" size={20} color={Colors.forest} />
                    <Text style={[styles.navLabel, { fontWeight: '700', color: Colors.forest }]}>
                      Admin Dashboard
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.navItem}
                  onPress={async () => {
                    await logoutUser();
                    onClose();
                  }}
                >
                  <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                  <Text style={[styles.navLabel, { color: Colors.error }]}>Log Out</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.navItem} onPress={() => handleNavigate('/login')}>
                  <Ionicons name="log-in-outline" size={20} color={Colors.green} />
                  <Text style={styles.navLabel}>Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => handleNavigate('/register')}>
                  <Ionicons name="person-add-outline" size={20} color={Colors.forest} />
                  <Text style={[styles.navLabel, { color: Colors.forest, fontWeight: '700' }]}>
                    Create Account / Register
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* For Founders */}
          <View style={styles.group}>
            <Text style={styles.groupLabel}>FOR STARTUPS</Text>
            <TouchableOpacity style={styles.pitchCard} onPress={() => handleNavigate('/startups')}>
              <View style={styles.pitchCardHeader}>
                <Ionicons name="paper-plane-outline" size={22} color="#FFFFFF" />
                <Text style={styles.pitchCardTitle}>Pitch Your Startup</Text>
              </View>
              <Text style={styles.pitchCardDesc}>
                Submit your one-line elevator pitch and investor deck for screening.
              </Text>
              <Text style={styles.pitchCardAction}>Open Pitch Form →</Text>
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
  userProfilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: Radii.md,
    padding: 10,
    marginBottom: 8,
    gap: 10,
  },
  userProfileInfo: {
    flex: 1,
  },
  userProfileName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.ink,
  },
  userProfileEmail: {
    fontSize: 12,
    color: Colors.muted,
  },
});
