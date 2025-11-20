import { PaymentMethod, Transaction, BillingAddress, Invoice } from '@/types/billing';

export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm1',
    userId: 'user1',
    type: 'credit_card',
    last4: '4242',
    brand: 'Visa',
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString()
  },
  {
    id: 'pm2',
    userId: 'user1',
    type: 'paypal',
    email: 'user@example.com',
    isDefault: false,
    createdAt: new Date('2024-02-20').toISOString(),
    updatedAt: new Date('2024-02-20').toISOString()
  },
  {
    id: 'pm3',
    userId: 'user1',
    type: 'debit_card',
    last4: '5555',
    brand: 'Mastercard',
    expiryMonth: 6,
    expiryYear: 2026,
    isDefault: false,
    createdAt: new Date('2024-03-10').toISOString(),
    updatedAt: new Date('2024-03-10').toISOString()
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: 'trans1',
    userId: 'user1',
    amount: 150.00,
    currency: 'USD',
    status: 'completed',
    type: 'purchase',
    description: 'Summer Music Festival 2024 - VIP Ticket',
    ticketIds: ['ticket1'],
    eventId: 'event1',
    eventName: 'Summer Music Festival 2024',
    paymentMethodId: 'pm1',
    paymentMethodType: 'credit_card',
    last4: '4242',
    receiptUrl: '/receipts/trans1.pdf',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'trans2',
    userId: 'user1',
    amount: 75.00,
    currency: 'USD',
    status: 'refunded',
    type: 'refund',
    description: 'Refund for Outdoor Cinema Night',
    eventId: 'event3',
    eventName: 'Outdoor Cinema Night',
    paymentMethodId: 'pm1',
    paymentMethodType: 'credit_card',
    last4: '4242',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'trans3',
    userId: 'user1',
    amount: 89.99,
    currency: 'USD',
    status: 'completed',
    type: 'purchase',
    description: 'Tech Conference 2024 - General Admission',
    ticketIds: ['ticket2'],
    eventId: 'event2',
    eventName: 'Tech Conference 2024',
    paymentMethodId: 'pm2',
    paymentMethodType: 'paypal',
    receiptUrl: '/receipts/trans3.pdf',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const mockBillingAddresses: BillingAddress[] = [
  {
    id: 'addr1',
    userId: 'user1',
    name: 'John Doe',
    addressLine1: '123 Main Street',
    addressLine2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    postalCode: '10001',
    isDefault: true,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString()
  },
  {
    id: 'addr2',
    userId: 'user1',
    name: 'John Doe',
    addressLine1: '456 Office Park',
    city: 'Brooklyn',
    state: 'NY',
    country: 'USA',
    postalCode: '11201',
    isDefault: false,
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date('2024-02-01').toISOString()
  }
];

export const mockInvoices: Invoice[] = [
  {
    id: 'inv1',
    userId: 'user1',
    transactionId: 'trans1',
    invoiceNumber: 'INV-2024-0001',
    amount: 150.00,
    tax: 12.00,
    total: 162.00,
    currency: 'USD',
    status: 'paid',
    paidDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    downloadUrl: '/invoices/inv1.pdf',
    items: [
      {
        description: 'Summer Music Festival 2024 - VIP Ticket',
        quantity: 1,
        unitPrice: 150.00,
        total: 150.00
      }
    ],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'inv2',
    userId: 'user1',
    transactionId: 'trans3',
    invoiceNumber: 'INV-2024-0002',
    amount: 89.99,
    tax: 7.20,
    total: 97.19,
    currency: 'USD',
    status: 'paid',
    paidDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    downloadUrl: '/invoices/inv2.pdf',
    items: [
      {
        description: 'Tech Conference 2024 - General Admission',
        quantity: 1,
        unitPrice: 89.99,
        total: 89.99
      }
    ],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  }
];
