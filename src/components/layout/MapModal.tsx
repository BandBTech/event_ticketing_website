// MapModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';


interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  venue: {
    name: string;
    address: string;
    coordinates?: { lat: number; lng: number };
  };
}

export const MapModal: React.FC<MapModalProps> = ({ isOpen, onClose, venue }) => {
  const mapQuery = venue.coordinates 
    ? `${venue.coordinates.lat},${venue.coordinates.lng}`
    : encodeURIComponent(venue.address.trim());

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{venue.name}</DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-6">
          <div className="w-full h-64 rounded-lg overflow-hidden">
            <iframe
              title={`${venue.name} location`}
              src={`https://maps.google.com/maps?q=${mapQuery}&z=15&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="mt-4">
            <p className="text-gray-700">
              {venue.address}
            </p>
            <button
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${mapQuery}`, '_blank')}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Open in Google Maps →
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
