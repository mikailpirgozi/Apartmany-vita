'use client'

import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { 
  MessageCircle, 
  Send, 
  Loader2, 
  X, 
  Minimize2,
  Maximize2,
  Bot,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChatMessage, ChatResponse } from '@/services/chatbot'
import { ScrollArea } from '@/components/ui/scroll-area'

async function sendChatMessage(data: {
  message: string
  conversationHistory: ChatMessage[]
  language: string
  sessionId?: string
  userId?: string
}): Promise<ChatResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  
  if (!response.ok) {
    throw new Error('Failed to send message')
  }
  
  return response.json()
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const [, setConversationId] = useState<string | undefined>()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const locale = 'sk' // Default to Slovak for now

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessages = {
        sk: 'Ahoj! Som virtuálny asistent Apartmánov Vita. Môžem vám pomôcť s rezerváciou alebo zodpovedať otázky o našich apartmánoch v Trenčíne. Ako vám môžem pomôcť?',
        en: 'Hello! I\'m the virtual assistant for Vita Apartments. I can help you with booking or answer questions about our apartments in Trenčín. How can I help you?',
        de: 'Hallo! Ich bin der virtuelle Assistent für Vita Apartments. Ich kann Ihnen bei der Buchung helfen oder Fragen zu unseren Apartments in Trenčín beantworten. Wie kann ich Ihnen helfen?',
        hu: 'Szia! A Vita Apartmanok virtuális asszisztense vagyok. Segíthetek a foglalásban vagy válaszolhatok kérdéseire trenčíni apartmanjainkról. Miben segíthetek?',
        pl: 'Cześć! Jestem wirtualnym asystentem Apartamentów Vita. Mogę pomóc w rezerwacji lub odpowiedzieć na pytania o nasze apartamenty w Trenčínie. Jak mogę pomóc?'
      }

      setMessages([{
        id: '1',
        text: welcomeMessages[locale as keyof typeof welcomeMessages] || welcomeMessages.sk,
        isBot: true,
        timestamp: new Date()
      }])
    }
  }, [locale, messages.length])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = useMutation({
    mutationFn: sendChatMessage,
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        id: data.messageId || Date.now().toString(),
        text: data.message,
        isBot: true,
        timestamp: new Date()
      }])
      if (data.conversationId) {
        setConversationId(data.conversationId)
      }
      setIsTyping(false)
    },
    onError: (error) => {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: 'Prepáčte, nastala chyba. Skúste to prosím neskôr alebo nás kontaktujte priamo na +421-900-123-456.',
        isBot: true,
        timestamp: new Date()
      }])
      setIsTyping(false)
    }
  })

  const handleSend = async () => {
    if (!input.trim()) return
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      isBot: false,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)
    
    sendMessage.mutate({
      message: input,
      conversationHistory: messages,
      language: locale,
      sessionId,
      userId: undefined // TODO: Get from auth context
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  // Floating chat button
  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-16 right-6 z-50 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="sr-only">Otvoriť chat</span>
      </Button>
    )
  }

  // Mobile full-screen chat
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-full h-full max-h-screen p-0 gap-0">
          <DialogHeader className="p-4 border-b bg-primary text-primary-foreground">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <Bot className="h-5 w-5" />
                Vita AI Asistent
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col h-[calc(100vh-80px)]">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3 max-w-[85%]",
                      message.isBot ? "justify-start" : "justify-end ml-auto"
                    )}
                  >
                    {message.isBot && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    
                    <div className={cn(
                      "rounded-lg px-3 py-2 text-sm",
                      message.isBot
                        ? "bg-muted text-foreground"
                        : "bg-primary text-primary-foreground"
                    )}>
                      {message.text}
                    </div>
                    
                    {!message.isBot && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Quick suggestions for mobile - inside ScrollArea */}
                {messages.length > 1 && (
                  <div className="pt-2">
                    <div className="flex flex-wrap gap-1">
                      {['Ceny apartmánov', 'Rezervácia', 'Atrakcie v Trenčíne'].map((suggestion) => (
                        <Badge
                          key={suggestion}
                          variant="secondary"
                          className="cursor-pointer hover:bg-secondary/80 text-xs"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t bg-background">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Napíšte vašu otázku..."
                  onKeyPress={handleKeyPress}
                  disabled={sendMessage.isPending}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSend} 
                  disabled={!input.trim() || sendMessage.isPending}
                  size="icon"
                >
                  {sendMessage.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Desktop chat window
  return (
    <Card className={cn(
      "fixed bottom-16 right-6 z-50 w-96 shadow-2xl transition-all duration-200",
      isMinimized ? "h-16" : "h-[600px]"
    )}>
      <CardHeader className="p-4 border-b bg-primary text-primary-foreground">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <Bot className="h-4 w-4" />
            Vita AI Asistent
          </CardTitle>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8 p-0"
            >
              {isMinimized ? (
                <Maximize2 className="h-3 w-3" />
              ) : (
                <Minimize2 className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-[calc(600px-64px)]">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2 max-w-[85%]",
                    message.isBot ? "justify-start" : "justify-end ml-auto"
                  )}
                >
                  {message.isBot && (
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="h-3 w-3 text-primary" />
                    </div>
                  )}
                  
                  <div className={cn(
                    "rounded-lg px-3 py-2 text-sm leading-relaxed",
                    message.isBot
                      ? "bg-muted text-foreground"
                      : "bg-primary text-primary-foreground"
                  )}>
                    {message.text}
                  </div>
                  
                  {!message.isBot && (
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="h-3 w-3 text-primary" />
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                    <Bot className="h-3 w-3 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Quick suggestions - moved inside ScrollArea */}
              {messages.length > 1 && (
                <div className="pt-2">
                  <div className="flex flex-wrap gap-1">
                    {['Ceny apartmánov', 'Rezervácia', 'Atrakcie v Trenčíne'].map((suggestion) => (
                      <Badge
                        key={suggestion}
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary/80 text-xs"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Napíšte vašu otázku..."
                onKeyPress={handleKeyPress}
                disabled={sendMessage.isPending}
                className="text-sm"
              />
              <Button 
                onClick={handleSend} 
                disabled={!input.trim() || sendMessage.isPending}
                size="sm"
              >
                {sendMessage.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
