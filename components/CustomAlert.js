import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { FontAwesome } from '@expo/vector-icons';

const TERRACOTTA = '#d96c3d';
const DARK_GREY = '#3A3A3A';
const SUCCESS_GREEN = '#2E7D32';
const ERROR_RED = '#C62828';

const CustomAlert = ({ visible, title, message, onClose }) => {
  // Detecta si es error por el título, pero no lo muestra
  const isError = title.toLowerCase().includes('error');
  const iconName = isError ? 'exclamation-triangle' : 'check-circle';
  const iconColor = isError ? ERROR_RED : SUCCESS_GREEN;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <BlurView intensity={100} tint="light" style={styles.modalViewCompact}>
          <FontAwesome name={iconName} size={32} color={iconColor} style={styles.iconTop} />
          <Text style={styles.modalTextCompact}>{message}</Text>
          <TouchableOpacity
            style={styles.buttonCompact}
            onPress={onClose}
          >
            <Text style={styles.textStyleCompact}>Cerrar</Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalViewCompact: {
    width: '80%',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    overflow: 'hidden',
  },
  iconTop: {
    alignSelf: 'center',
    marginBottom: 8,
  },
  modalTextCompact: {
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    color: DARK_GREY,
    textAlign: 'center',
    flexShrink: 1,
    lineHeight: 20,
    alignSelf: 'center',
    marginBottom: 10,
  },
  buttonCompact: {
    backgroundColor: TERRACOTTA,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 16,
    elevation: 2,
    alignSelf: 'center',
    marginTop: 6,
    opacity: 0.92,
  },
  textStyleCompact: {
    color: 'white',
    fontFamily: 'Roboto-Bold',
    textAlign: 'center',
    fontSize: 13,
  },
});

export default CustomAlert;