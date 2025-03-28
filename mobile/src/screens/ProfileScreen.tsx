import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Button, Title, Text, List, Avatar, Switch, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';

const ProfileScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const navigation = useNavigation<any>();
  const { logout, user, isLoading } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // No need to navigate - MainNavigator will handle it
            } catch (err) {
              console.error('Logout error:', err);
              Alert.alert('Logout Error', 'There was a problem logging out. Please try again.');
            }
          }
        },
      ]
    );
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    // TODO: Implement saving notification settings to backend
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    // TODO: Implement saving sound settings to backend
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Profile Card */}
        <Card style={styles.card}>
          <Card.Content style={styles.profileCardContent}>
            <Avatar.Text size={80} label="JD" style={styles.avatar} />
            <View style={styles.profileInfo}>
              <Title>John Doe</Title>
              <Text>john.doe@example.com</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Settings Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Notification Settings</Title>
            <List.Item
              title="Enable Notifications"
              description="Receive alerts for upcoming calls"
              right={() => (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={toggleNotifications}
                  color="#6200EE"
                />
              )}
            />
            <Divider />
            <List.Item
              title="Sound Alerts"
              description="Play sound when notifications are received"
              right={() => (
                <Switch
                  value={soundEnabled}
                  onValueChange={toggleSound}
                  color="#6200EE"
                  disabled={!notificationsEnabled}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Account Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Account</Title>
            <List.Item
              title="Change Password"
              description="Update your account password"
              left={props => <List.Icon {...props} icon="key-variant" />}
              onPress={() => {
                // TODO: Navigate to change password screen
                console.log('Navigate to change password');
              }}
            />
          </Card.Content>
        </Card>

        {/* About Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>About</Title>
            <List.Item
              title="Version"
              description="1.0.0"
              left={props => <List.Icon {...props} icon="information" />}
            />
            <Divider />
            <List.Item
              title="Terms of Service"
              left={props => <List.Icon {...props} icon="file-document" />}
              onPress={() => {
                // TODO: Navigate to terms of service
                console.log('Navigate to terms of service');
              }}
            />
            <Divider />
            <List.Item
              title="Privacy Policy"
              left={props => <List.Icon {...props} icon="shield-account" />}
              onPress={() => {
                // TODO: Navigate to privacy policy
                console.log('Navigate to privacy policy');
              }}
            />
          </Card.Content>
        </Card>

        {/* Logout Button */}
        <Button 
          mode="outlined" 
          onPress={handleLogout}
          style={styles.logoutButton}
          contentStyle={styles.logoutButtonContent}
          color="#B00020"
        >
          Log Out
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
  },
  profileCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    backgroundColor: '#6200EE',
  },
  profileInfo: {
    marginLeft: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 24,
    borderColor: '#B00020',
  },
  logoutButtonContent: {
    paddingVertical: 8,
  },
});

export default ProfileScreen;