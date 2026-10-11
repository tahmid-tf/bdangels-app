import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radii, Shadows, Spacing } from '../../constants/theme';

export default function ProgramDetailModal({ visible, program, onClose }) {
  if (!program) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleWrap}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>{program.badge || 'BAN PROGRAM'}</Text>
              </View>
              <Text style={styles.title}>{program.title}</Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.ink} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.description}>{program.description}</Text>

            {program.selectedItem && (
              <View style={styles.selectedItemBox}>
                <Text style={styles.selectedItemLabel}>Selected Track:</Text>
                <Text style={styles.selectedItemTitle}>{program.selectedItem.title}</Text>
              </View>
            )}

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="shield-checkmark-outline" size={18} color={Colors.green} />
                <Text style={styles.infoText}>Backed by Bangladesh Angels Network</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="people-outline" size={18} color={Colors.green} />
                <Text style={styles.infoText}>Cohort sessions, mentorship & investor committee access</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="ribbon-outline" size={18} color={Colors.green} />
                <Text style={styles.infoText}>Practical curriculum designed for angel investing</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footerActions}>
            <TouchableOpacity
              style={styles.applyBtn}
              activeOpacity={0.85}
              onPress={() => {
                onClose();
                Linking.openURL('mailto:hello@bdangels.co?subject=Inquiry regarding ' + encodeURIComponent(program.title));
              }}
            >
              <Text style={styles.applyBtnText}>Inquire / Apply for {program.title}</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeActionBtn} activeOpacity={0.85} onPress={onClose}>
              <Text style={styles.closeActionText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 47, 41, 0.65)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Radii.xxl,
    borderTopRightRadius: Radii.xxl,
    maxHeight: '80%',
    padding: Spacing.lg,
    ...Shadows.modal,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  titleWrap: {
    flex: 1,
    paddingRight: 12,
  },
  typeBadge: {
    backgroundColor: Colors.mint,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: Radii.sm,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  typeText: {
    color: Colors.green,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.ink,
  },
  closeBtn: {
    padding: 6,
    borderRadius: Radii.pill,
    backgroundColor: Colors.bgLight,
  },
  content: {
    marginVertical: Spacing.md,
  },
  description: {
    fontSize: 15,
    color: Colors.ink,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  selectedItemBox: {
    backgroundColor: '#E8F3ED',
    padding: 12,
    borderRadius: Radii.md,
    marginBottom: Spacing.md,
  },
  selectedItemLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.green,
    textTransform: 'uppercase',
  },
  selectedItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ink,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: Colors.paper,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.line,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 13,
    color: Colors.muted,
    flex: 1,
    lineHeight: 18,
  },
  footerActions: {
    gap: 8,
    marginTop: Spacing.sm,
  },
  applyBtn: {
    backgroundColor: Colors.green,
    minHeight: 48,
    borderRadius: Radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  closeActionBtn: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeActionText: {
    color: Colors.muted,
    fontSize: 14,
    fontWeight: '700',
  },
});
