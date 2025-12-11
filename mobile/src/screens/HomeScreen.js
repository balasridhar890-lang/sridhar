import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Button,
  useColorScheme,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {increment, decrement} from '../store/counterSlice';

function HomeScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const counter = useSelector(state => state.counter.value);
  const dispatch = useDispatch();

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f3f3f3',
    flex: 1,
  };

  const textStyle = {
    color: isDarkMode ? '#ffffff' : '#000000',
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View style={styles.container}>
          <Text style={[styles.title, textStyle]}>Welcome to React Native!</Text>
          <Text style={[styles.subtitle, textStyle]}>
            This is a monorepo setup with React Native and Express
          </Text>
          <View style={styles.counterContainer}>
            <Text style={[styles.counterLabel, textStyle]}>Redux Counter:</Text>
            <Text style={[styles.counterValue, textStyle]}>{counter}</Text>
            <View style={styles.buttonContainer}>
              <Button title="Increment" onPress={() => dispatch(increment())} />
              <Button title="Decrement" onPress={() => dispatch(decrement())} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  counterContainer: {
    marginTop: 30,
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    minWidth: 250,
    alignItems: 'center',
  },
  counterLabel: {
    fontSize: 18,
    marginBottom: 10,
  },
  counterValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-around',
    width: '100%',
  },
});

export default HomeScreen;
