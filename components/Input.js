import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const TERRACOTTA = '#d96c3d';
const LIGHT_GREY = '#E0E0E0';
const DARK_GREY = '#3A3A3A';

const Input = ({ icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize, accessibilityLabel, accessibilityHint, onlyLetters, onFocusChange }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    if (onFocusChange) onFocusChange(true);
  };
  const handleBlur = () => {
    setIsFocused(false);
    if (onFocusChange) onFocusChange(false);
  };

  // Si onlyLetters está activo, filtra el texto en tiempo real
  const handleChangeText = (text) => {
    if (onlyLetters) {
      // Permite letras, acentos, ñ y espacios
      const filtrado = text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
      onChangeText(filtrado);
    } else {
      onChangeText(text);
    }
  };

  const borderColor = isFocused ? TERRACOTTA : LIGHT_GREY;

  return (
    <View style={[styles.inputContainer, { borderBottomColor: borderColor }]}> 
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#888"
        value={value}
        onChangeText={handleChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onFocus={handleFocus}
        onBlur={handleBlur}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      />
      {icon && <FontAwesome name={icon} size={20} color={DARK_GREY} style={styles.inputIcon} />}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 2,
    marginBottom: 20,
    paddingBottom: 10,
  },
  input: { 
    flex: 1, 
    fontSize: 16,
    color: DARK_GREY,
    fontFamily: 'Roboto-Regular',
  },
  inputIcon: {
    marginLeft: 10,
    opacity: 0.6,
  },
});

export default Input;
