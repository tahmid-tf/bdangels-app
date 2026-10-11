import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radii, Shadows, Spacing } from '../../constants/theme';

export default function ProgramsSection({ programs, onSelectProgram }) {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const displayPrograms = programs && programs.length > 0 ? programs : [
    {
      id: 1,
      title: 'BWIN',
      badge: 'INITIATIVE',
      description: 'Building a more diverse pipeline of investors and entrepreneurs across Bangladesh.',
      theme: 'blush',
    },
    {
      id: 2,
      title: 'Angel Academy',
      badge: 'EDUCATION',
      description: 'Practical learning for aspiring and active angels—from first principles to investment committee.',
      theme: 'dark',
    },
    {
      id: 4,
      title: 'Services',
      badge: 'ADVISORY',
      description: 'Empowering founders with the strategic guidance, resources, and connections they need to build and scale successful ventures.',
      theme: 'mint',
      dropdown_items: {
        label: 'View Services',
        items: [
          { title: 'Founder Services', link: '/startups#our-services' },
          { title: 'Legal Services', link: '/startups#our-services' },
          { title: 'Deckvue (AI Due Diligence)', link: '/deckvue' },
        ],
      },
    },
  ];

  const handleProgramPress = (prog) => {
    if (prog.dropdown_items?.items?.length) {
      setActiveDropdown(prog);
    } else if (onSelectProgram) {
      onSelectProgram(prog);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.kicker}>OUR PROGRAMS</Text>
          <Text style={styles.heading}>Three focused platforms. One stronger ecosystem.</Text>
          <Text style={styles.description}>
            Explore the initiatives BAN has built to broaden participation, strengthen investment practice,
            and make startup evaluation more effective.
          </Text>
        </View>

        <View style={styles.grid}>
          {displayPrograms.map((prog) => {
            const isDark = prog.theme === 'dark' || prog.title?.toLowerCase().includes('academy');
            const isMint = prog.theme === 'mint' || prog.title?.toLowerCase().includes('service');
            const cardBg = isDark ? Colors.ink : isMint ? '#DFF4EB' : '#FFF8FB';
            const textColor = isDark ? '#FFFFFF' : Colors.ink;
            const descColor = isDark ? 'rgba(255, 255, 255, 0.7)' : '#57716A';

            return (
              <View
                key={prog.id}
                style={[
                  styles.card,
                  { backgroundColor: cardBg },
                  isDark && styles.darkCard,
                ]}
              >
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardEyebrow, isDark && { color: Colors.mint }]}>
                    {prog.badge || 'PROGRAM'}
                  </Text>
                  <Text style={[styles.cardTitle, { color: textColor }]}>
                    {prog.title}
                  </Text>
                  <Text style={[styles.cardDesc, { color: descColor }]}>
                    {prog.description}
                  </Text>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      isDark ? styles.actionButtonDark : styles.actionButtonLight,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => handleProgramPress(prog)}
                  >
                    <Text style={[styles.actionButtonText, isDark && { color: '#FFFFFF' }]}>
                      {prog.dropdown_items?.label || 'Explore Program'}
                    </Text>
                    <Ionicons
                      name={prog.dropdown_items ? 'chevron-down' : 'arrow-forward'}
                      size={16}
                      color={isDark ? '#FFFFFF' : Colors.ink}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Services Dropdown Sub-menu Modal */}
      {activeDropdown && (
        <Modal
          visible={!!activeDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setActiveDropdown(null)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setActiveDropdown(null)}
          >
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{activeDropdown.title} Offerings</Text>
                <TouchableOpacity onPress={() => setActiveDropdown(null)}>
                  <Ionicons name="close" size={22} color={Colors.ink} />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalDesc}>{activeDropdown.description}</Text>

              <View style={styles.modalList}>
                {activeDropdown.dropdown_items?.items?.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.modalItem}
                    onPress={() => {
                      setActiveDropdown(null);
                      if (onSelectProgram) onSelectProgram({ ...activeDropdown, selectedItem: item });
                    }}
                  >
                    <Text style={styles.modalItemTitle}>{item.title}</Text>
                    <Ionicons name="arrow-forward" size={16} color={Colors.green} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cream,
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
    color: Colors.green,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  heading: {
    color: Colors.ink,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
    letterSpacing: -0.8,
    marginBottom: 14,
  },
  description: {
    color: '#5A746D',
    fontSize: 15,
    lineHeight: 24,
  },
  grid: {
    gap: 18,
  },
  card: {
    borderRadius: Radii.xxl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(9, 47, 41, 0.08)',
    minHeight: 240,
    justifyContent: 'space-between',
    ...Shadows.card,
  },
  darkCard: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardHeader: {
    marginBottom: Spacing.md,
  },
  cardEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.green,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.6,
    marginBottom: 10,
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 22,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Radii.md,
  },
  actionButtonLight: {
    backgroundColor: 'rgba(9, 47, 41, 0.08)',
  },
  actionButtonDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.ink,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 47, 41, 0.6)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    ...Shadows.modal,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.ink,
  },
  modalDesc: {
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  modalList: {
    gap: 8,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: Colors.bgLight,
    borderRadius: Radii.md,
  },
  modalItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.ink,
  },
});
