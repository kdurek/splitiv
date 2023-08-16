"use client";

import { CircleDollarSign } from "lucide-react";

export function ExpenseLegend() {
  return (
    <div className="border p-4">
      <div className="grid grid-cols-3">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto bg-blue-100 grid place-content-center">
            <CircleDollarSign className="text-blue-500" />
          </div>
          <div className="mt-2">Nic nie spłacone</div>
        </div>

        <div className="text-center">
          <div className="w-10 h-10 mx-auto bg-yellow-100 grid place-content-center">
            <CircleDollarSign className="text-yellow-500" />
          </div>
          <div className="mt-2">Częściowo spłacone</div>
        </div>

        <div className="text-center">
          <div className="w-10 h-10 mx-auto bg-teal-100 grid place-content-center">
            <CircleDollarSign className="text-teal-500" />
          </div>
          <div className="mt-2">Całość spłacona</div>
        </div>
      </div>
    </div>
  );
}
