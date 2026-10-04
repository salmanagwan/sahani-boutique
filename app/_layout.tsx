import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AppProvider } from '@/context/AppContext';
import { Colors, Fonts } from '@/constants/theme';
import { TenorSans_400Regular } from '@expo-google-fonts/tenor-sans';
import {
  WorkSans_300Light,
  WorkSans_400Regular,
  WorkSans_400Regular_Italic,
  WorkSans_500Medium,
  WorkSans_600SemiBold,
  WorkSans_700Bold,
} from '@expo-google-fonts/work-sans';
import { Tinos_400Regular, Tinos_400Regular_Italic } from '@expo-google-fonts/tinos';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_500Medium,
} from '@expo-google-fonts/playfair-display';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

import { LogoMark } from '@/components/ui/Logo';

SplashScreen.preventAutoHideAsync();

// White splash: the engraved wordmark between two champagne rules.
function MaisonSplash({ onDismiss }: { onDismiss: () => void }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const markOpacity = useRef(new Animated.Value(0)).current;
  const ruleScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Never let the splash outlive its animation, even in a throttled browser frame.
    const fallback = setTimeout(onDismiss, 3200);
    Animated.sequence([
      Animated.delay(120),
      Animated.parallel([
        Animated.timing(markOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(ruleScale, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
      Animated.delay(600),
      Animated.timing(opacity, { toValue: 0, duration: 380, useNativeDriver: true }),
    ]).start(() => {
      clearTimeout(fallback);
      onDismiss();
    });
    return () => clearTimeout(fallback);
  }, []);

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.splash, { opacity }]}>
      <Animated.View style={{ opacity: markOpacity, alignItems: 'center' }}>
        <LogoMark size={58} />
        <Text style={[styles.splashName, { marginTop: 18 }]}>SAHANI</Text>
        <View style={styles.splashRow}>
          <Animated.View style={[styles.splashRule, { transform: [{ scaleX: ruleScale }] }]} />
          <Text style={styles.splashCity}>LONDON</Text>
          <Animated.View style={[styles.splashRule, { transform: [{ scaleX: ruleScale }] }]} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    TenorSans_400Regular,
    WorkSans_300Light,
    WorkSans_400Regular,
    WorkSans_400Regular_Italic,
    WorkSans_500Medium,
    WorkSans_600SemiBold,
    WorkSans_700Bold,
    Tinos_400Regular,
    Tinos_400Regular_Italic,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_400Regular_Italic,
    PlayfairDisplay_500Medium,
  });
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <AppProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="order/create" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="order/[id]" />
          <Stack.Screen name="designer/add" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="designer/[id]" />
        </Stack>
        {showSplash && <MaisonSplash onDismiss={() => setShowSplash(false)} />}
      </AppProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
    alignSelf: 'center',
    backgroundColor: Colors.background,
    ...(Platform.OS === 'web' ? { minHeight: '100vh' as unknown as number } : {}),
  },
  splash: {
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  splashName: {
    fontFamily: Fonts.display,
    fontSize: 40,
    letterSpacing: 16,
    marginRight: -16,
    color: Colors.ink,
  },
  splashRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
    width: 240,
  },
  splashRule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.champagne,
  },
  splashCity: {
    fontFamily: Fonts.display,
    fontSize: 11,
    letterSpacing: 6,
    marginRight: -6,
    color: Colors.ink,
  },
});
