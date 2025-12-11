import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {logoutUser} from '../store/authSlice';

function HomeScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const {user, isLoading} = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f8fafc',
  };

  const textStyle = {
    color: isDarkMode ? '#ffffff' : '#000000',
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Logout', style: 'destructive', onPress: () => dispatch(logoutUser())},
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[backgroundStyle, styles.container]}>
        <ActivityIndicator size="large" color="#3182ce" />
        <Text style={[styles.loadingText, textStyle]}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[backgroundStyle, styles.container]}>
      <View style={styles.content}>
        <Text style={[styles.title, textStyle]}>Welcome Home!</Text>
        <Text style={[styles.subtitle, textStyle]}>
          You are successfully signed in to our app
        </Text>
        
        <View style={styles.userInfoContainer}>
          <Text style={[styles.userInfoLabel, textStyle]}>User Information</Text>
          <Text style={[styles.userInfo, textStyle]}>Name: {user?.name || 'N/A'}</Text>
          <Text style={[styles.userInfo, textStyle]}>Email: {user?.email || 'N/A'}</Text>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoading}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  content: {
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.8,
  },
  userInfoContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfoLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  userInfo: {
    fontSize: 16,
    marginBottom: 8,
    opacity: 0.8,
  },
  logoutButton: {
    backgroundColor: '#e53e3e',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});

export default HomeScreen;
