import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Agent, Session } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AgentDetail'>;
type AgentDetailRouteProp = RouteProp<RootStackParamList, 'AgentDetail'>;

// ============================================================================
// Agent Detail Screen
// ============================================================================

export function AgentDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AgentDetailRouteProp>();
  const { agentId } = route.params;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    // TODO: Load from storage/API
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock agent data
    setAgent({
      id: agentId,
      name: agentId === 'agent-1' ? 'Trading Bot' : 'Payment Agent',
      pairedAt: Date.now() - 86400000 * 7,
      lastSeen: Date.now() - 3600000,
      status: 'active',
    });

    // Mock sessions
    setSessions([
      {
        id: 'session-1',
        agentId,
        walletPubkey: 'SimulatedWallet123',
        sessionPubkey: 'SessionKey456',
        limits: [{ mint: 'native', amount: 0.5, decimals: 9, symbol: 'SOL' }],
        durationSeconds: 3600,
        createdAt: Date.now() - 1800000,
        expiresAt: Date.now() + 1800000,
        status: 'active',
        spent: [{ mint: 'native', amount: 0.1, decimals: 9, symbol: 'SOL' }],
      },
      {
        id: 'session-2',
        agentId,
        walletPubkey: 'SimulatedWallet123',
        sessionPubkey: 'SessionKey789',
        limits: [{ mint: 'native', amount: 1.0, decimals: 9, symbol: 'SOL' }],
        durationSeconds: 7200,
        createdAt: Date.now() - 86400000,
        expiresAt: Date.now() - 79200000,
        status: 'expired',
      },
    ]);
  }, [agentId]);

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

  const handleSessionPress = (sessionId: string) => {
    navigation.navigate('SessionDetail', { sessionId, agentId });
  };

  const handleUnpair = () => {
    Alert.alert(
      'Unpair Agent',
      `Are you sure you want to unpair ${agent?.name}? This will revoke all active sessions.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unpair',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement unpair
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

  if (!agent) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Agent not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Agent Info */}
      <View style={styles.agentCard}>
        <View style={styles.agentHeader}>
          <Text style={styles.agentIcon}>🤖</Text>
          <View style={styles.agentInfo}>
            <Text style={styles.agentName}>{agent.name}</Text>
            <Text style={styles.agentMeta}>
              Paired {formatDate(agent.pairedAt)}
            </Text>
          </View>
          <View style={[styles.statusBadge, agent.status === 'active' && styles.statusActive]}>
            <Text style={styles.statusText}>{agent.status}</Text>
          </View>
        </View>
      </View>

      {/* Sessions List */}
      <View style={styles.sessionsHeader}>
        <Text style={styles.sectionTitle}>Sessions</Text>
        <Text style={styles.sessionCount}>{sessions.length}</Text>
      </View>

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SessionRow session={item} onPress={() => handleSessionPress(item.id)} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#7c3aed"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No sessions yet</Text>
          </View>
        }
      />

      {/* Unpair Button */}
      <TouchableOpacity style={styles.unpairButton} onPress={handleUnpair}>
        <Text style={styles.unpairButtonText}>Unpair Agent</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================================
// Components
// ============================================================================

interface SessionRowProps {
  session: Session;
  onPress: () => void;
}

function SessionRow({ session, onPress }: SessionRowProps) {
  const statusColor = {
    pending: '#f59e0b',
    active: '#22c55e',
    expired: '#666',
    revoked: '#ef4444',
  }[session.status];

  const limit = session.limits[0];
  const spent = session.spent?.[0];

  return (
    <TouchableOpacity style={styles.sessionRow} onPress={onPress}>
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionLimit}>
          {limit?.amount} {limit?.symbol} limit
        </Text>
        <Text style={styles.sessionMeta}>
          {spent ? `${spent.amount} spent · ` : ''}
          {formatTimeRemaining(session)}
        </Text>
      </View>
      <View style={[styles.sessionStatus, { backgroundColor: statusColor + '20' }]}>
        <Text style={[styles.sessionStatusText, { color: statusColor }]}>
          {session.status}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString();
}

function formatTimeRemaining(session: Session): string {
  if (session.status === 'expired') return 'Expired';
  if (session.status === 'revoked') return 'Revoked';
  
  const remaining = session.expiresAt - Date.now();
  if (remaining <= 0) return 'Expired';
  
  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
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
  agentCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
  },
  agentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  agentMeta: {
    fontSize: 12,
    color: '#888',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#333',
  },
  statusActive: {
    backgroundColor: '#22c55e20',
  },
  statusText: {
    fontSize: 12,
    color: '#888',
    textTransform: 'capitalize',
  },
  sessionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  sessionCount: {
    fontSize: 14,
    color: '#888',
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionLimit: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 4,
  },
  sessionMeta: {
    fontSize: 12,
    color: '#888',
  },
  sessionStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sessionStatusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
  },
  unpairButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#2d1515',
    borderRadius: 12,
    alignItems: 'center',
  },
  unpairButtonText: {
    color: '#f87171',
    fontWeight: '600',
  },
});

export default AgentDetailScreen;
