import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ImageBackground, Animated } from 'react-native';

export default function Welcome({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        navigation.navigate('Login');
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [fadeAnim, navigation]);

  return (
    <ImageBackground source={require('../assets/cork-946087.jpg')} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.buttonText}>Ingresar</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)', // Capa para oscurecer el fondo
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between', // Posición original
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
    backgroundColor: 'rgba(217, 108, 61, 0.7)', // Ligera transparencia
    paddingVertical: 15,
    borderRadius: 25, // Más redondeado
    width: '70%', // Nuevo ancho
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18, // Mismo tamaño que los otros botones
    fontFamily: 'Roboto-Bold', // Misma fuente que los otros botones
  },
});