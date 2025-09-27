'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Beds24V2TestPage() {
  const [testType, setTestType] = useState('availability');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Booking form state
  const [bookingData, setBookingData] = useState({
    propId: '357931',
    roomId: '357931',
    checkIn: '2024-12-15',
    checkOut: '2024-12-17',
    numAdult: 2,
    numChild: 0,
    guestFirstName: 'Test',
    guestName: 'User',
    guestEmail: 'test@example.com',
    guestPhone: '+421123456789',
    totalPrice: 200
  });

  const runTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/beds24/v2-test?test=${testType}`);
      const data = await response.json();
      
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Test failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const testBooking = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/beds24/v2-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Booking test failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Beds24 API V2 Test</CardTitle>
          <CardDescription>
            Test the new Beds24 API V2 integration with long-life token
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Test Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="test-type">Test Type</Label>
            <Select value={testType} onValueChange={setTestType}>
              <SelectTrigger>
                <SelectValue placeholder="Select test type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="availability">Availability</SelectItem>
                <SelectItem value="rates">Rates</SelectItem>
                <SelectItem value="bookings">Bookings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Run Test Button */}
          <Button 
            onClick={runTest} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Testing...' : `Test ${testType}`}
          </Button>

          {/* Booking Test Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Test Booking Creation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="propId">Property ID</Label>
                <Input
                  id="propId"
                  value={bookingData.propId}
                  onChange={(e) => setBookingData({...bookingData, propId: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="roomId">Room ID</Label>
                <Input
                  id="roomId"
                  value={bookingData.roomId}
                  onChange={(e) => setBookingData({...bookingData, roomId: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="checkIn">Check-in Date</Label>
                <Input
                  id="checkIn"
                  type="date"
                  value={bookingData.checkIn}
                  onChange={(e) => setBookingData({...bookingData, checkIn: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="checkOut">Check-out Date</Label>
                <Input
                  id="checkOut"
                  type="date"
                  value={bookingData.checkOut}
                  onChange={(e) => setBookingData({...bookingData, checkOut: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="guestFirstName">Guest First Name</Label>
                <Input
                  id="guestFirstName"
                  value={bookingData.guestFirstName}
                  onChange={(e) => setBookingData({...bookingData, guestFirstName: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="guestName">Guest Last Name</Label>
                <Input
                  id="guestName"
                  value={bookingData.guestName}
                  onChange={(e) => setBookingData({...bookingData, guestName: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="guestEmail">Guest Email</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  value={bookingData.guestEmail}
                  onChange={(e) => setBookingData({...bookingData, guestEmail: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="totalPrice">Total Price</Label>
                <Input
                  id="totalPrice"
                  type="number"
                  value={bookingData.totalPrice}
                  onChange={(e) => setBookingData({...bookingData, totalPrice: Number(e.target.value)})}
                />
              </div>
            </div>
            
            <Button 
              onClick={testBooking} 
              disabled={loading}
              className="w-full mt-4"
            >
              {loading ? 'Creating Booking...' : 'Test Booking Creation'}
            </Button>
          </div>

          {/* Results */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Test Results</h3>
              <Textarea
                value={JSON.stringify(result, null, 2)}
                readOnly
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
