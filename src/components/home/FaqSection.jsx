import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radii, Shadows, Spacing } from '../../constants/theme';

export default function FaqSection({ faqs }) {
  const [openIndexes, setOpenIndexes] = useState([0]); // First item open by default

  const toggleIndex = (index) => {
    if (openIndexes.includes(index)) {
      setOpenIndexes(openIndexes.filter((i) => i !== index));
    } else {
      setOpenIndexes([...openIndexes, index]);
    }
  };

  const displayFaqs = faqs && faqs.length > 0 ? faqs : [
    {
      question: 'Who can invest with BAN?',
      paragraphs: [
        'BAN members are typically high-net-worth individuals, angel investors, family offices, and institutions with an interest in backing Bangladesh-linked startups.',
        'BAN investment documents, including term sheets and shareholders agreements, are prepared within the applicable framework of the Companies Act, 1994.',
      ],
      bullets: [
        'Ordinary shares generally provide common ownership and voting rights.',
        'Convertible preference shares may include liquidation preference and anti-dilution protections.',
        'Investors may receive board director or observer representation for strategic guidance and oversight.',
      ],
    },
    {
      question: 'How do you see exits happening in this sector?',
      paragraphs: [
        "Exit opportunities depend heavily on the company's jurisdiction and growth path. Some companies may redomicile to markets such as Singapore to access international capital, strategic buyers, and higher valuations.",
      ],
      bullets: [
        'A regional technology company may acquire or invest in the business to enter Bangladesh.',
        'An international venture-capital firm may provide liquidity during later rounds.',
        'An eligible company may eventually seek a public listing, including through the Dhaka Stock Exchange SME platform.',
      ],
    },
    {
      question: 'What is my security?',
      paragraphs: [
        'Startup investing is highly risky and there is no guarantee that invested capital will be returned.',
        'BAN focuses on the quality of the investment process: initial screening, data rooms, diligence, and structured milestone tranches.',
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.kicker}>FAQ</Text>
          <Text style={styles.heading}>Questions, answered clearly.</Text>
          <Text style={styles.subtitle}>
            Start with the essentials about BAN, early-stage investing, and how transactions are coordinated.
          </Text>
        </View>

        {/* FAQ Accordion List */}
        <View style={styles.list}>
          {displayFaqs.map((faq, index) => {
            const isOpen = openIndexes.includes(index);
            const numStr = String(index + 1).padStart(2, '0');

            return (
              <View key={index} style={[styles.itemCard, isOpen && styles.itemCardOpen]}>
                <TouchableOpacity
                  style={styles.itemHeader}
                  activeOpacity={0.85}
                  onPress={() => toggleIndex(index)}
                >
                  <Text style={styles.itemNum}>{numStr}</Text>
                  <Text style={styles.questionText}>{faq.question}</Text>
                  <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={Colors.ink}
                  />
                </TouchableOpacity>

                {isOpen && (
                  <View style={styles.itemBody}>
                    {faq.paragraphs?.map((p, pIdx) => (
                      <Text key={`p-${pIdx}`} style={styles.bodyParagraph}>
                        {p}
                      </Text>
                    ))}

                    {faq.bullets && faq.bullets.length > 0 && (
                      <View style={styles.bulletList}>
                        {faq.bullets.map((b, bIdx) => (
                          <View key={`b-${bIdx}`} style={styles.bulletItem}>
                            <View style={styles.bulletDot} />
                            <Text style={styles.bulletText}>{b}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {faq.note && (
                      <View style={styles.noteBox}>
                        <Ionicons name="information-circle-outline" size={16} color={Colors.green} />
                        <Text style={styles.noteText}>{faq.note}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Contact Prompt */}
        <View style={styles.contactPrompt}>
          <Text style={styles.promptQuestion}>Can’t find what you’re looking for?</Text>
          <TouchableOpacity
            style={styles.contactLink}
            onPress={() => Linking.openURL('mailto:hello@bdangels.co')}
          >
            <Text style={styles.contactLinkText}>Contact us</Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.green} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.paper,
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
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
    marginBottom: 8,
  },
  heading: {
    color: Colors.ink,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
    letterSpacing: -0.8,
    marginBottom: 10,
  },
  subtitle: {
    color: Colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  list: {
    gap: 12,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.line,
    overflow: 'hidden',
    ...Shadows.card,
  },
  itemCardOpen: {
    borderColor: Colors.green,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: 12,
  },
  itemNum: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.green,
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ink,
    lineHeight: 22,
  },
  itemBody: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.lineLight,
    paddingTop: Spacing.sm,
  },
  bodyParagraph: {
    fontSize: 14,
    color: Colors.muted,
    lineHeight: 22,
    marginBottom: 8,
  },
  bulletList: {
    marginVertical: 8,
    gap: 6,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.green,
    marginTop: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 20,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F3ED',
    padding: 10,
    borderRadius: Radii.sm,
    marginTop: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: '#0B654E',
    fontStyle: 'italic',
  },
  contactPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: Radii.lg,
    marginTop: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  promptQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.ink,
  },
  contactLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactLinkText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.green,
  },
});
