
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Cookie } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const GDPRConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [userSession, setUserSession] = useState('');

  useEffect(() => {
    // Generate unique session ID
    const sessionId = `gdpr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setUserSession(sessionId);

    // Check if user already gave consent
    const checkConsent = async () => {
      const existingConsent = localStorage.getItem('gdpr_consent');
      if (!existingConsent) {
        setIsVisible(true);
      }
    };

    checkConsent();
  }, []);

  const handleAccept = async () => {
    try {
      // Store consent in database
      await supabase.from('gdpr_consents').insert([{
        user_session: userSession,
        consent_given: true,
        ip_address: null, // Will be handled by database
        user_agent: navigator.userAgent
      }]);

      // Store in localStorage
      localStorage.setItem('gdpr_consent', 'accepted');
      setIsVisible(false);
    } catch (error) {
      console.error('Error storing consent:', error);
      // Still hide the popup even if database storage fails
      localStorage.setItem('gdpr_consent', 'accepted');
      setIsVisible(false);
    }
  };

  const handleDecline = async () => {
    try {
      // Store decline in database
      await supabase.from('gdpr_consents').insert([{
        user_session: userSession,
        consent_given: false,
        ip_address: null,
        user_agent: navigator.userAgent
      }]);

      // Store in localStorage
      localStorage.setItem('gdpr_consent', 'declined');
      setIsVisible(false);
    } catch (error) {
      console.error('Error storing consent:', error);
      localStorage.setItem('gdpr_consent', 'declined');
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:w-96">
      <Card className="border shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Cookie className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-sm mb-2">Kebijakan Cookies</h3>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Kami menggunakan cookies untuk meningkatkan pengalaman browsing Anda, 
                menyajikan konten yang dipersonalisasi, dan menganalisis lalu lintas kami. 
                Dengan mengklik "Terima", Anda menyetujui penggunaan cookies sesuai 
                dengan kebijakan privasi kami.
              </p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleAccept}
                  className="flex-1 h-8 text-xs"
                >
                  Terima
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleDecline}
                  className="flex-1 h-8 text-xs"
                >
                  Tolak
                </Button>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GDPRConsent;
