import OpenAI from 'openai'
import { prisma } from '@/lib/db'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export interface ChatMessage {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
}

export interface ChatResponse {
  message: string
  suggestions?: string[]
  conversationId?: string
  messageId?: string
}

const SYSTEM_PROMPT = `
Ste virtuálny asistent pre Apartmány Vita v Trenčíne. Ste priateľský, profesionálny a nápomocný.

INFORMÁCIE O APARTMÁNOCH VITA:
- Luxusné apartmány na Štúrovom námestí 132/16, 911 01 Trenčín
- 4 typy apartmánov: Malý (30m², 2 osoby, €45/noc), Design (45m², 4 osoby, €65/noc), Lite (55m², 4 osoby, €75/noc), Deluxe (70m², 6 osôb, €95/noc)
- Všetky apartmány majú: klimatizáciu, WiFi, plne vybavenú kuchyňu, TV, práčku
- Check-in: 15:00, Check-out: 11:00 (flexibilný čas možný)
- 24/7 prístup s elektronickými zámkami
- Parkovanie: verejné parkovisko 50m od apartmánov
- Kontakt: +421-900-123-456, info@apartmanyvita.sk

CENNÍK A ZĽAVY:
- Registrovaní zákazníci: 5% zľava
- Pobyt 7+ nocí: 10% zľava
- Pobyt 14+ nocí: 15% zľava
- Deti do 3 rokov: zadarmo
- Extra posteľ: €15/noc

TRENČÍN - ATRAKCIE:
- Trenčiansky hrad (5 min pešo)
- Mestská veža (2 min pešo)
- Synagóga (3 min pešo)
- Galéria M. A. Bazovského (5 min pešo)
- Reštaurácie: Villa Sophia, Korzo, Meridiana (všetky v okolí)

PRAVIDLÁ:
1. Odpovedajte v slovenčine, pokiaľ sa hosť neopýta v inom jazyku
2. Buďte stručný ale informatívny
3. Vždy ponúknite pomoc s rezerváciou
4. Pri cenových otázkach spomenite zľavy pre registrovaných zákazníkov
5. Ak neviete odpoveď, presmerujte na kontakt

ZAKÁZANÉ:
- Neponúkajte služby ktoré nemáme
- Neslubujte ceny bez overenia dostupnosti
- Nedávajte medicínske alebo právne rady
`

export async function getChatbotResponse(
  message: string,
  conversationHistory: ChatMessage[] = [],
  language: string = 'sk',
  sessionId?: string,
  userId?: string
): Promise<ChatResponse> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        message: 'Prepáčte, chatbot momentálne nie je dostupný. Kontaktujte nás prosím na +421-900-123-456 alebo info@apartmanyvita.sk',
        suggestions: ['Kontaktovať telefonicky', 'Poslať email', 'Rezervovať online']
      }
    }

    // Get or create conversation
    let conversationId: string | undefined
    if (sessionId) {
      const conversation = await prisma.chatConversation.upsert({
        where: { sessionId },
        update: { updatedAt: new Date() },
        create: {
          sessionId,
          userId,
          language
        }
      })
      conversationId = conversation.id
    }

    // Save user message to database
    if (conversationId) {
      await prisma.chatMessage.create({
        data: {
          conversationId,
          text: message,
          isBot: false
        }
      })
    }

    // Build conversation context
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      }
    ]

    // Add conversation history (last 6 messages to keep context manageable)
    const recentHistory = conversationHistory.slice(-6)
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.isBot ? 'assistant' : 'user',
        content: msg.text
      })
    })

    // Add current message
    messages.push({
      role: 'user',
      content: message
    })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 300,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    })

    const response = completion.choices[0]?.message?.content || 
      'Prepáčte, nerozumiem vašej otázke. Môžete ju preformulovať?'

    // Save bot response to database
    let messageId: string | undefined
    if (conversationId) {
      const savedMessage = await prisma.chatMessage.create({
        data: {
          conversationId,
          text: response,
          isBot: true
        }
      })
      messageId = savedMessage.id
    }

    // Generate contextual suggestions based on the response
    const suggestions = generateSuggestions(message)

    return {
      message: response,
      suggestions,
      conversationId,
      messageId
    }

  } catch (error) {
    console.error('Chatbot error:', error)
    
    return {
      message: 'Nastala technická chyba. Prosím kontaktujte nás priamo na +421-900-123-456 alebo info@apartmanyvita.sk',
      suggestions: ['Kontaktovať telefonicky', 'Poslať email', 'Skúsiť neskôr']
    }
  }
}

function generateSuggestions(userMessage: string): string[] {
  const message = userMessage.toLowerCase()

  // Common suggestions based on message content
  if (message.includes('cena') || message.includes('koľko') || message.includes('stojí')) {
    return ['Zobraziť všetky apartmány', 'Informácie o zľavách', 'Rezervovať teraz']
  }

  if (message.includes('rezerv') || message.includes('book')) {
    return ['Začať rezerváciu', 'Zobraziť dostupnosť', 'Kontaktovať nás']
  }

  if (message.includes('apartmán') || message.includes('izba')) {
    return ['Malý apartmán', 'Design apartmán', 'Lite apartmán', 'Deluxe apartmán']
  }

  if (message.includes('trenčín') || message.includes('atrakcie') || message.includes('reštaurácie')) {
    return ['Trenčiansky hrad', 'Reštaurácie v okolí', 'Čo vidieť v Trenčíne']
  }

  if (message.includes('parkovanie') || message.includes('auto')) {
    return ['Informácie o parkovaní', 'Doprava do centra', 'Kontakt']
  }

  // Default suggestions
  return ['Zobraziť apartmány', 'Informácie o cenách', 'Rezervovať pobyt', 'Kontakt']
}

export function getWelcomeMessage(language: string = 'sk'): ChatMessage {
  const messages = {
    sk: 'Ahoj! Som virtuálny asistent Apartmánov Vita. Môžem vám pomôcť s rezerváciou alebo zodpovedať otázky o našich apartmánoch v Trenčíne. Ako vám môžem pomôcť?',
    en: 'Hello! I\'m the virtual assistant for Vita Apartments. I can help you with booking or answer questions about our apartments in Trenčín. How can I help you?',
    de: 'Hallo! Ich bin der virtuelle Assistent für Vita Apartments. Ich kann Ihnen bei der Buchung helfen oder Fragen zu unseren Apartments in Trenčín beantworten. Wie kann ich Ihnen helfen?',
    hu: 'Szia! A Vita Apartmanok virtuális asszisztense vagyok. Segíthetek a foglalásban vagy válaszolhatok kérdéseire trenčíni apartmanjainkról. Miben segíthetek?',
    pl: 'Cześć! Jestem wirtualnym asystentem Apartamentów Vita. Mogę pomóc w rezerwacji lub odpowiedzieć na pytania o nasze apartamenty w Trenčínie. Jak mogę pomóc?'
  }

  return {
    id: '1',
    text: messages[language as keyof typeof messages] || messages.sk,
    isBot: true,
    timestamp: new Date()
  }
}

// Learning functions
export async function saveChatLearning(
  question: string,
  answer: string,
  context: string,
  language: string = 'sk',
  source: 'customer' | 'owner' | 'system' = 'customer'
) {
  try {
    await prisma.chatLearning.create({
      data: {
        question,
        answer,
        context,
        language,
        source,
        isApproved: source === 'owner' // Auto-approve owner inputs
      }
    })
  } catch (error) {
    console.error('Error saving chat learning:', error)
  }
}

export async function getChatLearning(question: string, language: string = 'sk') {
  try {
    const learning = await prisma.chatLearning.findFirst({
      where: {
        question: {
          contains: question,
          mode: 'insensitive'
        },
        language,
        isApproved: true
      },
      orderBy: {
        usageCount: 'desc'
      }
    })
    
    if (learning) {
      // Increment usage count
      await prisma.chatLearning.update({
        where: { id: learning.id },
        data: { usageCount: learning.usageCount + 1 }
      })
      
      return learning
    }
    
    return null
  } catch (error) {
    console.error('Error getting chat learning:', error)
    return null
  }
}

export async function rateChatMessage(
  messageId: string,
  rating: number,
  wasHelpful?: boolean,
  needsImprovement?: string
) {
  try {
    await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        userSatisfaction: rating,
        wasHelpful,
        needsImprovement
      }
    })
  } catch (error) {
    console.error('Error rating chat message:', error)
  }
}
