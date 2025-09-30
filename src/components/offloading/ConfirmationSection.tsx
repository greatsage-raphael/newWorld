
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface ConfirmationSectionProps {
  isFormComplete: boolean;
  isConfirming: boolean;
  isUploadingImage: boolean;
  onConfirmReceipt: () => void;
  isCompleted: boolean;
}

const ConfirmationSection: React.FC<ConfirmationSectionProps> = ({
  isFormComplete,
  isConfirming,
  isUploadingImage,
  onConfirmReceipt,
  isCompleted
}) => {
  if (isCompleted) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-green-800 mb-1">Receipt Confirmed</h3>
            <p className="text-green-700 text-sm">
              This loading charge has been successfully confirmed and marked as completed.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Confirm Receipt</h3>
          <p className="text-yellow-700 text-sm">
            Please verify all the details above are correct, capture your current location, and take a photo before confirming receipt of this loading charge.
          </p>
        </div>
        
        <Button 
          onClick={onConfirmReceipt}
          disabled={!isFormComplete || isConfirming || isUploadingImage}
          className={`w-full py-3 text-lg ${
            isFormComplete && !isUploadingImage
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {isUploadingImage ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Uploading Photo...
            </>
          ) : isConfirming ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Confirming...
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              Confirm Received
            </>
          )}
        </Button>
        
        {!isFormComplete && (
          <p className="text-sm text-gray-500 text-center mt-2">
            Complete all required fields to enable confirmation
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ConfirmationSection;
