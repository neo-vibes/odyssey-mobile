import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList, SessionRequest } from '../types';

type ApproveSessionRouteProp = RouteProp<RootStackParamList, 'ApproveSession'>;

// ============================================================================
// Approve Session Screen
// ============================================================================

export function ApproveSessionScreen() {
  const navigation = useNavigation();
  const route = useRoute<ApproveSessionRouteProp>();
  const { requestId } = route.params;

  const [request, setRequest] = useState<SessionRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<'approved' | 'rejected' | null>(null);

  useEffect(() => {
    // Load session request
    const load = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Mock request data
      setRequest({
        requestId,
        agentId: 'agent-1',
        agentName: 'Trading Bot',
        walletPubkey: 'SimulatedWallet123',
        sessionPubkey: 'NewSessionKey789',
        limits: [{ mint: 'native', amount: 0.5, decimals: 9, symbol: 'SOL' }],
        durationSeconds: 3600,
        createdAt: Date.now(),
        status: 'pending',
      });
      
      setIsLoading(false);
    };
    load();
  }, [requestId]);

  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      
      // TODO: Actual approval with passkey signature
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setResult('approved');
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error) {
      console.error('Approval failed:', error);
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsProcessing(true);
      
      // TODO: Actual rejection
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setResult('rejected');
      setTimeout(() => navigation.goBack(), 1000);
    } catch (error) {
      console.error('Rejection failed:', error);
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (result) {
    return (
      <View style={styles.centered}>
        <Text style={styles.resultIcon}>
          {result === 'approved' ? '✅' : '❌'}
        </Text>
        <Text style={styles.resultText}>
          Session {result === 'approved' ? 'Approved' : 'Rejected'}
        </Text>
      </View>
    );
  }

  if (!request) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Request not found</Text>
      </View>
    );
  }

  const limit = request.limits[0];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.icon}>🔔</Text>
        <Text style={styles.title}>Session Request</Text>
        <Text style={styles.subtitle}>
          An agent is requesting a spending session
        </Text>
      </View>

      {/* Agent Info */}
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Agent</Text>
          <Text style={styles.cardValue}>{request.agentName}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Agent ID</Text>
          <Text style={styles.cardValueMono}>{request.agentId}</Text>
        </View>
      </View>

      {/* Request Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Requested Access</Text>
        
        <View style={styles.limitRow}>
          <Text style={styles.limitIcon}>💰</Text>
          <View style={styles.limitInfo}>
            <Text style={styles.limitTitle}>Spending Limit</Text>
            <Text style={styles.limitValue}>
              {limit?.amount} {limit?.symbol}
            </Text>
          </View>
        </View>

        <View style={styles.limitRow}>
          <Text style={styles.limitIcon}>⏱️</Text>
          <View style={styles.limitInfo}>
            <Text style={styles.limitTitle}>Duration</Text>
            <Text style={styles.limitValue}>
              {formatDuration(request.durationSeconds)}
            </Text>
          </View>
        </View>
      </View>

      {/* Warning */}
      <View style={styles.warning}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <Text style={styles.warningText}>
          By approving, you allow this agent to spend up to {limit?.amount} {limit?.symbol} 
          from your wallet for the next {formatDuration(request.durationSeconds)}.
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.rejectButton, isProcessing && styles.buttonDisabled]}
          onPress={handleReject}
          disabled={isProcessing}
        >
          <Text style={styles.rejectButtonText}>Reject</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.approveButton, isProcessing && styles.buttonDisabled]}
          onPress={handleApprove}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.approveButtonText}>Approve</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''}`;
  }
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  return `${minutes} minute${minutes > 1 ? 's' : ''}`;
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
  resultIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    fontSize: 48,
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
  card: {
    margin: 16,
    marginBottom: 0,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  cardLabel: {
    fontSize: 14,
    color: '#888',
  },
  cardValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  cardValueMono: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'monospace',
  },
  limitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  limitIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  limitInfo: {
    flex: 1,
  },
  limitTitle: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  limitValue: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  warning: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f59e0b20',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#f59e0b',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#333',
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  approveButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#7c3aed',
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default ApproveSessionScreen;
