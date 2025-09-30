#!/bin/bash

# Production Verification Script
# Tests if all critical endpoints are working on Vercel production
#
# Usage: ./scripts/verify-production.sh [URL]
# Example: ./scripts/verify-production.sh https://apartmany-vita.vercel.app

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get URL from argument or use default
BASE_URL="${1:-https://apartmany-vita.vercel.app}"

echo -e "${BLUE}🔍 Verifying Production Deployment${NC}"
echo -e "${BLUE}URL: ${BASE_URL}${NC}"
echo ""

# Function to test endpoint
test_endpoint() {
    local endpoint=$1
    local name=$2
    local expected_status=${3:-200}
    
    echo -ne "Testing ${name}..."
    
    response=$(curl -s -w "\n%{http_code}" "${BASE_URL}${endpoint}")
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" -eq "$expected_status" ]; then
        echo -e " ${GREEN}✅ PASS${NC} (${status_code})"
        return 0
    else
        echo -e " ${RED}❌ FAIL${NC} (Expected ${expected_status}, got ${status_code})"
        echo -e "${YELLOW}Response: ${body}${NC}"
        return 1
    fi
}

# Track failures
FAILED=0

# Test homepage
test_endpoint "/" "Homepage" || ((FAILED++))

# Test apartments page
test_endpoint "/apartments" "Apartments List" || ((FAILED++))

# Test specific apartment pages
test_endpoint "/apartments/deluxe-apartman" "Deluxe Apartment" || ((FAILED++))
test_endpoint "/apartments/design-apartman" "Design Apartment" || ((FAILED++))
test_endpoint "/apartments/lite-apartman" "Lite Apartment" || ((FAILED++))

# Test API endpoints
echo ""
echo -e "${BLUE}Testing API Endpoints...${NC}"

test_endpoint "/api/health" "Health Check" || ((FAILED++))

# Test environment variables (if debug enabled)
echo ""
echo -e "${BLUE}Testing Environment Configuration...${NC}"
echo -ne "Checking environment variables..."

env_response=$(curl -s "${BASE_URL}/api/test-env")
env_status=$(echo "$env_response" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

if [ "$env_status" == "READY" ]; then
    echo -e " ${GREEN}✅ READY${NC}"
    
    # Parse details
    ready_for_bookings=$(echo "$env_response" | grep -o '"readyForBookings":[^,}]*' | cut -d':' -f2)
    if [ "$ready_for_bookings" == "true" ]; then
        echo -e "  ${GREEN}✓${NC} Ready for bookings"
    else
        echo -e "  ${YELLOW}⚠${NC}  Not ready for bookings (missing Stripe or Beds24 config)"
        ((FAILED++))
    fi
else
    echo -e " ${RED}❌ NOT_READY${NC}"
    echo -e "${YELLOW}Environment issues detected:${NC}"
    
    # Show critical issues
    issues=$(echo "$env_response" | grep -o '"criticalIssues":\[[^]]*\]' | sed 's/"criticalIssues":\[//;s/\]//' | tr ',' '\n' | sed 's/"//g')
    if [ -n "$issues" ]; then
        echo "$issues" | while read -r issue; do
            [ -n "$issue" ] && echo -e "  ${RED}✗${NC} $issue"
        done
    fi
    ((FAILED++))
fi

# Test database connection (indirectly via apartments API)
echo ""
echo -e "${BLUE}Testing Database Connection...${NC}"
echo -ne "Checking database access..."

db_test=$(curl -s "${BASE_URL}/api/apartments")
if echo "$db_test" | grep -q "apartments"; then
    echo -e " ${GREEN}✅ CONNECTED${NC}"
else
    echo -e " ${RED}❌ FAILED${NC}"
    echo -e "${YELLOW}Response: ${db_test}${NC}"
    ((FAILED++))
fi

# Test Beds24 integration
echo ""
echo -e "${BLUE}Testing Beds24 Integration...${NC}"
echo -ne "Checking Beds24 API..."

# This will test if we can get availability
beds24_test=$(curl -s "${BASE_URL}/api/beds24/availability?propertyId=161445&checkIn=2025-11-01&checkOut=2025-11-03")
if echo "$beds24_test" | grep -q -E '(available|isAvailable|success)'; then
    echo -e " ${GREEN}✅ WORKING${NC}"
else
    echo -e " ${RED}❌ FAILED${NC}"
    echo -e "${YELLOW}Response: ${beds24_test}${NC}"
    ((FAILED++))
fi

# Summary
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo -e "${GREEN}🎉 Production deployment is working correctly!${NC}"
    exit 0
else
    echo -e "${RED}❌ ${FAILED} test(s) failed${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting steps:${NC}"
    echo -e "1. Check Vercel deployment logs"
    echo -e "2. Verify environment variables in Vercel dashboard"
    echo -e "3. Check ${BASE_URL}/api/test-env for configuration details"
    echo -e "4. Read VERCEL_PRODUCTION_FIX.md for detailed instructions"
    exit 1
fi
