import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Show Caller Mobile App</Text>
      <Text style={styles.description}>
        This is a simplified version for QR code generation.
        Scan this QR code with the Expo Go app to run the full version.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#6200EE',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#121212',
  },
});