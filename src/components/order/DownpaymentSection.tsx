
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DownpaymentSectionProps {
  useDownpayment: boolean;
  setUseDownpayment: (checked: boolean) => void;
  downpaymentPercentage: number;
  onPercentageChange: (value: number) => void;
  basePrice: number;
}

const DownpaymentSection = ({ 
  useDownpayment, 
  setUseDownpayment, 
  downpaymentPercentage, 
  onPercentageChange, 
  basePrice 
}: DownpaymentSectionProps) => {
  const downpaymentAmount = useDownpayment ? (basePrice * downpaymentPercentage) / 100 : 0;

  return (
    <div className="space-y-4 border p-4 rounded-md">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="use-downpayment" 
          checked={useDownpayment}
          onCheckedChange={(checked) => setUseDownpayment(checked === true)}
        />
        <label htmlFor="use-downpayment" className="text-sm font-medium">
          Saya ingin sistem pembayaran bertahap (DP)
        </label>
      </div>

      {useDownpayment && (
        <div className="space-y-3 pl-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Persentase DP (%)
            </label>
            <Select 
              value={downpaymentPercentage.toString()} 
              onValueChange={(value) => onPercentageChange(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih persentase DP" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20%</SelectItem>
                <SelectItem value="30">30%</SelectItem>
                <SelectItem value="40">40%</SelectItem>
                <SelectItem value="50">50%</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {downpaymentPercentage > 0 && basePrice > 0 && (
            <div className="bg-blue-50 p-3 rounded-md text-sm">
              <div className="flex justify-between mb-1">
                <span>Total Proyek:</span>
                <span className="font-medium">Rp {basePrice.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>DP ({downpaymentPercentage}%):</span>
                <span className="font-medium text-blue-600">Rp {downpaymentAmount.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between border-t pt-1">
                <span>Sisa Pembayaran:</span>
                <span className="font-medium">Rp {(basePrice - downpaymentAmount).toLocaleString('id-ID')}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DownpaymentSection;
