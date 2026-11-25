import type { CardFormField } from '../types/CardFormTypes';
import type { CardNetworkDescriptor } from './cardNetwork';

const KEY_PREFIX = 'primer_card_form_error_';
const LAST_MONTH = 12;
const CENTURY = 2000;
const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 45;

const REQUIRED_KEYS: Record<CardFormField, string> = {
  cardNumber: 'number_required',
  expiryDate: 'expiry_required',
  cvv: 'cvv_required',
  cardholderName: 'name_required',
};

export function cardFieldErrorKey(
  field: CardFormField,
  errorId: string,
  value: string,
  descriptor: Pick<CardNetworkDescriptor, 'panLengths' | 'cvvLength'>,
  now: Date = new Date()
): string {
  const trimmed = value.trim();
  if (!trimmed) return KEY_PREFIX + REQUIRED_KEYS[field];
  switch (field) {
    case 'cardNumber':
      return KEY_PREFIX + cardNumberError(errorId, trimmed, descriptor.panLengths);
    case 'expiryDate':
      return KEY_PREFIX + expiryDateError(trimmed, now);
    case 'cvv':
      return `${KEY_PREFIX}cvv_length_${descriptor.cvvLength}`;
    case 'cardholderName':
      return KEY_PREFIX + cardholderNameError(trimmed);
  }
}

function cardNumberError(errorId: string, value: string, panLengths: readonly number[]): string {
  if (errorId === 'unsupported-card-type') return 'card_type_unsupported';
  return panLengths.includes(value.replace(/\D/g, '').length) ? 'number_invalid' : 'number_incomplete';
}

function expiryDateError(value: string, now: Date): string {
  const digits = value.replace(/\D/g, '');
  const month = digits.slice(0, 2);
  const year = digits.slice(2);
  const monthNumber = Number(month);
  if (!month || monthNumber < 1 || monthNumber > LAST_MONTH) return 'expiry_month_invalid';
  if (year.length !== 2) return 'expiry_year_invalid';
  const yearNumber = CENTURY + Number(year);
  const isPast =
    yearNumber < now.getFullYear() || (yearNumber === now.getFullYear() && monthNumber < now.getMonth() + 1);
  return isPast ? 'card_expired' : 'expiry_year_invalid';
}

function cardholderNameError(value: string): string {
  return value.length < NAME_MIN_LENGTH || value.length > NAME_MAX_LENGTH ? 'name_length' : 'name_invalid';
}
