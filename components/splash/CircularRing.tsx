import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type Props = {
  number: '1' | '2';
};

export default function CircularRing({ number }: Props) {
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Animated.View
        style={{
          transform: [{ rotate: spin }],
          position: 'absolute',
        }}
      >
        <Svg width={220} height={220}>
          <Circle
            cx="110"
            cy="110"
            r="80"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="4"
            fill="none"
          />

          <Circle
            cx="110"
            cy="110"
            r="80"
            stroke="#FFFFFF"
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
            strokeDasharray="180 350"
          />
        </Svg>
      </Animated.View>

      <Animated.Text
        style={{
          color: '#FFFFFF',
          fontSize: 80,
          fontWeight: '700',
        }}
      >
        {number}
      </Animated.Text>
    </View>
  );
}