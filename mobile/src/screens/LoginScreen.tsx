import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Button, TextInput, Text, Card, Title } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { login, error, isLoading } = useAuth();
  const navigation = useNavigation();

  const validateForm = () => {
    let isValid = true;
    
    if (!username) {
      setUsernameError('Username is required');
      isValid = false;
    } else {
      setUsernameError('');
    }
    
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    return isValid;
  };

  const handleLogin = async () => {
    if (validateForm()) {
      await login(username, password);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.title}>Show Caller</Title>
                
                <TextInput
                  label="Username"
                  value={username}
                  onChangeText={setUsername}
                  style={styles.input}
                  autoCapitalize="none"
                  error={!!usernameError}
                />
                {!!usernameError && <Text style={styles.errorText}>{usernameError}</Text>}
                
                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  style={styles.input}
                  error={!!passwordError}
                />
                {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
                
                {error && <Text style={styles.errorText}>{error}</Text>}
                
                <Button 
                  mode="contained" 
                  onPress={handleLogin} 
                  style={styles.button}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Login
                </Button>
                
                <Button 
                  mode="text" 
                  onPress={() => navigation.navigate('Register')}
                  style={styles.registerButton}
                >
                  Create Account
                </Button>
              </Card.Content>
            </Card>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    elevation: 4,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#6200EE',
    textAlign: 'center',
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#6200EE',
  },
  registerButton: {
    marginTop: 12,
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginBottom: 8,
  },
});

export default LoginScreen;