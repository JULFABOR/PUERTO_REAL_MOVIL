import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { FontAwesome } from '@expo/vector-icons';

const TERRACOTTA = '#d96c3d';
const DARK_GREY = '#3A3A3A';
const SUCCESS_GREEN = '#2E7D32';
const ERROR_RED = '#C62828';
const LIGHT_GREY = '#E0E0E0';

const CustomAlert = ({ visible, title, message, onClose, buttons }) => {
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
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalTextCompact}>{message}</Text>
          <View style={styles.buttonsContainer}>
            {buttons ? (
              buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.buttonCompact,
                    button.style === 'destructive' && styles.destructiveButton,
                    button.style === 'cancel' && styles.cancelButton,
                  ]}
                  onPress={button.onPress}
                >
                  <Text style={[styles.textStyleCompact, button.style === 'cancel' && styles.cancelButtonText]}>{button.text}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <TouchableOpacity
                style={styles.buttonCompact}
                onPress={onClose}
              >
                <Text style={styles.textStyleCompact}>Cerrar</Text>
              </TouchableOpacity>
            )}
          </View>
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
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
    color: DARK_GREY,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalTextCompact: {
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    color: DARK_GREY,
    textAlign: 'center',
    flexShrink: 1,
    lineHeight: 20,
    alignSelf: 'center',
    marginBottom: 15,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  buttonCompact: {
    backgroundColor: TERRACOTTA,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 20,
    elevation: 2,
    marginHorizontal: 5,
  },
  destructiveButton: {
    backgroundColor: ERROR_RED,
  },
  cancelButton: {
    backgroundColor: LIGHT_GREY,
  },
  textStyleCompact: {
    color: 'white',
    fontFamily: 'Roboto-Bold',
    textAlign: 'center',
    fontSize: 14,
  },
  cancelButtonText: {
    color: DARK_GREY,
  },
});

export default CustomAlert;