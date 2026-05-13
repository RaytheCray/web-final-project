<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const ip = ref('')
const error = ref('')

function lookup() {
  const trimmed = ip.value.trim()
  if (!trimmed) {
    error.value = 'Please enter an IP address.'
    return
  }
  error.value = ''
  router.push(`/result/${trimmed}`)
}
</script>

<template>
  <div class="home">
    <div class="hero">
      <h1>IP Reputation Lookup</h1>
      <p>Investigate any IP address — geolocation, ISP, proxy detection, and more.</p>

      <form class="search-form" @submit.prevent="lookup">
        <input
          v-model="ip"
          type="text"
          placeholder="Enter an IP address (e.g. 8.8.8.8)"
          class="search-input"
          autocomplete="off"
          spellcheck="false"
        />
        <button type="submit" class="btn-primary">Look Up</button>
      </form>
      <p v-if="error" class="error-msg">{{ error }}</p>
    </div>

    <div class="info-cards">
      <div class="card">
        <div class="card-icon">&#127760;</div>
        <h3>Geolocation</h3>
        <p>Country, region, and city for any IP address.</p>
      </div>
      <div class="card">
        <div class="card-icon">&#128274;</div>
        <h3>Proxy & VPN Detection</h3>
        <p>Flags IPs known to be proxies, VPNs, or hosting providers.</p>
      </div>
      <div class="card">
        <div class="card-icon">&#128203;</div>
        <h3>Watchlist</h3>
        <p>Save, tag, and annotate IPs you want to track over time.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home { display: flex; flex-direction: column; gap: 3rem; }

.hero {
  text-align: center;
  padding: 3rem 1rem 2rem;
}

.hero h1 {
  font-size: 2rem;
  color: #58a6ff;
  margin-bottom: 0.6rem;
}

.hero p {
  color: #8b949e;
  margin-bottom: 1.8rem;
}

.search-form {
  display: flex;
  gap: 0.6rem;
  max-width: 560px;
  margin: 0 auto;
}

.search-input {
  flex: 1;
  padding: 0.7rem 1rem;
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 8px;
  color: #c9d1d9;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.15s;
}

.search-input:focus { border-color: #58a6ff; }

.btn-primary {
  padding: 0.7rem 1.4rem;
  background: #1f6feb;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-primary:hover { background: #388bfd; }

.error-msg { color: #f85149; margin-top: 0.6rem; font-size: 0.9rem; }

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.card {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 10px;
  padding: 1.5rem;
  text-align: center;
}

.card-icon { font-size: 2rem; margin-bottom: 0.8rem; }

.card h3 { color: #58a6ff; margin-bottom: 0.4rem; }

.card p { color: #8b949e; font-size: 0.9rem; line-height: 1.5; }
</style>
