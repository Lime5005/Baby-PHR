export interface ValidationResult {
  isValid: boolean;
  error?: string;
  parsedWeight?: number;
}

/**
 * 婴儿体重数据的核心业务校验算法
 */
export function validateBabyWeight(weightInput: string | undefined): ValidationResult {
  if (!weightInput || weightInput.trim() === '') {
    return { isValid: false, error: 'Missing required field: weightKg' };
  }

  const weight = parseFloat(weightInput);

  if (isNaN(weight)) {
    return { isValid: false, error: 'Weight must be a valid number' };
  }

  if (weight <= 0) {
    return { isValid: false, error: 'Weight must be greater than 0 kg' };
  }

  if (weight > 30) {
    return { isValid: false, error: 'Weight exceeds realistic limits for a baby (> 30 kg)' };
  }

  return { isValid: true, parsedWeight: weight };
}