import React, { useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ImageBackground, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

export default function Welcome({ navigation }) {
  const logoAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // This effect runs every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // 1. Reset all animations to their initial state
      fadeAnim.setValue(1);
      logoAnim.setValue(0);
      buttonAnim.setValue(0);

      // 2. Start the entrance animation
      const entranceAnimation = Animated.stagger(300, [
        Animated.timing(logoAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          delay: 200,
        }),
        Animated.timing(buttonAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]);
      entranceAnimation.start();

      // 3. Set up the automatic navigation timer
      const timer = setTimeout(() => {
        navigateWithFade();
      }, 5500);

      // 4. Return a cleanup function to run when the screen loses focus
      return () => {
        clearTimeout(timer);
        entranceAnimation.stop();
      };
    }, [navigation])
  );

  // Function to handle navigation with a fade-out effect
  const navigateWithFade = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      navigation.navigate('Login');
    });
  };

  const logoTranslateY = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 0],
  });

  const buttonTranslateY = buttonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  return (
    <ImageBackground source={require('../assets/cork-946087.jpg')} style={styles.background} resizeMode="cover">
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <View style={styles.overlay}>
          <View style={styles.container}>
            <Animated.View style={{ opacity: logoAnim, transform: [{ translateY: logoTranslateY }] }}>
              <Image source={require('../assets/logo.png')} style={styles.logo} />
            </Animated.View>
            <Animated.View style={{ width: '70%', opacity: buttonAnim, transform: [{ translateY: buttonTranslateY }] }}>
              <TouchableOpacity style={styles.button} onPress={navigateWithFade}>
                <Text style={styles.buttonText}>Ingresar</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 70,
    width: '100%',
  },
  logo: {
    width: 210,
    height: 210,
    transform: [{ rotate: '-11deg' }],
    tintColor: '#F3F38B',
  },
  button: {
    backgroundColor: 'rgba(217, 108, 61, 0.7)',
    paddingVertical: 15,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
  },
});
