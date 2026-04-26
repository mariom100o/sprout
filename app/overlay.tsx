import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Zap, BookOpen, ShoppingBag, X } from 'lucide-react-native';
import { Sprout } from 'lucide-react-native';
import { useSproutStore } from '../store';
import { Colors } from '../lib/theme';
import { SproutBlocker } from '../modules/sprout-blocker';

const { width } = Dimensions.get('window');
const MIN_COST = 50;

export default function OverlayScreen() {
  const fuelBalance = useSproutStore((s) => s.fuelBalance);
  const spendFuel = useSproutStore((s) => s.spendFuel);
  const grantSession = useSproutStore((s) => s.grantSession);
  const canAfford = fuelBalance >= MIN_COST;

  const handleSpend = async () => {
    if (!canAfford) return;
    spendFuel(MIN_COST);
    grantSession(15 * 60 * 1000);
    try {
      await SproutBlocker.dismissOverlayAndOpenApp('https://www.youtube.com');
    } catch {
      await SproutBlocker.dismissOverlay();
    }
  };

  const handleEarn = async () => {
    try {
      await SproutBlocker.dismissOverlayAndOpenApp('sprout:///(kid)/earn');
    } catch {
      await SproutBlocker.dismissOverlay();
    }
  };

  const handleDismiss = async () => {
    try {
      await SproutBlocker.dismissOverlayAndGoHome();
    } catch {
      await SproutBlocker.dismissOverlay();
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'rgba(27,46,31,0.90)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <MotiView
        from={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 14, stiffness: 150 }}
        style={{
          backgroundColor: Colors.paper,
          borderRadius: 28,
          padding: 28,
          width: width - 48,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 20,
        }}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.moss + '20', alignItems: 'center', justifyContent: 'center' }}>
            <Sprout size={24} color={Colors.moss} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Georgia', fontSize: 18, fontWeight: '700', color: Colors.ink }}>
              Hold on!
            </Text>
            <Text style={{ color: Colors.muted, fontSize: 13 }}>Sprout needs fuel to continue</Text>
          </View>
          <TouchableOpacity onPress={handleDismiss} style={{ padding: 4 }}>
            <X size={20} color={Colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Message */}
        <View
          style={{
            backgroundColor: Colors.earth + '18',
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <Text style={{ color: Colors.ink, fontSize: 15, lineHeight: 22, textAlign: 'center' }}>
            You need{' '}
            <Text style={{ fontWeight: '700', color: Colors.earth }}>
              {MIN_COST} fuel
            </Text>{' '}
            for 15 minutes of YouTube.{'\n'}
            Your balance:{' '}
            <Text style={{ fontWeight: '700', color: canAfford ? Colors.moss : Colors.earth }}>
              {fuelBalance.toLocaleString()} ⚡
            </Text>
          </Text>
        </View>

        {/* Action buttons */}
        {canAfford ? (
          <TouchableOpacity
            onPress={handleSpend}
            style={{
              backgroundColor: Colors.moss,
              borderRadius: 18,
              padding: 16,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 12,
            }}
            activeOpacity={0.85}
          >
            <ShoppingBag size={20} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
              Spend {MIN_COST} fuel — Watch now
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleEarn}
            style={{
              backgroundColor: Colors.moss,
              borderRadius: 18,
              padding: 16,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 12,
            }}
            activeOpacity={0.85}
          >
            <BookOpen size={20} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
              Earn Fuel First
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={handleDismiss}
          style={{
            backgroundColor: Colors.muted + '20',
            borderRadius: 18,
            padding: 14,
            alignItems: 'center',
          }}
          activeOpacity={0.8}
        >
          <Text style={{ color: Colors.muted, fontWeight: '600', fontSize: 14 }}>
            Go back home
          </Text>
        </TouchableOpacity>
      </MotiView>
    </View>
  );
}
