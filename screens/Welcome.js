/**
 * @file Welcome.js
 * @description Pantalla de bienvenida con animación y navegación automática a la pantalla de Login.
 * @author [Tu Nombre]
 */

import React, { useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ImageBackground, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

/**
 * Componente de la pantalla de Bienvenida.
 * Muestra un logo y un botón con animación, y navega a la pantalla de Login tras un tiempo.
 * @param {object} props - Propiedades del componente.
 * @param {object} props.navigation - Objeto de navegación de React Navigation.
 * @returns {JSX.Element}
 */
export default function Welcome({ navigation }) {
  const { t } = useTranslation();
  // Referencias para las animaciones
  const logoAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  /**
   * Hook de efecto que se ejecuta cada vez que la pantalla obtiene el foco.
   * Inicia las animaciones de entrada y un temporizador para la navegación automática.
   */
  useFocusEffect(
    useCallback(() => {
      // 1. Reinicia las animaciones a su estado inicial
      fadeAnim.setValue(1);
      logoAnim.setValue(0);
      buttonAnim.setValue(0);

      // 2. Inicia la animación de entrada para el logo y el botón
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

      // 3. Configura un temporizador para navegar automáticamente
      const timer = setTimeout(() => {
        navigateWithFade();
      }, 5500);

      // 4. Función de limpieza que se ejecuta cuando la pantalla pierde el foco
      return () => {
        clearTimeout(timer);
        entranceAnimation.stop();
      };
    }, [navigation])
  );

  /**
   * Navega a la pantalla de Login con un efecto de desvanecimiento.
   */
  const navigateWithFade = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      navigation.navigate('Login');
    });
  };

  // Interpolaciones para las animaciones de traslación
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
            {/* Logo animado */}
            <Animated.View style={{ opacity: logoAnim, transform: [{ translateY: logoTranslateY }] }}>
              <Image source={require('../assets/logo.png')} style={styles.logo} />
            </Animated.View>
            {/* Botón animado */}
            <Animated.View style={{ width: '70%', opacity: buttonAnim, transform: [{ translateY: buttonTranslateY }] }}>
              <TouchableOpacity style={styles.button} onPress={navigateWithFade}>
                <Text style={styles.buttonText}>{t('ingresar')}</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </Animated.View>
    </ImageBackground>
  );
}

// --- Hoja de Estilos ---
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