import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Send, Loader2, TestTube } from 'lucide-react';
import { toast } from 'sonner';

interface EmailTestDialogProps {
  emailConfig: any;
}

const EmailTestDialog = ({ emailConfig }: EmailTestDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testData, setTestData] = useState({
    to: '',
    subject: 'Test Email from Digital Service Platform',
    message: 'This is a test email to verify SMTP configuration is working correctly.\n\nIf you receive this email, your email settings are properly configured!'
  });

  const handleTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real implementation, this would call an API endpoint or edge function
      // For now, we'll simulate the test
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate validation
      if (!emailConfig.smtp_host || !emailConfig.smtp_user) {
        throw new Error('SMTP configuration is incomplete. Please check your email settings.');
      }

      if (!testData.to) {
        throw new Error('Please enter a recipient email address.');
      }

      // Simulate email sending
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      if (success) {
        toast.success('Test email sent successfully! Check the recipient inbox.');
        setIsOpen(false);
      } else {
        throw new Error('Failed to send test email. Please check your SMTP configuration.');
      }
    } catch (error: any) {
      console.error('Email test error:', error);
      toast.error(error.message || 'Failed to send test email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <TestTube className="h-4 w-4" />
          Test Email
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Test Email Configuration
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleTestEmail} className="space-y-4">
          <div>
            <Label>Recipient Email *</Label>
            <Input
              type="email"
              placeholder="test@example.com"
              value={testData.to}
              onChange={(e) => setTestData(prev => ({ ...prev, to: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label>Subject</Label>
            <Input
              value={testData.subject}
              onChange={(e) => setTestData(prev => ({ ...prev, subject: e.target.value }))}
            />
          </div>
          
          <div>
            <Label>Message</Label>
            <Textarea
              rows={4}
              value={testData.message}
              onChange={(e) => setTestData(prev => ({ ...prev, message: e.target.value }))}
            />
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Test Email
                </>
              )}
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

export default EmailTestDialog;