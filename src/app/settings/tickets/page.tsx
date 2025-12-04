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
import { TicketService } from '@/lib/ticketService';
import { Ticket, TicketFilters } from '@/types/ticket';
import { format } from 'date-fns';

export default function TicketsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  // const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [filters, setFilters] = useState<TicketFilters>({});

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      let ticketData: Ticket[] = [];
      // const [statsData] = await Promise.all([
      //   TicketService.getTicketStats()
      // ]);
      
      if (activeTab === 'upcoming') {
        const response = await TicketService.getUpcomingTickets();
        ticketData = response?.tickets || [];
      } else if (activeTab === 'past') {
        const response = await TicketService.getPastTickets();
        ticketData = response?.tickets || [];
      } else {
        const response = await TicketService.getTickets(filters);
        ticketData = response?.tickets || [];
      }
      
      setTickets(ticketData);
      // setStats(statsData);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadTickets();
      return;
    }
    setLoading(true);
    try {
      const results = await TicketService.searchTickets(searchQuery);
      setTickets(results);
    } catch (error) {
      console.error('Failed to search tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTicket = async (ticketId: string) => {
    try {
      await TicketService.cancelTicket(ticketId);
      setTickets(prev => prev.map(t => 
        t.id === ticketId ? { ...t, status: 'cancelled' as const } : t
      ));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to cancel ticket';
      alert(message);
    }
  };

  const handleDownloadTicket = async (ticketId: string) => {
    try {
      const { pdfUrl } = await TicketService.downloadTicket(ticketId);
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Failed to download ticket:', error);
    }
  };

  const getStatusColor = (status: Ticket['status']) => {
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

  const getTicketTypeColor = (type: Ticket['ticketType']) => {
    switch (type) {
      case 'vip':
        return 'bg-purple-100 text-purple-800';
      case 'premium':
        return 'bg-yellow-100 text-yellow-800';
      case 'early_bird':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
          {/* Stats */}
          {/* {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">Total Tickets</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{stats.upcoming}</div>
                  <div className="text-sm text-muted-foreground">Upcoming</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{stats.active}</div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Total Spent</div>
                </CardContent>
              </Card>
            </div>
          )} */}

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search by event name, location, or ticket number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Select 
                value={filters.status || 'all'} 
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  status: value === 'all' ? undefined : value as Ticket['status'] 
                }))}
              >
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
                {tab === 'all' ? 'All Tickets' : tab}
              </button>
            ))}
          </div>

          {/* Tickets Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className='py-4'>
                  <CardHeader>
                    <Skeleton className="h-40 w-full rounded-lg" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <Card className='gap-0'>
              <CardContent className="text-center py-12">
                <TicketIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
                <p className="text-muted-foreground">
                  {activeTab === 'upcoming' 
                    ? "You don't have any upcoming events"
                    : activeTab === 'past'
                    ? "You don't have any past tickets"
                    : "No tickets match your search criteria"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tickets.map((ticket) => (
                <Card key={ticket.id} className="overflow-hidden hover:shadow-lg transition-shadow gap-0">
                  <div 
                    className="h-40 bg-cover bg-center relative"
                    style={{ backgroundImage: `url(${ticket.eventImage})` }}
                  >
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                      <Badge className={getTicketTypeColor(ticket.ticketType)}>
                        {ticket.ticketType.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-lg mb-2">{ticket.eventName}</h3>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(ticket.eventDate), 'EEE, MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {format(new Date(ticket.eventDate), 'h:mm a')}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {ticket.eventLocation}
                      </div>
                      {ticket.seatNumber && (
                        <div className="font-medium text-foreground">
                          Seat: {ticket.section && `${ticket.section} - `}
                          Row {ticket.row}, Seat {ticket.seatNumber}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setSelectedTicket(ticket);
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
                        onClick={() => handleDownloadTicket(ticket.id)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                    {ticket.status === 'active' && new Date(ticket.eventDate) > new Date() && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="w-full mt-2"
                        onClick={() => handleCancelTicket(ticket.id)}
                      >
                        Cancel Ticket
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.eventName}</DialogTitle>
            <DialogDescription>
              Ticket #{selectedTicket?.ticketNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="flex flex-col items-center py-4">
              <img 
                src={selectedTicket.qrCode} 
                alt="QR Code" 
                className="w-48 h-48 mb-4"
              />
              <p className="text-sm text-muted-foreground text-center">
                Present this QR code at the venue entrance
              </p>
              {selectedTicket.notes && (
                <div className="mt-4 p-3 bg-accent rounded-lg w-full">
                  <p className="text-sm font-medium">Note:</p>
                  <p className="text-sm text-muted-foreground">{selectedTicket.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
