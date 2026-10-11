import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radii } from '../constants/theme';

export default function Header({ onOpenMenu, onScrollToSection }) {
  const { width } = useWindowDimensions();
  const isNarrow = width < 380;
  const isTabletOrDesktop = width >= 768;

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {/* Brand Logo with responsive sizing */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onScrollToSection && onScrollToSection('hero')}
          style={styles.logoWrap}
          accessibilityLabel="Bangladesh Angels Network Home"
        >
          <Image
            source={require('../../assets/images/logo.png')}
            style={[
              styles.logo,
              isTabletOrDesktop
                ? styles.logoDesktop
                : isNarrow
                ? styles.logoNarrow
                : styles.logoMobile,
            ]}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Action buttons & Menu Trigger with generous breathing room */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.pitchButton,
              isTabletOrDesktop && styles.buttonDesktop,
            ]}
            activeOpacity={0.8}
            onPress={() => onScrollToSection && onScrollToSection('pitch')}
            accessibilityLabel="Pitch your startup"
          >
            <Text style={styles.pitchText}>PITCH</Text>
          </TouchableOpacity>

          {/* On standard mobile and above, display Join BAN button */}
          {!isNarrow && (
            <TouchableOpacity
              style={[
                styles.registerButton,
                isTabletOrDesktop && styles.buttonDesktop,
              ]}
              activeOpacity={0.8}
              onPress={() => onScrollToSection && onScrollToSection('plans')}
              accessibilityLabel="Join BAN membership plans"
            >
              <Text style={styles.registerText}>JOIN BAN</Text>
            </TouchableOpacity>
          )}

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
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    marginRight: 12,
  },
  logo: {
    height: 32,
    maxWidth: 130,
  },
  logoNarrow: {
    width: 114,
    height: 29,
  },
  logoMobile: {
    width: 128,
    height: 32,
  },
  logoDesktop: {
    width: 160,
    height: 38,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  pitchButton: {
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
  registerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  buttonDesktop: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radii.sm,
  },
  menuToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
});
