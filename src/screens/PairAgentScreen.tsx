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
import { api } from '../services';

// ============================================================================
// Pair Agent Screen
// ============================================================================

export function PairAgentScreen() {
  const navigation = useNavigation();
  const [code, setCode] = useState('');
  const [isPairing, setIsPairing] = useState(false);
  const [status, setStatus] = useState<'input' | 'waiting' | 'success' | 'error'>('input');
  const [error, setError] = useState<string | null>(null);

  const handlePair = async () => {
    if (!code.trim()) {
      setError('Please enter a pairing code');
      return;
    }

    try {
      setIsPairing(true);
      setError(null);
      setStatus('waiting');

      // Create pairing request
      const response = await api.pairing.create({
        code: code.trim(),
        agentId: 'mobile-app',
        agentName: 'Odyssey Mobile',
      });

      // Poll for approval
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes with 5s intervals

      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        
        const statusResponse = await api.pairing.check(response.requestId);
        
        if (statusResponse.status === 'approved') {
          setStatus('success');
          Alert.alert('Success', 'Agent paired successfully!', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
          return;
        }
        
        if (statusResponse.status === 'rejected') {
          throw new Error('Pairing was rejected');
        }
        
        if (statusResponse.status === 'expired') {
          throw new Error('Pairing request expired');
        }
        
        attempts++;
      }

      throw new Error('Pairing timed out');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Pairing failed');
    } finally {
      setIsPairing(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {status === 'input' && (
          <>
            <View style={styles.header}>
              <Text style={styles.icon}>🔗</Text>
              <Text style={styles.title}>Pair an Agent</Text>
              <Text style={styles.subtitle}>
                Enter the pairing code provided by your AI agent
              </Text>
            </View>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                value={code}
                onChangeText={setCode}
                placeholder="Enter pairing code"
                placeholderTextColor="#666"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />

              {error && (
                <Text style={styles.errorText}>{error}</Text>
              )}

              <TouchableOpacity
                style={[styles.button, !code.trim() && styles.buttonDisabled]}
                onPress={handlePair}
                disabled={!code.trim() || isPairing}
              >
                <Text style={styles.buttonText}>Pair Agent</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {status === 'waiting' && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#7c3aed" />
            <Text style={styles.waitingText}>Waiting for approval...</Text>
            <Text style={styles.waitingSubtext}>
              The agent needs to approve this pairing request
            </Text>
          </View>
        )}

        {status === 'success' && (
          <View style={styles.centered}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successText}>Paired!</Text>
          </View>
        )}

        {status === 'error' && (
          <View style={styles.centered}>
            <Text style={styles.errorIcon}>❌</Text>
            <Text style={styles.errorTitle}>Pairing Failed</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setStatus('input');
                setError(null);
              }}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
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
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorText: {
    color: '#f87171',
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#7c3aed',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 24,
  },
  waitingSubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#333',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default PairAgentScreen;
