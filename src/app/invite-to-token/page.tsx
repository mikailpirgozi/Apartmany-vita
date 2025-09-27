'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TokenData {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: string | number;
}

interface TokenResult {
  success: boolean;
  data?: TokenData;
  error?: string;
}

export default function InviteToTokenPage() {
  const [inviteCode, setInviteCode] = useState('');
  const [result, setResult] = useState<TokenResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convertToToken = async () => {
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/beds24/invite-to-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inviteCode })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Conversion failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Beds24 Invite Code to Token Converter</CardTitle>
          <CardDescription>
            Convert your Beds24 invite code to access and refresh tokens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Invite Code Input */}
          <div className="space-y-2">
            <Label htmlFor="invite-code">Invite Code</Label>
            <Input
              id="invite-code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter your Beds24 invite code"
              className="font-mono"
            />
            <p className="text-sm text-muted-foreground">
              Paste your invite code from Beds24 dashboard here
            </p>
          </div>

          {/* Convert Button */}
          <Button 
            onClick={convertToToken} 
            disabled={loading || !inviteCode.trim()}
            className="w-full"
          >
            {loading ? 'Converting...' : 'Convert to Token'}
          </Button>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Conversion Results</h3>
              
              {result.data && (
                <div className="space-y-4">
                  {/* Access Token */}
                  <div className="space-y-2">
                    <Label>Access Token (Use this as BEDS24_LONG_LIFE_TOKEN)</Label>
                    <div className="flex gap-2">
                      <Textarea
                        value={result.data.accessToken || 'No access token received'}
                        readOnly
                        className="font-mono text-sm min-h-[100px]"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(result.data?.accessToken || '')}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>

                  {/* Refresh Token */}
                  <div className="space-y-2">
                    <Label>Refresh Token</Label>
                    <div className="flex gap-2">
                      <Textarea
                        value={result.data.refreshToken || 'No refresh token received'}
                        readOnly
                        className="font-mono text-sm min-h-[60px]"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(result.data?.refreshToken || '')}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>

                  {/* Expires In */}
                  {result.data.expiresIn && (
                    <div className="space-y-2">
                      <Label>Expires In</Label>
                      <Input
                        value={String(result.data.expiresIn)}
                        readOnly
                        className="font-mono"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Full Response */}
              <div className="space-y-2">
                <Label>Full Response</Label>
                <Textarea
                  value={JSON.stringify(result, null, 2)}
                  readOnly
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-4 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold">Instructions:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Copy your invite code from Beds24 dashboard</li>
              <li>Paste it in the input field above</li>
              <li>Click &quot;Convert to Token&quot;</li>
              <li>Copy the Access Token and use it as BEDS24_LONG_LIFE_TOKEN in your .env.local</li>
              <li>Test the new token with the V2 API</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
