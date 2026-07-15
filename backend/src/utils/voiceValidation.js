/**
 * Voice Validation Utility
 * Validates transactions returned by the AI or submitted for confirmation
 */

const validateTransaction = (tx) => {
  const errors = [];
  
  if (!tx.type || !['expense', 'income'].includes(tx.type.toLowerCase())) {
    errors.push('Type must be either "expense" or "income"');
  }
  
  if (tx.amount === undefined || tx.amount === null || isNaN(Number(tx.amount))) {
    errors.push('Amount must be numeric');
  }
  
  if (!tx.category || typeof tx.category !== 'string' || tx.category.trim() === '') {
    errors.push('Category cannot be empty');
  }
  
  if (!tx.description || typeof tx.description !== 'string' || tx.description.trim() === '') {
    errors.push('Description cannot be empty');
  }
  
  if (!tx.date) {
    errors.push('Date must exist');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateTransactions = (transactions) => {
  if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
    return {
      isValid: false,
      errors: ['An array of transactions is required']
    };
  }

  const allErrors = [];
  for (let i = 0; i < transactions.length; i++) {
    const { isValid, errors } = validateTransaction(transactions[i]);
    if (!isValid) {
      allErrors.push(`Transaction at index ${i} failed validation: ${errors.join(', ')}`);
    }
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
};

module.exports = {
  validateTransaction,
  validateTransactions,
};
