import { Metadata } from 'next';
import { MakeupDashboard } from './MakeupDashboard';

export const metadata: Metadata = {
  title: 'Makeup Try-On | BeautyTryOn',
  description: 'Try on different makeup looks virtually using AI-powered technology',
};

export default function MakeupPage() {
  return <MakeupDashboard />;
}
