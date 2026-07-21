import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import apiClient from '../utils/apiClient';
import TransactionRow from './cards/TransactionRow';
import ThemedText from './common/ThemedText';
import { useTheme } from '../styles/ThemeContext';

import FadeIn from './animations/FadeIn';

export default function InlineQueryResult({ filterString }) {
  const { colors, radius } = useTheme();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);

  useEffect(() => {
    async function fetchResults() {
      try {
        const filters = JSON.parse(filterString);
        const res = await apiClient.getExpenses(filters);
        if (res.success && Array.isArray(res.data)) {
          setResults(res.data);
        }
      } catch (e) {
        console.error('Error fetching inline results:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [filterString]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (results.length === 0) {
    return (
      <ThemedText variant="caption" color="secondary" style={styles.emptyText}>
        No matching transactions found.
      </ThemedText>
    );
  }

  return (
    <FadeIn direction="scale" delay={50} style={{ width: '100%' }}>
      <View style={[styles.container, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, borderRadius: radius.md }]}>
        {results.slice(0, 5).map((item) => (
          <TransactionRow key={item.id} expense={item} showDate />
        ))}
        {results.length > 5 && (
          <ThemedText variant="caption" color="blue" style={styles.moreText}>
            + {results.length - 5} more transactions
          </ThemedText>
        )}
      </View>
    </FadeIn>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  emptyText: {
    paddingVertical: 8,
    fontStyle: 'italic',
  },
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    marginTop: 8,
    width: '100%',
  },
  moreText: {
    marginTop: 6,
    textAlign: 'right',
    fontWeight: '700',
    paddingRight: 4,
  },
});
