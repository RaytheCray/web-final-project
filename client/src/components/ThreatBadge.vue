<script setup>
defineProps({ level: String })
</script>

<template>
  <span class="badge" :class="level?.toLowerCase()">{{ level || 'Unknown' }}</span>
</template>

<style scoped>
.badge {
  display: inline-block;
  padding: 0.2rem 0.7rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #30363d;
  color: #8b949e;
}

.badge.safe    { background: #1a4a2e; color: #3fb950; }
.badge.suspicious { background: #4a3800; color: #d29922; }
.badge.malicious  { background: #4a1a1a; color: #f85149; }
</style>
