"use client";

import { useState } from "react";
import { SimpleAvailabilityCalendar } from "@/components/booking/simple-availability-calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, Euro } from "lucide-react";
import { format } from "date-fns";
import { sk } from "date-fns/locale";

export default function CalendarTestPage() {
  const [selectedApartment, setSelectedApartment] = useState<string>('deluxe-apartman');
  const [selectedGuests, setSelectedGuests] = useState<number>(2);
  const [selectedRange, setSelectedRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: null,
    to: null
  });

  const apartments = [
    { slug: 'deluxe-apartman', name: 'Deluxe Apartmán', maxGuests: 6 },
    { slug: 'design-apartman', name: 'Design Apartmán', maxGuests: 6 },
    { slug: 'lite-apartman', name: 'Lite Apartmán', maxGuests: 2 }
  ];

  const currentApartment = apartments.find(apt => apt.slug === selectedApartment);

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Jednoduchý kalendár dostupnosti</h1>
          <p className="text-muted-foreground">
            Test nového jednoduchého kalendára s reálnymi dátami z Beds24
          </p>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Nastavenia testu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Apartment Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Apartmán</label>
                <Select value={selectedApartment} onValueChange={setSelectedApartment}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {apartments.map(apt => (
                      <SelectItem key={apt.slug} value={apt.slug}>
                        {apt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Guest Count */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Počet hostí</label>
                <Select value={selectedGuests.toString()} onValueChange={(value) => setSelectedGuests(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: currentApartment?.maxGuests || 6 }, (_, i) => i + 1).map(count => (
                      <SelectItem key={count} value={count.toString()}>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {count} {count === 1 ? 'hosť' : count < 5 ? 'hostia' : 'hostí'}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reset Button */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Akcie</label>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedRange({ from: null, to: null })}
                  className="w-full"
                >
                  Resetovať výber
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Range Info */}
        {selectedRange.from && selectedRange.to && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                Vybraný termín
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Termín</p>
                  <p className="font-medium">
                    {format(selectedRange.from, 'dd.MM.yyyy', { locale: sk })} - {format(selectedRange.to, 'dd.MM.yyyy', { locale: sk })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Počet nocí</p>
                  <p className="font-medium">
                    {Math.ceil((selectedRange.to.getTime() - selectedRange.from.getTime()) / (1000 * 60 * 60 * 24))} nocí
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hostia</p>
                  <p className="font-medium">{selectedGuests} hostí</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calendar */}
        <SimpleAvailabilityCalendar
          apartmentSlug={selectedApartment}
          selectedRange={selectedRange}
          onRangeSelect={setSelectedRange}
          guests={selectedGuests}
        />

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Funkcie nového kalendára</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-green-600">✅ Implementované</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="text-xs">API</Badge>
                    <span>Reálne dáta z Beds24 API</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="text-xs">CENY</Badge>
                    <span>Individuálne ceny na každý deň</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="text-xs">ZĽAVY</Badge>
                    <span>Automatické zľavy za dĺžku pobytu</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="text-xs">SEZÓNA</Badge>
                    <span>Sezónne zľavy (október-marec)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="text-xs">UI</Badge>
                    <span>Jednoduchý a prehľadný dizajn</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-blue-600">📊 Cenové pravidlá</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Badge variant="secondary" className="text-xs">7+ dní</Badge>
                    <span>10% zľava za týždňový pobyt</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="secondary" className="text-xs">14+ dní</Badge>
                    <span>15% zľava za predĺžený pobyt</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="secondary" className="text-xs">30+ dní</Badge>
                    <span>30% zľava za mesačný pobyt</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="secondary" className="text-xs">Mimo sezóny</Badge>
                    <span>20% zľava (október-marec)</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
