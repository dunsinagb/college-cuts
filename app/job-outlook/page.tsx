import type { Metadata } from 'next';
import { JobOutlook } from '@/components/JobOutlook';

export const metadata: Metadata = {
  title: 'Major → Job Outlook | CollegeCuts',
  description: 'Search for a major to see median pay and 10-year growth for related occupations. Powered by U.S. BLS and O*NET data.',
  keywords: [
    'job outlook',
    'major to career',
    'salary by major',
    'occupation growth',
    'BLS data',
    'career planning',
    'college major salary',
    'job market trends'
  ],
};

export default function JobOutlookPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <JobOutlook />
    </div>
  );
} 