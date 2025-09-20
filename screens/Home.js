import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { FontAwesome } from '@expo/vector-icons';

export default function Home({ navigation }) {
  const user = auth.currentUser;

  const handleLogOut = async () => {
    try {
      await signOut(auth);
      Alert.alert("Sesión cerrada", "Has cerrado sesión correctamente.");
      navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al cerrar sesión.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.userInfoContainer}>
        <FontAwesome name="user-circle" size={24} color="black" />
        <Text style={styles.userName}>{user?.displayName || user?.email}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ControlCompras')}>
        <Text style={styles.buttonText}>Control de Compras</Text>
      </TouchableOpacity>

      <Image source={require('../assets/logo.png')} style={styles.logo} />

      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogOut}>
        <Text style={styles.buttonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  userInfoContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    marginLeft: 10,
    fontSize: 16,
  },
  logo: {
    width: 100,
    height: 100,
    marginTop: 150,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#922b21',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    position: 'absolute',
    bottom: 40,
  },
});
