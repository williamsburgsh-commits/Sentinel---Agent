'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white">Sentinel Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage your autonomous price monitors</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create New Sentinel Section */}
          <div>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Create New Sentinel</CardTitle>
                <CardDescription className="text-gray-400">
                  Set up a new price monitoring agent
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Form will go here */}
                <div className="text-gray-500 text-center py-8">
                  Form coming soon...
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Sentinel Section */}
          <div>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Active Sentinel</CardTitle>
                <CardDescription className="text-gray-400">
                  Monitor your current price alert
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Sentinel info will go here */}
                <div className="text-gray-500 text-center py-8">
                  No active sentinel yet
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
