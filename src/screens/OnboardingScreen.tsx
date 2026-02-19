import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import { RootStackParamList, StoredWallet } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

// ============================================================================
// Constants
// ============================================================================

const WALLET_STORAGE_KEY = 'odyssey_wallet';

// ============================================================================
// Onboarding Screen
// ============================================================================

export function OnboardingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [isCreating, setIsCreating] = useState(false);
  const [step, setStep] = useState<'welcome' | 'creating' | 'success'>('welcome');

  const handleCreateWallet = async () => {
    try {
      setIsCreating(true);
      setStep('creating');

      // TODO: Integrate actual passkey creation with Lazorkit
      // For now, simulate wallet creation
      await simulateWalletCreation();

      setStep('success');

      // Small delay before navigation
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }, 1500);
    } catch (error) {
      setStep('welcome');
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create wallet'
      );
    } finally {
      setIsCreating(false);
    }
  };

  const simulateWalletCreation = async (): Promise<void> => {
    // Simulate passkey creation delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate a mock wallet (in production, this comes from Lazorkit)
    const mockPublicKey = 'SimulatedPublicKey' + Math.random().toString(36).substring(7);
    const mockCredentialId = 'cred_' + Math.random().toString(36).substring(7);

    const wallet: StoredWallet = {
      wallet: {
        publicKey: mockPublicKey,
        createdAt: Date.now(),
        name: 'My Wallet',
      },
      credentialId: mockCredentialId,
    };

    // Store wallet securely
    await SecureStore.setItemAsync(WALLET_STORAGE_KEY, JSON.stringify(wallet));
  };

  return (
    <View style={styles.container}>
      {step === 'welcome' && (
        <WelcomeStep onCreateWallet={handleCreateWallet} isCreating={isCreating} />
      )}
      {step === 'creating' && <CreatingStep />}
      {step === 'success' && <SuccessStep />}
    </View>
  );
}

// ============================================================================
// Steps
// ============================================================================

interface WelcomeStepProps {
  onCreateWallet: () => void;
  isCreating: boolean;
}

function WelcomeStep({ onCreateWallet, isCreating }: WelcomeStepProps) {
  return (
    <>
      <View style={styles.header}>
        <Text style={styles.logo}>🚀</Text>
        <Text style={styles.title}>Odyssey</Text>
        <Text style={styles.subtitle}>AI Agent Wallet</Text>
      </View>

      <View style={styles.features}>
        <FeatureItem
          icon="🔐"
          title="Passkey Security"
          description="Secured by Face ID or fingerprint"
        />
        <FeatureItem
          icon="🤖"
          title="Agent Sessions"
          description="Approve time-limited spending for AI agents"
        />
        <FeatureItem
          icon="⚡"
          title="Instant Transfers"
          description="Fast transactions on Solana"
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, isCreating && styles.buttonDisabled]}
          onPress={onCreateWallet}
          disabled={isCreating}
        >
          <Text style={styles.buttonText}>Create Wallet with Passkey</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          By continuing, you agree to our Terms of Service
        </Text>
      </View>
    </>
  );
}

function CreatingStep() {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#7c3aed" />
      <Text style={styles.creatingText}>Creating your wallet...</Text>
      <Text style={styles.creatingSubtext}>
        Please authenticate with your passkey
      </Text>
    </View>
  );
}

function SuccessStep() {
  return (
    <View style={styles.centered}>
      <Text style={styles.successIcon}>✅</Text>
      <Text style={styles.successText}>Wallet Created!</Text>
      <Text style={styles.successSubtext}>Redirecting to your wallet...</Text>
    </View>
  );
}

// ============================================================================
// Components
// ============================================================================

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
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
    padding: 24,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#888',
  },
  features: {
    flex: 1,
    justifyContent: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#888',
  },
  footer: {
    paddingBottom: 32,
  },
  button: {
    backgroundColor: '#7c3aed',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footerText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  creatingText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 24,
  },
  creatingSubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  successSubtext: {
    fontSize: 14,
    color: '#888',
  },
});

export default OnboardingScreen;
