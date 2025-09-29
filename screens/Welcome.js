import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ImageBackground, Animated } from 'react-native';

export default function Welcome({ navigation }) {
  const logoAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current; // Animación para el desvanecimiento de salida

  // Función para manejar la navegación con desvanecimiento
  const navigateWithFade = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500, // Duración del desvanecimiento
      useNativeDriver: true,
    }).start(() => {
      navigation.navigate('Login');
    });
  };

  // Efecto para las animaciones de entrada
  useEffect(() => {
    Animated.stagger(300, [
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
    ]).start();
  }, [logoAnim, buttonAnim]);

  // Efecto para la navegación automática
  useEffect(() => {
    const timer = setTimeout(() => {
      navigateWithFade();
    }, 5500); // 5.5s de espera + 0.5s de fade = 6s total

    return () => clearTimeout(timer);
  }, [navigation]);

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