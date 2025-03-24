import { NextResponse } from 'next/server';
import cron from 'node-cron';

// Initialize cron job to run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/monitor`, {
      method: 'GET'
    });
  } catch (error) {
    console.error('Failed to run monitoring task:', error);
  }
});

export async function GET() {
  return NextResponse.json({ status: 'Cron job is running' });
}