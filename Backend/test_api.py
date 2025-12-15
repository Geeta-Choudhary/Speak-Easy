#!/usr/bin/env python3
"""
Basic test script for the Speech-to-Text API
Usage: python test_api.py
"""

import requests
import json

BASE_URL = 'http://localhost:5000'


def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing health check endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data['status']}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed. Make sure the API server is running.")
        return False
    except Exception as e:
        print(f"❌ Health check error: {str(e)}")
        return False


def test_supported_languages():
    """Test the supported languages endpoint"""
    print("\n🌍 Testing supported languages endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/supported-languages")
        if response.status_code == 200:
            data = response.json()
            if data['success']:
                print(f"✅ Found {len(data['data'])} supported languages")
                print("📋 Available languages:")
                for lang in data['data'][:5]:  # Show first 5
                    print(f"   - {lang['code']}: {lang['name']}")
                if len(data['data']) > 5:
                    print(f"   ... and {len(data['data']) - 5} more")
                return True
            else:
                print("❌ Languages endpoint returned error")
                return False
        else:
            print(f"❌ Languages endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Languages endpoint error: {str(e)}")
        return False


def test_speech_endpoint_no_file():
    """Test the speech endpoint without file (should fail)"""
    print("\n🎤 Testing speech endpoint without audio file...")
    try:
        response = requests.post(f"{BASE_URL}/api/speech-to-text")
        if response.status_code == 400:
            data = response.json()
            print(f"✅ Correctly rejected request without audio: {data['error']['message']}")
            return True
        else:
            print(f"❌ Expected 400 error but got: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Speech endpoint test error: {str(e)}")
        return False


def test_invalid_endpoint():
    """Test an invalid endpoint"""
    print("\n🚫 Testing invalid endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/invalid-endpoint")
        if response.status_code == 404:
            print("✅ Correctly returned 404 for invalid endpoint")
            return True
        else:
            print(f"❌ Expected 404 but got: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Invalid endpoint test error: {str(e)}")
        return False


def main():
    """Run all tests"""
    print("🧪 VoiceTranscribe API Test Suite")
    print("=" * 40)

    tests = [
        test_health_check,
        test_supported_languages,
        test_speech_endpoint_no_file,
        test_invalid_endpoint
    ]

    passed = 0
    total = len(tests)

    for test in tests:
        if test():
            passed += 1

    print("\n" + "=" * 40)
    print(f"📊 Test Results: {passed}/{total} tests passed")

    if passed == total:
        print("🎉 All tests passed! API is working correctly.")
        print("\n💡 Next steps:")
        print("   - Upload an audio file to test speech-to-text")
        print("   - Integrate with your frontend application")
    else:
        print("⚠️  Some tests failed. Check the API server and configuration.")
        print("\n🔧 Troubleshooting:")
        print("   - Ensure the API server is running (python app.py)")
        print("   - Check your .env file has correct Azure credentials")
        print("   - Verify network connectivity")


if __name__ == '__main__':
    main()