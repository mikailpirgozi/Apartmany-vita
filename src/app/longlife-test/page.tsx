'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Clock, Zap } from 'lucide-react';

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  environment?: any;
  instructions?: any;
  error?: string;
  troubleshooting?: string[];
}

export default function LongLifeTestPage() {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runTest = async (apartment: string = 'design-apartman') => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const response = await fetch(`/api/beds24/test-longlife?apartment=${apartment}`);
      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Test request failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Zap className="text-yellow-500" />
            Beds24 Long Life Token Test
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Test the official Beds24 Long Life Token authentication system. 
            This tests the recommended authentication method from Sören.
          </p>
        </div>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Run Authentication Test</CardTitle>
            <CardDescription>
              Test Long Life Token authentication and API functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {['design-apartman', 'lite-apartman', 'deluxe-apartman', 'maly-apartman'].map((apt) => (
                <Button
                  key={apt}
                  onClick={() => runTest(apt)}
                  disabled={isLoading}
                  variant="outline"
                  className="capitalize"
                >
                  {isLoading ? <Clock className="w-4 h-4 animate-spin mr-2" /> : null}
                  Test {apt.replace('-', ' ')}
                </Button>
              ))}
            </div>
            
            <Button
              onClick={() => runTest()}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? <Clock className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
              Run Full Test (Design Apartment)
            </Button>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle className="text-green-500" />
                ) : (
                  <XCircle className="text-red-500" />
                )}
                Test Results
                <Badge variant={testResult.success ? "default" : "destructive"}>
                  {testResult.success ? "SUCCESS" : "FAILED"}
                </Badge>
              </CardTitle>
              <CardDescription>
                {testResult.message}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Environment Info */}
              {testResult.environment && (
                <div>
                  <h3 className="font-semibold mb-2">Environment Configuration</h3>
                  <div className="bg-muted p-3 rounded-lg text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>Has Long Life Token: <Badge variant={testResult.environment.hasLongLifeToken ? "default" : "secondary"}>
                        {testResult.environment.hasLongLifeToken ? "YES" : "NO"}
                      </Badge></div>
                      <div>Token Length: {testResult.environment.longLifeTokenLength}</div>
                      <div className="col-span-2">Base URL: {testResult.environment.baseUrl}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Data */}
              {testResult.success && testResult.data && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Authentication Test</h3>
                    <div className="bg-green-50 p-3 rounded-lg text-sm">
                      <div>Properties Found: {testResult.data.authentication?.propertiesCount || 0}</div>
                      {testResult.data.authentication?.properties && (
                        <div className="mt-2">
                          <div className="font-medium">Sample Properties:</div>
                          <ul className="list-disc list-inside ml-2">
                            {testResult.data.authentication.properties.map((prop: any, idx: number) => (
                              <li key={idx}>{prop.name || prop.id} (ID: {prop.id})</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Availability Test</h3>
                    <div className="bg-blue-50 p-3 rounded-lg text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div>Apartment: {testResult.data.availability.apartment}</div>
                        <div>Property ID: {testResult.data.availability.propId}</div>
                        <div>Room ID: {testResult.data.availability.roomId}</div>
                        <div>Date Range: {testResult.data.availability.dateRange.start} to {testResult.data.availability.dateRange.end}</div>
                        <div>Available Days: <Badge variant="default">{testResult.data.availability.availableDays}</Badge></div>
                        <div>Booked Days: <Badge variant="secondary">{testResult.data.availability.bookedDays}</Badge></div>
                        <div>Total Days: {testResult.data.availability.totalDays}</div>
                        <div>Prices Loaded: {testResult.data.availability.prices}</div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Instructions */}
              {testResult.instructions && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">
                      {testResult.success ? "Success! Next Steps:" : "Setup Instructions:"}
                    </h3>
                    <ul className="space-y-1 text-sm">
                      {(testResult.instructions.nextSteps || testResult.instructions).map((step: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-muted-foreground">•</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {/* Error Details */}
              {!testResult.success && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2 text-red-600">Error Details</h3>
                    <div className="bg-red-50 p-3 rounded-lg text-sm">
                      <div className="font-medium text-red-800">{testResult.error}</div>
                      
                      {testResult.troubleshooting && (
                        <div className="mt-2">
                          <div className="font-medium text-red-800">Troubleshooting Steps:</div>
                          <ul className="list-disc list-inside ml-2 text-red-700">
                            {testResult.troubleshooting.map((step: string, idx: number) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Raw Response (for debugging) */}
              <details className="text-xs">
                <summary className="cursor-pointer font-medium">Raw Response (Debug)</summary>
                <pre className="bg-muted p-2 rounded mt-2 overflow-auto">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </details>
            </CardContent>
          </Card>
        )}

        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
            <CardDescription>
              How to set up Long Life Token authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-medium">1. Generate Invite Code</div>
                <div className="text-muted-foreground ml-4">
                  Go to <a href="https://beds24.com/control3.php?pagetype=apiv2" target="_blank" className="text-blue-600 underline">
                    Beds24 API Management
                  </a> and create an invite code with READ,WRITE scopes
                </div>
              </div>
              
              <div>
                <div className="font-medium">2. Convert to Token</div>
                <div className="text-muted-foreground ml-4">
                  Use our <a href="/invite-to-token" className="text-blue-600 underline">
                    Invite to Token converter
                  </a> to get your Long Life Token
                </div>
              </div>
              
              <div>
                <div className="font-medium">3. Set Environment Variable</div>
                <div className="text-muted-foreground ml-4">
                  Add <code className="bg-muted px-1 rounded">BEDS24_LONG_LIFE_TOKEN=your_token_here</code> to your .env.local
                </div>
              </div>
              
              <div>
                <div className="font-medium">4. Test</div>
                <div className="text-muted-foreground ml-4">
                  Run the test above to verify everything works
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
