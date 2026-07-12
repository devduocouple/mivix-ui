import 'mivix-ui/auto';
import 'mivix-ui/styles';

export default function App() {
  return (
    <main>
      <mvx-button type="solid" tone="primary">Deploy</mvx-button>
      <mvx-input label="Project" placeholder="mivix-ui" />
      <mvx-alert tone="success" title="Ready">Web Components work directly in React.</mvx-alert>
    </main>
  );
}
