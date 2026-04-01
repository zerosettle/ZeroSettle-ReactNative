import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  ZeroSettleKit,
  useZeroSettleEvents,
  ZSMigrateTipView,
} from 'react-native-zerosettle-kit';
import type {
  ZSProduct,
  Entitlement,
} from 'react-native-zerosettle-kit';

export default function App() {
  const [products, setProducts] = useState<ZSProduct[]>([]);
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  useZeroSettleEvents({
    onCheckoutDidBegin: (productId) => {
      setEvents((prev) => [...prev, `Checkout began: ${productId}`]);
    },
    onCheckoutDidComplete: (tx) => {
      setEvents((prev) => [
        ...prev,
        `Checkout complete: ${tx.productId} (${tx.status})`,
      ]);
    },
    onCheckoutDidCancel: (productId) => {
      setEvents((prev) => [...prev, `Checkout cancelled: ${productId}`]);
    },
    onCheckoutDidFail: (data) => {
      setEvents((prev) => [
        ...prev,
        `Checkout failed: ${data.productId} - ${data.error.message}`,
      ]);
    },
    onEntitlementsDidUpdate: (ents) => {
      setEntitlements(ents);
      setEvents((prev) => [
        ...prev,
        `Entitlements updated: ${ents.length} total`,
      ]);
    },
  });

  useEffect(() => {
    ZeroSettleKit.configure({ publishableKey: 'zs_pk_test_xxx' });
    ZeroSettleKit.bootstrap('user_123')
      .then((catalog) => {
        setProducts(catalog.products);
        setIsReady(true);
      })
      .catch((error) => {
        Alert.alert('Bootstrap Error', error.message);
      });
  }, []);

  const handlePurchase = async (productId: string) => {
    try {
      const tx = await ZeroSettleKit.purchase(productId, 'user_123');
      Alert.alert('Success', `Purchased ${tx.productId}`);
    } catch (error: any) {
      if (error?.code === 'cancelled') return;
      Alert.alert('Purchase Error', error.message);
    }
  };

  const handleCancelFlow = async (productId: string) => {
    try {
      const result = await ZeroSettleKit.presentCancelFlow(
        productId,
        'user_123'
      );
      setEvents((prev) => [...prev, `Cancel flow result: ${result}`]);
    } catch (error: any) {
      Alert.alert('Cancel Flow Error', error.message);
    }
  };

  const handleUpgradeOffer = async () => {
    try {
      const result = await ZeroSettleKit.presentUpgradeOffer('user_123');
      setEvents((prev) => [...prev, `Upgrade result: ${result}`]);
    } catch (error: any) {
      Alert.alert('Upgrade Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>ZeroSettleKit Example</Text>

        {/* Migration Tip */}
        <ZSMigrateTipView
          backgroundColorHex="#1E1E1E"
          userId="user_123"
          style={styles.tipView}
        />

        {/* Products */}
        <Text style={styles.sectionTitle}>Products</Text>
        {!isReady && <Text style={styles.label}>Loading...</Text>}
        {products.map((product) => (
          <View key={product.id} style={styles.card}>
            <Text style={styles.cardTitle}>{product.displayName}</Text>
            <Text style={styles.label}>
              Web: {product.webPrice?.formatted ?? 'N/A'} | App Store:{' '}
              {product.storeKitPrice?.formatted ?? 'N/A'}
            </Text>
            {product.savingsPercent != null && (
              <Text style={styles.savings}>
                Save {product.savingsPercent}%
              </Text>
            )}
            <TouchableOpacity
              style={styles.button}
              onPress={() => handlePurchase(product.id)}
            >
              <Text style={styles.buttonText}>Purchase</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Entitlements */}
        <Text style={styles.sectionTitle}>
          Entitlements ({entitlements.filter((e) => e.isActive).length} active)
        </Text>
        {entitlements.map((ent) => (
          <View key={ent.id} style={styles.card}>
            <Text style={styles.cardTitle}>{ent.productId}</Text>
            <Text style={styles.label}>
              Status: {ent.status} | Source: {ent.source}
            </Text>
            {ent.isActive && (
              <TouchableOpacity
                style={styles.buttonSecondary}
                onPress={() => handleCancelFlow(ent.productId)}
              >
                <Text style={styles.buttonText}>Manage</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* Actions */}
        <Text style={styles.sectionTitle}>Actions</Text>
        <TouchableOpacity style={styles.button} onPress={handleUpgradeOffer}>
          <Text style={styles.buttonText}>Check Upgrade Offer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            ZeroSettleKit.presentManageSubscriptionSheet().then((r) =>
              setEvents((prev) => [...prev, `Manage sheet: ${r}`])
            )
          }
        >
          <Text style={styles.buttonText}>Manage Subscription</Text>
        </TouchableOpacity>

        {/* Events Log */}
        <Text style={styles.sectionTitle}>Events Log</Text>
        {events.length === 0 && (
          <Text style={styles.label}>No events yet</Text>
        )}
        {events.map((event, i) => (
          <Text key={i} style={styles.eventText}>
            {event}
          </Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 12,
  },
  tipView: {
    minHeight: 220,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 8,
  },
  savings: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#6200EE',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  buttonSecondary: {
    backgroundColor: '#333333',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  eventText: {
    fontSize: 12,
    color: '#888888',
    fontFamily: 'Courier',
    marginBottom: 4,
  },
});
