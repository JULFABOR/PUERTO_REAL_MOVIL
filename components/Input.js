/**
 * @file Input.js
 * @description Un componente de campo de texto reutilizable con icono y validación opcional.
 */

import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

// --- Colores ---
const TERRACOTTA = '#d96c3d';
const LIGHT_GREY = '#E0E0E0';
const DARK_GREY = '#3A3A3A';

/**
 * Un componente de campo de texto personalizable.
 * @param {object} props - Propiedades del componente.
 * @param {string} [props.icon] - Nombre del icono de FontAwesome a mostrar.
 * @param {string} props.placeholder - Texto del placeholder.
 * @param {string} props.value - Valor actual del campo.
 * @param {function} props.onChangeText - Función a llamar cuando el texto cambia.
 * @param {boolean} [props.secureTextEntry=false] - Oculta el texto para campos de contraseña.
 * @param {string} [props.keyboardType='default'] - Tipo de teclado a mostrar.
 * @param {string} [props.autoCapitalize='sentences'] - Comportamiento de la autocapitalización.
 * @param {string} [props.accessibilityLabel] - Etiqueta de accesibilidad.
 * @param {string} [props.accessibilityHint] - Pista de accesibilidad.
 * @param {boolean} [props.onlyLetters=false] - Si es verdadero, solo permite la entrada de letras y espacios.
 * @param {function} [props.onFocusChange] - Callback que se ejecuta cuando el campo gana o pierde el foco.
 * @returns {JSX.Element}
 */
const Input = ({ icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize, accessibilityLabel, accessibilityHint, onlyLetters, onFocusChange }) => {
  const [isFocused, setIsFocused] = useState(false);

  /**
   * Maneja el evento de foco del campo de texto.
   */
  const handleFocus = () => {
    setIsFocused(true);
    if (onFocusChange) onFocusChange(true);
  };

  /**
   * Maneja el evento de pérdida de foco del campo de texto.
   */
  const handleBlur = () => {
    setIsFocused(false);
    if (onFocusChange) onFocusChange(false);
  };

  /**
   * Maneja el cambio de texto, aplicando un filtro si `onlyLetters` es verdadero.
   * @param {string} text - El nuevo texto introducido.
   */
  const handleChangeText = (text) => {
    if (onlyLetters) {
      // Permite letras (incluyendo acentos y ñ) y espacios
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
        placeholderTextColor="#AAA"
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

// --- Hoja de Estilos ---
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