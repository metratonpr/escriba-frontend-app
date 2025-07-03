// utils/formatUtils.js

export const formatCpf = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  const match = digits.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/);
  if (!match) return digits;

  let result = "";
  if (match[1]) result += match[1];
  if (match[2]) result += "." + match[2];
  if (match[3]) result += "." + match[3];
  if (match[4]) result += "-" + match[4];

  return result;
};

export const isValidCpf = (cpf) => {
  const cleaned = cpf.replace(/\D/g, "");
  if (!cleaned || cleaned.length !== 11 || /^(\d)\1{10}$/.test(cleaned))
    return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }

  let firstCheck = 11 - (sum % 11);
  if (firstCheck > 9) firstCheck = 0;
  if (firstCheck !== parseInt(cleaned.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }

  let secondCheck = 11 - (sum % 11);
  if (secondCheck > 9) secondCheck = 0;
  if (secondCheck !== parseInt(cleaned.charAt(10))) return false;

  return true;
};

export const formatCnpj = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  const match = digits.match(/^(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})$/);
  if (!match) return digits;

  let result = "";
  if (match[1]) result += match[1];
  if (match[2]) result += "." + match[2];
  if (match[3]) result += "." + match[3];
  if (match[4]) result += "/" + match[4];
  if (match[5]) result += "-" + match[5];

  return result;
};

export const isValidCnpj = (cnpj) => {
  const cleaned = cnpj.replace(/\D/g, "");
  if (cleaned.length !== 14 || /^(\d)\1{13}$/.test(cleaned)) return false;

  const calcCheckDigit = (cnpjArray, weights) => {
    const sum = cnpjArray
      .slice(0, weights.length)
      .reduce((acc, val, idx) => acc + parseInt(val) * weights[idx], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const cnpjArray = cleaned.split("");
  const digit1 = calcCheckDigit(cnpjArray, weights1);
  const digit2 = calcCheckDigit(cnpjArray, weights2);

  return (
    digit1 === parseInt(cnpjArray[12]) && digit2 === parseInt(cnpjArray[13])
  );
};

export const formatPhone = (value) => {
  const digits = value.replace(/\D/g, "");
  const match = digits.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
  if (!match) return digits;

  let result = "";
  if (match[1]) result += `(${match[1]}`;
  if (match[1] && match[1].length === 2) result += ") ";
  if (match[2]) result += match[2];
  if (match[3]) result += `-${match[3]}`;

  return result;
};

// Adiciona no final de utils/formatUtils.js

export const formatCurrency = (value) => {
  const num = typeof value === "number" ? value : parseFloat(value);
  if (isNaN(num)) return "R$ 0,00";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
};


export const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

export const formatDateTimeForInput = (dateString) => {
  if (!dateString) return "";

  const trimmed = dateString.trim();

  // Se já estiver no formato correto (YYYY-MM-DDTHH:MM)
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Converte de formatos com segundos, microssegundos e/ou "Z"
  const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}):\d{2}/);
  if (match) {
    const datePart = match[1];
    const timePart = match[2];
    return `${datePart}T${timePart}`;
  }

  return "";
};

/**
 * Retorna a data de hoje no formato YYYY-MM-DD.
 * Útil para inputs tipo date.
 * @returns {string}
 */
export const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Converte datetime ISO para formato brasileiro com hora.
 * Exemplo: "2025-06-15T16:00" → "15/06/2025 16:00"
 * @param {string} dateTimeStr
 * @returns {string}
 */
export const convertToBrazilianDateTimeFormat = (dateTimeStr) => {
  if (!dateTimeStr) return "";

  const date = new Date(dateTimeStr);
  if (isNaN(date.getTime())) return dateTimeStr; // Retorna o original se inválido

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const convertToBrazilianDateFormat = (dateStr) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr; // Retorna o original se inválido

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};