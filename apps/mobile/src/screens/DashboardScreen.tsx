import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>View your account and transactions</Text>
      
      {/* Dashboard content will go here */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account Balance</Text>
        <Text style={styles.balance}>0.00 SOL</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Transactions</Text>
        <Text style={styles.emptyState}>No recent transactions</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  balance: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  emptyState: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 10,
  },
});
