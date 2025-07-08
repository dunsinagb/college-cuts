import { NextResponse } from 'next/server';

// Force Node.js runtime to ensure environment variables are accessible
export const runtime = 'nodejs';

export async function GET() {
  const BLS_API_KEY = process.env.BLS_API_KEY;
  
  console.log('🔍 Test BLS API route debugging:');
  console.log('  - process.env.BLS_API_KEY:', BLS_API_KEY ? 'SET' : 'NOT SET');
  console.log('  - process.env keys:', Object.keys(process.env).filter(key => key.includes('BLS')));
  console.log(`🔑 BLS API Key (first 6): ${BLS_API_KEY ? BLS_API_KEY.slice(0, 6) : 'NOT SET'}`);
  
  return NextResponse.json({
    blsApiKeySet: !!BLS_API_KEY,
    blsApiKeyFirst6: BLS_API_KEY ? BLS_API_KEY.slice(0, 6) : 'NOT SET',
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('BLS'))
  });
} 