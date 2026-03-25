
import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet 
} from '@react-pdf/renderer';
import { InvoiceInfo, TransactionDetail } from '@/types/transaction';
import { formatDate } from '@/lib/utils';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  companySection: {
    flex: 1,
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  companyAddress: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2,
  },
  companyContact: {
    fontSize: 8,
    color: '#9ca3af',
    marginTop: 4,
  },
  invoiceSection: {
    textAlign: 'right',
  },
  invoiceLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 4,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  statusBadge: {
    backgroundColor: '#e7f7ef',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 10,
    color: '#0faf62',
  },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  label: {
    fontSize: 10,
    color: '#6b7280',
  },
  value: {
    fontSize: 10,
    fontWeight: 'medium',
    color: '#111827',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemDescription: {
    flex: 2,
    fontSize: 10,
  },
  itemQuantity: {
    flex: 1,
    fontSize: 10,
    textAlign: 'right',
  },
  itemPrice: {
    flex: 1,
    fontSize: 10,
    textAlign: 'right',
  },
  itemTotal: {
    flex: 1,
    fontSize: 10,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 12,
    paddingHorizontal: 12,
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 12,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 20,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
});

interface InvoicePDFProps {
  invoiceInfo: InvoiceInfo;
  transaction: TransactionDetail;
}

export const InvoicePDF = ({ invoiceInfo, transaction }: InvoicePDFProps) => {
  // Debug: Log the data we're receiving
  console.log('PDF Component - invoiceInfo:', invoiceInfo);
  console.log('PDF Component - transaction:', transaction);

  const unitPrice = invoiceInfo.subtotal / transaction.ticket_count;
  const taxRate = invoiceInfo.tax_amount > 0 
    ? (invoiceInfo.tax_amount / invoiceInfo.subtotal) * 100 
    : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companySection}>
            <Text style={styles.companyName}>{invoiceInfo.company_name}</Text>
            <Text style={styles.companyAddress}>{invoiceInfo.company_address}</Text>
            <Text style={styles.companyContact}>
              {invoiceInfo.company_phone} | {invoiceInfo.company_email}
            </Text>
            <Text style={styles.companyContact}>VAT: {invoiceInfo.tax_number}</Text>
          </View>
          <View style={styles.invoiceSection}>
            <Text style={styles.invoiceLabel}>INVOICE NUMBER</Text>
            <Text style={styles.invoiceNumber}>{invoiceInfo.invoice_number}</Text>
          </View>
        </View>

        {/* Status Badge */}
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {transaction.status === 'completed' ? '✓ PAYMENT COMPLETED' : transaction.status.toUpperCase()}
          </Text>
        </View>

        {/* Payment Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Transaction ID</Text>
            <Text style={styles.value}>{transaction.id}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Gateway</Text>
            <Text style={styles.value}>{invoiceInfo.payment_gateway}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Issue Date</Text>
            <Text style={styles.value}>{formatDate(invoiceInfo.issue_date)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Transaction Reference</Text>
            <Text style={styles.value}>{invoiceInfo.transaction_ref || 'N/A'}</Text>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Customer Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Customer Name</Text>
            <Text style={styles.value}>{transaction.user_name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email Address</Text>
            <Text style={styles.value}>{transaction.customer_email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Event</Text>
            <Text style={styles.value}>{transaction.event_title}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tickets</Text>
            <Text style={styles.value}>
              {transaction.ticket_count} {transaction.ticket_count === 1 ? 'ticket' : 'tickets'}
            </Text>
          </View>
        </View>

        {/* Invoice Items Table */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Invoice Items</Text>
          
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Item Description</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Quantity</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Unit Price</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Total</Text>
          </View>
          
          {/* Table Row - Item */}
          <View style={styles.tableRow}>
            <View style={{ flex: 2 }}>
              <Text>{transaction.event_title}</Text>
              <Text style={{ fontSize: 8, color: '#6b7280' }}>Ticket Purchase</Text>
            </View>
            <Text style={styles.itemQuantity}>{transaction.ticket_count}</Text>
            <Text style={styles.itemPrice}>
              {invoiceInfo.currency} {unitPrice.toFixed(2)}
            </Text>
            <Text style={styles.itemTotal}>
              {invoiceInfo.currency} {invoiceInfo.subtotal.toFixed(2)}
            </Text>
          </View>
          
          {/* Subtotal Row */}
          <View style={styles.subtotalRow}>
            <Text style={{ fontSize: 10, color: '#6b7280' }}>Subtotal:</Text>
            <Text style={{ fontSize: 10, fontWeight: 'bold', marginLeft: 20, width: 80, textAlign: 'right' }}>
              {invoiceInfo.currency} {invoiceInfo.subtotal.toFixed(2)}
            </Text>
          </View>
          
          {/* Tax Row (if applicable) */}
          {invoiceInfo.tax_amount > 0 && (
            <View style={styles.taxRow}>
              <Text style={{ fontSize: 10, color: '#6b7280' }}>
                Tax ({taxRate.toFixed(0)}%):
              </Text>
              <Text style={{ fontSize: 10, marginLeft: 20, width: 80, textAlign: 'right' }}>
                {invoiceInfo.currency} {invoiceInfo.tax_amount.toFixed(2)}
              </Text>
            </View>
          )}
          
          {/* Total Row */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>
              {invoiceInfo.currency} {invoiceInfo.total_amount.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your business!</Text>
        </View>
      </Page>
    </Document>
  );
};