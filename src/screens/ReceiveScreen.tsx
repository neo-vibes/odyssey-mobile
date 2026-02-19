import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  ActivityIndicator,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Clipboard from 'expo-clipboard';
import { StoredWallet } from '../types';
import { solana } from '../services';

const WALLET_STORAGE_KEY = 'odyssey_wallet';

// ============================================================================
// Receive Screen
// ============================================================================

export function ReceiveScreen() {
  const [wallet, setWallet] = useState<StoredWallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      const stored = await SecureStore.getItemAsync(WALLET_STORAGE_KEY);
      if (stored) {
        setWallet(JSON.parse(stored) as StoredWallet);
      }
    } catch (err) {
      console.error('Failed to load wallet:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!wallet) return;
    await Clipboard.setStringAsync(wallet.wallet.publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!wallet) return;
    await Share.share({
      message: wallet.wallet.publicKey,
      title: 'My Solana Address',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (!wallet) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No wallet found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* QR Code Placeholder */}
      <View style={styles.qrContainer}>
        <View style={styles.qrPlaceholder}>
          <Text style={styles.qrText}>📱</Text>
          <Text style={styles.qrLabel}>QR Code</Text>
        </View>
      </View>

      {/* Address Display */}
      <View style={styles.addressContainer}>
        <Text style={styles.label}>Your Address</Text>
        <Text style={styles.address}>{wallet.wallet.publicKey}</Text>
        <Text style={styles.networkBadge}>
          {solana.getNetwork().toUpperCase()}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
          <Text style={styles.actionIcon}>{copied ? '✓' : '📋'}</Text>
          <Text style={styles.actionLabel}>{copied ? 'Copied!' : 'Copy'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={styles.actionLabel}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>To receive funds:</Text>
        <Text style={styles.instructionText}>
          1. Share your address or QR code with the sender
        </Text>
        <Text style={styles.instructionText}>
          2. Make sure they are sending on Solana ({solana.getNetwork()})
        </Text>
        <Text style={styles.instructionText}>
          3. Wait for the transaction to confirm
        </Text>
      </View>
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  errorText: {
    color: '#f87171',
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrText: {
    fontSize: 48,
  },
  qrLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  addressContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  address: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 8,
  },
  networkBadge: {
    fontSize: 10,
    color: '#7c3aed',
    backgroundColor: '#7c3aed20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  instructions: {
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
});

export default ReceiveScreen;
