import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import { RootStackParamList, MainTabParamList } from '../types';
import { OnboardingScreen, WalletScreen, SendScreen, ReceiveScreen, AgentsScreen, PairAgentScreen } from '../screens';

// ============================================================================
// Placeholder Screens (to be replaced)
// ============================================================================

function PlaceholderScreen({ name }: { name: string }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>{name}</Text>
    </View>
  );
}

// Placeholder implementations
function SettingsScreen() {
  return <PlaceholderScreen name="Settings" />;
}

function AgentDetailScreen() {
  return <PlaceholderScreen name="Agent Detail" />;
}

function SessionDetailScreen() {
  return <PlaceholderScreen name="Session Detail" />;
}

function ApproveSessionScreen() {
  return <PlaceholderScreen name="Approve Session" />;
}

// ============================================================================
// Tab Navigator
// ============================================================================

const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0a0a0a' },
        headerTintColor: '#fff',
        tabBarStyle: { backgroundColor: '#0a0a0a', borderTopColor: '#222' },
        tabBarActiveTintColor: '#7c3aed',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          tabBarLabel: 'Wallet',
          tabBarIcon: ({ color }) => <TabIcon icon="💳" color={color} />,
        }}
      />
      <Tab.Screen
        name="Agents"
        component={AgentsScreen}
        options={{
          tabBarLabel: 'Agents',
          tabBarIcon: ({ color }) => <TabIcon icon="🤖" color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => <TabIcon icon="⚙️" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

function TabIcon({ icon, color }: { icon: string; color: string }) {
  return (
    <Text style={[styles.tabIcon, { opacity: color === '#7c3aed' ? 1 : 0.5 }]}>{icon}</Text>
  );
}

// ============================================================================
// Stack Navigator
// ============================================================================

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  // TODO: Check if user has wallet, show Onboarding if not
  const hasWallet = false;

  return (
    <Stack.Navigator
      initialRouteName={hasWallet ? 'Main' : 'Onboarding'}
      screenOptions={{
        headerStyle: { backgroundColor: '#0a0a0a' },
        headerTintColor: '#fff',
        contentStyle: { backgroundColor: '#0a0a0a' },
      }}
    >
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Main"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AgentDetail"
        component={AgentDetailScreen}
        options={{ title: 'Agent' }}
      />
      <Stack.Screen
        name="SessionDetail"
        component={SessionDetailScreen}
        options={{ title: 'Session' }}
      />
      <Stack.Screen
        name="Send"
        component={SendScreen}
        options={{ title: 'Send' }}
      />
      <Stack.Screen
        name="Receive"
        component={ReceiveScreen}
        options={{ title: 'Receive' }}
      />
      <Stack.Screen
        name="PairAgent"
        component={PairAgentScreen}
        options={{ title: 'Pair Agent' }}
      />
      <Stack.Screen
        name="ApproveSession"
        component={ApproveSessionScreen}
        options={{ title: 'Approve Session', presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}

// ============================================================================
// App Navigator (with NavigationContainer)
// ============================================================================

export function AppNavigator() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  placeholderText: {
    color: '#666',
    fontSize: 18,
  },
  tabIcon: {
    fontSize: 20,
  },
});

export default AppNavigator;
