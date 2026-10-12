import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Radii } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(300, SCREEN_WIDTH * 0.82);

export default function AdminSidebar({
  visible,
  onClose,
  activeView,
  onSelectView,
  unreadNotificationsCount = 0,
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

  const renderContent = () => (
    <SafeAreaView style={styles.sidebarContainer}>
      {/* Top Header with Brand Logo */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.logoWrap}
          onPress={() => handleItemPress('overview')}
          activeOpacity={0.8}
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

      {/* Navigation Groups List */}
      <ScrollView
        style={styles.scrollList}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* GROUP 1: OVERVIEW */}
        <Text style={styles.sectionLabel}>Overview</Text>

        <TouchableOpacity
          style={[styles.navItem, activeView === 'overview' && styles.navItemActive]}
          onPress={() => handleItemPress('overview')}
          activeOpacity={0.75}
        >
          {activeView === 'overview' && <View style={styles.activeIndicator} />}
          <Ionicons
            name={activeView === 'overview' ? 'grid' : 'grid-outline'}
            size={18}
            color={activeView === 'overview' ? '#FFFFFF' : 'rgba(239, 252, 246, 0.75)'}
          />
          <Text style={[styles.navText, activeView === 'overview' && styles.navTextActive]}>
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeView === 'notifications' && styles.navItemActive]}
          onPress={() => handleItemPress('notifications')}
          activeOpacity={0.75}
        >
          {activeView === 'notifications' && <View style={styles.activeIndicator} />}
          <Ionicons
            name={activeView === 'notifications' ? 'notifications' : 'notifications-outline'}
            size={18}
            color={activeView === 'notifications' ? '#FFFFFF' : 'rgba(239, 252, 246, 0.75)'}
          />
          <Text style={[styles.navText, activeView === 'notifications' && styles.navTextActive]}>
            Notifications
          </Text>
          {unreadNotificationsCount > 0 && (
            <View style={styles.badgePill}>
              <Text style={styles.badgeText}>
                {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* GROUP 2: NETWORK */}
        <Text style={styles.sectionLabel}>Network</Text>

        <TouchableOpacity
          style={[styles.navItem, activeView === 'members' && styles.navItemActive]}
          onPress={() => handleItemPress('members')}
          activeOpacity={0.75}
        >
          {activeView === 'members' && <View style={styles.activeIndicator} />}
          <Ionicons
            name={activeView === 'members' ? 'people' : 'people-outline'}
            size={18}
            color={activeView === 'members' ? '#FFFFFF' : 'rgba(239, 252, 246, 0.75)'}
          />
          <Text style={[styles.navText, activeView === 'members' && styles.navTextActive]}>
            Members
          </Text>
        </TouchableOpacity>

        {/* GROUP 3: CONTENT */}
        <Text style={styles.sectionLabel}>Content</Text>

        <TouchableOpacity
          style={[styles.navItem, activeView === 'blogs' && styles.navItemActive]}
          onPress={() => handleItemPress('blogs')}
          activeOpacity={0.75}
        >
          {activeView === 'blogs' && <View style={styles.activeIndicator} />}
          <Ionicons
            name={activeView === 'blogs' ? 'newspaper' : 'newspaper-outline'}
            size={18}
            color={activeView === 'blogs' ? '#FFFFFF' : 'rgba(239, 252, 246, 0.75)'}
          />
          <Text style={[styles.navText, activeView === 'blogs' && styles.navTextActive]}>
            Blogs
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeView === 'publications' && styles.navItemActive]}
          onPress={() => handleItemPress('publications')}
          activeOpacity={0.75}
        >
          {activeView === 'publications' && <View style={styles.activeIndicator} />}
          <Ionicons
            name={activeView === 'publications' ? 'document-text' : 'document-text-outline'}
            size={18}
            color={activeView === 'publications' ? '#FFFFFF' : 'rgba(239, 252, 246, 0.75)'}
          />
          <Text style={[styles.navText, activeView === 'publications' && styles.navTextActive]}>
            Publications
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeView === 'landing-stats' && styles.navItemActive]}
          onPress={() => handleItemPress('landing-stats')}
          activeOpacity={0.75}
        >
          {activeView === 'landing-stats' && <View style={styles.activeIndicator} />}
          <Ionicons
            name={activeView === 'landing-stats' ? 'stats-chart' : 'stats-chart-outline'}
            size={18}
            color={activeView === 'landing-stats' ? '#FFFFFF' : 'rgba(239, 252, 246, 0.75)'}
          />
          <Text style={[styles.navText, activeView === 'landing-stats' && styles.navTextActive]}>
            Homepage Statistics
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeView === 'landing-programs' && styles.navItemActive]}
          onPress={() => handleItemPress('landing-programs')}
          activeOpacity={0.75}
        >
          {activeView === 'landing-programs' && <View style={styles.activeIndicator} />}
          <Ionicons
            name={activeView === 'landing-programs' ? 'layers' : 'layers-outline'}
            size={18}
            color={activeView === 'landing-programs' ? '#FFFFFF' : 'rgba(239, 252, 246, 0.75)'}
          />
          <Text style={[styles.navText, activeView === 'landing-programs' && styles.navTextActive]}>
            Homepage Programs
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeView === 'homepage-portfolios' && styles.navItemActive]}
          onPress={() => handleItemPress('homepage-portfolios')}
          activeOpacity={0.75}
        >
          {activeView === 'homepage-portfolios' && <View style={styles.activeIndicator} />}
          <Ionicons
            name={activeView === 'homepage-portfolios' ? 'briefcase' : 'briefcase-outline'}
            size={18}
            color={activeView === 'homepage-portfolios' ? '#FFFFFF' : 'rgba(239, 252, 246, 0.75)'}
          />
          <Text style={[styles.navText, activeView === 'homepage-portfolios' && styles.navTextActive]}>
            Homepage Portfolios
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeView === 'team-about' && styles.navItemActive]}
          onPress={() => handleItemPress('team-about')}
          activeOpacity={0.75}
        >
          {activeView === 'team-about' && <View style={styles.activeIndicator} />}
          <Ionicons
            name={activeView === 'team-about' ? 'information-circle' : 'information-circle-outline'}
            size={18}
            color={activeView === 'team-about' ? '#FFFFFF' : 'rgba(239, 252, 246, 0.75)'}
          />
          <Text style={[styles.navText, activeView === 'team-about' && styles.navTextActive]}>
            Team About Section
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeView === 'events' && styles.navItemActive]}
          onPress={() => handleItemPress('events')}
          activeOpacity={0.75}
        >
          {activeView === 'events' && <View style={styles.activeIndicator} />}
          <Ionicons
            name={activeView === 'events' ? 'calendar' : 'calendar-outline'}
            size={18}
            color={activeView === 'events' ? '#FFFFFF' : 'rgba(239, 252, 246, 0.75)'}
          />
          <Text style={[styles.navText, activeView === 'events' && styles.navTextActive]}>
            Events
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeView === 'startup-services' && styles.navItemActive]}
          onPress={() => handleItemPress('startup-services')}
          activeOpacity={0.75}
        >
          {activeView === 'startup-services' && <View style={styles.activeIndicator} />}
          <Ionicons
            name={activeView === 'startup-services' ? 'rocket' : 'rocket-outline'}
            size={18}
            color={activeView === 'startup-services' ? '#FFFFFF' : 'rgba(239, 252, 246, 0.75)'}
          />
          <Text style={[styles.navText, activeView === 'startup-services' && styles.navTextActive]}>
            Startup Services
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeView === 'team-members' && styles.navItemActive]}
          onPress={() => handleItemPress('team-members')}
          activeOpacity={0.75}
        >
          {activeView === 'team-members' && <View style={styles.activeIndicator} />}
          <Ionicons
            name={activeView === 'team-members' ? 'person-circle' : 'person-circle-outline'}
            size={18}
            color={activeView === 'team-members' ? '#FFFFFF' : 'rgba(239, 252, 246, 0.75)'}
          />
          <Text style={[styles.navText, activeView === 'team-members' && styles.navTextActive]}>
            Team Directory
          </Text>
        </TouchableOpacity>

        {/* GROUP 4: PIPELINE */}
        <Text style={styles.sectionLabel}>Pipeline</Text>

        <TouchableOpacity
          style={[styles.navItem, activeView === 'deals' && styles.navItemActive]}
          onPress={() => handleItemPress('deals')}
          activeOpacity={0.75}
        >
          {activeView === 'deals' && <View style={styles.activeIndicator} />}
          <Ionicons
            name={activeView === 'deals' ? 'briefcase' : 'briefcase-outline'}
            size={18}
            color={activeView === 'deals' ? '#FFFFFF' : 'rgba(239, 252, 246, 0.75)'}
          />
          <Text style={[styles.navText, activeView === 'deals' && styles.navTextActive]}>
            Deals
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeView === 'founder-pitches' && styles.navItemActive]}
          onPress={() => handleItemPress('founder-pitches')}
          activeOpacity={0.75}
        >
          {activeView === 'founder-pitches' && <View style={styles.activeIndicator} />}
          <Ionicons
            name={activeView === 'founder-pitches' ? 'paper-plane' : 'paper-plane-outline'}
            size={18}
            color={activeView === 'founder-pitches' ? '#FFFFFF' : 'rgba(239, 252, 246, 0.75)'}
          />
          <Text style={[styles.navText, activeView === 'founder-pitches' && styles.navTextActive]}>
            Founder Pitch Submissions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeView === 'angel-academy' && styles.navItemActive]}
          onPress={() => handleItemPress('angel-academy')}
          activeOpacity={0.75}
        >
          {activeView === 'angel-academy' && <View style={styles.activeIndicator} />}
          <Ionicons
            name={activeView === 'angel-academy' ? 'school' : 'school-outline'}
            size={18}
            color={activeView === 'angel-academy' ? '#FFFFFF' : 'rgba(239, 252, 246, 0.75)'}
          />
          <Text style={[styles.navText, activeView === 'angel-academy' && styles.navTextActive]}>
            Angel Academy Applications
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeView === 'subscriptions' && styles.navItemActive]}
          onPress={() => handleItemPress('subscriptions')}
          activeOpacity={0.75}
        >
          {activeView === 'subscriptions' && <View style={styles.activeIndicator} />}
          <Ionicons
            name={activeView === 'subscriptions' ? 'card' : 'card-outline'}
            size={18}
            color={activeView === 'subscriptions' ? '#FFFFFF' : 'rgba(239, 252, 246, 0.75)'}
          />
          <Text style={[styles.navText, activeView === 'subscriptions' && styles.navTextActive]}>
            Subscriptions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeView === 'investments' && styles.navItemActive]}
          onPress={() => handleItemPress('investments')}
          activeOpacity={0.75}
        >
          {activeView === 'investments' && <View style={styles.activeIndicator} />}
          <Ionicons
            name={activeView === 'investments' ? 'trending-up' : 'trending-up-outline'}
            size={18}
            color={activeView === 'investments' ? '#FFFFFF' : 'rgba(239, 252, 246, 0.75)'}
          />
          <Text style={[styles.navText, activeView === 'investments' && styles.navTextActive]}>
            Investments
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeView === 'investor-investments' && styles.navItemActive]}
          onPress={() => handleItemPress('investor-investments')}
          activeOpacity={0.75}
        >
          {activeView === 'investor-investments' && <View style={styles.activeIndicator} />}
          <Ionicons
            name={activeView === 'investor-investments' ? 'folder-open' : 'folder-open-outline'}
            size={18}
            color={activeView === 'investor-investments' ? '#FFFFFF' : 'rgba(239, 252, 246, 0.75)'}
          />
          <Text style={[styles.navText, activeView === 'investor-investments' && styles.navTextActive]}>
            Investors Investments
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeView === 'ban-wealth-orders' && styles.navItemActive]}
          onPress={() => handleItemPress('ban-wealth-orders')}
          activeOpacity={0.75}
        >
          {activeView === 'ban-wealth-orders' && <View style={styles.activeIndicator} />}
          <Ionicons
            name={activeView === 'ban-wealth-orders' ? 'receipt' : 'receipt-outline'}
            size={18}
            color={activeView === 'ban-wealth-orders' ? '#FFFFFF' : 'rgba(239, 252, 246, 0.75)'}
          />
          <Text style={[styles.navText, activeView === 'ban-wealth-orders' && styles.navTextActive]}>
            BAN Wealth Orders
          </Text>
        </TouchableOpacity>

        {/* GROUP 5: COMMUNICATION */}
        <Text style={styles.sectionLabel}>Communication</Text>

        <TouchableOpacity
          style={[styles.navItem, activeView === 'mail-campaigns' && styles.navItemActive]}
          onPress={() => handleItemPress('mail-campaigns')}
          activeOpacity={0.75}
        >
          {activeView === 'mail-campaigns' && <View style={styles.activeIndicator} />}
          <Ionicons
            name={activeView === 'mail-campaigns' ? 'mail' : 'mail-outline'}
            size={18}
            color={activeView === 'mail-campaigns' ? '#FFFFFF' : 'rgba(239, 252, 246, 0.75)'}
          />
          <Text style={[styles.navText, activeView === 'mail-campaigns' && styles.navTextActive]}>
            Email Campaigns
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Footer Profile & Actions */}
      <View style={styles.footer}>
        <View style={styles.profileRow}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {(currentUser?.name || 'A').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>
              {currentUser?.name || 'Administrator'}
            </Text>
            <View style={styles.rolePill}>
              <Text style={styles.rolePillText}>ADMIN</Text>
            </View>
          </View>
        </View>

        <View style={styles.footerActions}>
          <TouchableOpacity
            style={styles.publicAppBtn}
            onPress={() => {
              if (onClose) onClose();
              router.replace('/');
            }}
          >
            <Ionicons name="arrow-back-outline" size={14} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.publicAppBtnText}>Public App</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => {
              if (onClose) onClose();
              if (onLogout) onLogout();
            }}
          >
            <Ionicons name="log-out-outline" size={14} color="#F87171" />
            <Text style={styles.logoutBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );

  if (isPermanent) {
    return <View style={styles.permanentWrapper}>{renderContent()}</View>;
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* Backdrop touchable to close */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        {/* Drawer container */}
        <View style={styles.drawerCard}>
          {renderContent()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  drawerCard: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: '#0a5554',
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 20,
  },
  permanentWrapper: {
    width: 260,
    height: '100%',
    backgroundColor: '#0a5554',
  },
  sidebarContainer: {
    flex: 1,
    backgroundColor: '#0a5554',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  logoWrap: {
    paddingVertical: 2,
  },
  logo: {
    width: 140,
    height: 38,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  sectionLabel: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 6,
    color: 'rgba(216, 245, 232, 0.45)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  navItem: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 12,
  },
  navItemActive: {
    backgroundColor: 'rgba(59, 190, 139, 0.28)',
    borderWidth: 1,
    borderColor: 'rgba(180, 244, 216, 0.22)',
  },
  activeIndicator: {
    position: 'absolute',
    left: 2,
    top: 9,
    bottom: 9,
    width: 3.5,
    borderRadius: 2,
    backgroundColor: '#7de0b6',
  },
  navText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(239, 252, 246, 0.75)',
  },
  navTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  badgePill: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.pill,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  bottomSpacer: {
    height: 20,
  },
  footer: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    gap: 10,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#C9F3DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B4A3E',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  rolePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(59, 190, 139, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radii.pill,
  },
  rolePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#7de0b6',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  publicAppBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 7,
    borderRadius: Radii.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  publicAppBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logoutBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 7,
    borderRadius: Radii.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  logoutBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F87171',
  },
});
