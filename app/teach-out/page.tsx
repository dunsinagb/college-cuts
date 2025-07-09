'use client';

import { useState } from 'react';
import { useTeachOut } from '@/hooks/useTeachOut';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, DollarSign, GraduationCap, ExternalLink, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TeachOutPage() {
  const [cip, setCip] = useState('');
  const [state, setState] = useState('');
  const { data, error, isLoading } = useTeachOut(cip, state);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search will trigger automatically when cip changes due to SWR
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Teach-Out Finder
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Find alternative institutions offering your program when your current school cuts it.
          </p>
        </div>

        {/* Info Alert */}
        <Alert className="mb-8">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>How to use:</strong> Enter your program's CIP code to find institutions that offer the same major. 
            CIP codes are 6-digit classification codes (e.g., 52.0201 for Business Administration). 
            Ask your academic advisor or check your program cut details for the CIP code.
          </AlertDescription>
        </Alert>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Find Alternative Programs
            </CardTitle>
            <CardDescription>
              Enter your program's CIP code to find institutions that offer the same major
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Input
                  value={cip}
                  onChange={(e) => setCip(e.target.value)}
                  placeholder="CIP code (e.g. 52.0201 for Business Administration)"
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Find your CIP code in the program cut details or ask your advisor
                </p>
              </div>
              <div className="w-32">
                <Input
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase())}
                  placeholder="State (optional)"
                  maxLength={2}
                  className="w-full"
                />
              </div>
              <Button type="submit" disabled={!cip.trim()}>
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Searching for teach-out options...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-200">
            <CardContent className="py-8">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-muted-foreground">
                Unable to fetch teach-out options. Please try again later.
              </p>
            </CardContent>
          </Card>
        )}

        {data && data.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Found {data.length} Alternative Institutions
              </CardTitle>
              <CardDescription>
                Sorted by affordability (lowest net price first)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3 text-left font-medium">Institution</th>
                      <th className="p-3 text-left font-medium">Location</th>
                      <th className="p-3 text-center font-medium">Net Price</th>
                      <th className="p-3 text-center font-medium">Transfer Rate</th>
                      <th className="p-3 text-center font-medium">% Majors</th>
                      <th className="p-3 text-center font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((school: any) => (
                      <tr key={school.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-3">
                          <div className="font-medium">{school.name}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {school.city}, {school.state}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          {school.net_price ? (
                            <div className="flex items-center justify-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {school.net_price.toLocaleString()}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {school.transfer ? (
                            <Badge variant="secondary">
                              {(school.transfer * 100).toFixed(1)}%
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {school.pct_major ? (
                            <Badge variant="outline">
                              {(school.pct_major * 100).toFixed(1)}%
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {school.url && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <a
                                href={`https://${school.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Visit
                              </a>
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {data && data.length === 0 && cip && !isLoading && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No teach-out options found for CIP code {cip}
                  {state && ` in ${state}`}.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try removing the state filter or check if the CIP code is correct.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Use This Tool</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Finding Your CIP Code</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Check your program cut details page</li>
                  <li>• Ask your academic advisor</li>
                  <li>• Search the NCES CIP code database</li>
                  <li>• Contact your department chair</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Understanding the Results</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Net Price:</strong> Average cost after financial aid</li>
                  <li>• <strong>Transfer Rate:</strong> How many students transfer in</li>
                  <li>• <strong>% Majors:</strong> Students in your field of study</li>
                  <li>• Results are sorted by affordability</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common CIP Codes */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Common CIP Codes</CardTitle>
            <CardDescription>
              Quick reference for popular majors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-3 border rounded-lg">
                <div className="font-medium">Business Administration</div>
                <div className="text-sm text-muted-foreground">52.0201</div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="font-medium">Computer Science</div>
                <div className="text-sm text-muted-foreground">11.0701</div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="font-medium">Psychology</div>
                <div className="text-sm text-muted-foreground">42.0101</div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="font-medium">Nursing</div>
                <div className="text-sm text-muted-foreground">51.3801</div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="font-medium">English</div>
                <div className="text-sm text-muted-foreground">23.0101</div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="font-medium">Economics</div>
                <div className="text-sm text-muted-foreground">45.0601</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 