#!/bin/bash

# OpenAI API Key Validator Script
# This script helps you test your OpenAI API key

echo "🔍 OpenAI API Key Validator"
echo "================================"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found!"
    echo "Please create .env.local with your API key:"
    echo ""
    echo "VITE_OPENAI_API_KEY=sk-proj-your-key-here"
    exit 1
fi

# Extract API key
API_KEY=$(grep VITE_OPENAI_API_KEY .env.local | cut -d '=' -f2 | tr -d ' ')

if [ -z "$API_KEY" ]; then
    echo "❌ VITE_OPENAI_API_KEY not found in .env.local"
    exit 1
fi

echo "✅ API Key found: ${API_KEY:0:15}..."
echo ""
echo "🧪 Testing API key..."
echo ""

# Test the API key
RESPONSE=$(curl -s -w "\n%{http_code}" https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 10
  }')

# Extract HTTP status code (last line)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
# Extract response body (all but last line)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP Status: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ SUCCESS! Your API key works!"
    echo ""
    echo "Response preview:"
    echo "$BODY" | head -c 200
    echo ""
    echo ""
    echo "🎉 Your OpenAI integration is ready!"
    echo "Restart your dev server: npm run dev"
elif [ "$HTTP_CODE" = "401" ]; then
    echo "❌ AUTHENTICATION FAILED (401)"
    echo ""
    echo "Error details:"
    echo "$BODY"
    echo ""
    echo "🔧 How to fix:"
    echo "1. Visit: https://platform.openai.com/api-keys"
    echo "2. Create a new API key"
    echo "3. Make sure it has 'model.request' permission"
    echo "4. Update .env.local with the new key"
    echo "5. Run this script again to verify"
elif [ "$HTTP_CODE" = "429" ]; then
    echo "⚠️ RATE LIMIT EXCEEDED (429)"
    echo ""
    echo "You've hit the rate limit. Wait a moment and try again."
else
    echo "⚠️ UNEXPECTED ERROR ($HTTP_CODE)"
    echo ""
    echo "Response:"
    echo "$BODY"
    echo ""
    echo "Check https://status.openai.com for API status"
fi

echo ""
echo "================================"

