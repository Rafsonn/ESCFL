import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Breakout16.05</Text>
      <Text style={styles.subtitle}>Mobile App</Text>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Go to Dashboard"
          onPress={() => navigation.navigate('Dashboard')}
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Go to Chat"
          onPress={() => navigation.navigate('Chat')}
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Go to Escrow"
          onPress={() => navigation.navigate('Escrow')}
        />
      </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
  },
  buttonContainer: {
    marginVertical: 10,
    width: '80%',
  },
});
