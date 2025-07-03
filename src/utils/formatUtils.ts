// utils/formatUtils.ts

/** CPF: formatado e limpo */
export const formatCpf = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  const match = digits.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
  return match ? `${match[1]}.${match[2]}.${match[3]}-${match[4]}` : digits;
};

export const unformatCpf = (value: string): string =>
  value.replace(/\D/g, "").slice(0, 11);

export const isValidCpf = (cpf: string): boolean => {
  const cleaned = unformatCpf(cpf);
  if (cleaned.length !== 11 || /^(\d)\1{10}$/.test(cleaned)) return false;

  const calcCheck = (factor: number, length: number): number => {
    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum += parseInt(cleaned.charAt(i)) * (factor - i);
    }
    const result = 11 - (sum % 11);
    return result >= 10 ? 0 : result;
  };

  return (
    calcCheck(10, 9) === parseInt(cleaned[9]) &&
    calcCheck(11, 10) === parseInt(cleaned[10])
  );
};

/** CNPJ: formatado e limpo */
export const formatCnpj = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  const match = digits.match(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/);
  return match ? `${match[1]}.${match[2]}.${match[3]}/${match[4]}-${match[5]}` : digits;
};

export const unformatCnpj = (value: string): string =>
  value.replace(/\D/g, "").slice(0, 14);

export const isValidCnpj = (cnpj: string): boolean => {
  const cleaned = unformatCnpj(cnpj);
  if (cleaned.length !== 14 || /^(\d)\1{13}$/.test(cleaned)) return false;

  const calcCheckDigit = (arr: string[], weights: number[]): number => {
    const sum = arr
      .slice(0, weights.length)
      .reduce((acc, val, idx) => acc + parseInt(val) * weights[idx], 0);
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };

  const cnpjArray = cleaned.split('');
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, ...weights1];

  return (
    calcCheckDigit(cnpjArray, weights1) === parseInt(cnpjArray[12]) &&
    calcCheckDigit(cnpjArray, weights2) === parseInt(cnpjArray[13])
  );
};

/** Telefones */
export const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  const match = digits.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
  if (!match) return digits;

  return `${match[1] ? `(${match[1]}${match[1].length === 2 ? ') ' : ''}` : ''}${match[2] || ''}${match[3] ? `-${match[3]}` : ''}`;
};

/** Moeda BRL */
export const formatCurrency = (value: number | string): string => {
  const num = typeof value === 'number' ? value : parseFloat(value);
  return isNaN(num)
    ? "R$ 0,00"
    : new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
      }).format(num);
};

export const parseBrazilianCurrency = (value: string): number => {
  const normalized = value.replace(/[^\d,-]+/g, '').replace(',', '.');
  return parseFloat(normalized);
};

/** Datas */
export const formatDateForInput = (dateString?: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

export const getToday = (): string => {
  return new Date().toISOString().slice(0, 10);
};

export const convertToBrazilianDateFormat = (dateStr?: string): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

export const convertToBrazilianDateTimeFormat = (dateTimeStr?: string): string => {
  if (!dateTimeStr) return "";
  const date = new Date(dateTimeStr);
  if (isNaN(date.getTime())) return dateTimeStr;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const convertBrazilianDateToISO = (dateStr: string): string => {
  const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return dateStr;
  return `${match[3]}-${match[2]}-${match[1]}`;
};

export const convertBrazilianDateTimeToISO = (dateTimeStr: string): string => {
  const match = dateTimeStr.match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/);
  if (!match) return dateTimeStr;
  return `${match[3]}-${match[2]}-${match[1]}T${match[4]}:${match[5]}`;
};