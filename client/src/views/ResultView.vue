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
const isPrivate = ref(false)
const isReserved = ref(false)

const notes = ref('')
const threatLevel = ref('Unknown')
const saving = ref(false)
const saved = ref(false)

function getPrivateRangeInfo(ip) {
  const parts = ip.split('.').map(Number)
  if (parts[0] === 10)
    return { range: '10.0.0.0/8', label: 'Class A Private' }
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
    return { range: '172.16.0.0/12', label: 'Class B Private' }
  if (parts[0] === 192 && parts[1] === 168)
    return { range: '192.168.0.0/16', label: 'Class C Private' }
  return { range: 'Private', label: 'Private' }
}

function getReservedRangeInfo(ip) {
  const parts = ip.split('.').map(Number)
  if (parts[0] === 127)
    return { range: '127.0.0.0/8', label: 'Loopback', rfc: 'RFC 1122', desc: 'Traffic sent to this address loops back to the same machine without touching the network. Used by applications to communicate with themselves.' }
  if (parts[0] === 0)
    return { range: '0.0.0.0/8', label: 'This Network', rfc: 'RFC 1122', desc: 'Represents an unknown or unspecified source address. Devices use it before they have been assigned an IP address (e.g. during DHCP negotiation).' }
  if (parts[0] === 169 && parts[1] === 254)
    return { range: '169.254.0.0/16', label: 'Link-Local', rfc: 'RFC 3927', desc: 'Automatically assigned when a device cannot reach a DHCP server. Only valid between devices on the same physical network segment and not routed beyond it.' }
  if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127)
    return { range: '100.64.0.0/10', label: 'Shared Address Space', rfc: 'RFC 6598', desc: 'Used by internet service providers for carrier-grade NAT — a layer of address translation between the ISP and the customer. Not reachable from the public internet.' }
  if (parts[0] >= 224 && parts[0] <= 239)
    return { range: '224.0.0.0/4', label: 'Multicast', rfc: 'RFC 1112', desc: 'Reserved for one-to-many communication. Routers and network protocols use this range to send packets to multiple subscribers simultaneously (e.g. streaming, routing protocols).' }
  if (parts[0] >= 240)
    return { range: '240.0.0.0/4', label: 'Reserved for Future Use', rfc: 'RFC 1112', desc: 'Set aside by IANA for potential future protocols. These addresses have never been publicly allocated and are not routable on the internet.' }
  if (ip === '255.255.255.255')
    return { range: '255.255.255.255/32', label: 'Limited Broadcast', rfc: 'RFC 919', desc: 'The limited broadcast address. Packets sent here are delivered to all hosts on the local network segment but are never forwarded by routers.' }
  if (parts[0] === 192 && parts[1] === 0 && parts[2] === 2)
    return { range: '192.0.2.0/24', label: 'Documentation (TEST-NET-1)', rfc: 'RFC 5737', desc: 'Reserved exclusively for use in documentation, textbooks, and examples. These addresses must never appear in real network traffic.' }
  if (parts[0] === 198 && parts[1] === 51 && parts[2] === 100)
    return { range: '198.51.100.0/24', label: 'Documentation (TEST-NET-2)', rfc: 'RFC 5737', desc: 'Reserved exclusively for use in documentation, textbooks, and examples. These addresses must never appear in real network traffic.' }
  if (parts[0] === 203 && parts[1] === 0 && parts[2] === 113)
    return { range: '203.0.113.0/24', label: 'Documentation (TEST-NET-3)', rfc: 'RFC 5737', desc: 'Reserved exclusively for use in documentation, textbooks, and examples. These addresses must never appear in real network traffic.' }
  return { range: 'Reserved', label: 'Reserved', rfc: 'RFC 6890', desc: 'This address falls within a range reserved by IANA for special purposes. It is not assigned to any public entity and cannot be tracked or geolocated.' }
}

const privateRangeInfo = ref(null)
const reservedRangeInfo = ref(null)

onMounted(async () => {
  try {
    const result = await lookupIP(route.params.ip)
    if (result.status === 'fail') {
      if (result.message === 'private range') {
        isPrivate.value = true
        privateRangeInfo.value = getPrivateRangeInfo(route.params.ip)
      } else if (result.message === 'reserved range') {
        isReserved.value = true
        reservedRangeInfo.value = getReservedRangeInfo(route.params.ip)
      } else {
        lookupError.value = result.message || 'Invalid IP address.'
      }
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

    <div v-else-if="isPrivate" class="private-panel">
      <div class="private-icon">&#127968;</div>
      <div class="private-body">
        <h2 class="private-title">Private IP Address</h2>
        <p class="private-ip">{{ route.params.ip }}</p>
        <span class="private-badge">{{ privateRangeInfo.label }} &mdash; {{ privateRangeInfo.range }}</span>

        <p class="private-desc">
          This IP address belongs to a <strong>private address range</strong> defined by
          <a href="https://datatracker.ietf.org/doc/html/rfc1918" target="_blank" rel="noopener">RFC 1918</a>.
          Private IPs are used exclusively within local networks — home routers, office LANs, and internal
          infrastructure — and are never routed over the public internet.
        </p>

        <div class="private-reasons">
          <div class="reason">
            <span class="reason-icon">&#128683;</span>
            <div>
              <strong>Not publicly routable</strong>
              <p>Internet service providers drop packets destined for private ranges. These addresses only exist inside a local network.</p>
            </div>
          </div>
          <div class="reason">
            <span class="reason-icon">&#128100;</span>
            <div>
              <strong>Could be anyone</strong>
              <p>Millions of devices share the same private address space. <span class="mono">192.168.1.1</span> is a common home router address used by hundreds of millions of households.</p>
            </div>
          </div>
          <div class="reason">
            <span class="reason-icon">&#128204;</span>
            <div>
              <strong>No geolocation data</strong>
              <p>Geolocation databases map IPs to physical locations using public registration records. Private IPs have no such records.</p>
            </div>
          </div>
        </div>

        <p class="private-tip">
          If you saw this IP in a log, it originated from a device on the <em>same local network</em> as the server — not from the internet.
        </p>
      </div>
    </div>

    <div v-else-if="isReserved" class="reserved-panel">
      <div class="reserved-icon">&#128736;</div>
      <div class="reserved-body">
        <h2 class="reserved-title">Reserved IP Address</h2>
        <p class="reserved-ip">{{ route.params.ip }}</p>
        <span class="reserved-badge">{{ reservedRangeInfo.label }} &mdash; {{ reservedRangeInfo.range }}</span>

        <p class="reserved-desc">
          This IP address falls within a <strong>reserved address range</strong> ({{ reservedRangeInfo.rfc }}).
          Reserved ranges are set aside by IANA — the authority that manages global IP allocation — for
          special technical purposes. They are never assigned to any organization or individual and
          cannot be tracked or geolocated.
        </p>

        <div class="reserved-highlight">
          <span class="highlight-label">What this range is used for</span>
          <p>{{ reservedRangeInfo.desc }}</p>
        </div>

        <div class="reserved-reasons">
          <div class="reason">
            <span class="reason-icon">&#128683;</span>
            <div>
              <strong>Not internet-routable</strong>
              <p>Routers on the public internet will never forward packets to or from reserved addresses. They only function within their specific intended context.</p>
            </div>
          </div>
          <div class="reason">
            <span class="reason-icon">&#128204;</span>
            <div>
              <strong>No geolocation records</strong>
              <p>Geolocation databases only contain entries for publicly assigned IPs. Reserved ranges have no owner, ISP, or physical location on record.</p>
            </div>
          </div>
          <div class="reason">
            <span class="reason-icon">&#128220;</span>
            <div>
              <strong>Governed by IANA</strong>
              <p>The Internet Assigned Numbers Authority (IANA) maintains the Special-Purpose Address Registry, which defines exactly what each reserved block is allowed to be used for.</p>
            </div>
          </div>
        </div>

        <p class="reserved-tip">
          If you encountered this address in a log or packet capture, it was generated locally by the
          operating system or a network protocol — <em>not</em> by a remote host on the internet.
        </p>
      </div>
    </div>

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

/* Private range panel */
.private-panel {
  display: flex;
  gap: 1.5rem;
  background: #161b22;
  border: 1px solid #d29922;
  border-radius: 12px;
  padding: 2rem;
}

.private-icon { font-size: 2.8rem; flex-shrink: 0; line-height: 1; }

.private-body { display: flex; flex-direction: column; gap: 0.9rem; }

.private-title { font-size: 1.5rem; color: #d29922; }

.private-ip { font-family: monospace; font-size: 1.1rem; color: #58a6ff; }

.private-badge {
  display: inline-block;
  background: #4a3800;
  color: #d29922;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.2rem 0.75rem;
  border-radius: 999px;
  letter-spacing: 0.04em;
  width: fit-content;
}

.private-desc {
  color: #c9d1d9;
  font-size: 0.92rem;
  line-height: 1.65;
  max-width: 620px;
}

.private-desc a { color: #58a6ff; text-decoration: underline; }

.private-reasons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-top: 1px solid #30363d;
  padding-top: 0.9rem;
}

.reason {
  display: flex;
  gap: 0.8rem;
  align-items: flex-start;
}

.reason-icon { font-size: 1.1rem; flex-shrink: 0; margin-top: 0.05rem; }

.reason strong { display: block; color: #c9d1d9; font-size: 0.9rem; margin-bottom: 0.2rem; }

.reason p { color: #8b949e; font-size: 0.85rem; line-height: 1.5; margin: 0; }

.private-tip {
  background: #21262d;
  border-left: 3px solid #d29922;
  padding: 0.7rem 1rem;
  border-radius: 0 6px 6px 0;
  color: #8b949e;
  font-size: 0.87rem;
  line-height: 1.5;
}

.mono { font-family: monospace; }

@media (max-width: 600px) {
  .private-panel { flex-direction: column; }
  .private-icon { font-size: 2rem; }
}

/* Reserved range panel */
.reserved-panel {
  display: flex;
  gap: 1.5rem;
  background: #161b22;
  border: 1px solid #58a6ff;
  border-radius: 12px;
  padding: 2rem;
}

.reserved-icon { font-size: 2.8rem; flex-shrink: 0; line-height: 1; }

.reserved-body { display: flex; flex-direction: column; gap: 0.9rem; }

.reserved-title { font-size: 1.5rem; color: #58a6ff; }

.reserved-ip { font-family: monospace; font-size: 1.1rem; color: #58a6ff; }

.reserved-badge {
  display: inline-block;
  background: #1a2d4a;
  color: #58a6ff;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.2rem 0.75rem;
  border-radius: 999px;
  letter-spacing: 0.04em;
  width: fit-content;
}

.reserved-desc {
  color: #c9d1d9;
  font-size: 0.92rem;
  line-height: 1.65;
  max-width: 620px;
}

.reserved-highlight {
  background: #1a2d4a;
  border-left: 3px solid #58a6ff;
  border-radius: 0 6px 6px 0;
  padding: 0.8rem 1rem;
}

.highlight-label {
  display: block;
  color: #58a6ff;
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.35rem;
}

.reserved-highlight p {
  color: #c9d1d9;
  font-size: 0.88rem;
  line-height: 1.55;
  margin: 0;
}

.reserved-reasons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-top: 1px solid #30363d;
  padding-top: 0.9rem;
}

.reserved-tip {
  background: #21262d;
  border-left: 3px solid #58a6ff;
  padding: 0.7rem 1rem;
  border-radius: 0 6px 6px 0;
  color: #8b949e;
  font-size: 0.87rem;
  line-height: 1.5;
}

@media (max-width: 600px) {
  .reserved-panel { flex-direction: column; }
  .reserved-icon { font-size: 2rem; }
}
</style>
