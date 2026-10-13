import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Radii } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(300, SCREEN_WIDTH * 0.82);

export default function InvestorSidebar({
  visible,
  onClose,
  activeView,
  onSelectView,
  currentUser = null,
  onLogout,
  isPermanent = false,
}) {
  const handleItemPress = (viewKey) => {
    onSelectView(viewKey);
    if (!isPermanent && onClose) {
      onClose();
    }
  };

  const handleBackToWebsite = () => {
    if (onClose) onClose();
    router.push('/');
  };

  const handleLogoutPress = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your investor account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            if (onClose) onClose();
            if (onLogout) onLogout();
          },
        },
      ]
    );
  };

  const renderContent = () => {
    const initials = (currentUser?.name || 'Investor')
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const tierLabel = currentUser?.account_status
      ? currentUser.account_status.charAt(0).toUpperCase() + currentUser.account_status.slice(1)
      : (currentUser?.selected_plan || 'Active Member');

    return (
      <SafeAreaView style={styles.sidebarContainer}>
        {/* Brand Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.logoWrap}
            onPress={() => handleItemPress('overview')}
            activeOpacity={0.8}
            accessibilityLabel="Investor Dashboard Home"
          >
            <Image
              source={require('../../../assets/images/logo-white.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {!isPermanent && (
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              accessibilityLabel="Close sidebar menu"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Investor Identity Card */}
        <View style={styles.identityCard}>
          {currentUser?.profile_photo_url ? (
            <Image
              source={{ uri: currentUser.profile_photo_url }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}

          <View style={styles.identityInfo}>
            <Text style={styles.identityName} numberOfLines={1}>
              {currentUser?.name || 'Investor'}
            </Text>
            <View style={styles.tierPillRow}>
              <Text style={styles.tierPillText}>INVESTOR ACCOUNT</Text>
            </View>
            <Text style={styles.identitySub} numberOfLines={1}>
              {tierLabel}
            </Text>
          </View>
        </View>

        {/* Navigation List */}
        <ScrollView
          style={styles.scrollList}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* SECTION: WORKSPACE */}
          <Text style={styles.sectionLabel}>WORKSPACE</Text>

          {/* Dashboard Overview */}
          <TouchableOpacity
            style={[styles.navItem, activeView === 'overview' && styles.navItemActive]}
            onPress={() => handleItemPress('overview')}
            activeOpacity={0.75}
          >
            {activeView === 'overview' && <View style={styles.activeIndicator} />}
            <Ionicons
              name={activeView === 'overview' ? 'grid' : 'grid-outline'}
              size={19}
              color={activeView === 'overview' ? '#70D9A9' : 'rgba(238, 251, 245, 0.72)'}
            />
            <Text style={[styles.navText, activeView === 'overview' && styles.navTextActive]}>
              Dashboard
            </Text>
          </TouchableOpacity>

          {/* My Investments */}
          <TouchableOpacity
            style={[styles.navItem, activeView === 'investments' && styles.navItemActive]}
            onPress={() => handleItemPress('investments')}
            activeOpacity={0.75}
          >
            {activeView === 'investments' && <View style={styles.activeIndicator} />}
            <Ionicons
              name={activeView === 'investments' ? 'wallet' : 'wallet-outline'}
              size={19}
              color={activeView === 'investments' ? '#70D9A9' : 'rgba(238, 251, 245, 0.72)'}
            />
            <Text style={[styles.navText, activeView === 'investments' && styles.navTextActive]}>
              My Investments
            </Text>
          </TouchableOpacity>

          {/* Portfolio Companies */}
          <TouchableOpacity
            style={[styles.navItem, activeView === 'portfolio' && styles.navItemActive]}
            onPress={() => handleItemPress('portfolio')}
            activeOpacity={0.75}
          >
            {activeView === 'portfolio' && <View style={styles.activeIndicator} />}
            <Ionicons
              name={activeView === 'portfolio' ? 'briefcase' : 'briefcase-outline'}
              size={19}
              color={activeView === 'portfolio' ? '#70D9A9' : 'rgba(238, 251, 245, 0.72)'}
            />
            <Text style={[styles.navText, activeView === 'portfolio' && styles.navTextActive]}>
              Portfolio Companies
            </Text>
          </TouchableOpacity>

          {/* Active Deals / Opportunities */}
          <TouchableOpacity
            style={[styles.navItem, activeView === 'deals' && styles.navItemActive]}
            onPress={() => handleItemPress('deals')}
            activeOpacity={0.75}
          >
            {activeView === 'deals' && <View style={styles.activeIndicator} />}
            <Ionicons
              name={activeView === 'deals' ? 'rocket' : 'rocket-outline'}
              size={19}
              color={activeView === 'deals' ? '#70D9A9' : 'rgba(238, 251, 245, 0.72)'}
            />
            <Text style={[styles.navText, activeView === 'deals' && styles.navTextActive]}>
              Active Deals
            </Text>
          </TouchableOpacity>

          {/* SECTION: ACCOUNT */}
          <Text style={styles.sectionLabel}>ACCOUNT</Text>

          {/* Membership Receipts */}
          <TouchableOpacity
            style={[styles.navItem, activeView === 'orders' && styles.navItemActive]}
            onPress={() => handleItemPress('orders')}
            activeOpacity={0.75}
          >
            {activeView === 'orders' && <View style={styles.activeIndicator} />}
            <Ionicons
              name={activeView === 'orders' ? 'receipt' : 'receipt-outline'}
              size={19}
              color={activeView === 'orders' ? '#70D9A9' : 'rgba(238, 251, 245, 0.72)'}
            />
            <Text style={[styles.navText, activeView === 'orders' && styles.navTextActive]}>
              Membership Receipts
            </Text>
          </TouchableOpacity>

          {/* Profile & Settings */}
          <TouchableOpacity
            style={[styles.navItem, activeView === 'profile' && styles.navItemActive]}
            onPress={() => handleItemPress('profile')}
            activeOpacity={0.75}
          >
            {activeView === 'profile' && <View style={styles.activeIndicator} />}
            <Ionicons
              name={activeView === 'profile' ? 'person-circle' : 'person-circle-outline'}
              size={19}
              color={activeView === 'profile' ? '#70D9A9' : 'rgba(238, 251, 245, 0.72)'}
            />
            <Text style={[styles.navText, activeView === 'profile' && styles.navTextActive]}>
              Profile Settings
            </Text>
          </TouchableOpacity>

          {/* Back to Website */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={handleBackToWebsite}
            activeOpacity={0.75}
          >
            <Ionicons name="home-outline" size={19} color="rgba(238, 251, 245, 0.72)" />
            <Text style={styles.navText}>Back to Website</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Footer: Sign Out */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogoutPress}
            activeOpacity={0.8}
            accessibilityLabel="Sign out of investor workspace"
          >
            <Text style={styles.logoutText}>Sign out</Text>
            <Ionicons name="arrow-forward" size={16} color="rgba(238, 251, 245, 0.8)" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  };

  if (isPermanent) {
    return <View style={styles.permanentSidebar}>{renderContent()}</View>;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
          accessibilityLabel="Close investor sidebar backdrop"
        />
        <View style={styles.drawerShell}>{renderContent()}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(3, 24, 21, 0.55)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  drawerShell: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: '#073D35',
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 16,
  },
  permanentSidebar: {
    width: 272,
    height: '100%',
    backgroundColor: '#073D35',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.08)',
  },
  sidebarContainer: {
    flex: 1,
    backgroundColor: '#073D35',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  logoWrap: {
    flex: 1,
  },
  logo: {
    width: 140,
    height: 38,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#70D9A9',
  },
  avatarBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0C5C4C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#70D9A9',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  identityInfo: {
    flex: 1,
  },
  identityName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  tierPillRow: {
    marginTop: 2,
  },
  tierPillText: {
    color: '#70D9A9',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  identitySub: {
    color: 'rgba(222, 245, 234, 0.65)',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  scrollList: {
    flex: 1,
    paddingHorizontal: 12,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  sectionLabel: {
    color: 'rgba(222, 245, 234, 0.45)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 18,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginVertical: 2,
    gap: 12,
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: 'rgba(115, 216, 169, 0.16)',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 6,
    bottom: 6,
    width: 3.5,
    backgroundColor: '#70D9A9',
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  navText: {
    color: 'rgba(238, 251, 245, 0.72)',
    fontSize: 13.5,
    fontWeight: '700',
  },
  navTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: Radii.pill,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  logoutText: {
    color: '#FCA5A5',
    fontSize: 13,
    fontWeight: '700',
  },
});
