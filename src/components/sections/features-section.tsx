import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Star, Users } from 'lucide-react'

export function FeaturesSection() {
  const features = [
    {
      icon: MapPin,
      title: 'Výborná poloha',
      description: 'Priamo na Štúrovom námestí v historickom centre Trenčína'
    },
    {
      icon: Star,
      title: 'Luxusné vybavenie',
      description: 'Moderne zariadené apartmány s kompletným vybavením'
    },
    {
      icon: Users,
      title: 'Osobný prístup',
      description: '24/7 podpora a individuálny prístup ku každému hosťovi'
    }
  ]

  return (
    <section className="py-16">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Prečo si vybrať Apartmány Vita?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ponúkame vám komfort a pohodlie v srdci Trenčína s výnimočnými službami
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="text-center p-6">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}