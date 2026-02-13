'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Ticket as TicketIcon, QrCode, Download, Calendar, MapPin, Clock, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TicketItem, ViewTicketDetails } from '@/types/ticket';
import { useUserTickets } from '@/hooks/useTickets';
import { QRCodeSVG } from 'qrcode.react';

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
};

// Check if event is upcoming (start date is in the future)
const isUpcoming = (startDate: string) => {
  return new Date(startDate) > new Date();
};

export default function TicketsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<ViewTicketDetails | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTicketForQR, setSelectedTicketForQR] = useState<TicketItem | null>(null);
  
  // Use the existing query hook
  const { data: tickets = [], isLoading, error } = useUserTickets();

  // Filter tickets based on active tab and search
  const filteredTickets = tickets.filter((order: ViewTicketDetails) => {
    const eventDate = order.event.startDate;
    const isEventUpcoming = isUpcoming(eventDate);
    
    // Tab filter
    if (activeTab === 'upcoming' && !isEventUpcoming) return false;
    if (activeTab === 'past' && isEventUpcoming) return false;
    
    // Status filter
    if (statusFilter !== 'all') {
      const hasMatchingStatus = order.tickets.some(t => t.checkedIn ? statusFilter === 'used' : statusFilter === 'active');
      if (!hasMatchingStatus) return false;
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.event.title.toLowerCase().includes(query) ||
        order.event.venueName.toLowerCase().includes(query) ||
        order.tickets.some(t => t.ticketNumber.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  const getStatusFromTicket = (ticket: ViewTicketDetails['tickets'][0]) => {
    return ticket.checkedIn ? 'used' : 'active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'used':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownloadTicket = async (orderId: string) => {
    // You'll need to implement this in your ticketService
    console.log('Download ticket for order:', orderId);
  };

  const handleCancelTicket = async (orderId: string) => {
    // You'll need to implement this in your ticketService
    console.log('Cancel ticket for order:', orderId);
  };

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 font-poppins">My Tickets</h1>
        <Card>
          <CardContent className="text-center py-12">
            <TicketIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error loading tickets</h3>
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : 'Failed to load tickets. Please try again.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-poppins">
          My Tickets
        </h1>
        <p className="text-sm text-gray-600">
          Manage and view all your event tickets
        </p>
      </div>

      {/* Main Content */}
      <div className="glass-card rounded-xl p-6">
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search by event name, location, or ticket number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b">
            {(['upcoming', 'past', 'all'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-1 capitalize font-medium transition-colors cursor-pointer ${
                  activeTab === tab
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'all' ? 'All Tickets' : `${tab} Events`}
              </button>
            ))}
          </div>

          {/* Tickets Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-40 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <TicketIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
                <p className="text-muted-foreground">
                  {activeTab === 'upcoming' 
                    ? "You don't have any upcoming events"
                    : activeTab === 'past'
                    ? "You don't have any past events"
                    : "No tickets match your search criteria"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTickets.map((order: ViewTicketDetails) => (
                order.tickets.map((ticket) => (
                  <Card key={ticket.ticketId} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div 
                      className="h-40 bg-cover bg-center relative"
                      style={{ backgroundImage: `url(${order.event.imageUrl})` }}
                    >
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Badge className={`${getStatusColor(getStatusFromTicket(ticket))} border-none px-3 py-1 shadow-sm`}>
                          {getStatusFromTicket(ticket).toUpperCase()}
                        </Badge>
                        <Badge className="bg-gray-100 text-gray-800">
                          {ticket.tierName}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-lg mb-2">{order.event.title}</h3>
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(order.event.startDate)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {formatTime(order.event.startDate)}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {order.event.venueName}, {order.event.address}
                        </div>
                        <div className="font-medium text-foreground">
                          Ticket #: {ticket.ticketNumber}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setSelectedTicketForQR(ticket);
                            setShowQRModal(true);
                          }}
                        >
                          <QrCode className="h-4 w-4 mr-1" />
                          QR Code
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleDownloadTicket(order.orderId)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
     <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
  <DialogContent className="max-w-md">
    <DialogHeader>
            <DialogTitle>
        {tickets.find(order => 
          order.tickets.some(t => t.ticketId === selectedTicketForQR?.ticketId)
        )?.event.title || 'Ticket QR Code'}
      </DialogTitle>
      <DialogDescription>
        Ticket #{selectedTicketForQR?.ticketNumber}
      </DialogDescription>
    </DialogHeader>
    {selectedTicketForQR && (
      <div className="flex flex-col items-center py-4">
        <QRCodeSVG
          value={selectedTicketForQR.qrData}
          size={250}
          level="H"
          includeMargin={true}
          fgColor="#0f172a"
        />
        <p className="text-sm text-muted-foreground text-center mt-4">
          Present this QR code at the venue entrance
        </p>
      </div>
    )}
  </DialogContent>
</Dialog>
    </div>
  );
}