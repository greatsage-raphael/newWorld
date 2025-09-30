import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, MapPin, Hash, Layers } from 'lucide-react';

interface LoadingDetailsSectionProps {
  formData: {
    loading_chainage: string; // CORRECTED NAME
    material: string;
    custom_transaction_id: string;
  };
  onInputChange: (field: string, value: any) => void;
  netMassValue: string;
  netMassUnit: string;
  onNetMassValueChange: (value: string) => void;
  onNetMassUnitChange: (value: string) => void;
  onMaterialChange: (value: string) => void;
  isDriverSelected: boolean;
  isChainageLocked: boolean;
  isNetMassLocked: boolean;
  isTransactionIdEditable: boolean;
}

const LoadingDetailsSection: React.FC<LoadingDetailsSectionProps> = ({
  formData,
  onInputChange,
  netMassValue,
  netMassUnit,
  onNetMassValueChange,
  onNetMassUnitChange,
  onMaterialChange,
  isDriverSelected,
  isChainageLocked,
  isNetMassLocked,
  isTransactionIdEditable,
}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
        <Package className="h-5 w-5" />
        Loading Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <Label htmlFor="loading_chainage" className="flex items-center gap-2 text-blue-900">
            <MapPin className="h-4 w-4" />
            Loading chainage *
          </Label>
          <Input
            id="loading_chainage"
            value={formData.loading_chainage}
            onChange={(e) => onInputChange('loading_chainage', e.target.value)} // CORRECTED NAME
            placeholder="Enter loading chainage"
            required
            className="mt-1"
            disabled={isChainageLocked}
          />
        </div>

        <div>
          <Label htmlFor="transaction_id" className="flex items-center gap-2 text-blue-900">
            <Hash className="h-4 w-4" />
            Transaction ID *
          </Label>
          <Input
            id="transaction_id"
            type="number"
            value={formData.custom_transaction_id}
            onChange={(e) => onInputChange('custom_transaction_id', e.target.value)}
            placeholder={isTransactionIdEditable ? 'Enter transaction ID...' : 'Auto-generated'}
            disabled={!isTransactionIdEditable}
            required={isTransactionIdEditable}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="material" className="flex items-center gap-2 text-blue-900">
            <Layers className="h-4 w-4" />
            Material Type *
          </Label>
          <Select value={formData.material} onValueChange={onMaterialChange} required>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select material type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="murrum">Murrum</SelectItem>
              <SelectItem value="Top Soil">Top Soil</SelectItem>
              <SelectItem value="hardcore">Hardcore</SelectItem>
              <SelectItem value="stone base">Stone Base</SelectItem>
              <SelectItem value="aggregate">Aggregate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="flex items-center gap-2 text-blue-900 mb-3">
            <Package className="h-4 w-4" />
            Net Mass *
          </Label>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="net_mass_value" className="text-sm text-gray-600">
                Value
              </Label>
              <Input
                id="net_mass_value"
                type="number"
                value={netMassValue}
                onChange={(e) => onNetMassValueChange(e.target.value)}
                placeholder={isNetMassLocked ? "Auto-filled capacity" : "Enter quantity"}
                required
                min="0"
                step="0.01"
                className="mt-1"
                disabled={isNetMassLocked}
              />
            </div>
            
            <fieldset disabled={isNetMassLocked} className="space-y-2">
              <Label className="text-sm text-gray-600 block">
                Unit
              </Label>
              <RadioGroup
                value={netMassUnit}
                onValueChange={onNetMassUnitChange}
                className="flex flex-row gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tonnes" id="tonnes" />
                  <Label htmlFor="tonnes" className="text-sm font-normal">Tonnes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="m³" id="m3" />
                  <Label htmlFor="m3" className="text-sm font-normal">m³</Label>
                </div>
              </RadioGroup>
            </fieldset>
            
            {netMassValue.trim() && (
              <div className="p-2 bg-gray-50 rounded border text-sm text-gray-700">
                <strong>Preview:</strong> {netMassValue} {netMassUnit}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingDetailsSection;