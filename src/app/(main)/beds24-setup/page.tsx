'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Copy, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function Beds24SetupPage() {
  const [apiKey, setApiKey] = useState('VitaAPI2024Mikipiki');
  const [propId, setPropId] = useState('294444');
  const [roomIds, setRoomIds] = useState({
    maly: '615761',
    design: '483027',
    lite: '357932',
    deluxe: '357931'
  });
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    error?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/beds24/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const generateEnvFile = () => {
    const envContent = `# Beds24 API Configuration
BEDS24_API_KEY=${apiKey}
BEDS24_BASE_URL=https://beds24.com/api/v2
BEDS24_PROP_ID=${propId}

# Beds24 Room Mappings
BEDS24_ROOM_MALY=${roomIds.maly}
BEDS24_ROOM_DESIGN=${roomIds.design}
BEDS24_ROOM_LITE=${roomIds.lite}
BEDS24_ROOM_DELUXE=${roomIds.deluxe}

# Other required variables
DATABASE_URL="postgresql://username:password@localhost:5432/apartmany_vita"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
GA_MEASUREMENT_ID=G-XXXXXXXXXX
OPENAI_API_KEY=your_openai_api_key`;

    return envContent;
  };

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Beds24 API Setup
            </CardTitle>
            <CardDescription>
              Nastavenie skutočných Beds24 API údajov pre funkčnú integráciu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Dôležité:</strong> API kľúč &quot;AbDalfEtyekmentOsVeb&quot; nie je skutočný Beds24 API kľúč. 
                Potrebujete skutočné údaje z vašej Beds24 účtu.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Zadajte skutočný Beds24 API kľúč"
                  />
                  <p className="text-xs text-muted-foreground">
                    Nájdete v Beds24 účte: Account → Account Access → API Key 1
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propId">Property ID (propKey)</Label>
                  <Input
                    id="propId"
                    value={propId}
                    onChange={(e) => setPropId(e.target.value)}
                    placeholder="Zadajte Property ID"
                  />
                  <p className="text-xs text-muted-foreground">
                    Nájdete v Beds24 účte: Properties → Access → API Access
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Room IDs</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="roomMaly" className="text-xs">Malý apartmán</Label>
                    <Input
                      id="roomMaly"
                      value={roomIds.maly}
                      onChange={(e) => setRoomIds(prev => ({ ...prev, maly: e.target.value }))}
                      placeholder="Room ID"
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="roomDesign" className="text-xs">Design apartmán</Label>
                    <Input
                      id="roomDesign"
                      value={roomIds.design}
                      onChange={(e) => setRoomIds(prev => ({ ...prev, design: e.target.value }))}
                      placeholder="Room ID"
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="roomLite" className="text-xs">Lite apartmán</Label>
                    <Input
                      id="roomLite"
                      value={roomIds.lite}
                      onChange={(e) => setRoomIds(prev => ({ ...prev, lite: e.target.value }))}
                      placeholder="Room ID"
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="roomDeluxe" className="text-xs">Deluxe apartmán</Label>
                    <Input
                      id="roomDeluxe"
                      value={roomIds.deluxe}
                      onChange={(e) => setRoomIds(prev => ({ ...prev, deluxe: e.target.value }))}
                      placeholder="Room ID"
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={testConnection} disabled={isLoading}>
                {isLoading ? 'Testujem...' : 'Testovať pripojenie'}
              </Button>
            </div>

            {testResult && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Výsledok testu</CardTitle>
                    <Badge variant={testResult.success ? 'default' : 'destructive'}>
                      {testResult.success ? 'Úspech' : 'Chyba'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {testResult.message}
                  </p>
                  {testResult.error && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        {testResult.error}
                      </AlertDescription>
                    </Alert>
                  )}
                  {testResult.success && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        API pripojenie funguje správne!
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment súbor (.env.local)</CardTitle>
            <CardDescription>
              Skopírujte tento obsah do súboru .env.local v root priečinku aplikácie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-muted p-4 rounded text-xs overflow-auto">
                {generateEnvFile()}
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(generateEnvFile())}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kroky na získanie Beds24 API údajov</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">1</Badge>
                <div>
                  <p className="font-medium">Prihláste sa do Beds24 účtu</p>
                  <p className="text-sm text-muted-foreground">
                    Choďte na <a href="https://beds24.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">beds24.com</a> a prihláste sa
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">2</Badge>
                <div>
                  <p className="font-medium">Získajte API Key</p>
                  <p className="text-sm text-muted-foreground">
                    Account → Account Access → API Key 1 → zadajte kľúč a uložte
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">3</Badge>
                <div>
                  <p className="font-medium">Získajte Property ID</p>
                  <p className="text-sm text-muted-foreground">
                    Properties → Access → API Access → propKey
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">4</Badge>
                <div>
                  <p className="font-medium">Získajte Room IDs</p>
                  <p className="text-sm text-muted-foreground">
                    Properties → Rooms → každá izba má svoj Room ID
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">5</Badge>
                <div>
                  <p className="font-medium">Nastavte IP prístup</p>
                  <p className="text-sm text-muted-foreground">
                    Account → Account Access → API Key 1 → &quot;allow any IP&quot; alebo pridajte vašu IP
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
