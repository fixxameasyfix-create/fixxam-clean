import { Stack } from 'expo-router';
import React from 'react';

import { ShopRegistrationProvider } from '../../../contexts/ShopRegistrationContext';

export default function MyShopLayout() {
  return (
    <ShopRegistrationProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
        }}
      />
    </ShopRegistrationProvider>
  );
}