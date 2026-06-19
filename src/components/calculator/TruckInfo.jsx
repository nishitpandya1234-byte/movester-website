import React from 'react'

// Small chip summarising the crew + truck assigned to the job.
export default function TruckInfo({ workerCount, truckType }) {
  const movers = `${workerCount} ${workerCount === 1 ? 'mover' : 'movers'}`
  return (
    <div className="flex items-center gap-2 rounded-full border border-[#e8e0d0] bg-cream-dark/40 px-4 py-2 text-sm text-[#3A3935] w-fit">
      <span className="text-base">🚛</span>
      <span className="font-medium text-ink">Your job:</span>
      <span className="text-[#3A3935]">{movers} + {truckType}</span>
    </div>
  )
}
