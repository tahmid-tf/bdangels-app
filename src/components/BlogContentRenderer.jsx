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

function parseHtmlBlocks(content) {
  if (!content) return [];
  const normalized = content
    .replace(/\r\n/g, '\n')
    .replace(/<br\s*\/?>/gi, '\n');

  const blockRegex = /<(h[1-6]|ul|ol|p|div|blockquote)[^>]*>([\s\S]*?)<\/\1>/gi;
  const blocks = [];
  let lastIndex = 0;
  let match;

  while ((match = blockRegex.exec(normalized)) !== null) {
    if (match.index > lastIndex) {
      const intermediate = normalized.substring(lastIndex, match.index).trim();
      if (intermediate) {
        intermediate.split(/\n\s*\n/).forEach((chunk) => {
          const clean = chunk.trim();
          if (clean) {
            blocks.push({ type: 'p', raw: clean });
          }
        });
      }
    }

    const tag = match[1].toLowerCase();
    const inner = match[2].trim();

    if (tag === 'ul' || tag === 'ol') {
      const items = [];
      const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
      let liMatch;
      while ((liMatch = liRegex.exec(inner)) !== null) {
        const liText = liMatch[1].trim();
        if (liText) items.push(liText);
      }
      if (items.length === 0) {
        inner.split('\n').map((l) => l.trim()).filter(Boolean).forEach((l) => items.push(l));
      }
      blocks.push({ type: tag, items });
    } else if (tag.startsWith('h')) {
      blocks.push({ type: tag, raw: inner });
    } else if (tag === 'blockquote') {
      blocks.push({ type: 'blockquote', raw: inner });
    } else {
      blocks.push({ type: 'p', raw: inner });
    }

    lastIndex = blockRegex.lastIndex;
  }

  if (lastIndex < normalized.length) {
    const trailing = normalized.substring(lastIndex).trim();
    if (trailing) {
      trailing.split(/\n\s*\n/).forEach((chunk) => {
        const clean = chunk.trim();
        if (clean) {
          blocks.push({ type: 'p', raw: clean });
        }
      });
    }
  }

  if (blocks.length === 0 && content.trim()) {
    content
      .split(/\n\s*\n/)
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((t) => blocks.push({ type: 'p', raw: t }));
  }

  return blocks;
}

export default function BlogContentRenderer({ content }) {
  if (!content) return null;
  const blocks = parseHtmlBlocks(content);

  return (
    <View style={styles.container}>
      {blocks.map((block, idx) => {
        if (block.type === 'h1' || block.type === 'h2') {
          return (
            <Text key={`h2-${idx}`} style={styles.heading2}>
              {decodeHtmlEntities(block.raw.replace(/<[^>]*>/g, ''))}
            </Text>
          );
        }

        if (block.type === 'h3' || block.type === 'h4') {
          return (
            <Text key={`h3-${idx}`} style={styles.heading3}>
              {decodeHtmlEntities(block.raw.replace(/<[^>]*>/g, ''))}
            </Text>
          );
        }

        if (block.type === 'ul' || block.type === 'ol') {
          const isOrdered = block.type === 'ol';
          return (
            <View key={`list-${idx}`} style={styles.listContainer}>
              {block.items.map((itemHtml, itemIdx) => {
                const segs = parseInlineSegments(itemHtml);
                return (
                  <View key={`item-${itemIdx}`} style={styles.listItemRow}>
                    <Text style={isOrdered ? styles.listNumber : styles.bullet}>
                      {isOrdered ? `${itemIdx + 1}.` : '•'}
                    </Text>
                    <Text style={styles.listItemText}>
                      {segs.map((seg, sIdx) => (
                        <Text
                          key={sIdx}
                          style={[
                            seg.bold && styles.bold,
                            seg.italic && styles.italic,
                            seg.href && styles.link,
                          ]}
                          onPress={
                            seg.href
                              ? () => Linking.openURL(seg.href).catch((err) => console.log('Link err:', err))
                              : undefined
                          }
                        >
                          {seg.text}
                        </Text>
                      ))}
                    </Text>
                  </View>
                );
              })}
            </View>
          );
        }

        if (block.type === 'blockquote') {
          const segs = parseInlineSegments(block.raw);
          return (
            <View key={`quote-${idx}`} style={styles.blockquoteBox}>
              <Text style={styles.blockquoteText}>
                {segs.map((seg, sIdx) => (
                  <Text
                    key={sIdx}
                    style={[
                      seg.bold && styles.bold,
                      seg.italic && styles.italic,
                      seg.href && styles.link,
                    ]}
                  >
                    {seg.text}
                  </Text>
                ))}
              </Text>
            </View>
          );
        }

        // Paragraph
        const segs = parseInlineSegments(block.raw);
        if (segs.length === 0) return null;

        return (
          <Text key={`p-${idx}`} style={styles.paragraph}>
            {segs.map((seg, sIdx) => (
              <Text
                key={sIdx}
                style={[
                  seg.bold && styles.bold,
                  seg.italic && styles.italic,
                  seg.href && styles.link,
                ]}
                onPress={
                  seg.href
                    ? () => Linking.openURL(seg.href).catch((err) => console.log('Link err:', err))
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
    paddingVertical: 6,
  },
  heading2: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.ink,
    marginTop: 20,
    marginBottom: 8,
    letterSpacing: -0.3,
    lineHeight: 25,
  },
  heading3: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 6,
    lineHeight: 22,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.ink,
    marginTop: 20,
    marginBottom: 8,
    letterSpacing: -0.3,
    lineHeight: 25,
  },
  paragraph: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 24,
    marginBottom: 14,
  },
  listContainer: {
    marginVertical: 8,
    paddingLeft: 4,
    gap: 4,
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bullet: {
    fontSize: 16,
    color: '#0A5554',
    fontWeight: '900',
    width: 18,
    marginTop: 1,
  },
  listNumber: {
    fontSize: 14,
    color: '#0A5554',
    fontWeight: '700',
    width: 22,
    marginTop: 2,
  },
  listItemText: {
    flex: 1,
    fontSize: 15,
    color: '#334155',
    lineHeight: 23,
  },
  blockquoteBox: {
    backgroundColor: '#F0FDFA',
    borderLeftWidth: 3,
    borderLeftColor: '#0A5554',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 12,
  },
  blockquoteText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#134E4A',
    lineHeight: 22,
  },
  bold: {
    fontWeight: '700',
    color: Colors.ink,
  },
  italic: {
    fontStyle: 'italic',
  },
  link: {
    color: '#0A5554',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
