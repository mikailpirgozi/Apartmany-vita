'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface TestResult {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
}

interface TestResults {
  connection: TestResult;
  property?: TestResult;
  availability?: TestResult;
}

export default function Beds24TestPage() {
  const [propId, setPropId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TestResults | null>(null);

  const runTests = async () => {
    setIsLoading(true);
    setResults(null);

    try {
      const params = new URLSearchParams();
      if (propId) params.append('propId', propId);
      if (roomId) params.append('roomId', roomId);

      const response = await fetch(`/api/beds24/test?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.results);
      } else {
        setResults({
          connection: {
            success: false,
            message: 'Test failed',
            error: data.error
          }
        });
      }
    } catch (error) {
      setResults({
        connection: {
          success: false,
          message: 'Test failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (result: TestResult) => {
    return (
      <Badge variant={result.success ? 'default' : 'destructive'}>
        {result.success ? 'Success' : 'Failed'}
      </Badge>
    );
  };

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Beds24 API Test</CardTitle>
            <CardDescription>
              Test your Beds24 API connection and functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="propId">Property ID (optional)</Label>
                <Input
                  id="propId"
                  value={propId}
                  onChange={(e) => setPropId(e.target.value)}
                  placeholder="Enter your Beds24 property ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomId">Room ID (optional)</Label>
                <Input
                  id="roomId"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Enter your Beds24 room ID"
                />
              </div>
            </div>

            <Button 
              onClick={runTests} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Testing...' : 'Run Beds24 API Tests'}
            </Button>

            {results && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Test Results</h3>
                
                {/* Connection Test */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">API Connection</CardTitle>
                      {getStatusBadge(results.connection)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      {results.connection.message}
                    </p>
                    {results.connection.error && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          {results.connection.error}
                        </AlertDescription>
                      </Alert>
                    )}
                    {results.connection.data && (
                      <div className="mt-2">
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground">
                            View Response Data
                          </summary>
                          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                            {JSON.stringify(results.connection.data, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Property Test */}
                {results.property && (
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Property Access</CardTitle>
                        {getStatusBadge(results.property)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        {results.property.message}
                      </p>
                      {results.property.error && (
                        <Alert variant="destructive">
                          <AlertDescription>
                            {results.property.error}
                          </AlertDescription>
                        </Alert>
                      )}
                      {results.property.data && (
                        <div className="mt-2">
                          <details className="text-xs">
                            <summary className="cursor-pointer text-muted-foreground">
                              View Property Data
                            </summary>
                            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                              {JSON.stringify(results.property.data, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Availability Test */}
                {results.availability && (
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Room Availability</CardTitle>
                        {getStatusBadge(results.availability)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        {results.availability.message}
                      </p>
                      {results.availability.error && (
                        <Alert variant="destructive">
                          <AlertDescription>
                            {results.availability.error}
                          </AlertDescription>
                        </Alert>
                      )}
                      {results.availability.data && (
                        <div className="mt-2">
                          <details className="text-xs">
                            <summary className="cursor-pointer text-muted-foreground">
                              View Availability Data
                            </summary>
                            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                              {JSON.stringify(results.availability.data, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            <Alert>
              <AlertDescription>
                <strong>API Key:</strong> AbDalfEtyekmentOsVeb<br />
                <strong>Base URL:</strong> https://beds24.com/api/v2<br />
                <strong>Note:</strong> Make sure your Beds24 account has API access enabled and the provided API key has the necessary permissions.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
