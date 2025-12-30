export function StructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LEGACY RP',
    description: 'Experience the next generation of FiveM roleplay. Custom framework, player-driven economy, and infinite possibilities.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/Logos/logo.png`,
    sameAs: [
      // Add your social media links here
      // 'https://discord.gg/yourserver',
      // 'https://twitter.com/legacyrp',
      // 'https://www.youtube.com/@legacyrp',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: 'English',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
