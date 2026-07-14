import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";
import { Ticket, TicketItem, ViewTicketDetails } from "@/types/ticket";
import { TransactionDetail } from "@/types/transaction";

interface TicketPDFDownloadProps {
  ticket: TicketItem;
  detailTickets: ViewTicketDetails;
}
export const TicketPDFDownload = ({
  ticket,
  detailTickets,
}: TicketPDFDownloadProps) => {
  return (
    <div
      style={{
        width: "794px",
        padding: "50px",
        background: "#fff",
        fontFamily: "'Helvetica', 'Arial', sans-serif",
        position: "absolute",
        left: "-9999px",
        top: "-9999px",
      }}
    >
      {/* Professional Header - No Image */}
      <div
        style={{
          background: "#1a1a1a",
          color: "white",
          padding: "40px",
          borderRadius: "16px 16px 0 0",
          borderBottom: "4px solid #3b82f6",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "32px", letterSpacing: "-0.5px" }}>
          {detailTickets.event.title}
        </h1>
        <p style={{ margin: "10px 0 0 0", opacity: 0.8, fontSize: "16px" }}>
          Official Entry Pass
        </p>
      </div>

      <div
        style={{
          border: "1px solid #e2e8f0",
          borderTop: "none",
          borderRadius: "0 0 16px 16px",
          padding: "40px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {/* Left Side: Event Info */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                fontSize: "12px",
                color: "#64748b",
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              Date & Time
            </label>
            <p
              style={{ margin: "4px 0", fontSize: "18px", fontWeight: "bold" }}
            >
              {format(
                new Date(detailTickets.event.startDate),
                "eeee, MMMM do, yyyy",
              )}
            </p>
            <p style={{ margin: 0, fontSize: "16px", color: "#334155" }}>
              {format(new Date(detailTickets.event.endDate), "p")}
            </p>
               <p
              style={{ margin: "4px 0", fontSize: "18px", fontWeight: "bold" }}
            >
              {format(
                new Date(detailTickets.event.endDate),
                "eeee, MMMM do, yyyy",
              )}
            </p>
            <p style={{ margin: 0, fontSize: "16px", color: "#334155" }}>
              {format(new Date(detailTickets.event.startDate), "p")}
            </p>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                fontSize: "12px",
                color: "#64748b",
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              Location
            </label>
            <p style={{ margin: "4px 0", fontSize: "16px", fontWeight: "600" }}>
              {detailTickets.event.venueName}
            </p>
            <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
              {detailTickets.event.address}
            </p>
          </div>

          <div style={{ paddingTop: "20px", borderTop: "1px solid #f1f5f9" }}>
            <label
              style={{
                fontSize: "12px",
                color: "#64748b",
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              Ticket Holder / Number
            </label>
            <p
              style={{
                margin: "4px 0",
                fontSize: "18px",
                fontWeight: "bold",
                color: "#3b82f6",
              }}
            >
              {ticket.ticketNumber}
            </p>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: "500" }}>
              Tier: {ticket.tierName?.name || "General Admission"}
            </p>
          </div>
        </div>

        {/* Right Side: QR Code */}
        <div style={{ textAlign: "center", marginLeft: "40px" }}>
          <div
            style={{
              padding: "15px",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              background: "#fff",
            }}
          >
            <QRCodeSVG
              value={ticket.qrData}
              size={180}
              level="L"
              includeMargin={true}
            />
          </div>
          <p
            style={{
              marginTop: "15px",
              fontSize: "12px",
              color: "#94a3b8",
              fontWeight: "500",
            }}
          >
            Scan at entrance
          </p>
          <div
            style={{
              marginTop: "10px",
              fontSize: "10px",
              color: "#cbd5e1",
              fontFamily: "monospace",
            }}
          >
            ID: {ticket.ticketId.split("-")[0]}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div
        style={{
          marginTop: "30px",
          textAlign: "center",
          color: "#94a3b8",
          fontSize: "11px",
        }}
      >
        Order ID: {detailTickets.orderId} • This ticket is subject to the terms
        and conditions of the event organizer.
      </div>
    </div>
  );
};
