export const BUSINESS_CONSTANTS = {
  DEFAULT_COMMISSION_PERCENTAGE: 15,
  DEFAULT_SERVICE_DURATION: 30,
  CACHE_DURATION_MS: 100,
  MAX_DISCOUNT_PERCENTAGE: 100,
  MIN_DISCOUNT_AMOUNT: 0,
  SALES_HISTORY_CACHE_MINUTES: 5,
  
  PAYMENT_METHODS: [
    { label: 'Efectivo', value: 'cash' },
    { label: 'Tarjeta de Crédito', value: 'credit_card' },
    { label: 'Tarjeta de Débito', value: 'debit_card' },
    { label: 'Transferencia', value: 'transfer' }
  ],

  DEFAULT_CATEGORIES: [
    'Corte de Cabello',
    'Barba y Bigote', 
    'Coloración',
    'Tratamientos',
    'Peinados',
    'Otros'
  ],

  STOCK_THRESHOLDS: {
    HIGH: 10,
    MEDIUM: 5,
    LOW: 0
  }
};