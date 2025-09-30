// Funciones de validación para inputs

export function validarNombreApellido(valor) {
  // Permite letras (mayúsculas, minúsculas, acentos, ñ) y espacios
  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  return regex.test(valor);
}

export function validarEmail(valor) {
  // Valida formato de email básico
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(valor);
}
