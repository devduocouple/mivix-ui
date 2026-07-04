<script setup>
import 'mivix-ui/auto';
import 'mivix-ui/styles';
</script>

<template>
  <main>
    <mvx-button variant="primary">Deploy</mvx-button>
    <mvx-input label="Project" placeholder="mivix-ui" />
    <mvx-alert tone="success" title="Ready">Web Components work directly in Vue.</mvx-alert>
  </main>
</template>
