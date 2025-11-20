import { PaymentMethod, Transaction, BillingAddress, Invoice } from '@/types/billing';
import { mockPaymentMethods, mockTransactions, mockBillingAddresses, mockInvoices } from '@/data/mockBilling';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class BillingService {
  // Payment Methods
  static async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    await delay(500);
    return mockPaymentMethods.filter(pm => pm.userId === userId);
  }
  
  static async addPaymentMethod(method: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentMethod> {
    await delay(700);
    const newMethod: PaymentMethod = {
      ...method,
      id: `pm${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockPaymentMethods.push(newMethod);
    return newMethod;
  }
  
  static async updatePaymentMethod(id: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod> {
    await delay(500);
    const method = mockPaymentMethods.find(pm => pm.id === id);
    if (!method) {
      throw new Error('Payment method not found');
    }
    Object.assign(method, updates, { updatedAt: new Date().toISOString() });
    return method;
  }
  
  static async deletePaymentMethod(id: string): Promise<void> {
    await delay(500);
    const index = mockPaymentMethods.findIndex(pm => pm.id === id);
    if (index === -1) {
      throw new Error('Payment method not found');
    }
    mockPaymentMethods.splice(index, 1);
  }
  
  static async setDefaultPaymentMethod(userId: string, methodId: string): Promise<void> {
    await delay(500);
    mockPaymentMethods.forEach(pm => {
      if (pm.userId === userId) {
        pm.isDefault = pm.id === methodId;
        pm.updatedAt = new Date().toISOString();
      }
    });
  }
  
  // Transactions
  static async getTransactions(userId: string, filters?: { 
    status?: Transaction['status'];
    type?: Transaction['type'];
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Transaction[]> {
    await delay(600);
    let transactions = mockTransactions.filter(t => t.userId === userId);
    
    if (filters) {
      if (filters.status) {
        transactions = transactions.filter(t => t.status === filters.status);
      }
      if (filters.type) {
        transactions = transactions.filter(t => t.type === filters.type);
      }
      if (filters.dateFrom) {
        transactions = transactions.filter(t => new Date(t.createdAt) >= new Date(filters.dateFrom!));
      }
      if (filters.dateTo) {
        transactions = transactions.filter(t => new Date(t.createdAt) <= new Date(filters.dateTo!));
      }
    }
    
    return transactions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  
  static async getTransaction(id: string): Promise<Transaction | null> {
    await delay(300);
    return mockTransactions.find(t => t.id === id) || null;
  }
  
  static async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    await delay(1000);
    const newTransaction: Transaction = {
      ...transaction,
      id: `trans${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockTransactions.push(newTransaction);
    return newTransaction;
  }
  
  // Billing Addresses
  static async getBillingAddresses(userId: string): Promise<BillingAddress[]> {
    await delay(400);
    return mockBillingAddresses.filter(addr => addr.userId === userId);
  }
  
  static async addBillingAddress(address: Omit<BillingAddress, 'id' | 'createdAt' | 'updatedAt'>): Promise<BillingAddress> {
    await delay(600);
    const newAddress: BillingAddress = {
      ...address,
      id: `addr${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockBillingAddresses.push(newAddress);
    return newAddress;
  }
  
  static async updateBillingAddress(id: string, updates: Partial<BillingAddress>): Promise<BillingAddress> {
    await delay(500);
    const address = mockBillingAddresses.find(addr => addr.id === id);
    if (!address) {
      throw new Error('Billing address not found');
    }
    Object.assign(address, updates, { updatedAt: new Date().toISOString() });
    return address;
  }
  
  static async deleteBillingAddress(id: string): Promise<void> {
    await delay(400);
    const index = mockBillingAddresses.findIndex(addr => addr.id === id);
    if (index === -1) {
      throw new Error('Billing address not found');
    }
    mockBillingAddresses.splice(index, 1);
  }
  
  static async setDefaultBillingAddress(userId: string, addressId: string): Promise<void> {
    await delay(400);
    mockBillingAddresses.forEach(addr => {
      if (addr.userId === userId) {
        addr.isDefault = addr.id === addressId;
        addr.updatedAt = new Date().toISOString();
      }
    });
  }
  
  // Invoices
  static async getInvoices(userId: string): Promise<Invoice[]> {
    await delay(500);
    return mockInvoices.filter(inv => inv.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  static async getInvoice(id: string): Promise<Invoice | null> {
    await delay(300);
    return mockInvoices.find(inv => inv.id === id) || null;
  }
  
  static async downloadInvoice(id: string): Promise<string> {
    await delay(800);
    const invoice = mockInvoices.find(inv => inv.id === id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    // In a real app, this would return a download URL or blob
    return invoice.downloadUrl;
  }
  
  // Statistics
  static async getBillingStats(userId: string): Promise<{
    totalSpent: number;
    totalRefunded: number;
    pendingPayments: number;
    activePaymentMethods: number;
  }> {
    await delay(400);
    const userTransactions = mockTransactions.filter(t => t.userId === userId);
    
    return {
      totalSpent: userTransactions
        .filter(t => t.status === 'completed' && t.type === 'purchase')
        .reduce((sum, t) => sum + t.amount, 0),
      totalRefunded: userTransactions
        .filter(t => t.status === 'refunded')
        .reduce((sum, t) => sum + t.amount, 0),
      pendingPayments: userTransactions
        .filter(t => t.status === 'pending')
        .length,
      activePaymentMethods: mockPaymentMethods
        .filter(pm => pm.userId === userId)
        .length
    };
  }
}
