import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { InvoiceInfo, TransactionDetail } from "@/types/transaction";
import { formatDate } from "@/lib/utils";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    minHeight: "100%",
  },
  // Top branding with company logo
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  companyLogo: {
    width: 35,
    height: 35,
    objectFit: "contain",
  },
  companyName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2563eb",
    letterSpacing: 1,
  },
  invoiceNo: {
    fontSize: 9,
    color: "#64748b",
  },
  // Large Heading from Sample
  mainTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
    letterSpacing: -1,
  },
  dateRow: {
    fontSize: 9,
    color: "#475569",
    marginBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 12,
  },
  // Billed To / From Columns
  addressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  addressBlock: {
    width: "45%",
  },
  addressHeader: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 8,
    color: "#475569",
    lineHeight: 1.4,
  },
  // Event Summary Card with Organizer Logo
  eventSummary: {
    marginBottom: 25,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  organizerLogoContainer: {
    width: 50,
    height: 50,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 6,
  },
  organizerLogo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 2,
  },
  organizerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  organizerName: {
    fontSize: 9,
    color: "#2563eb",
    fontWeight: "medium",
  },
  eventMetaRow: {
    flexDirection: "row",
    marginTop: 4,
    gap: 16,
  },
  eventMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  eventMetaLabel: {
    fontSize: 7,
    color: "#64748b",
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  eventMetaValue: {
    fontSize: 8,
    color: "#0f172a",
  },
  // Table Styling
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    padding: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    alignItems: "center",
  },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: "center" },
  col3: { flex: 1, textAlign: "right" },
  col4: { flex: 1, textAlign: "right" },
  // Total Section
  totalSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 15,
  },
  totalBox: {
    width: 160,
    borderTopWidth: 2,
    borderTopColor: "#2563eb",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2563eb",
  },
  // Footer Notes
  notes: {
    marginTop: 30,
    marginBottom: 20,
    fontSize: 8,
    color: "#475569",
    lineHeight: 1.4,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 12,
  },
  bold: {
    fontWeight: "bold",
    color: "#0f172a",
  },
  // Decorative Abstract Footer
  footerDecorationContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    overflow: "hidden",
    zIndex: -1,
  },
  curveLight: {
    position: "absolute",
    bottom: -30,
    left: -60,
    width: 400,
    height: 140,
    backgroundColor: "#eff6ff",
    borderRadius: 200,
    opacity: 0.6,
  },
  curveDark: {
    position: "absolute",
    bottom: -40,
    right: -100,
    width: 350,
    height: 180,
    backgroundColor: "#dbeafe",
    borderRadius: 180,
    opacity: 0.5,
  },
});

interface InvoicePDFProps {
  invoiceInfo: InvoiceInfo;
  transaction: TransactionDetail;
}

export const InvoicePDF = ({ invoiceInfo, transaction }: InvoicePDFProps) => {
  if (!invoiceInfo || !transaction) {
    return (
      <Document>
        <Page size="A4">
          <View>
            <Text>Loading...</Text>
          </View>
        </Page>
      </Document>
    );
  }

  const currency =  "$";
  
  // Get organizer and company info
  const organizerName = invoiceInfo.organizer?.name;
  const organizerLogo = invoiceInfo.organizer.logo;
  const companyLogo = invoiceInfo.company?.logo;
  const companyName = invoiceInfo.company?.name;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Branding with Company Logo */}
        <View style={styles.topBar}>
          {/* <View style={styles.logoContainer}>
            {companyLogo ? (
              <Image src={companyLogo} style={styles.companyLogo} />
            ) : (
              <Text style={styles.companyName}>{companyName || "TIMRO"}</Text>
            )}
          </View> */}
          <Text style={styles.invoiceNo}>INVOICE #{invoiceInfo.invoice_number}</Text>
        </View>

        {/* Main Title */}
        <Text style={styles.mainTitle}>INVOICE</Text>
        <Text style={styles.dateRow}>
          <Text style={styles.bold}>Date: </Text>
          {formatDate(transaction.updated_at)}
        </Text>

        {/* Billing Details */}
        <View style={styles.addressContainer}>
          <View style={styles.addressBlock}>
            <Text style={styles.addressHeader}>Bill To:</Text>
            <Text style={[styles.addressText, styles.bold]}>
              {transaction.user.name}
            </Text>
            <Text style={styles.addressText}>{transaction.user.email}</Text>
          </View>
          <View style={styles.addressBlock}>
            <Text style={styles.addressHeader}>From:</Text>
            <Text style={[styles.addressText, styles.bold]}>
              {invoiceInfo.company.name}
            </Text>
            <Text style={styles.addressText}>
              {invoiceInfo.company.address}
            </Text>
            <Text style={styles.addressText}>{invoiceInfo.company.email}</Text>
            <Text style={styles.addressText}>{invoiceInfo.company.phone}</Text>
            {invoiceInfo.company.tax_number && (
              <Text style={styles.addressText}>
                Tax ID: {invoiceInfo.company.tax_number}
              </Text>
            )}
          </View>
        </View>

        {/* Event Summary Card with Organizer Logo */}
        <View style={styles.eventSummary}>
          {/* {organizerLogo && (
            <View style={styles.organizerLogoContainer}>
              <Image src={organizerLogo} style={styles.organizerLogo} />
            </View>
          )} */}
          
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{transaction.event.title}</Text>
            <View style={styles.organizerRow}>
              <Text style={styles.organizerName}>Organized by {organizerName}</Text>
            </View>

          </View>
        </View>

        {/* Items Table */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.col1]}>
            Description
          </Text>
          <Text style={[styles.tableHeaderText, styles.col2]}>Qty</Text>
          <Text style={[styles.tableHeaderText, styles.col3]}>Unit Price</Text>
          <Text style={[styles.tableHeaderText, styles.col4]}>Amount</Text>
        </View>

        {invoiceInfo.items.map((item, index) => (
          <View style={styles.tableRow} key={item.id || index}>
            <View style={styles.col1}>
              <Text style={{ fontSize: 9, fontWeight: "bold", color: "#0f172a" }}>
                {item.name} Ticket
              </Text>
            </View>
            <Text style={[styles.addressText, styles.col2]}>
              {item.quantity}
            </Text>
            <Text style={[styles.addressText, styles.col3]}>
              {currency} {item.unit_price.toFixed(2)}
            </Text>
            <Text style={[styles.addressText, styles.col4, styles.bold]}>
              {currency} {item.total_price.toFixed(2)}
            </Text>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totalSection}>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>
              {currency} {invoiceInfo.total.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Bottom Info */}
        <View style={styles.notes}>
          <Text>
            <Text style={styles.bold}>Payment: </Text>
            {transaction.payment_gateway?.toUpperCase()}
          </Text>
          <Text style={{ marginTop: 4 }}>
            <Text style={styles.bold}>Thank you!</Text> For inquiries, contact {invoiceInfo.company.email}
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