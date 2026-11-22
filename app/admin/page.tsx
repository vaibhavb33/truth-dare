import { Metadata } from 'next';
import AdminClient from './AdminClient';

export const metadata: Metadata = {
  title: 'Question Database Management | Play Truth & Dare',
  description: 'Internal operations dashboard for question management, deduplication, and catalog operations.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AdminClient />;
}

