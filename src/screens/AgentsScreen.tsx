import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Agent } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// ============================================================================
// Agents Screen
// ============================================================================

export function AgentsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAgents = useCallback(async () => {
    // TODO: Load agents from storage/API
    // For now, use mock data
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    setAgents([
      {
        id: 'agent-1',
        name: 'Trading Bot',
        pairedAt: Date.now() - 86400000 * 7,
        lastSeen: Date.now() - 3600000,
        status: 'active',
      },
      {
        id: 'agent-2',
        name: 'Payment Agent',
        pairedAt: Date.now() - 86400000 * 2,
        lastSeen: Date.now() - 86400000,
        status: 'inactive',
      },
    ]);
  }, []);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await loadAgents();
      setIsLoading(false);
    };
    load();
  }, [loadAgents]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadAgents();
    setIsRefreshing(false);
  }, [loadAgents]);

  const handlePairAgent = () => {
    navigation.navigate('PairAgent');
  };

  const handleAgentPress = (agentId: string) => {
    navigation.navigate('AgentDetail', { agentId });
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Pair Button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Paired Agents</Text>
        <TouchableOpacity style={styles.pairButton} onPress={handlePairAgent}>
          <Text style={styles.pairButtonText}>+ Pair</Text>
        </TouchableOpacity>
      </View>

      {/* Agent List */}
      <FlatList
        data={agents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AgentRow agent={item} onPress={() => handleAgentPress(item.id)} />
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
            <Text style={styles.emptyIcon}>🤖</Text>
            <Text style={styles.emptyText}>No agents paired yet</Text>
            <Text style={styles.emptySubtext}>
              Pair an agent to allow it to request spending sessions
            </Text>
          </View>
        }
        contentContainerStyle={agents.length === 0 ? styles.emptyList : undefined}
      />
    </View>
  );
}

// ============================================================================
// Components
// ============================================================================

interface AgentRowProps {
  agent: Agent;
  onPress: () => void;
}

function AgentRow({ agent, onPress }: AgentRowProps) {
  const statusColor = agent.status === 'active' ? '#22c55e' : '#666';
  const lastSeenText = agent.lastSeen
    ? formatTimeAgo(agent.lastSeen)
    : 'Never';

  return (
    <TouchableOpacity style={styles.agentRow} onPress={onPress}>
      <View style={styles.agentIcon}>
        <Text style={styles.agentIconText}>🤖</Text>
      </View>
      <View style={styles.agentInfo}>
        <Text style={styles.agentName}>{agent.name}</Text>
        <Text style={styles.agentMeta}>Last seen: {lastSeenText}</Text>
      </View>
      <View style={styles.agentStatus}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusText, { color: statusColor }]}>
          {agent.status}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  pairButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pairButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  agentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  agentIconText: {
    fontSize: 24,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  agentMeta: {
    fontSize: 12,
    color: '#888',
  },
  agentStatus: {
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    textTransform: 'capitalize',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 48,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});

export default AgentsScreen;
