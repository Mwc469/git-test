import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeProvider';
import { colors as themeColors } from '../theme/colors';

type Props = NativeStackScreenProps<any, 'Dashboard'>;

export function DashboardScreen({ navigation }: Props) {
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Fetch latest data
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const stats = [
    { label: 'Total Posts', value: '24', icon: 'newspaper', color: themeColors.primary[600] },
    { label: 'Scheduled', value: '8', icon: 'time', color: themeColors.platforms.youtube },
    { label: 'This Week', value: '12', icon: 'calendar', color: themeColors.success },
    { label: 'Platforms', value: '4', icon: 'share-social', color: themeColors.platforms.instagram },
  ];

  const platforms = [
    { name: 'YouTube', icon: 'logo-youtube', color: themeColors.platforms.youtube, connected: true },
    { name: 'Instagram', icon: 'logo-instagram', color: themeColors.platforms.instagram, connected: true },
    { name: 'Facebook', icon: 'logo-facebook', color: themeColors.platforms.facebook, connected: false },
    { name: 'TikTok', icon: 'logo-tiktok', color: themeColors.platforms.tiktok, connected: false },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.primary[600] }]}>
        <View>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.userName}>Let's automate your content</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          style={styles.settingsButton}
        >
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View
            key={index}
            style={[styles.statCard, { backgroundColor: colors.surface }]}
          >
            <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
              <Ionicons name={stat.icon as any} size={24} color={stat.color} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stat.value}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Connected Platforms */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Connected Platforms
        </Text>
        <View style={styles.platformsGrid}>
          {platforms.map((platform, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.platformCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name={platform.icon as any} size={32} color={platform.color} />
              <Text style={[styles.platformName, { color: colors.text }]}>
                {platform.name}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: platform.connected ? themeColors.success : colors.border },
                ]}
              >
                <Text style={styles.statusText}>
                  {platform.connected ? 'Connected' : 'Connect'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Quick Actions
        </Text>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: themeColors.primary[600] }]}
          onPress={() => navigation.navigate('Schedule')}
        >
          <Ionicons name="add-circle" size={32} color="#fff" />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Schedule New Post</Text>
            <Text style={styles.actionSubtitle}>
              Create and schedule content across platforms
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
          onPress={() => navigation.navigate('Analytics')}
        >
          <Ionicons name="stats-chart" size={32} color={themeColors.primary[600]} />
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>
              View Analytics
            </Text>
            <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
              Track your performance and engagement
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  greeting: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  settingsButton: {
    padding: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    marginTop: -20,
  },
  statCard: {
    width: '48%',
    margin: '1%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  platformsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  platformCard: {
    width: '48%',
    margin: '1%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  platformName: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionContent: {
    flex: 1,
    marginLeft: 16,
  },
  actionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionSubtitle: {
    color: '#fff',
    opacity: 0.8,
    fontSize: 12,
  },
});
