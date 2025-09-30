
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface OffloadingHeaderProps {
  onBackClick: () => void;
}

const OffloadingHeader: React.FC<OffloadingHeaderProps> = ({ onBackClick }) => {
  return (
    <div className="bg-blue-900 text-white p-6 shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={onBackClick}
          className="text-white hover:bg-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Transit
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Offloading Confirmation</h1>
          <p className="text-blue-200 mt-1">Confirm receipt of loading charge</p>
        </div>
      </div>
    </div>
  );
};

export default OffloadingHeader;
