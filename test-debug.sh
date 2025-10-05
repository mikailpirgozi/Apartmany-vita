#!/bin/bash

echo "🧹 Clearing cache for lite-apartman..."
curl -s "http://localhost:3000/api/beds24/clear-cache?apartment=lite-apartman" | jq

echo ""
echo "⏳ Waiting 2 seconds..."
sleep 2

echo ""
echo "🔍 Testing availability API..."
curl -s "http://localhost:3000/api/beds24/availability?apartment=lite-apartman&checkIn=2025-10-01&checkOut=2025-10-31&guests=2&children=0" | jq '{
  success,
  available_count: (.available | length),
  booked_count: (.booked | length),
  prices_count: (.prices | length),
  is_2025_10_09_available: (.available | contains(["2025-10-09"])),
  is_2025_10_09_booked: (.booked | contains(["2025-10-09"])),
  price_2025_10_09: .prices["2025-10-09"],
  is_2025_10_10_available: (.available | contains(["2025-10-10"])),
  is_2025_10_10_booked: (.booked | contains(["2025-10-10"])),
  price_2025_10_10: .prices["2025-10-10"],
  booked_dates: .booked
}'
