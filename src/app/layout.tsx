import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
	title: 'Chiya and Puff | Nepali Tea & Puff Kitchen',
	description: 'Chiya and Puff — Nepali tea and fresh-baked puff kitchen with QR table ordering.',
	manifest: '/manifest.json',
	icons: { icon: '/logo.svg' },
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
	themeColor: '#C0681D',
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
