import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
	title: 'Chiya and Puff | Admin & Ordering',
	description: 'Premium Restaurant Management System',
	manifest: '/manifest.json',
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
	themeColor: '#FF5A5F',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
		>
			<body>
				<ThemeProvider
					attribute="data-theme"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					{children}
				</ThemeProvider>
				<Analytics />
			</body>
		</html>
	);
}
