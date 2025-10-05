#!/usr/bin/env node

/**
 * Test script to check Beds24 availability API response
 * Run: node test-availability-api.js
 */

const apartment = 'lite-apartman';
const checkIn = '2025-10-01';
const checkOut = '2025-10-31';

const url = `http://localhost:3000/api/beds24/availability?apartment=${apartment}&checkIn=${checkIn}&checkOut=${checkOut}&guests=2&children=0`;

console.log('🔍 Testing Beds24 Availability API');
console.log('URL:', url);
console.log('');

fetch(url)
  .then(response => {
    console.log('📡 Response status:', response.status, response.statusText);
    return response.json();
  })
  .then(data => {
    console.log('');
    console.log('✅ API Response:');
    console.log('================');
    console.log('Success:', data.success);
    console.log('Available dates count:', data.available?.length || 0);
    console.log('Booked dates count:', data.booked?.length || 0);
    console.log('Prices count:', Object.keys(data.prices || {}).length);
    console.log('');
    
    // Check specific date 2025-10-09
    console.log('🔍 Checking 2025-10-09:');
    console.log('  - In available array?', data.available?.includes('2025-10-09'));
    console.log('  - In booked array?', data.booked?.includes('2025-10-09'));
    console.log('  - Has price?', data.prices?.['2025-10-09'] || 'NO PRICE');
    console.log('');
    
    // Check specific date 2025-10-10
    console.log('🔍 Checking 2025-10-10:');
    console.log('  - In available array?', data.available?.includes('2025-10-10'));
    console.log('  - In booked array?', data.booked?.includes('2025-10-10'));
    console.log('  - Has price?', data.prices?.['2025-10-10'] || 'NO PRICE');
    console.log('');
    
    console.log('📋 Booked dates:', data.booked);
    console.log('');
    console.log('💰 Prices for Oct 9-12:');
    for (let day = 9; day <= 12; day++) {
      const date = `2025-10-${day.toString().padStart(2, '0')}`;
      console.log(`  ${date}: €${data.prices?.[date] || 'NO PRICE'}`);
    }
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
  });
