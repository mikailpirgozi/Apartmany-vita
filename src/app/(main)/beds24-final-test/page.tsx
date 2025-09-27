'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Info, RefreshCw } from 'lucide-react';

export default function Beds24FinalTestPage() {
  const [testResults, setTestResults] = useState<{
    connection?: {
      message: string;
      results?: {
        connection?: {
          success: boolean;
          error?: string;
        };
      };
    };
    availability?: Record<string, {
      success: boolean;
      message?: string;
      error?: string;
    }>;
    direct?: {
      success: boolean;
      message: string;
      error?: string;
    };
    error?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runComprehensiveTest = async () => {
    setIsLoading(true);
    setTestResults(null);

    try {
      const results: {
        connection?: {
          message: string;
          results?: {
            connection?: {
              success: boolean;
              error?: string;
            };
          };
        };
        availability?: Record<string, {
          success: boolean;
          message?: string;
          error?: string;
        }>;
        direct?: {
          success: boolean;
          message: string;
          error?: string;
        };
      } = {};

      // Test 1: Basic API connection
      console.log('Testing basic API connection...');
      const connectionTest = await fetch('/api/beds24/test');
      const connectionResult = await connectionTest.json();
      results.connection = connectionResult;

      // Test 2: Availability test with test apartment only
      console.log('Testing availability for test apartment...');
      const apartments = ['maly-apartman']; // Only test apartment
      results.availability = {};

      for (const apartment of apartments) {
        try {
          const availabilityTest = await fetch(
            `/api/beds24/availability?apartment=${apartment}&startDate=2024-12-01&endDate=2024-12-07`
          );
          const availabilityResult = await availabilityTest.json();
          results.availability[apartment] = availabilityResult;
        } catch (error) {
          results.availability[apartment] = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }

      // Test 3: Direct Beds24 API test (simulate what our service does)
      console.log('Testing direct Beds24 API...');
      try {
        const directTest = await fetch('/api/beds24/direct-test');
        const directResult = await directTest.json();
        results.direct = directResult;
      } catch (error) {
        results.direct = {
          success: false,
          message: 'Direct test failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }

      setTestResults(results);
    } catch (error) {
      setTestResults({
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (result: {
    success: boolean;
    error?: string;
  } | null | undefined) => {
    if (!result) return <Badge variant="secondary">Not tested</Badge>;
    return (
      <Badge variant={result.success ? 'default' : 'destructive'}>
        {result.success ? 'Success' : 'Failed'}
      </Badge>
    );
  };

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-500" />
              Beds24 Test - Nová Testovacia Izba
            </CardTitle>
            <CardDescription>
              Testovanie len novej testovacej izby (Room ID: 615761)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Aktuálne nastavenia:</strong><br />
                API Key: <code>VitaAPI2024Mikipiki</code><br />
                Property ID: <code>294444</code><br />
                Test Room ID: 615761 (Apartman Vita Test)<br />
                <br />
                <strong>PropKey pre testovaciu izbu:</strong><br />
                Test: <code>VitaTest2024NewKey</code>
              </AlertDescription>
            </Alert>

            <Button 
              onClick={runComprehensiveTest} 
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testujem testovaciu izbu...
                </>
              ) : (
                'Spustiť test testovacej izby'
              )}
            </Button>

            {testResults && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Výsledky testov</h3>
                
                {/* Connection Test */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">1. API Pripojenie</CardTitle>
                      {getStatusBadge(testResults.connection?.results?.connection)}
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
                          <strong>Chyba:</strong> {testResults.connection.results.connection.error}
                        </AlertDescription>
                      </Alert>
                    )}
                    {testResults.connection?.results?.connection?.success && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          API pripojenie funguje správne!
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Availability Tests */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">2. Dostupnosť Apartmánov</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(testResults.availability || {}).map(([apartment, result]: [string, {
                      success: boolean;
                      message?: string;
                      error?: string;
                    }]) => (
                      <div key={apartment} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <span className="font-medium capitalize">
                            {apartment.replace('-', ' ')}
                          </span>
                          <p className="text-sm text-muted-foreground">
                            {result.message || result.error || 'Test dokončený'}
                          </p>
                        </div>
                        {getStatusBadge(result)}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Direct API Test */}
                {testResults.direct && (
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">3. Priamy Beds24 API Test</CardTitle>
                        {getStatusBadge(testResults.direct)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        {testResults.direct.message}
                      </p>
                      {testResults.direct.error && (
                        <Alert variant="destructive">
                          <XCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Chyba:</strong> {testResults.direct.error}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Súhrn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {testResults.connection?.results?.connection?.success ? (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Výborně!</strong> API kľúč funguje správne. Beds24 integrácia je pripravená na použitie.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Problém:</strong> API kľúč stále nie je platný alebo nie je správne aktivovaný v Beds24 účte.
                          <br /><br />
                          <strong>Riešenie:</strong>
                          <br />1. Skontrolujte, či je API kľúč &quot;VitaAPI2024mikipiki&quot; správne uložený v Beds24 účte
                          <br />2. Uistite sa, že &quot;API Key Access&quot; je nastavené na &quot;allow any IP&quot;
                          <br />3. Skontrolujte, či &quot;Allow Writes&quot; je nastavené na &quot;Yes&quot;
                          <br />4. Kontaktujte Beds24 podporu ak problém pretrváva
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
