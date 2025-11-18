import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useAuthStore } from '../services/auth';

export function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
  }: any) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
      onPress={onPress}
    >
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={24} color={colors.text} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Profile Section */}
      <View style={[styles.profileSection, { backgroundColor: colors.surface }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{user?.name}</Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>
          {user?.email}
        </Text>
      </View>

      {/* Account Settings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          ACCOUNT
        </Text>
        <SettingItem
          icon="person-outline"
          title="Edit Profile"
          subtitle="Update your name and email"
          onPress={() => console.log('Edit profile')}
        />
        <SettingItem
          icon="lock-closed-outline"
          title="Change Password"
          onPress={() => console.log('Change password')}
        />
      </View>

      {/* Connected Platforms */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          CONNECTED PLATFORMS
        </Text>
        <SettingItem
          icon="logo-youtube"
          title="YouTube"
          subtitle="Connected"
          onPress={() => console.log('YouTube settings')}
        />
        <SettingItem
          icon="logo-instagram"
          title="Instagram"
          subtitle="Not connected"
          onPress={() => console.log('Connect Instagram')}
        />
        <SettingItem
          icon="logo-facebook"
          title="Facebook"
          subtitle="Not connected"
          onPress={() => console.log('Connect Facebook')}
        />
        <SettingItem
          icon="logo-tiktok"
          title="TikTok"
          subtitle="Not connected"
          onPress={() => console.log('Connect TikTok')}
        />
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          APP SETTINGS
        </Text>
        <SettingItem
          icon={isDark ? 'moon' : 'sunny'}
          title="Theme"
          subtitle={isDark ? 'Dark mode' : 'Light mode'}
          onPress={toggleTheme}
        />
        <SettingItem
          icon="notifications-outline"
          title="Notifications"
          subtitle="Manage push notifications"
          onPress={() => console.log('Notifications')}
        />
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          ABOUT
        </Text>
        <SettingItem
          icon="help-circle-outline"
          title="Help & Support"
          onPress={() => console.log('Help')}
        />
        <SettingItem
          icon="document-text-outline"
          title="Terms & Privacy"
          onPress={() => console.log('Terms')}
        />
        <SettingItem
          icon="information-circle-outline"
          title="Version"
          subtitle="1.0.0"
          showArrow={false}
          onPress={() => {}}
        />
      </View>

      {/* Sign Out */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.surface, borderColor: '#ef4444' }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 32,
    marginBottom: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
  },
  settingIcon: {
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
});
