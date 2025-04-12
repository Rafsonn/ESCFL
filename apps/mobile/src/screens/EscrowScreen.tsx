import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, ScrollView, Alert } from 'react-native';

export default function EscrowScreen() {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [condition, setCondition] = useState('');
  const [loading, setLoading] = useState(false);

  const createEscrow = () => {
    if (!amount || !recipient || !condition) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    // Simulate API call to create escrow
    setTimeout(() => {
      Alert.alert(
        'Success',
        'Escrow created successfully!',
        [{ text: 'OK', onPress: () => resetForm() }]
      );
      setLoading(false);
    }, 1500);

    // In a real app, you would call the Solana program here
    // const escrowProgram = new EscrowProgram();
    // await escrowProgram.createEscrow(amount, recipient, condition);
  };

  const resetForm = () => {
    setAmount('');
    setRecipient('');
    setCondition('');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Escrow</Text>
      <Text style={styles.subtitle}>Create a secure transaction with Solana</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>Amount (SOL)</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />
        
        <Text style={styles.label}>Recipient Address</Text>
        <TextInput
          style={styles.input}
          value={recipient}
          onChangeText={setRecipient}
          placeholder="Solana wallet address"
          autoCapitalize="none"
        />
        
        <Text style={styles.label}>Condition</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={condition}
          onChangeText={setCondition}
          placeholder="Describe the conditions for release"
          multiline
          numberOfLines={3}
        />
        
        <Button
          title={loading ? "Creating..." : "Create Escrow"}
          onPress={createEscrow}
          disabled={loading}
        />
      </View>
      
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>How Escrow Works</Text>
        <Text style={styles.infoText}>
          1. You create an escrow by specifying an amount, recipient, and condition.
        </Text>
        <Text style={styles.infoText}>
          2. Funds are locked in a Solana smart contract.
        </Text>
        <Text style={styles.infoText}>
          3. When conditions are met, funds are released to the recipient.
        </Text>
        <Text style={styles.infoText}>
          4. If conditions are not met, funds can be returned to you.
        </Text>
      </View>
    </ScrollView>
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
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  infoCard: {
    backgroundColor: '#e6f7ff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
});
