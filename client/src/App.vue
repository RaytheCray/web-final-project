<script setup>
import { RouterView, RouterLink } from 'vue-router'
</script>

<template>
  <header class="navbar">
    <div class="brand">
      <span class="shield">&#9632;</span> IP Tracker
    </div>
    <nav>
      <RouterLink to="/">Lookup</RouterLink>
      <RouterLink to="/watchlist">Watchlist</RouterLink>
    </nav>
  </header>

  <main>
    <RouterView />
  </main>
</template>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: #0d1117;
  color: #c9d1d9;
  font-family: 'Segoe UI', system-ui, sans-serif;
  min-height: 100vh;
}

a { color: inherit; text-decoration: none; }

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  height: 56px;
  background: #161b22;
  border-bottom: 1px solid #30363d;
}

.brand {
  font-size: 1.2rem;
  font-weight: 700;
  color: #58a6ff;
  letter-spacing: 1px;
}

.shield { margin-right: 0.4rem; }

nav { display: flex; gap: 1.5rem; }

nav a {
  font-size: 0.9rem;
  color: #8b949e;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  transition: background 0.15s, color 0.15s;
}

nav a:hover,
nav a.router-link-active {
  background: #21262d;
  color: #c9d1d9;
}

main { padding: 2rem; max-width: 900px; margin: 0 auto; }
</style>
