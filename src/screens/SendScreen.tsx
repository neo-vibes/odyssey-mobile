import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { solana } from '../services';

// ============================================================================
// Send Screen
// ============================================================================

export function SendScreen() {
  const navigation = useNavigation();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidInput = () => {
    if (!recipient || !amount) return false;
    if (!solana.isValidAddress(recipient)) return false;
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return false;
    return true;
  };

  const handleSend = async () => {
    if (!isValidInput()) {
      setError('Please enter a valid recipient and amount');
      return;
    }

    try {
      setIsSending(true);
      setError(null);

      // TODO: Integrate with actual transfer via session or direct passkey signing
      // For now, simulate the transfer
      await new Promise((resolve) => setTimeout(resolve, 2000));

      Alert.alert('Success', 'Transfer submitted!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.form}>
        {/* Recipient */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Recipient Address</Text>
          <TextInput
            style={styles.input}
            value={recipient}
            onChangeText={setRecipient}
            placeholder="Enter Solana address"
            placeholderTextColor="#666"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {recipient && !solana.isValidAddress(recipient) && (
            <Text style={styles.inputError}>Invalid address</Text>
          )}
        </View>

        {/* Amount */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount (SOL)</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.0"
            placeholderTextColor="#666"
            keyboardType="decimal-pad"
          />
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Send Button */}
        <TouchableOpacity
          style={[styles.button, (!isValidInput() || isSending) && styles.buttonDisabled]}
          onPress={handleSend}
          disabled={!isValidInput() || isSending}
        >
          {isSending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  inputError: {
    color: '#f87171',
    fontSize: 12,
    marginTop: 4,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: '#2d1515',
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#f87171',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#7c3aed',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default SendScreen;
