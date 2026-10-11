import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Animated,
  Easing,
  PanResponder,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radii, Shadows, Spacing } from '../../constants/theme';
import { resolveTeamPhoto } from '../../utils/imageResolver';

const CARD_WIDTH = 270;
const CARD_GAP = 16;
const ITEM_SPAN = CARD_WIDTH + CARD_GAP; // 286px per card slot
const PIXELS_PER_SEC = 38; // Smooth reading pace (~5-7 seconds per member)

// Alternating pastel avatar backgrounds matching web .ban2-team-profile
const AVATAR_BG_COLORS = ['#dff4eb', '#f9a7a7', '#dcecef'];

export default function TeamSection({ teamMembers, onSelectMember }) {
  const displayMembers =
    teamMembers && teamMembers.length > 0
      ? teamMembers
      : [
          {
            id: 1,
            name: 'Ivy Huq Russell',
            title: 'CEO',
            linkedin_url: 'https://www.linkedin.com/in/ivy-huq-russell-417487/',
          },
          {
            id: 2,
            name: 'Zaaim Zakir',
            title: 'Lead Deals Analyst',
            linkedin_url: 'https://www.linkedin.com/in/zaaim-zakir/',
          },
          {
            id: 3,
            name: 'Rifat Ara Bonnhy',
            title: 'Strategic Partnerships Lead',
            linkedin_url: 'https://www.linkedin.com/in/bonnhy/',
          },
          {
            id: 4,
            name: 'Nadim Abrar',
            title: 'Operations Analyst',
            linkedin_url: 'https://www.linkedin.com/in/nadim-abrar-26087721a/',
          },
          {
            id: 6,
            name: 'Prajna Paromita',
            title: 'Seasonal Analyst',
          },
          {
            id: 7,
            name: 'Arham Ahmed',
            title: 'Seasonal Analyst',
            linkedin_url: 'https://www.linkedin.com/in/rhmhmd/',
          },
          {
            id: 15,
            name: 'Tahmid Ferdous',
            title: 'Tech Analyst & Developer',
            linkedin_url: 'https://www.linkedin.com/in/tahmid-ferdous-7a66b8134/',
          },
        ];

  // Two identical groups cloned back-to-back for seamless infinite wrapping
  const duplicatedMembers = [...displayMembers, ...displayMembers];
  const singleListWidth = displayMembers.length * ITEM_SPAN;

  // React 19 safe stable animated value
  const [scrollX] = useState(() => new Animated.Value(0));
  const currentX = useRef(0);
  const animRef = useRef(null);
  const isPausedRef = useRef(false);
  const isDragging = useRef(false);
  const dragStart = useRef(0);
  const idleTimerRef = useRef(null);
  const startAnimationRef = useRef(null);

  const [isPaused, setIsPaused] = useState(false);

  // Smooth continuous linear marquee animation loop
  const startAnimation = useCallback(
    (fromValue = 0) => {
      if (isPausedRef.current) return;
      animRef.current?.stop();

      // Normalize starting point within [-singleListWidth, 0]
      let start = fromValue;
      while (start < -singleListWidth) start += singleListWidth;
      while (start > 0) start -= singleListWidth;

      scrollX.setValue(start);
      currentX.current = start;

      const remainingDistance = Math.abs(-singleListWidth - start);
      const duration = (remainingDistance / PIXELS_PER_SEC) * 1000;

      animRef.current = Animated.timing(scrollX, {
        toValue: -singleListWidth,
        duration: Math.max(100, duration),
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== 'web',
      });

      animRef.current.start(({ finished }) => {
        if (finished && !isPausedRef.current) {
          scrollX.setValue(0);
          currentX.current = 0;
          if (startAnimationRef.current) {
            startAnimationRef.current(0);
          }
        }
      });
    },
    [singleListWidth, scrollX]
  );

  useEffect(() => {
    startAnimationRef.current = startAnimation;
  }, [startAnimation]);

  const pauseAnimation = useCallback(() => {
    isPausedRef.current = true;
    setIsPaused(true);
    animRef.current?.stop();
    scrollX.stopAnimation((val) => {
      currentX.current = val;
    });
  }, [scrollX]);

  const resumeAnimation = useCallback(() => {
    isPausedRef.current = false;
    setIsPaused(false);
    startAnimation(currentX.current);
  }, [startAnimation]);

  const togglePause = useCallback(() => {
    if (isPausedRef.current) {
      resumeAnimation();
    } else {
      pauseAnimation();
    }
  }, [pauseAnimation, resumeAnimation]);

  const stepMarquee = useCallback(
    (direction) => {
      // direction = 1 moves left to next item, -1 moves right to previous item
      pauseAnimation();
      let target = currentX.current - direction * ITEM_SPAN;
      while (target < -singleListWidth) target += singleListWidth;
      while (target > 0) target -= singleListWidth;

      Animated.timing(scrollX, {
        toValue: target,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }).start(() => {
        currentX.current = target;
        // Resume auto-scroll after 3.5s of manual stepping
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(() => {
          resumeAnimation();
        }, 3500);
      });
    },
    [pauseAnimation, resumeAnimation, scrollX, singleListWidth]
  );

  useEffect(() => {
    startAnimation(0);

    return () => {
      animRef.current?.stop();
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [startAnimation]);

  const [panResponder, setPanResponder] = useState(null);

  // Initialize PanResponder inside useEffect to ensure zero ref access during render
  useEffect(() => {
    const pr = PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          Math.abs(gestureState.dx) > 10 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
        );
      },
      onPanResponderGrant: () => {
        isDragging.current = true;
        animRef.current?.stop();
        scrollX.stopAnimation((val) => {
          dragStart.current = val;
          currentX.current = val;
        });
      },
      onPanResponderMove: (_, gestureState) => {
        let newX = dragStart.current + gestureState.dx;
        while (newX > 0) newX -= singleListWidth;
        while (newX < -singleListWidth) newX += singleListWidth;
        scrollX.setValue(newX);
        currentX.current = newX;
      },
      onPanResponderRelease: () => {
        isDragging.current = false;
        if (!isPausedRef.current && startAnimationRef.current) {
          startAnimationRef.current(currentX.current);
        }
      },
      onPanResponderTerminate: () => {
        isDragging.current = false;
        if (!isPausedRef.current && startAnimationRef.current) {
          startAnimationRef.current(currentX.current);
        }
      },
    });

    setPanResponder(pr);
  }, [singleListWidth, scrollX]);

  const handleMemberPress = (member) => {
    if (member.linkedin_url) {
      Linking.openURL(member.linkedin_url).catch((err) =>
        console.log('LinkedIn URL error:', err)
      );
    } else if (onSelectMember) {
      onSelectMember(member);
    }
  };

  const renderPhoto = (member, index) => {
    const resolved = resolveTeamPhoto(member);
    const bgColor = AVATAR_BG_COLORS[index % AVATAR_BG_COLORS.length];

    return (
      <View style={[styles.photoContainer, { backgroundColor: bgColor }]}>
        <Image
          source={resolved.source}
          style={styles.photo}
          resizeMode="cover"
        />
        {member.linkedin_url && (
          <View style={styles.linkedinBadge}>
            <Ionicons name="logo-linkedin" size={10} color="#FFFFFF" />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {/* Section Header */}
        <View style={styles.header}>
          <Text style={styles.heading}>Our Team</Text>
          <Text style={styles.subtitle}>
            Meet the team behind Bangladesh Angels Network, connecting founders,
            investors, and partners across the entrepreneurial ecosystem.
          </Text>
        </View>

        {/* Marquee Status Bar & Controls */}
        <View style={styles.controlsRow}>
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                isPaused ? styles.statusDotPaused : styles.statusDotActive,
              ]}
            />
            <Text style={styles.statusText}>
              {isPaused ? 'Paused' : 'Auto-gliding'} • Tap card for LinkedIn
            </Text>
          </View>

          <View style={styles.controlButtons}>
            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => stepMarquee(-1)}
              activeOpacity={0.7}
              accessibilityLabel="Previous team member"
            >
              <Ionicons name="chevron-back" size={18} color={Colors.ink} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlBtn}
              onPress={togglePause}
              activeOpacity={0.7}
              accessibilityLabel={isPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
            >
              <Ionicons
                name={isPaused ? 'play' : 'pause'}
                size={14}
                color={Colors.ink}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => stepMarquee(1)}
              activeOpacity={0.7}
              accessibilityLabel="Next team member"
            >
              <Ionicons name="chevron-forward" size={18} color={Colors.ink} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Continuous Auto-Moving Marquee Track (Infinite Seamless Loop) */}
        <View style={styles.marqueeContainer} {...(panResponder ? panResponder.panHandlers : {})}>
          <Animated.View
            style={[
              styles.marqueeTrack,
              {
                width: singleListWidth * 2,
                transform: [{ translateX: scrollX }],
              },
            ]}
          >
            {duplicatedMembers.map((member, index) => {
              const uniqueKey = `${member.id || member.name}-${index}`;

              return (
                <TouchableOpacity
                  key={uniqueKey}
                  style={styles.card}
                  activeOpacity={0.9}
                  onPressIn={() => {
                    if (!isDragging.current) pauseAnimation();
                  }}
                  onPressOut={() => {
                    if (!isDragging.current && !isPaused) resumeAnimation();
                  }}
                  onPress={() => handleMemberPress(member)}
                >
                  {renderPhoto(member, index)}

                  <View style={styles.cardCopy}>
                    <Text style={styles.memberName} numberOfLines={1}>
                      {member.name}
                    </Text>
                    <Text style={styles.memberTitle} numberOfLines={2}>
                      {member.title}
                    </Text>
                    <Text style={styles.networkTag}>
                      BANGLADESH ANGELS NETWORK
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        </View>

        {/* Bottom Meet Full Team Link */}
        <TouchableOpacity
          style={styles.seeAllButton}
          activeOpacity={0.8}
          onPress={() => onSelectMember && onSelectMember(null)}
        >
          <Text style={styles.seeAllText}>Meet the full team</Text>
          <Ionicons name="arrow-forward" size={14} color={Colors.green} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
  },
  inner: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  heading: {
    color: Colors.ink,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginBottom: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusDotActive: {
    backgroundColor: Colors.green,
  },
  statusDotPaused: {
    backgroundColor: '#F59E0B',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.muted,
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  controlBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  marqueeContainer: {
    overflow: 'hidden',
    width: '100%',
    paddingVertical: 6,
  },
  marqueeTrack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    width: CARD_WIDTH,
    minHeight: 92,
    backgroundColor: Colors.paper,
    borderRadius: Radii.xl,
    padding: 12,
    marginRight: CARD_GAP,
    borderWidth: 1,
    borderColor: Colors.line,
    gap: 14,
    ...Shadows.card,
  },
  photoContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    position: 'relative',
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E5E7EB',
  },
  linkedinBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0A66C2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cardCopy: {
    flex: 1,
    justifyContent: 'center',
  },
  memberName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 3,
  },
  memberTitle: {
    fontSize: 12,
    color: Colors.green,
    fontWeight: '700',
    marginBottom: 4,
  },
  networkTag: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.muted,
    letterSpacing: 0.6,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    alignSelf: 'flex-start',
  },
  seeAllText: {
    color: Colors.green,
    fontSize: 14,
    fontWeight: '800',
  },
});
