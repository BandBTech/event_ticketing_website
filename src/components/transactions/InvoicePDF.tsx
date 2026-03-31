import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet,
  Font 
} from '@react-pdf/renderer';
import { InvoiceInfo, TransactionDetail } from '@/types/transaction';
import { formatDate } from '@/lib/utils';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  // Top branding matching your Web UI
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563eb', // Your Primary Blue
    letterSpacing: 1,
  },
  invoiceNo: {
    fontSize: 10,
    color: '#64748b', // Slate-500
  },
  // Large Heading from Sample
  mainTitle: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#0f172a', // Slate-900
    marginBottom: 10,
    letterSpacing: -1,
  },
  dateRow: {
    fontSize: 11,
    color: '#475569',
    marginBottom: 40,
  },
  // Billed To / From Columns
  addressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 50,
  },
  addressBlock: {
    width: '45%',
  },
  addressHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  addressText: {
    fontSize: 10,
    color: '#475569',
    lineHeight: 1.5,
  },
  // Table Styling
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc', // Very light blue-gray
    padding: 10,
    borderRadius: 4,
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: 'center' },
  col3: { flex: 1, textAlign: 'right' },
  col4: { flex: 1, textAlign: 'right' },
  // Total Section
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  totalBox: {
    width: 160,
    borderTopWidth: 2,
    borderTopColor: '#2563eb',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  // Footer Notes
  notes: {
    marginTop: 60,
    fontSize: 10,
    color: '#475569',
    lineHeight: 1.6,
  },
  bold: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  // Decorative Abstract Footer (Matching the curves in your sample)
  footerDecorationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
    overflow: 'hidden',
  },
  curveLight: {
    position: 'absolute',
    bottom: -50,
    left: -100,
    width: 600,
    height: 200,
    backgroundColor: '#eff6ff', // Blue-50
    borderRadius: 300,
  },
  curveDark: {
    position: 'absolute',
    bottom: -80,
    right: -150,
    width: 500,
    height: 250,
    backgroundColor: '#155dfb', // Slate-800
    borderRadius: 250,
  },
});

interface InvoicePDFProps {
  invoiceInfo: InvoiceInfo;
  transaction: TransactionDetail;
}

export const InvoicePDF = ({ invoiceInfo, transaction }: InvoicePDFProps) => {
  const unitPrice = invoiceInfo.subtotal / transaction.ticket_count;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Branding */}
        <View style={styles.topBar}>
          <Text style={styles.logoText}>TIMRO TICKET</Text>
          <Text style={styles.invoiceNo}>NO. {invoiceInfo.invoice_number}</Text>
        </View>

        {/* Main Title */}
        <Text style={styles.mainTitle}>INVOICE</Text>
        <Text style={styles.dateRow}>
          <Text style={styles.bold}>Date: </Text>
          {formatDate(invoiceInfo.issue_date)}
        </Text>

        {/* Billing Details */}
        <View style={styles.addressContainer}>
          <View style={styles.addressBlock}>
            <Text style={styles.addressHeader}>Billed to:</Text>
            <Text style={[styles.addressText, styles.bold]}>{transaction.user_name}</Text>
            <Text style={styles.addressText}>{transaction.customer_email}</Text>
          </View>
          <View style={styles.addressBlock}>
            <Text style={styles.addressHeader}>From:</Text>
            <Text style={[styles.addressText, styles.bold]}>{invoiceInfo.company_name}</Text>
            <Text style={styles.addressText}>{invoiceInfo.company_address}</Text>
            <Text style={styles.addressText}>{invoiceInfo.company_email}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.col1]}>Item Description</Text>
          <Text style={[styles.tableHeaderText, styles.col2]}>Qty</Text>
          <Text style={[styles.tableHeaderText, styles.col3]}>Price</Text>
          <Text style={[styles.tableHeaderText, styles.col4]}>Amount</Text>
        </View>

        <View style={styles.tableRow}>
          <View style={styles.col1}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#0f172a' }}>
              {transaction.event_title}
            </Text>
            <Text style={{ fontSize: 9, color: '#64748b', marginTop: 2 }}>
              Standard Ticket Entry
            </Text>
          </View>
          <Text style={[styles.addressText, styles.col2]}>{transaction.ticket_count}</Text>
          <Text style={[styles.addressText, styles.col3]}>
            {invoiceInfo.currency} {unitPrice.toFixed(2)}
          </Text>
          <Text style={[styles.addressText, styles.col4, styles.bold]}>
            {invoiceInfo.currency} {invoiceInfo.subtotal.toFixed(2)}
          </Text>
        </View>

        {/* Totals */}
        <View style={styles.totalSection}>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {invoiceInfo.currency} {invoiceInfo.total_amount.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Bottom Info */}
        <View style={styles.notes}>
          <Text>
            <Text style={styles.bold}>Payment method: </Text>
            {invoiceInfo.payment_gateway}
          </Text>
          <Text style={{ marginTop: 8 }}>
            <Text style={styles.bold}>Note: </Text>
            Thank you for choosing Timro Ticket!
          </Text>
        </View>

        {/* Decorative Footer */}
        <View style={styles.footerDecorationContainer} fixed>
          <View style={styles.curveLight} />
          <View style={styles.curveDark} />
        </View>
      </Page>
    </Document>
  );
};