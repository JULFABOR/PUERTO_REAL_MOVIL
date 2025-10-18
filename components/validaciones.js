/**
 * @file validaciones.js
 * @description Funciones de validación reutilizables para campos de texto.
 * @author [Tu Nombre]
 */

/**
 * Valida que un valor contenga solo letras (incluyendo acentos y ñ) y espacios.
 * @param {string} valor - El string a validar.
 * @returns {boolean} - `true` si el valor es válido, `false` en caso contrario.
 */
export function validarNombreApellido(valor) {
  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  return regex.test(valor);
}

/**
 * Valida que un valor tenga el formato de una dirección de correo electrónico.
 * @param {string} valor - El string a validar.
 * @returns {boolean} - `true` si el formato de email es válido, `false` en caso contrario.
 */
export function validarEmail(valor) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(valor);
}