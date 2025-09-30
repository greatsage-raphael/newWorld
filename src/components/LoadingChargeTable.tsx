
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { User, Truck, MapPin, Weight, CheckCircle } from 'lucide-react';

interface Loadingcharge {
  transaction_id: number;
  transaction_uuid: string;
  user_id: string;
  driver_name: string;
  vehicle_number: string;
  loading_charge: string;
  net_mass: string;
  location: any;
  status: string;
  created_at: string;
}

interface LoadingchargeTableProps {
  charges: Loadingcharge[];
  emptyMessage?: string;
}

const LoadingchargeTable: React.FC<LoadingchargeTableProps> = ({ 
  charges, 
  emptyMessage = "No loading charges found" 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getLocationDisplay = (location: any) => {
    if (typeof location === 'object' && location.displayName) {
      return location.displayName;
    }
    if (typeof location === 'string') {
      return location;
    }
    return 'Location not available';
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('completed') || statusLower.includes('complete')) {
      return <Badge variant="default" className="bg-green-100 text-green-800">{status}</Badge>;
    } else if (statusLower.includes('transit')) {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">{status}</Badge>;
    } else if (statusLower.includes('failed') || statusLower.includes('error')) {
      return <Badge variant="destructive">{status}</Badge>;
    } else {
      return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!charges || charges.length === 0) {
    return (
      <div className="text-center py-12">
        <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">{emptyMessage}</h3>
        <p className="text-gray-500">Loading charges will appear here once they are submitted.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Transaction</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>charge</TableHead>
            <TableHead>Net Mass</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {charges.map((charge) => (
            <TableRow key={charge.transaction_id} className="hover:bg-blue-50">
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-blue-900">
                    #{charge.transaction_id}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    {charge.transaction_uuid.slice(0, 8)}...
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm font-mono text-gray-600">
                  {charge.user_id.slice(0, 8)}...
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  {charge.driver_name}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <Badge variant="outline" className="font-mono">
                    {charge.vehicle_number}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>{charge.loading_charge}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Weight className="h-4 w-4 text-blue-600" />
                  {charge.net_mass}
                </div>
              </TableCell>
              <TableCell className="max-w-xs">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm truncate">
                    {getLocationDisplay(charge.location)}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {getStatusBadge(charge.status)}
              </TableCell>
              <TableCell>
                {formatDate(charge.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LoadingchargeTable;
