'use client';

import { AIProductSearch } from '@/components/AIProductSearch';

export default function AIProductSearchPage() {
  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className=" mx-auto">

        <div className="h-[100vh]">
          <AIProductSearch
            config={{
              maxMessages: 50,
              enableProductSelection: true,
              showTimestamps: true,
              enableClearChat: true,
            }}
            onProductSelect={(product) => {
              console.log('Product selected:', product);
            }}
          />
        </div>
      </div>
    </div>
  );
}