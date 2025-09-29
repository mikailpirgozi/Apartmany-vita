/**
 * Discount Information Component
 * Displays available stay-based discounts to users
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Percent, Clock } from 'lucide-react';
import { getDiscountTiers } from '@/lib/discounts';

interface DiscountInfoProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export function DiscountInfo({ className, variant = 'default' }: DiscountInfoProps) {
  const discountTiers = getDiscountTiers();

  if (variant === 'compact') {
    return (
      <div className={className}>
        <div className="flex items-center gap-2 mb-3">
          <Percent className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Zľavy za dlhší pobyt</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {discountTiers.map((tier) => (
            <Badge key={tier.type} variant="secondary" className="bg-blue-100 text-blue-800">
              {tier.label}: -{tier.discountPercent}%
            </Badge>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="h-5 w-5 text-blue-600" />
          Zľavy za dlhší pobyt
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Čím dlhší pobyt, tým väčšia zľava! Automaticky sa aplikuje pri rezervácii.
        </p>
        
        <div className="space-y-3">
          {discountTiers.map((tier) => (
            <div key={tier.type} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-blue-600" />
                <div>
                  <span className="font-medium text-blue-900">{tier.label}</span>
                  <p className="text-xs text-blue-600">
                    {tier.minNights}+ nocí
                  </p>
                </div>
              </div>
              <Badge className="bg-blue-600 text-white">
                -{tier.discountPercent}%
              </Badge>
            </div>
          ))}
        </div>
        
        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <Clock className="h-4 w-4 text-amber-600 mt-0.5" />
          <div className="text-xs text-amber-700">
            <strong>Tip:</strong> Zľavy sa kombinujú s loyalty programom pre registrovaných používateľov!
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

