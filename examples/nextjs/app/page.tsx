'use client';

import { useEffect, useRef } from 'react';
import type { MvxChart } from 'mivix-ui/components/chart';
import type {} from 'mivix-ui';

export default function Page() {
  const chartRef = useRef<MvxChart | null>(null);

  useEffect(() => {
    void import('mivix-ui/auto');
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.series = [
      { name: 'Adoption', data: [18, 28, 44, 37, 62] },
      { name: 'Usage', data: [12, 22, 31, 48, 58] }
    ];
  }, []);

  return (
    <main>
      <mvx-button type="solid" tone="primary">Deploy</mvx-button>
      <mvx-input label="Project" placeholder="mivix-ui" />
      <mvx-chart ref={chartRef} type="combo" title="Next.js analytics" legend grid />
    </main>
  );
}
