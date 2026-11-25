/**
 * Seller (dealership) details printed on contracts and invoices.
 * Set them in .env (see .env.example). Defaults are fictional demo values.
 */
const env = import.meta.env;

export const SELLER = {
    name: env.VITE_SELLER_NAME || 'Musterautohaus GmbH',
    address: env.VITE_SELLER_ADDRESS || 'Musterstraße 1',
    city: env.VITE_SELLER_CITY || '12345 Musterstadt',
    phone: env.VITE_SELLER_PHONE || '0123 4567890',
    taxNumber: env.VITE_SELLER_TAX_NUMBER || '000/000/00000',
    vatId: env.VITE_SELLER_VAT_ID || 'DE000000000',
    bank: {
        iban: env.VITE_SELLER_IBAN || 'DE00 0000 0000 0000 0000 00',
        bic: env.VITE_SELLER_BIC || 'XXXXDEXXXXX',
        bankName: env.VITE_SELLER_BANK_NAME || 'Musterbank',
    },
    /** City printed next to the contract date */
    contractCity: env.VITE_SELLER_CONTRACT_CITY || 'Musterstadt',
} as const;
