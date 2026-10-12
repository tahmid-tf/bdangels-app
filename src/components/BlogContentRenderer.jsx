import React from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { Colors } from '../constants/theme';

function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–');
}

function parseInlineSegments(html) {
  const segments = [];
  const tagRegex =
    /<a\s+[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>|<b>(.*?)<\/b>|<strong>(.*?)<\/strong>|<i>(.*?)<\/i>|<em>(.*?)<\/em>/gi;
  let lastIndex = 0;
  let match;

  while ((match = tagRegex.exec(html)) !== null) {
    if (match.index > lastIndex) {
      const rawText = decodeHtmlEntities(html.substring(lastIndex, match.index));
      if (rawText) segments.push({ text: rawText });
    }

    if (match[1] !== undefined) {
      // <a> link tag
      const href = match[1];
      const linkText = decodeHtmlEntities(match[2].replace(/<[^>]*>/g, ''));
      segments.push({ text: linkText, href });
    } else if (match[3] !== undefined) {
      // <b> bold tag
      const boldText = decodeHtmlEntities(match[3].replace(/<[^>]*>/g, ''));
      segments.push({ text: boldText, bold: true });
    } else if (match[4] !== undefined) {
      // <strong> tag
      const strongText = decodeHtmlEntities(match[4].replace(/<[^>]*>/g, ''));
      segments.push({ text: strongText, bold: true });
    } else if (match[5] !== undefined) {
      // <i> italic tag
      const italicText = decodeHtmlEntities(match[5].replace(/<[^>]*>/g, ''));
      segments.push({ text: italicText, italic: true });
    } else if (match[6] !== undefined) {
      // <em> tag
      const emText = decodeHtmlEntities(match[6].replace(/<[^>]*>/g, ''));
      segments.push({ text: emText, italic: true });
    }

    lastIndex = tagRegex.lastIndex;
  }

  if (lastIndex < html.length) {
    const rawText = decodeHtmlEntities(html.substring(lastIndex));
    if (rawText) segments.push({ text: rawText });
  }

  return segments;
}

export default function BlogContentRenderer({ content }) {
  if (!content) return null;

  // Split content by paragraphs or block tags
  const rawBlocks = content
    .split(/<\/p>|<br\s*\/?>\s*<br\s*\/?>|<\/h[1-6]>|<\/div>/i)
    .map((b) =>
      b
        .replace(/^<p[^>]*>/i, '')
        .replace(/^<div[^>]*>/i, '')
        .replace(/^<h[1-6][^>]*>/i, '')
        .trim()
    )
    .filter(Boolean);

  return (
    <View style={styles.container}>
      {rawBlocks.map((blockHtml, blockIdx) => {
        // Detect pure headings: starts and ends with <b> or <strong>
        const headingMatch = blockHtml.match(/^<(?:b|strong)>(.*?)<\/(?:b|strong)>$/i);
        if (headingMatch && headingMatch[1].length < 120) {
          const headingText = decodeHtmlEntities(headingMatch[1].replace(/<[^>]*>/g, ''));
          return (
            <Text key={blockIdx} style={styles.sectionHeading}>
              {headingText}
            </Text>
          );
        }

        const segments = parseInlineSegments(blockHtml);
        if (segments.length === 0) return null;

        return (
          <Text key={blockIdx} style={styles.paragraph}>
            {segments.map((seg, segIdx) => (
              <Text
                key={segIdx}
                style={[
                  seg.bold && styles.bold,
                  seg.italic && styles.italic,
                  seg.href && styles.link,
                ]}
                onPress={
                  seg.href
                    ? () => Linking.openURL(seg.href).catch((err) => console.log('Link open err:', err))
                    : undefined
                }
              >
                {seg.text}
              </Text>
            ))}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.ink,
    marginTop: 24,
    marginBottom: 10,
    letterSpacing: -0.3,
    lineHeight: 25,
  },
  paragraph: {
    fontSize: 15.5,
    color: '#374151',
    lineHeight: 25,
    marginBottom: 16,
  },
  bold: {
    fontWeight: '700',
    color: Colors.ink,
  },
  italic: {
    fontStyle: 'italic',
  },
  link: {
    color: Colors.green,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
