import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList, Session, Transaction } from '../types';

type SessionDetailRouteProp = RouteProp<RootStackParamList, 'SessionDetail'>;

// ============================================================================
// Session Detail Screen
// ============================================================================

export function SessionDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<SessionDetailRouteProp>();
  const { sessionId } = route.params;

  const [session, setSession] = useState<Session | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    // TODO: Load from storage/API
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock session
    setSession({
      id: sessionId,
      agentId: 'agent-1',
      walletPubkey: 'SimulatedWallet123',
      sessionPubkey: 'SessionKey456',
      limits: [{ mint: 'native', amount: 0.5, decimals: 9, symbol: 'SOL' }],
      durationSeconds: 3600,
      createdAt: Date.now() - 1800000,
      expiresAt: Date.now() + 1800000,
      status: 'active',
      spent: [{ mint: 'native', amount: 0.1, decimals: 9, symbol: 'SOL' }],
    });

    // Mock transactions
    setTransactions([
      {
        signature: 'tx1abc123...',
        type: 'transfer',
        from: 'SimulatedWallet123',
        to: 'RecipientAddress456',
        amount: 0.05,
        timestamp: Date.now() - 600000,
        status: 'confirmed',
        sessionId,
      },
      {
        signature: 'tx2def456...',
        type: 'transfer',
        from: 'SimulatedWallet123',
        to: 'RecipientAddress789',
        amount: 0.05,
        timestamp: Date.now() - 300000,
        status: 'confirmed',
        sessionId,
      },
    ]);
  }, [sessionId]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await loadData();
      setIsLoading(false);
    };
    load();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  }, [loadData]);

  const handleRevoke = () => {
    Alert.alert(
      'Revoke Session',
      'Are you sure you want to revoke this session? The agent will no longer be able to spend from your wallet.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement revoke
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Session not found</Text>
      </View>
    );
  }

  const limit = session.limits[0];
  const spent = session.spent?.[0];
  const remaining = limit ? limit.amount - (spent?.amount || 0) : 0;
  const spentPercentage = limit ? ((spent?.amount || 0) / limit.amount) * 100 : 0;

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
      {/* Status Banner */}
      <View style={[styles.statusBanner, styles[`status_${session.status}`]]}>
        <Text style={styles.statusText}>{session.status.toUpperCase()}</Text>
        <Text style={styles.statusSubtext}>{getStatusMessage(session)}</Text>
      </View>

      {/* Spending Progress */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Spending Limit</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${Math.min(spentPercentage, 100)}%` }]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressSpent}>
              {spent?.amount || 0} {limit?.symbol} spent
            </Text>
            <Text style={styles.progressRemaining}>
              {remaining.toFixed(4)} {limit?.symbol} left
            </Text>
          </View>
        </View>

        <View style={styles.limitInfo}>
          <View style={styles.limitItem}>
            <Text style={styles.limitLabel}>Limit</Text>
            <Text style={styles.limitValue}>{limit?.amount} {limit?.symbol}</Text>
          </View>
          <View style={styles.limitItem}>
            <Text style={styles.limitLabel}>Duration</Text>
            <Text style={styles.limitValue}>{formatDuration(session.durationSeconds)}</Text>
          </View>
          <View style={styles.limitItem}>
            <Text style={styles.limitLabel}>Expires</Text>
            <Text style={styles.limitValue}>{formatExpiry(session.expiresAt)}</Text>
          </View>
        </View>
      </View>

      {/* Transactions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Transactions</Text>
        
        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>No transactions yet</Text>
        ) : (
          transactions.map((tx) => (
            <TransactionRow key={tx.signature} transaction={tx} />
          ))
        )}
      </View>

      {/* Revoke Button */}
      {session.status === 'active' && (
        <TouchableOpacity style={styles.revokeButton} onPress={handleRevoke}>
          <Text style={styles.revokeButtonText}>Revoke Session</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

// ============================================================================
// Components
// ============================================================================

interface TransactionRowProps {
  transaction: Transaction;
}

function TransactionRow({ transaction }: TransactionRowProps) {
  const statusIcon = {
    pending: '⏳',
    confirmed: '✅',
    failed: '❌',
  }[transaction.status];

  return (
    <View style={styles.txRow}>
      <View style={styles.txInfo}>
        <Text style={styles.txAmount}>-{transaction.amount} SOL</Text>
        <Text style={styles.txTo}>
          To: {shortenAddress(transaction.to)}
        </Text>
      </View>
      <View style={styles.txStatus}>
        <Text style={styles.txStatusIcon}>{statusIcon}</Text>
        <Text style={styles.txTime}>{formatTimeAgo(transaction.timestamp)}</Text>
      </View>
    </View>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function getStatusMessage(session: Session): string {
  switch (session.status) {
    case 'active':
      return `Expires ${formatExpiry(session.expiresAt)}`;
    case 'expired':
      return 'Session has expired';
    case 'revoked':
      return 'Session was revoked';
    case 'pending':
      return 'Waiting for approval';
    default:
      return '';
  }
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  if (hours >= 24) return `${Math.floor(hours / 24)}d`;
  return `${hours}h`;
}

function formatExpiry(timestamp: number): string {
  const diff = timestamp - Date.now();
  if (diff <= 0) return 'Expired';
  
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  
  if (hours > 0) return `in ${hours}h ${minutes}m`;
  return `in ${minutes}m`;
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
  errorText: {
    color: '#f87171',
  },
  statusBanner: {
    padding: 16,
    alignItems: 'center',
  },
  status_active: {
    backgroundColor: '#22c55e20',
  },
  status_pending: {
    backgroundColor: '#f59e0b20',
  },
  status_expired: {
    backgroundColor: '#33333340',
  },
  status_revoked: {
    backgroundColor: '#ef444420',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statusSubtext: {
    fontSize: 12,
    color: '#888',
  },
  card: {
    margin: 16,
    marginBottom: 0,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7c3aed',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressSpent: {
    fontSize: 12,
    color: '#888',
  },
  progressRemaining: {
    fontSize: 12,
    color: '#888',
  },
  limitInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  limitItem: {
    alignItems: 'center',
  },
  limitLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  limitValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  txInfo: {
    flex: 1,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 2,
  },
  txTo: {
    fontSize: 12,
    color: '#888',
  },
  txStatus: {
    alignItems: 'flex-end',
  },
  txStatusIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  txTime: {
    fontSize: 10,
    color: '#666',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    paddingVertical: 24,
  },
  revokeButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#2d1515',
    borderRadius: 12,
    alignItems: 'center',
  },
  revokeButtonText: {
    color: '#f87171',
    fontWeight: '600',
  },
});

export default SessionDetailScreen;
