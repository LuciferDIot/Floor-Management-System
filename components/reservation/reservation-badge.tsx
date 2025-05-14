"use client"

import type { ReservationType } from "@/lib/types"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatDate } from "@/lib/utils"

interface ReservationBadgeProps {
  reservation: ReservationType
  chairCount?: number
}

export function ReservationBadge({ reservation, chairCount = 0 }: ReservationBadgeProps) {
  // Use chair count for party size if available
  const displayPartySize = chairCount > 0 ? chairCount : reservation.partySize

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {displayPartySize}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="space-y-1 text-sm">
          <p className="font-medium">{reservation.customerName}</p>
          <p>{formatDate(reservation.time)}</p>
          <p>Party of {displayPartySize}</p>
          {reservation.notes && <p className="text-gray-500">{reservation.notes}</p>}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
