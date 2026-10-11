import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

export default function SubpageHeader({
  title,
  onOpenMenu,
  showBack = true,
  onBack,
}) {
  const { width } = useWindowDimensions();
  const isNarrow = width < 380;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleGoHome = () => {
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {/* Left: Back button + Logo */}
        <View style={styles.leftGroup}>
          {showBack && (
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={handleBack}
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={20} color={Colors.ink} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleGoHome}
            style={styles.logoWrap}
            accessibilityLabel="Bangladesh Angels Home"
          >
            <Image
              source={require('../../assets/images/logo.png')}
              style={isNarrow ? styles.logoNarrow : styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Right: Pitch button + Menu trigger */}
        <View style={styles.rightGroup}>
          <TouchableOpacity
            style={styles.pitchBtn}
            activeOpacity={0.8}
            onPress={() => router.push('/startups')}
            accessibilityLabel="Pitch your startup"
          >
            <Text style={styles.pitchText}>PITCH</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuToggle}
            activeOpacity={0.7}
            onPress={onOpenMenu}
            accessibilityLabel="Open navigation menu"
          >
            <Ionicons name="menu-outline" size={22} color={Colors.ink} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Optional subpage breadcrumb bar */}
      {title && (
        <View style={styles.titleBar}>
          <Text style={styles.titleText}>{title}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    zIndex: 100,
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 30,
  },
  logoNarrow: {
    width: 105,
    height: 27,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  pitchBtn: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.ink,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pitchText: {
    color: Colors.ink,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  menuToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBar: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  titleText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.green,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
