import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

interface InvoiceAdjustmentDialogProps {
  invoice: any;
  onAdjustment: (adjustmentData: any) => void;
}

const InvoiceAdjustmentDialog = ({ invoice, onAdjustment }: InvoiceAdjustmentDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [adjustmentData, setAdjustmentData] = useState({
    type: 'discount', // discount, additional_charge, tax_adjustment
    amount: 0,
    percentage: 0,
    description: '',
    reason: '',
    apply_as: 'amount' // amount or percentage
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adjustmentData.description) {
      toast.error('Please provide a description for the adjustment');
      return;
    }

    const adjustmentAmount = adjustmentData.apply_as === 'percentage' 
      ? (invoice.subtotal * adjustmentData.percentage) / 100
      : adjustmentData.amount;

    let newSubtotal = invoice.subtotal;
    
    if (adjustmentData.type === 'discount') {
      newSubtotal = Math.max(0, invoice.subtotal - adjustmentAmount);
    } else if (adjustmentData.type === 'additional_charge') {
      newSubtotal = invoice.subtotal + adjustmentAmount;
    }

    const adjustment = {
      invoiceId: invoice.id,
      type: adjustmentData.type,
      amount: adjustmentAmount,
      description: adjustmentData.description,
      reason: adjustmentData.reason,
      newSubtotal,
      newTotal: newSubtotal + (invoice.tax_amount || 0)
    };

    onAdjustment(adjustment);
    setIsOpen(false);
    setAdjustmentData({
      type: 'discount',
      amount: 0,
      percentage: 0,
      description: '',
      reason: '',
      apply_as: 'amount'
    });
  };

  const calculatePreview = () => {
    const adjustmentAmount = adjustmentData.apply_as === 'percentage' 
      ? (invoice.subtotal * adjustmentData.percentage) / 100
      : adjustmentData.amount;

    let newSubtotal = invoice.subtotal;
    
    if (adjustmentData.type === 'discount') {
      newSubtotal = Math.max(0, invoice.subtotal - adjustmentAmount);
    } else if (adjustmentData.type === 'additional_charge') {
      newSubtotal = invoice.subtotal + adjustmentAmount;
    }

    return {
      adjustmentAmount,
      newSubtotal,
      newTotal: newSubtotal + (invoice.tax_amount || 0)
    };
  };

  const preview = calculatePreview();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Edit className="h-4 w-4" />
          Adjust
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invoice Adjustment</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Adjustment Type</Label>
            <Select 
              value={adjustmentData.type} 
              onValueChange={(value) => setAdjustmentData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discount">
                  <div className="flex items-center gap-2">
                    <Minus className="h-4 w-4 text-red-500" />
                    Discount
                  </div>
                </SelectItem>
                <SelectItem value="additional_charge">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-green-500" />
                    Additional Charge
                  </div>
                </SelectItem>
                <SelectItem value="tax_adjustment">Tax Adjustment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Apply As</Label>
            <Select 
              value={adjustmentData.apply_as} 
              onValueChange={(value) => setAdjustmentData(prev => ({ ...prev, apply_as: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amount">Fixed Amount</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {adjustmentData.apply_as === 'amount' ? (
            <div>
              <Label>Amount (Rp)</Label>
              <Input
                type="number"
                value={adjustmentData.amount}
                onChange={(e) => setAdjustmentData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>
          ) : (
            <div>
              <Label>Percentage (%)</Label>
              <Input
                type="number"
                value={adjustmentData.percentage}
                onChange={(e) => setAdjustmentData(prev => ({ ...prev, percentage: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
                min="0"
                max="100"
              />
            </div>
          )}

          <div>
            <Label>Description *</Label>
            <Input
              value={adjustmentData.description}
              onChange={(e) => setAdjustmentData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of adjustment"
              required
            />
          </div>

          <div>
            <Label>Reason</Label>
            <Textarea
              value={adjustmentData.reason}
              onChange={(e) => setAdjustmentData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Detailed reason for this adjustment..."
              rows={3}
            />
          </div>

          {/* Preview */}
          <div className="bg-muted p-4 rounded-md space-y-2">
            <h4 className="font-medium">Preview</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Current Subtotal:</span>
                <span>Rp {invoice.subtotal?.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Adjustment:</span>
                <span className={adjustmentData.type === 'discount' ? 'text-red-600' : 'text-green-600'}>
                  {adjustmentData.type === 'discount' ? '-' : '+'}Rp {preview.adjustmentAmount.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between font-medium border-t pt-1">
                <span>New Total:</span>
                <span>Rp {preview.newTotal.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Apply Adjustment
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceAdjustmentDialog;