import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import { RootStackParamList, StoredWallet, TokenBalance } from '../types';
import { solana } from '../services';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const WALLET_STORAGE_KEY = 'odyssey_wallet';

// ============================================================================
// Wallet Screen
// ============================================================================

export function WalletScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [wallet, setWallet] = useState<StoredWallet | null>(null);
  const [solBalance, setSolBalance] = useState<number>(0);
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWallet = useCallback(async () => {
    try {
      const stored = await SecureStore.getItemAsync(WALLET_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StoredWallet;
        setWallet(parsed);
        return parsed;
      }
      return null;
    } catch (err) {
      console.error('Failed to load wallet:', err);
      return null;
    }
  }, []);

  const loadBalances = useCallback(async (publicKey: string) => {
    try {
      setError(null);
      const [sol, tokenBalances] = await Promise.all([
        solana.getSolBalance(publicKey),
        solana.getTokenBalances(publicKey),
      ]);
      setSolBalance(sol);
      setTokens(tokenBalances);
    } catch (err) {
      console.error('Failed to load balances:', err);
      setError('Failed to load balances');
    }
  }, []);

  const onRefresh = useCallback(async () => {
    if (!wallet) return;
    setIsRefreshing(true);
    await loadBalances(wallet.wallet.publicKey);
    setIsRefreshing(false);
  }, [wallet, loadBalances]);

  useEffect(() => {
    // Initial load - this is an intentional pattern for data fetching
    const load = async () => {
      setIsLoading(true);
      const loadedWallet = await loadWallet();
      if (loadedWallet) {
        await loadBalances(loadedWallet.wallet.publicKey);
      }
      setIsLoading(false);
    };
    load();
  }, [loadWallet, loadBalances]);

  const handleSend = () => {
    navigation.navigate('Send', {});
  };

  const handleReceive = () => {
    navigation.navigate('Receive');
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
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor="#7c3aed"
        />
      }
    >
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>{solBalance.toFixed(4)} SOL</Text>
        <Text style={styles.addressText}>
          {solana.shortenAddress(wallet.wallet.publicKey, 6)}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleSend}>
          <Text style={styles.actionIcon}>↑</Text>
          <Text style={styles.actionLabel}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleReceive}>
          <Text style={styles.actionIcon}>↓</Text>
          <Text style={styles.actionLabel}>Receive</Text>
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Token List */}
      <View style={styles.tokenSection}>
        <Text style={styles.sectionTitle}>Tokens</Text>
        
        {/* SOL */}
        <TokenRow
          symbol="SOL"
          name="Solana"
          balance={solBalance.toFixed(4)}
          logoUri={undefined}
        />

        {/* Other Tokens */}
        {tokens.map((token) => (
          <TokenRow
            key={token.mint}
            symbol={token.symbol}
            name={token.name}
            balance={token.uiBalance}
            logoUri={token.logoUri}
          />
        ))}

        {tokens.length === 0 && (
          <Text style={styles.emptyText}>No other tokens</Text>
        )}
      </View>
    </ScrollView>
  );
}

// ============================================================================
// Components
// ============================================================================

interface TokenRowProps {
  symbol: string;
  name: string;
  balance: string;
  logoUri?: string;
}

function TokenRow({ symbol, name, balance }: TokenRowProps) {
  return (
    <View style={styles.tokenRow}>
      <View style={styles.tokenIcon}>
        <Text style={styles.tokenIconText}>{symbol[0]}</Text>
      </View>
      <View style={styles.tokenInfo}>
        <Text style={styles.tokenSymbol}>{symbol}</Text>
        <Text style={styles.tokenName}>{name}</Text>
      </View>
      <Text style={styles.tokenBalance}>{balance}</Text>
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
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  balanceCard: {
    margin: 16,
    padding: 24,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#7c3aed',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  errorContainer: {
    margin: 16,
    padding: 12,
    backgroundColor: '#2d1515',
    borderRadius: 8,
  },
  errorText: {
    color: '#f87171',
    textAlign: 'center',
  },
  tokenSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  tokenIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tokenIconText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  tokenInfo: {
    flex: 1,
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  tokenName: {
    fontSize: 12,
    color: '#888',
  },
  tokenBalance: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    paddingVertical: 24,
  },
});

export default WalletScreen;
