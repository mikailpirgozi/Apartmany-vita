'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

export default function Beds24DebugPage() {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    setTestResults(null);

    try {
      // Test 1: Basic connection
      const connectionTest = await fetch('/api/beds24/test');
      const connectionResult = await connectionTest.json();

      // Test 2: Availability test
      const availabilityTest = await fetch('/api/beds24/availability?apartment=deluxe-apartman&startDate=2024-12-01&endDate=2024-12-07');
      const availabilityResult = await availabilityTest.json();

      setTestResults({
        connection: connectionResult,
        availability: availabilityResult
      });
    } catch (error) {
      setTestResults({
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Beds24 API Debug
            </CardTitle>
            <CardDescription>
              Diagnostika problémov s Beds24 API pripojením
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Problém:</strong> API kľúč "AbDalfEtyekmentOsVeb" nie je platný Beds24 API kľúč.
                Dostávame HTTP 401 Unauthorized, čo znamená, že kľúč nie je autorizovaný.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Aktuálne nastavenia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">API Key:</span>
                    <Badge variant="outline">AbDalfEtyekmentOsVeb</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Property ID:</span>
                    <Badge variant="outline">357931</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Deluxe Room ID:</span>
                    <Badge variant="outline">161445</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Lite Room ID:</span>
                    <Badge variant="outline">168900</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Design Room ID:</span>
                    <Badge variant="outline">227484</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Testovanie</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={runTests} disabled={isLoading} className="w-full">
                    {isLoading ? 'Testujem...' : 'Spustiť testy'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {testResults && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Výsledky testov</h3>
                
                {/* Connection Test */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">API Pripojenie</CardTitle>
                      <Badge variant={testResults.connection?.success ? 'default' : 'destructive'}>
                        {testResults.connection?.success ? 'Úspech' : 'Chyba'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      {testResults.connection?.message}
                    </p>
                    {testResults.connection?.results?.connection?.error && (
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                          {testResults.connection.results.connection.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Availability Test */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Dostupnosť Apartmánu</CardTitle>
                      <Badge variant={testResults.availability?.success ? 'default' : 'destructive'}>
                        {testResults.availability?.success ? 'Úspech' : 'Chyba'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      {testResults.availability?.message}
                    </p>
                    {testResults.availability?.error && (
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                          {testResults.availability.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Riešenie:</strong> Musíte získať skutočný API kľúč z vašej Beds24 účtu.
                Choďte na <a href="https://beds24.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">beds24.com</a> → 
                Account → Account Access → API Key 1 → vytvorte nový kľúč.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kroky na opravu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">1</Badge>
                <div>
                  <p className="font-medium">Prihláste sa do Beds24 účtu</p>
                  <p className="text-sm text-muted-foreground">
                    <a href="https://beds24.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">beds24.com</a>
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">2</Badge>
                <div>
                  <p className="font-medium">Vytvorte nový API kľúč</p>
                  <p className="text-sm text-muted-foreground">
                    Account → Account Access → API Key 1 → zadajte nový kľúč → Save
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">3</Badge>
                <div>
                  <p className="font-medium">Nastavte IP prístup</p>
                  <p className="text-sm text-muted-foreground">
                    V API Key 1 nastavte "allow any IP" alebo pridajte vašu IP adresu
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">4</Badge>
                <div>
                  <p className="font-medium">Aktualizujte .env.local</p>
                  <p className="text-sm text-muted-foreground">
                    Nahraďte "AbDalfEtyekmentOsVeb" skutočným API kľúčom
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">5</Badge>
                <div>
                  <p className="font-medium">Reštartujte aplikáciu</p>
                  <p className="text-sm text-muted-foreground">
                    Zastavte a spustite znovu npm run dev
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
