
// src/components/tricky-offer-card.tsx
import type { DetectTrickyOffersOutput } from "@/ai/flows/detect-tricky-offers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgePercent, AlertCircle, Lightbulb } from "lucide-react";

type TrickyOffer = DetectTrickyOffersOutput[0];

interface TrickyOfferCardProps {
  offer: TrickyOffer;
}

export function TrickyOfferCard({ offer }: TrickyOfferCardProps) {
  return (
    <Card className="border-l-4 border-rose-500 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
      <CardHeader className="pb-3 pt-5">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-full bg-rose-500/10 mt-0.5">
            <BadgePercent className="h-6 w-6 text-rose-500" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-card-foreground">Potentially Tricky Offer</CardTitle>
            {offer.offerText && (
                <CardDescription className="text-sm text-muted-foreground mt-1 italic">
                    "{offer.offerText}"
                </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-5 space-y-3">
        <div className="flex items-start gap-2.5 text-sm ml-1">
          <AlertCircle className="h-4 w-4 mt-0.5 text-rose-500/90 shrink-0" />
          <div>
            <h4 className="font-medium text-card-foreground">Concern:</h4>
            <p className="text-muted-foreground leading-relaxed">{offer.concern}</p>
          </div>
        </div>
         <div className="flex items-start gap-2.5 text-sm ml-1">
          <Lightbulb className="h-4 w-4 mt-0.5 text-amber-500/90 shrink-0" />
          <div>
            <h4 className="font-medium text-card-foreground">Advice:</h4>
            <p className="text-muted-foreground leading-relaxed">{offer.advice}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
