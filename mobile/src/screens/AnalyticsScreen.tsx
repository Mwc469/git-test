import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export function AnalyticsScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            📊 Analytics Dashboard
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Track your social media performance across all platforms. View
            engagement metrics, growth trends, and AI-powered recommendations.
          </Text>
          <Text style={[styles.comingSoon, { color: colors.textSecondary }]}>
            Analytics coming soon...
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  comingSoon: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 16,
  },
});
