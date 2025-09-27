// import { notFound } from 'next/navigation'
// import { getRequestConfig } from 'next-intl/server'

// Define supported locales
const locales = ['sk', 'en', 'de', 'hu', 'pl'] as const

export type Locale = typeof locales[number]

// Temporarily disabled next-intl configuration
// export default getRequestConfig(async ({ locale }) => {
//   // Validate that the incoming `locale` parameter is valid
//   if (!locales.includes(locale as any)) notFound()

//   return {
//     messages: (await import(`./messages/${locale}.json`)).default
//   }
// })

// Temporary default export
export default async function getRequestConfig() {
  return {
    messages: {}
  }
}

export { locales }
