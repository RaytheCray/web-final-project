<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { lookupIP, saveIP } from '../api.js'
import ThreatBadge from '../components/ThreatBadge.vue'

const route = useRoute()
const router = useRouter()

const data = ref(null)
const loading = ref(true)
const lookupError = ref('')

const notes = ref('')
const threatLevel = ref('Unknown')
const saving = ref(false)
const saved = ref(false)

onMounted(async () => {
  try {
    const result = await lookupIP(route.params.ip)
    if (result.status === 'fail') {
      lookupError.value = result.message || 'Invalid IP address.'
    } else {
      data.value = result
    }
  } catch {
    lookupError.value = 'Could not reach the lookup API. Check your connection.'
  } finally {
    loading.value = false
  }
})

async function saveToWatchlist() {
  saving.value = true
  await saveIP({
    ip: data.value.query,
    country: data.value.country,
    countryCode: data.value.countryCode,
    region: data.value.regionName,
    city: data.value.city,
    isp: data.value.isp,
    org: data.value.org,
    isProxy: data.value.proxy,
    isHosting: data.value.hosting,
    threatLevel: threatLevel.value,
    notes: notes.value,
  })
  saving.value = false
  saved.value = true
}
</script>

<template>
  <div class="result-page">
    <button class="back-btn" @click="router.push('/')">&#8592; New Lookup</button>

    <div v-if="loading" class="status-msg">Looking up {{ route.params.ip }}...</div>
    <div v-else-if="lookupError" class="error-msg">{{ lookupError }}</div>

    <template v-else-if="data">
      <h2 class="ip-title">{{ data.query }}</h2>

      <div class="result-grid">
        <div class="info-panel">
          <h3>IP Details</h3>
          <table class="detail-table">
            <tbody>
              <tr><td class="label">Country</td><td>{{ data.country }}</td></tr>
              <tr><td class="label">Region</td><td>{{ data.regionName }}</td></tr>
              <tr><td class="label">City</td><td>{{ data.city }}</td></tr>
              <tr><td class="label">ISP</td><td>{{ data.isp }}</td></tr>
              <tr><td class="label">Organization</td><td>{{ data.org }}</td></tr>
              <tr>
                <td class="label">Proxy / VPN</td>
                <td>
                  <span class="flag" :class="data.proxy ? 'flag-warn' : 'flag-ok'">
                    {{ data.proxy ? 'Yes' : 'No' }}
                  </span>
                </td>
              </tr>
              <tr>
                <td class="label">Hosting / DC</td>
                <td>
                  <span class="flag" :class="data.hosting ? 'flag-warn' : 'flag-ok'">
                    {{ data.hosting ? 'Yes' : 'No' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="save-panel">
          <h3>Save to Watchlist</h3>

          <div v-if="saved" class="saved-msg">
            Saved! <button class="link-btn" @click="router.push('/watchlist')">View Watchlist &#8594;</button>
          </div>

          <template v-else>
            <label class="field-label">Threat Level</label>
            <select v-model="threatLevel" class="select-input">
              <option>Unknown</option>
              <option>Safe</option>
              <option>Suspicious</option>
              <option>Malicious</option>
            </select>
            <div class="badge-preview"><ThreatBadge :level="threatLevel" /></div>

            <label class="field-label">Notes</label>
            <textarea
              v-model="notes"
              class="textarea-input"
              placeholder="Add investigation notes..."
              rows="4"
            ></textarea>

            <button class="btn-primary" :disabled="saving" @click="saveToWatchlist">
              {{ saving ? 'Saving...' : 'Save to Watchlist' }}
            </button>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.result-page { display: flex; flex-direction: column; gap: 1.5rem; }

.back-btn {
  background: none;
  border: 1px solid #30363d;
  color: #8b949e;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  width: fit-content;
  transition: border-color 0.15s, color 0.15s;
}
.back-btn:hover { border-color: #58a6ff; color: #58a6ff; }

.ip-title { font-size: 1.8rem; color: #58a6ff; font-family: monospace; }

.status-msg { color: #8b949e; padding: 2rem; text-align: center; }
.error-msg { color: #f85149; padding: 1rem; }

.result-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
}
@media (max-width: 640px) { .result-grid { grid-template-columns: 1fr; } }

.info-panel, .save-panel {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 10px;
  padding: 1.4rem;
}

h3 { color: #c9d1d9; margin-bottom: 1rem; font-size: 1rem; }

.detail-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.detail-table td { padding: 0.45rem 0; vertical-align: top; }
.detail-table tr + tr td { border-top: 1px solid #21262d; }
.label { color: #8b949e; width: 40%; }

.flag { padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.82rem; font-weight: 600; }
.flag-ok   { background: #1a4a2e; color: #3fb950; }
.flag-warn { background: #4a1a1a; color: #f85149; }

.field-label { display: block; color: #8b949e; font-size: 0.82rem; margin-bottom: 0.4rem; margin-top: 0.9rem; }

.select-input, .textarea-input {
  width: 100%;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  color: #c9d1d9;
  padding: 0.55rem 0.8rem;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.15s;
}
.select-input:focus, .textarea-input:focus { border-color: #58a6ff; }
.textarea-input { resize: vertical; font-family: inherit; }

.badge-preview { margin: 0.5rem 0; }

.btn-primary {
  margin-top: 1rem;
  width: 100%;
  padding: 0.65rem;
  background: #1f6feb;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-primary:hover:not(:disabled) { background: #388bfd; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.saved-msg { color: #3fb950; font-size: 0.95rem; }
.link-btn { background: none; border: none; color: #58a6ff; cursor: pointer; font-size: inherit; text-decoration: underline; }
</style>
