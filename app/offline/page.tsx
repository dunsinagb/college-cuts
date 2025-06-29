'use client';
import { WifiOff, Home, Database, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <WifiOff className="mx-auto h-16 w-16 text-gray-400" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">You're Offline</h1>
          <p className="mt-2 text-gray-600">
            Don't worry! You can still access cached content while offline.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Offline</h2>
            <div className="space-y-3">
              <Link 
                href="/"
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Home className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700">Home</span>
                </div>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Cached</span>
              </Link>
              
              <Link 
                href="/cuts"
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700">All Cuts</span>
                </div>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Cached</span>
              </Link>
              
              <Link 
                href="/analytics"
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700">Analytics</span>
                </div>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Cached</span>
              </Link>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">What's Available Offline?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Previously viewed pages</li>
              <li>• Cached data from your last visit</li>
              <li>• Static assets and images</li>
              <li>• Core app functionality</li>
            </ul>
          </div>

          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
} 