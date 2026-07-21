import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../styles/ThemeContext';
import InlineQueryResult from './InlineQueryResult';
import SlideUp from './animations/SlideUp';

export default function MessageBubble({ message }) {
  const { colors, radius } = useTheme();
  const isUser = message.role === 'user';

  // Parse out filter metadata if present
  const filterRegex = /\[FILTER:\s*(\{.*?\})\]/;
  const match = message.content.match(filterRegex);
  const filterString = match ? match[1] : null;

  // Clean prompt helper tags from display content
  const cleanContent = message.content.replace(filterRegex, '').trim();

  return (
    <SlideUp delay={0} distance={12} duration={250}>
    <View style={[styles.wrapper, isUser ? styles.userWrapper : styles.aiWrapper]}>
      {!isUser && (
        <MaterialCommunityIcons
          name="robot-outline"
          size={18}
          color={colors.textSecondary}
          style={styles.icon}
        />
      )}
      <View style={{ flex: 1, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: isUser ? colors.primary : colors.surfaceSecondary,
              borderColor: isUser ? 'transparent' : colors.border,
              borderWidth: isUser ? 0 : 1,
              borderBottomRightRadius: isUser ? 4 : radius.md,
              borderBottomLeftRadius: isUser ? radius.md : 4,
              borderRadius: radius.md,
            },
          ]}
        >
          <Text
            style={[
              styles.text,
              {
                color: isUser ? '#FFFFFF' : colors.textPrimary,
              },
            ]}
          >
            {cleanContent}
          </Text>
        </View>

        {filterString && <InlineQueryResult filterString={filterString} />}
      </View>
    </View>
    </SlideUp>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    marginVertical: 6,
    maxWidth: '88%',
    alignItems: 'flex-start',
  },
  userWrapper: {
    alignSelf: 'flex-end',
  },
  aiWrapper: {
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 8,
    marginTop: 8,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexShrink: 1,
  },
  text: {
    fontSize: 14.5,
    lineHeight: 20,
  },
});
