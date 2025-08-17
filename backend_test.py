#!/usr/bin/env python3
"""
Backend API Testing Suite for King of Gambler ($KOG) Landing Page
Tests all backend endpoints using the production-configured external URL.
"""

import requests
import json
import sys
from typing import Dict, Any
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get the backend URL from frontend environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://kog-memecoin.preview.emergentagent.com')
BASE_API_URL = f"{BACKEND_URL}/api"

print(f"Testing backend at: {BASE_API_URL}")

class BackendTester:
    def __init__(self):
        self.test_results = []
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })

    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details
        })

    def test_root_endpoint(self):
        """Test GET /api/ returns Hello World"""
        try:
            response = self.session.get(f"{BASE_API_URL}/")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('message') == 'Hello World':
                    self.log_test("GET /api/ root endpoint", True, "Returns correct Hello World message")
                    return True
                else:
                    self.log_test("GET /api/ root endpoint", False, f"Wrong message: {data}")
                    return False
            else:
                self.log_test("GET /api/ root endpoint", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("GET /api/ root endpoint", False, f"Exception: {str(e)}")
            return False

    def test_get_content_seeded_defaults(self):
        """Test GET /api/content returns seeded defaults with correct schema"""
        try:
            response = self.session.get(f"{BASE_API_URL}/content")
            
            if response.status_code != 200:
                self.log_test("GET /api/content seeded defaults", False, f"HTTP {response.status_code}: {response.text}")
                return False
            
            data = response.json()
            
            # Check for Mongo _id leaks
            if '_id' in data:
                self.log_test("GET /api/content seeded defaults", False, "Mongo _id field leaked in response")
                return False
            
            # Verify required top-level fields
            required_fields = ['hero', 'tokenomics', 'howToBuy', 'roadmap', 'faqs', 'config']
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                self.log_test("GET /api/content seeded defaults", False, f"Missing fields: {missing_fields}")
                return False
            
            # Verify hero structure
            hero = data.get('hero', {})
            hero_required = ['title', 'ticker', 'subtitle', 'ctas']
            hero_missing = [field for field in hero_required if field not in hero]
            if hero_missing:
                self.log_test("GET /api/content seeded defaults", False, f"Missing hero fields: {hero_missing}")
                return False
            
            # Check hero values match defaults
            if hero.get('title') != 'KING OF GAMBLER' or hero.get('ticker') != '$KOG':
                self.log_test("GET /api/content seeded defaults", False, "Hero title/ticker don't match defaults")
                return False
            
            # Verify ctas structure
            ctas = hero.get('ctas', {})
            cta_fields = ['dexUrl', 'telegram', 'twitter']
            cta_missing = [field for field in cta_fields if field not in ctas]
            if cta_missing:
                self.log_test("GET /api/content seeded defaults", False, f"Missing CTA fields: {cta_missing}")
                return False
            
            # Verify tokenomics is array with correct structure
            tokenomics = data.get('tokenomics', [])
            if not isinstance(tokenomics, list) or len(tokenomics) != 4:
                self.log_test("GET /api/content seeded defaults", False, f"Tokenomics should be array of 4 items, got {len(tokenomics)}")
                return False
            
            # Check first tokenomics item structure
            if tokenomics:
                token_item = tokenomics[0]
                token_required = ['label', 'value', 'note']
                token_missing = [field for field in token_required if field not in token_item]
                if token_missing:
                    self.log_test("GET /api/content seeded defaults", False, f"Missing tokenomics fields: {token_missing}")
                    return False
            
            # Verify howToBuy is array
            how_to_buy = data.get('howToBuy', [])
            if not isinstance(how_to_buy, list) or len(how_to_buy) != 4:
                self.log_test("GET /api/content seeded defaults", False, f"HowToBuy should be array of 4 steps, got {len(how_to_buy)}")
                return False
            
            # Verify roadmap is array
            roadmap = data.get('roadmap', [])
            if not isinstance(roadmap, list) or len(roadmap) != 3:
                self.log_test("GET /api/content seeded defaults", False, f"Roadmap should be array of 3 sections, got {len(roadmap)}")
                return False
            
            # Verify faqs is array
            faqs = data.get('faqs', [])
            if not isinstance(faqs, list) or len(faqs) != 4:
                self.log_test("GET /api/content seeded defaults", False, f"FAQs should be array of 4 items, got {len(faqs)}")
                return False
            
            # Verify config structure
            config = data.get('config', {})
            if 'contractAddress' not in config:
                self.log_test("GET /api/content seeded defaults", False, "Missing contractAddress in config")
                return False
            
            self.log_test("GET /api/content seeded defaults", True, "All required fields present with correct structure")
            return True
            
        except Exception as e:
            self.log_test("GET /api/content seeded defaults", False, f"Exception: {str(e)}")
            return False

    def test_put_content_persistence(self):
        """Test PUT /api/content updates and persistence"""
        try:
            # First get current content
            get_response = self.session.get(f"{BASE_API_URL}/content")
            if get_response.status_code != 200:
                self.log_test("PUT /api/content persistence", False, "Failed to get initial content")
                return False
            
            current_data = get_response.json()
            
            # Update config.contractAddress and hero.ctas.dexUrl
            updated_data = current_data.copy()
            updated_data['config']['contractAddress'] = '0xABCDEF1234567890'
            updated_data['hero']['ctas']['dexUrl'] = 'https://dex.example.com/kog'
            
            # Send PUT request
            put_response = self.session.put(f"{BASE_API_URL}/content", json=updated_data)
            
            if put_response.status_code != 200:
                self.log_test("PUT /api/content persistence", False, f"PUT failed with HTTP {put_response.status_code}: {put_response.text}")
                return False
            
            put_data = put_response.json()
            
            # Verify PUT response has updated values
            if put_data.get('config', {}).get('contractAddress') != '0xABCDEF1234567890':
                self.log_test("PUT /api/content persistence", False, "PUT response doesn't show updated contractAddress")
                return False
            
            if put_data.get('hero', {}).get('ctas', {}).get('dexUrl') != 'https://dex.example.com/kog':
                self.log_test("PUT /api/content persistence", False, "PUT response doesn't show updated dexUrl")
                return False
            
            # Now GET again to verify persistence
            verify_response = self.session.get(f"{BASE_API_URL}/content")
            if verify_response.status_code != 200:
                self.log_test("PUT /api/content persistence", False, "Failed to verify persistence with GET")
                return False
            
            verify_data = verify_response.json()
            
            # Check persistence
            if verify_data.get('config', {}).get('contractAddress') != '0xABCDEF1234567890':
                self.log_test("PUT /api/content persistence", False, "contractAddress not persisted")
                return False
            
            if verify_data.get('hero', {}).get('ctas', {}).get('dexUrl') != 'https://dex.example.com/kog':
                self.log_test("PUT /api/content persistence", False, "dexUrl not persisted")
                return False
            
            # Check no _id leak
            if '_id' in verify_data:
                self.log_test("PUT /api/content persistence", False, "Mongo _id leaked after update")
                return False
            
            self.log_test("PUT /api/content persistence", True, "Updates persisted correctly without _id leaks")
            return True
            
        except Exception as e:
            self.log_test("PUT /api/content persistence", False, f"Exception: {str(e)}")
            return False

    def test_status_endpoints(self):
        """Test POST /api/status and GET /api/status"""
        try:
            # POST a new status check
            test_payload = {"client_name": "tester"}
            post_response = self.session.post(f"{BASE_API_URL}/status", json=test_payload)
            
            if post_response.status_code != 200:
                self.log_test("POST /api/status", False, f"HTTP {post_response.status_code}: {post_response.text}")
                return False
            
            post_data = post_response.json()
            
            # Verify POST response structure
            required_fields = ['id', 'client_name', 'timestamp']
            missing_fields = [field for field in required_fields if field not in post_data]
            if missing_fields:
                self.log_test("POST /api/status", False, f"Missing fields in response: {missing_fields}")
                return False
            
            if post_data.get('client_name') != 'tester':
                self.log_test("POST /api/status", False, f"Wrong client_name: {post_data.get('client_name')}")
                return False
            
            # Check no _id leak
            if '_id' in post_data:
                self.log_test("POST /api/status", False, "Mongo _id leaked in POST response")
                return False
            
            created_id = post_data.get('id')
            
            # Now GET all status checks
            get_response = self.session.get(f"{BASE_API_URL}/status")
            
            if get_response.status_code != 200:
                self.log_test("GET /api/status", False, f"HTTP {get_response.status_code}: {get_response.text}")
                return False
            
            get_data = get_response.json()
            
            if not isinstance(get_data, list):
                self.log_test("GET /api/status", False, "Response should be an array")
                return False
            
            # Find our created entry
            found_entry = None
            for entry in get_data:
                if entry.get('id') == created_id:
                    found_entry = entry
                    break
            
            if not found_entry:
                self.log_test("GET /api/status", False, "Created status check not found in GET response")
                return False
            
            # Verify entry structure
            entry_missing = [field for field in required_fields if field not in found_entry]
            if entry_missing:
                self.log_test("GET /api/status", False, f"Missing fields in GET entry: {entry_missing}")
                return False
            
            # Check no _id leak in any entry
            for entry in get_data:
                if '_id' in entry:
                    self.log_test("GET /api/status", False, "Mongo _id leaked in GET response")
                    return False
            
            self.log_test("Status endpoints (POST + GET)", True, "Both endpoints work correctly without _id leaks")
            return True
            
        except Exception as e:
            self.log_test("Status endpoints (POST + GET)", False, f"Exception: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 60)
        print("BACKEND API TESTING SUITE")
        print("=" * 60)
        
        tests = [
            self.test_root_endpoint,
            self.test_get_content_seeded_defaults,
            self.test_put_content_persistence,
            self.test_status_endpoints
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if test():
                passed += 1
            print()  # Add spacing between tests
        
        print("=" * 60)
        print(f"RESULTS: {passed}/{total} tests passed")
        print("=" * 60)
        
        return passed == total

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)