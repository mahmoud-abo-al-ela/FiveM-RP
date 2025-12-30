import { Metadata } from 'next'

interface PageSEOProps {
  title: string
  description: string
  path: string
  image?: string
  noindex?: boolean
}

export function generatePageMetadata({
  title,
  description,
  path,
  image = '/Logos/logo.png',
  noindex = false,
}: PageSEOProps): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const url = `${baseUrl}${path}`

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'LEGACY RP',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    robots: noindex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
  }
}
