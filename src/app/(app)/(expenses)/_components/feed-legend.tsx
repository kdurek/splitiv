'use client';

import { CircleDollarSign } from 'lucide-react';

export function FeedLegend() {
  return (
    <div className="rounded-md border p-4">
      <div className="grid grid-cols-3">
        <div className="text-center">
          <div className="mx-auto grid size-10 place-content-center rounded-md bg-blue-100">
            <CircleDollarSign className="text-blue-500" />
          </div>
          <div className="mt-2">Nic nie spłacone</div>
        </div>

        <div className="text-center">
          <div className="mx-auto grid size-10 place-content-center rounded-md bg-yellow-100">
            <CircleDollarSign className="text-yellow-500" />
          </div>
          <div className="mt-2">Częściowo spłacone</div>
        </div>

        <div className="text-center">
          <div className="mx-auto grid size-10 place-content-center rounded-md bg-teal-100">
            <CircleDollarSign className="text-teal-500" />
          </div>
          <div className="mt-2">Całość spłacona</div>
        </div>
      </div>
    </div>
  );
}
