import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radii, Spacing } from '../../constants/theme';

const FUNCTIONS = [
  {
    num: '01',
    title: 'Source & screen',
    desc: 'We identify technology-enabled startups with committed teams, early traction, and the potential to scale.',
  },
  {
    num: '02',
    title: 'Prepare founders',
    desc: 'We sharpen the narrative, pitch deck, data room, and fundraising strategy before a company meets members.',
  },
  {
    num: '03',
    title: 'Coordinate investment',
    desc: 'We convene interested angels, organise diligence, align terms, and support the documentation process.',
  },
  {
    num: '04',
    title: 'Support growth',
    desc: 'Our network contributes operating experience, introductions, governance support, and follow-on perspective.',
  },
];

export default function CoreFunctionsSection() {
  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.kicker}>CORE BAN FUNCTIONS</Text>
          <Text style={styles.heading}>From first conversation to long-term partnership.</Text>
          <Text style={styles.description}>
            BAN builds the connective tissue around early-stage investment. We prepare promising founders,
            equip investors to make informed decisions, coordinate the transaction, and stay engaged after
            the cheque is written.
          </Text>
        </View>

        <View style={styles.grid}>
          {FUNCTIONS.map((item, index) => (
            <View key={item.num} style={styles.card}>
              <Text style={styles.cardNum}>{item.num}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.desc}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.deep,
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
    color: Colors.mint,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
    letterSpacing: -0.8,
    marginBottom: 14,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 15,
    lineHeight: 24,
  },
  grid: {
    gap: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardNum: {
    color: Colors.mint,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardDesc: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 14,
    lineHeight: 22,
  },
});
