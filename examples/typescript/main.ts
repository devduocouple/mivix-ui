import 'mivix-ui/auto';
import 'mivix-ui/styles';
import type { MvxChart } from 'mivix-ui/components/chart';
import type {} from 'mivix-ui';

const chart = document.querySelector<MvxChart>('mvx-chart');

if (chart) {
  chart.series = [
    { name: 'Adoption', data: [18, 28, 44, 37, 62] },
    { name: 'Usage', data: [12, 22, 31, 48, 58] }
  ];
}

document.querySelector('mvx-button')?.addEventListener('click', event => {
  console.log('Mivix event', event);
});
