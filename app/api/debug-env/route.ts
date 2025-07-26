import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV,
    // Don't log actual values for security
    jwtSecretLength: process.env.JWT_SECRET?.length || 0,
    databaseUrlLength: process.env.DATABASE_URL?.length || 0,
  });
} 