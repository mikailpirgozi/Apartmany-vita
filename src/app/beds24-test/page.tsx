'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';

interface TestResult {
  success: boolean;
  data?: unknown;
  error?: string;
  timestamp: string;
}

export default function Beds24TestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState('357931'); // Deluxe room ID
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2025-01-07');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  // Use server-side API endpoints to avoid CORS issues

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [result, ...prev]);
  };

  const runTest = async (testName: string, testFunction: () => Promise<unknown>) => {
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      console.log(`🧪 Running test: ${testName}`);
      const data = await testFunction();
      const duration = Date.now() - startTime;
      
      addTestResult({
        success: true,
        data: data,
        timestamp: new Date().toLocaleTimeString()
      });
      
      console.log(`✅ Test ${testName} completed in ${duration}ms:`, data);
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      addTestResult({
        success: false,
        error: errorMessage,
        timestamp: new Date().toLocaleTimeString()
      });
      
      console.error(`❌ Test ${testName} failed in ${duration}ms:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get property ID based on selected room
  const getPropertyId = (roomId: string) => {
    const roomMapping: Record<string, string> = {
      '357931': '161445', // Deluxe
      '357932': '168900', // Lite  
      '483027': '227484'  // Design
    };
    return roomMapping[roomId] || '161445'; // Default to Deluxe
  };

  const testProperties = () => runTest('Properties API', async () => {
    const propId = getPropertyId(selectedRoomId);
    const response = await fetch(`/api/beds24/test-properties?propId=${propId}&includeAllRooms=true`);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return response.json();
  });

  const testCalendar = () => runTest('Calendar API', async () => {
    const propId = getPropertyId(selectedRoomId);
    const response = await fetch(`/api/beds24/test-calendar?propId=${propId}&roomId=${selectedRoomId}&startDate=${startDate}&endDate=${endDate}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return response.json();
  });

  const testOffers = () => runTest('Offers API', async () => {
    const propId = getPropertyId(selectedRoomId);
    const response = await fetch(`/api/beds24/test-offers?propId=${propId}&roomId=${selectedRoomId}&startDate=${startDate}&endDate=${endDate}&adults=${adults}&children=${children}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return response.json();
  });

  const testBookings = () => runTest('Bookings API', async () => {
    const propId = getPropertyId(selectedRoomId);
    const response = await fetch(`/api/beds24/test-bookings?propId=${propId}&roomId=${selectedRoomId}&startDate=${startDate}&endDate=${endDate}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return response.json();
  });

  const testAvailability = () => runTest('Availability (with guests)', async () => {
    const propId = getPropertyId(selectedRoomId);
    const response = await fetch(`/api/beds24/test-availability?propId=${propId}&roomId=${selectedRoomId}&startDate=${startDate}&endDate=${endDate}&adults=${adults}&children=${children}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return response.json();
  });

  const testAvailabilityCalendar = () => runTest('Availability (calendar mode)', async () => {
    const propId = getPropertyId(selectedRoomId);
    const response = await fetch(`/api/beds24/test-availability?propId=${propId}&roomId=${selectedRoomId}&startDate=${startDate}&endDate=${endDate}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return response.json();
  });

  const testRoomPrices = () => runTest('Room Prices from Beds24', async () => {
    const propId = getPropertyId(selectedRoomId);
    const response = await fetch(`/api/beds24/test-room-prices?roomId=${selectedRoomId}&propId=${propId}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return response.json();
  });

  const testMinimumPrice = () => runTest('Minimum Price', async () => {
    const propId = getPropertyId(selectedRoomId);
    const response = await fetch(`/api/beds24/test-minimum-price?roomId=${selectedRoomId}&propId=${propId}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return response.json();
  });

  const runAllTests = async () => {
    await testProperties();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
    await testCalendar();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testOffers();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testBookings();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testAvailability();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testAvailabilityCalendar();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testRoomPrices();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testMinimumPrice();
  };

  const runComprehensiveTest = () => runTest('Comprehensive Test', async () => {
    const propId = getPropertyId(selectedRoomId);
    const response = await fetch(`/api/beds24/comprehensive-test?propId=${propId}&roomId=${selectedRoomId}&startDate=${startDate}&endDate=${endDate}&adults=${adults}&children=${children}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return response.json();
  });

  const runComparisonTest = () => runTest('Raw vs Processed Comparison', async () => {
    const propId = getPropertyId(selectedRoomId);
    const response = await fetch(`/api/beds24/test-comparison?propId=${propId}&roomId=${selectedRoomId}&startDate=${startDate}&endDate=${endDate}&adults=${adults}&children=${children}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return response.json();
  });

  const runBlockedDatesTest = () => runTest('Blocked Dates Analysis', async () => {
    const propId = getPropertyId(selectedRoomId);
    const response = await fetch(`/api/beds24/test-blocked-dates?propId=${propId}&roomId=${selectedRoomId}&startDate=${startDate}&endDate=${endDate}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return response.json();
  });

  const runParsingDebugTest = () => runTest('Parsing Debug Analysis', async () => {
    const propId = getPropertyId(selectedRoomId);
    const response = await fetch(`/api/beds24/test-parsing-debug?propId=${propId}&roomId=${selectedRoomId}&startDate=${startDate}&endDate=${endDate}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return response.json();
  });

  const runBookingsOnlyTest = () => runTest('Bookings API Only (with reservations)', async () => {
    const propId = getPropertyId(selectedRoomId);
    const response = await fetch(`/api/beds24/test-bookings?propId=${propId}&roomId=${selectedRoomId}&startDate=${startDate}&endDate=${endDate}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return response.json();
  });

  const clearResults = () => setTestResults([]);

  const roomOptions = [
    { id: '357931', name: 'Deluxe (Property: 161445)', price: 0 },
    { id: '357932', name: 'Lite (Property: 168900)', price: 0 },
    { id: '483027', name: 'Design (Property: 227484)', price: 0 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Beds24 API Test Suite
          </h1>
          <p className="text-gray-600 mb-6">
            Testovacia sekcia pre presné testovanie Beds24 API komunikácie
          </p>
          
          {/* Important Notice */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Dôležité:</strong> Calendar API neobsahuje rezervácie, len manuálne blokované dátumy. 
                  Pre testovanie skutočných rezervácií použite <strong>&quot;Bookings API&quot;</strong> alebo <strong>&quot;Raw vs Processed&quot;</strong> test.
                </p>
              </div>
            </div>
          </div>

          {/* Test Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apartmán
              </label>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {roomOptions.map(room => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Začiatok
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Koniec
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hostia (dospelí/deti)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={adults}
                  onChange={(e) => setAdults(parseInt(e.target.value) || 2)}
                  min="1"
                  max="10"
                  className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Dospelí"
                />
                <input
                  type="number"
                  value={children}
                  onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                  min="0"
                  max="10"
                  className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Deti"
                />
              </div>
            </div>
          </div>

          {/* Test Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            <button
              onClick={testProperties}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Properties
            </button>
            <button
              onClick={testCalendar}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Calendar
            </button>
            <button
              onClick={testOffers}
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Offers
            </button>
            <button
              onClick={testBookings}
              disabled={isLoading}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Bookings
            </button>
            <button
              onClick={testAvailability}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Availability
            </button>
            <button
              onClick={testAvailabilityCalendar}
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Calendar Mode
            </button>
            <button
              onClick={testRoomPrices}
              disabled={isLoading}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Room Prices
            </button>
            <button
              onClick={testMinimumPrice}
              disabled={isLoading}
              className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Min Price
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={runAllTests}
              disabled={isLoading}
              className="px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Testujem...' : 'Spustiť všetky testy'}
            </button>
            <button
              onClick={runComprehensiveTest}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-800 text-white rounded-md hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Testujem...' : 'Comprehensive Test'}
            </button>
            <button
              onClick={runComparisonTest}
              disabled={isLoading}
              className="px-6 py-3 bg-purple-800 text-white rounded-md hover:bg-purple-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Testujem...' : 'Raw vs Processed'}
            </button>
            <button
              onClick={runBlockedDatesTest}
              disabled={isLoading}
              className="px-6 py-3 bg-red-800 text-white rounded-md hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Testujem...' : 'Blocked Dates'}
            </button>
            <button
              onClick={runParsingDebugTest}
              disabled={isLoading}
              className="px-6 py-3 bg-indigo-800 text-white rounded-md hover:bg-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Testujem...' : 'Parsing Debug'}
            </button>
            <button
              onClick={runBookingsOnlyTest}
              disabled={isLoading}
              className="px-6 py-3 bg-emerald-800 text-white rounded-md hover:bg-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Testujem...' : 'Bookings API'}
            </button>
            <button
              onClick={clearResults}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Vymazať výsledky
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="space-y-4">
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                result.success
                  ? 'bg-green-50 border-green-400'
                  : 'bg-red-50 border-red-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className={`font-medium ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.success ? '✅ Úspech' : '❌ Chyba'} - {result.timestamp}
                </h3>
              </div>
              
              {result.success ? (
                <div className="text-sm text-green-700">
                  {(result.data as any)?.data?.rawCalendar || (result.data as any)?.data?.rawBookings || (result.data as any)?.data?.comparison || (result.data as any)?.data?.parsingAnalysis ? (
                    // Comparison test results - show side by side
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Raw Calendar */}
                        {(result.data as any)?.data?.rawCalendar && (
                          <div className="bg-blue-50 p-3 rounded border">
                            <h4 className="font-semibold text-blue-800 mb-2">📅 Raw Calendar API</h4>
                            <div className="text-xs">
                              <div className="mb-2">
                                <span className="font-medium">Status:</span> {(result.data as any)?.data?.rawCalendar.status}
                              </div>
                              <pre className="bg-white p-2 rounded border overflow-auto max-h-64 text-xs">
                                {JSON.stringify((result.data as any)?.data?.rawCalendar.data, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}

                        {/* Processed Calendar */}
                        {(result.data as any)?.data?.processedCalendar && (
                          <div className="bg-green-50 p-3 rounded border">
                            <h4 className="font-semibold text-green-800 mb-2">📅 Processed Calendar</h4>
                            <div className="text-xs">
                              <div className="mb-2">
                                <span className="font-medium">Available:</span> {(result.data as any)?.data?.processedCalendar.data?.available?.length || 0} dates
                              </div>
                              <div className="mb-2">
                                <span className="font-medium">Booked:</span> {(result.data as any)?.data?.processedCalendar.data?.booked?.length || 0} dates
                              </div>
                              <pre className="bg-white p-2 rounded border overflow-auto max-h-64 text-xs">
                                {JSON.stringify((result.data as any)?.data?.processedCalendar.data, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}

                        {/* Raw Bookings */}
                        {(result.data as any)?.data?.rawBookings && (
                          <div className="bg-orange-50 p-3 rounded border">
                            <h4 className="font-semibold text-orange-800 mb-2">📋 Raw Bookings API</h4>
                            <div className="text-xs">
                              <div className="mb-2">
                                <span className="font-medium">Status:</span> {(result.data as any)?.data?.rawBookings.status}
                              </div>
                              <pre className="bg-white p-2 rounded border overflow-auto max-h-64 text-xs">
                                {JSON.stringify((result.data as any)?.data?.rawBookings.data, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}

                        {/* Processed Bookings */}
                        {(result.data as any)?.data?.processedBookings && (
                          <div className="bg-purple-50 p-3 rounded border">
                            <h4 className="font-semibold text-purple-800 mb-2">📋 Processed Bookings</h4>
                            <div className="text-xs">
                              <div className="mb-2">
                                <span className="font-medium">Available:</span> {(result.data as any)?.data?.processedBookings.data?.available?.length || 0} dates
                              </div>
                              <div className="mb-2">
                                <span className="font-medium">Booked:</span> {(result.data as any)?.data?.processedBookings.data?.booked?.length || 0} dates
                              </div>
                              <pre className="bg-white p-2 rounded border overflow-auto max-h-64 text-xs">
                                {JSON.stringify((result.data as any)?.data?.processedBookings.data, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}

                        {/* Raw Offers */}
                        {(result.data as any)?.data?.rawOffers && (
                          <div className="bg-yellow-50 p-3 rounded border">
                            <h4 className="font-semibold text-yellow-800 mb-2">💰 Raw Offers API</h4>
                            <div className="text-xs">
                              <div className="mb-2">
                                <span className="font-medium">Status:</span> {(result.data as any)?.data?.rawOffers.status}
                              </div>
                              <pre className="bg-white p-2 rounded border overflow-auto max-h-64 text-xs">
                                {JSON.stringify((result.data as any)?.data?.rawOffers.data, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}

                        {/* Processed Offers */}
                        {(result.data as any)?.data?.processedOffers && (
                          <div className="bg-pink-50 p-3 rounded border">
                            <h4 className="font-semibold text-pink-800 mb-2">💰 Processed Offers</h4>
                            <div className="text-xs">
                              <div className="mb-2">
                                <span className="font-medium">Available:</span> {(result.data as any)?.data?.processedOffers.data?.available?.length || 0} dates
                              </div>
                              <div className="mb-2">
                                <span className="font-medium">Booked:</span> {(result.data as any)?.data?.processedOffers.data?.booked?.length || 0} dates
                              </div>
                              <pre className="bg-white p-2 rounded border overflow-auto max-h-64 text-xs">
                                {JSON.stringify((result.data as any)?.data?.processedOffers.data, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Blocked Dates Analysis */}
                      {(result.data as any)?.data?.rawCalendar?.analysis && (
                        <div className="bg-red-50 p-3 rounded border">
                          <h4 className="font-semibold text-red-800 mb-2">🚫 Blocked Dates Analysis</h4>
                          <div className="text-xs space-y-2">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="font-medium">Total Dates:</span> {(result.data as any)?.data?.rawCalendar.analysis.totalDates}
                              </div>
                              <div>
                                <span className="font-medium">Available:</span> {(result.data as any)?.data?.rawCalendar.analysis.availableDates}
                              </div>
                              <div>
                                <span className="font-medium">Blocked:</span> {(result.data as any)?.data?.rawCalendar.analysis.blockedDates}
                              </div>
                              <div>
                                <span className="font-medium">Zero Availability:</span> {(result.data as any)?.data?.rawCalendar.analysis.datesWithZeroAvailability.length}
                              </div>
                            </div>
                            
                            {(result.data as any)?.data?.rawCalendar.analysis.datesWithZeroAvailability.length > 0 && (
                              <div>
                                <span className="font-medium">Zero Availability Dates:</span>
                                <div className="bg-white p-2 rounded border mt-1">
                                  {(result.data as any)?.data?.rawCalendar.analysis.datesWithZeroAvailability.join(', ')}
                                </div>
                              </div>
                            )}
                            
                            {(result.data as any)?.data?.rawCalendar.analysis.datesWithFalseAvailability.length > 0 && (
                              <div>
                                <span className="font-medium">False Availability Dates:</span>
                                <div className="bg-white p-2 rounded border mt-1">
                                  {(result.data as any)?.data?.rawCalendar.analysis.datesWithFalseAvailability.join(', ')}
                                </div>
                              </div>
                            )}
                            
                            {(result.data as any)?.data?.rawCalendar.analysis.datesWithStatusBlocked.length > 0 && (
                              <div>
                                <span className="font-medium">Status Blocked Dates:</span>
                                <div className="bg-white p-2 rounded border mt-1">
                                  {(result.data as any)?.data?.rawCalendar.analysis.datesWithStatusBlocked.join(', ')}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Comparison Results */}
                      {(result.data as any)?.data?.comparison && (
                        <div className="bg-yellow-50 p-3 rounded border">
                          <h4 className="font-semibold text-yellow-800 mb-2">⚖️ Comparison Results</h4>
                          <div className="text-xs space-y-1">
                            <div><span className="font-medium">Summary:</span> {(result.data as any)?.data?.comparison.summary}</div>
                            {(result.data as any)?.data?.comparison.discrepancies.map((discrepancy: string, index: number) => (
                              <div key={index} className="text-red-600">⚠️ {discrepancy}</div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Parsing Debug Analysis */}
                      {(result.data as any)?.data?.rawData?.parsingAnalysis && (
                        <div className="bg-indigo-50 p-3 rounded border">
                          <h4 className="font-semibold text-indigo-800 mb-2">🔍 Parsing Debug Analysis</h4>
                          <div className="text-xs space-y-3">
                            
                            {/* Step 1: Data Structure */}
                            <div className="bg-white p-2 rounded border">
                              <h5 className="font-medium text-indigo-700 mb-1">Step 1: Data Structure</h5>
                              <div className="space-y-1">
                                <div><span className="font-medium">Has Data:</span> {(result.data as any)?.data?.rawData.parsingAnalysis.step1_dataStructure.hasData ? 'Yes' : 'No'}</div>
                                <div><span className="font-medium">Data Type:</span> {(result.data as any)?.data?.rawData.parsingAnalysis.step1_dataStructure.dataType}</div>
                                <div><span className="font-medium">Data Keys:</span> {(result.data as any)?.data?.rawData.parsingAnalysis.step1_dataStructure.dataKeys?.join(', ') || 'None'}</div>
                                <div><span className="font-medium">Data Length:</span> {(result.data as any)?.data?.rawData.parsingAnalysis.step1_dataStructure.dataLength}</div>
                              </div>
                            </div>

                            {/* Step 2: Calendar Data Extraction */}
                            <div className="bg-white p-2 rounded border">
                              <h5 className="font-medium text-indigo-700 mb-1">Step 2: Calendar Data Extraction</h5>
                              <div className="space-y-1">
                                <div><span className="font-medium">Extraction Method:</span> {(result.data as any)?.data?.rawData.parsingAnalysis.step2_calendarDataExtraction.extractionMethod}</div>
                                <div><span className="font-medium">Calendar Data Length:</span> {(result.data as any)?.data?.rawData.parsingAnalysis.step2_calendarDataExtraction.calendarDataLength}</div>
                              </div>
                            </div>

                            {/* Step 3: Calendar Map Creation */}
                            <div className="bg-white p-2 rounded border">
                              <h5 className="font-medium text-indigo-700 mb-1">Step 3: Calendar Map Creation</h5>
                              <div className="space-y-1">
                                <div><span className="font-medium">Map Size:</span> {(result.data as any)?.data?.rawData.parsingAnalysis.step3_calendarMapCreation.calendarMapSize}</div>
                                <div><span className="font-medium">Blocked Dates in Map:</span> {(result.data as any)?.data?.rawData.parsingAnalysis.step3_calendarMapCreation.blockedDatesInMap?.length || 0}</div>
                                <div><span className="font-medium">Available Dates in Map:</span> {(result.data as any)?.data?.rawData.parsingAnalysis.step3_calendarMapCreation.availableDatesInMap?.length || 0}</div>
                              </div>
                            </div>

                            {/* Step 4: Date Range Generation */}
                            <div className="bg-white p-2 rounded border">
                              <h5 className="font-medium text-indigo-700 mb-1">Step 4: Date Range Generation</h5>
                              <div className="space-y-1">
                                <div><span className="font-medium">Total Dates:</span> {(result.data as any)?.data?.rawData.parsingAnalysis.step4_dateRangeGeneration.totalDates}</div>
                                <div><span className="font-medium">Date Range:</span> {(result.data as any)?.data?.rawData.parsingAnalysis.step4_dateRangeGeneration.allDates?.slice(0, 3).join(', ')}...</div>
                              </div>
                            </div>

                            {/* Step 5: Final Results */}
                            <div className="bg-white p-2 rounded border">
                              <h5 className="font-medium text-indigo-700 mb-1">Step 5: Final Results</h5>
                              <div className="space-y-1">
                                <div><span className="font-medium">Available Count:</span> {(result.data as any)?.data?.rawData.parsingAnalysis.step5_finalResults.availableCount}</div>
                                <div><span className="font-medium">Booked Count:</span> {(result.data as any)?.data?.rawData.parsingAnalysis.step5_finalResults.bookedCount}</div>
                                <div><span className="font-medium">Prices Count:</span> {(result.data as any)?.data?.rawData.parsingAnalysis.step5_finalResults.pricesCount}</div>
                              </div>
                            </div>

                            {/* Step 6: Debugging */}
                            <div className="bg-white p-2 rounded border">
                              <h5 className="font-medium text-indigo-700 mb-1">Step 6: Debugging</h5>
                              <div className="space-y-1">
                                <div><span className="font-medium">Dates with Calendar Data:</span> {(result.data as any)?.data?.rawData.parsingAnalysis.step6_debugging.datesWithCalendarData?.length || 0}</div>
                                <div><span className="font-medium">Dates without Calendar Data:</span> {(result.data as any)?.data?.rawData.parsingAnalysis.step6_debugging.datesWithoutCalendarData?.length || 0}</div>
                                <div><span className="font-medium">Blocked from Calendar:</span> {(result.data as any)?.data?.rawData.parsingAnalysis.step6_debugging.blockedDatesFromCalendar?.length || 0}</div>
                                <div><span className="font-medium">Assumed Available:</span> {(result.data as any)?.data?.rawData.parsingAnalysis.step6_debugging.datesAssumedAvailable?.length || 0}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Summary */}
                      <div className="bg-gray-50 p-3 rounded border">
                        <h4 className="font-semibold text-gray-800 mb-2">📊 Summary</h4>
                        <div className="text-xs space-y-1">
                          <div><span className="font-medium">Test Parameters:</span> {JSON.stringify((result.data as any)?.data?.parameters, null, 2)}</div>
                          <div><span className="font-medium">Timestamp:</span> {(result.data as any)?.data?.timestamp}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Regular test results
                    <pre className="bg-white p-3 rounded border overflow-auto max-h-96">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </div>
              ) : (
                <div className="text-sm text-red-700">
                  <div className="bg-white p-3 rounded border">
                    <strong>Chyba:</strong> {result.error}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {testResults.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Žiadne testy zatiaľ neboli spustené</p>
            <p className="text-sm">Vyberte parametre a spustite testy</p>
          </div>
        )}
      </div>
    </div>
  );
}
