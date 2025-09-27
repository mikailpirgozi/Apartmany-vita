import { z } from "zod"

// User validation schemas
export const signInSchema = z.object({
  email: z.string().email("Zadajte platný email"),
  password: z.string().min(6, "Heslo musí mať aspoň 6 znakov")
})

export const signUpSchema = z.object({
  name: z.string().min(2, "Meno musí mať aspoň 2 znaky"),
  email: z.string().email("Zadajte platný email"),
  password: z.string().min(6, "Heslo musí mať aspoň 6 znakov"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Heslá sa nezhodujú",
  path: ["confirmPassword"]
})

// Profile validation schema
export const profileSchema = z.object({
  name: z.string().min(2, "Meno musí mať aspoň 2 znaky"),
  email: z.string().email("Zadajte platný email"),
  phone: z.string().optional(),
  dateOfBirth: z.date().optional(),
  preferences: z.object({}).optional()
})

// Booking validation schemas
export const bookingSearchSchema = z.object({
  checkIn: z.date({
    message: "Vyberte dátum príchodu"
  }),
  checkOut: z.date({
    message: "Vyberte dátum odchodu"
  }),
  guests: z.number().min(1, "Minimálne 1 hosť").max(8, "Maximálne 8 hostí"),
  children: z.number().min(0).max(6, "Maximálne 6 detí").default(0)
}).refine((data) => data.checkOut > data.checkIn, {
  message: "Dátum odchodu musí byť po dátume príchodu",
  path: ["checkOut"]
})

export const guestInfoSchema = z.object({
  firstName: z.string().min(2, "Meno musí mať aspoň 2 znaky"),
  lastName: z.string().min(2, "Priezvisko musí mať aspoň 2 znaky"),
  email: z.string().email("Zadajte platný email"),
  phone: z.string().min(9, "Zadajte platné telefónne číslo"),
  specialRequests: z.string().optional()
})

// Newsletter validation schema
export const newsletterSchema = z.object({
  email: z.string().email("Zadajte platný email")
})

// Contact form validation schema
export const contactSchema = z.object({
  name: z.string().min(2, "Meno musí mať aspoň 2 znaky"),
  email: z.string().email("Zadajte platný email"),
  subject: z.string().min(5, "Predmet musí mať aspoň 5 znakov"),
  message: z.string().min(10, "Správa musí mať aspoň 10 znakov")
})

// Types
export type SignInFormData = z.infer<typeof signInSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
export type BookingSearchData = z.infer<typeof bookingSearchSchema>
export type GuestInfoData = z.infer<typeof guestInfoSchema>
export type NewsletterData = z.infer<typeof newsletterSchema>
export type ContactFormData = z.infer<typeof contactSchema>
