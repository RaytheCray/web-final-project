<script setup>
import { ref, onMounted } from 'vue'
import { getWatchlist, updateIP, deleteIP } from '../api.js'
import ThreatBadge from '../components/ThreatBadge.vue'

const entries = ref([])
const loading = ref(true)

// Track which row is being edited and its draft values
const editingId = ref(null)
const draft = ref({ threatLevel: '', notes: '' })

onMounted(async () => {
  entries.value = await getWatchlist()
  loading.value = false
})

function startEdit(entry) {
  editingId.value = entry.id
  draft.value = { threatLevel: entry.threatLevel, notes: entry.notes }
}

function cancelEdit() {
  editingId.value = null
}

async function saveEdit(entry) {
  const updated = await updateIP(entry.id, draft.value)
  const idx = entries.value.findIndex(e => e.id === entry.id)
  entries.value[idx] = updated
  editingId.value = null
}

async function remove(id) {
  if (!confirm('Remove this IP from your watchlist?')) return
  await deleteIP(id)
  entries.value = entries.value.filter(e => e.id !== id)
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="watchlist-page">
    <div class="page-header">
      <h2>Watchlist</h2>
      <span class="count">{{ entries.length }} {{ entries.length === 1 ? 'entry' : 'entries' }}</span>
    </div>

    <div v-if="loading" class="status-msg">Loading...</div>

    <div v-else-if="entries.length === 0" class="empty-state">
      <p>Your watchlist is empty.</p>
      <p>Look up an IP address and save it to start tracking.</p>
      <RouterLink to="/" class="btn-primary">Go to Lookup</RouterLink>
    </div>

    <div v-else class="table-wrap">
      <table class="watchlist-table">
        <thead>
          <tr>
            <th>IP Address</th>
            <th>Location</th>
            <th>ISP</th>
            <th>Flags</th>
            <th>Threat</th>
            <th>Notes</th>
            <th>Saved</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in entries" :key="entry.id">
            <td class="mono">{{ entry.ip }}</td>
            <td>{{ entry.city }}, {{ entry.countryCode }}</td>
            <td class="isp-cell">{{ entry.isp }}</td>

            <td>
              <span v-if="entry.isProxy" class="flag flag-warn" title="Proxy / VPN">P</span>
              <span v-if="entry.isHosting" class="flag flag-info" title="Hosting / Datacenter">H</span>
              <span v-if="!entry.isProxy && !entry.isHosting" class="flag flag-ok">&#10003;</span>
            </td>

            <!-- Threat level: editable -->
            <td>
              <template v-if="editingId === entry.id">
                <select v-model="draft.threatLevel" class="select-input">
                  <option>Unknown</option>
                  <option>Safe</option>
                  <option>Suspicious</option>
                  <option>Malicious</option>
                </select>
              </template>
              <ThreatBadge v-else :level="entry.threatLevel" />
            </td>

            <!-- Notes: editable -->
            <td class="notes-cell">
              <template v-if="editingId === entry.id">
                <textarea v-model="draft.notes" class="notes-input" rows="2"></textarea>
              </template>
              <span v-else class="notes-text">{{ entry.notes || '—' }}</span>
            </td>

            <td class="date-cell">{{ formatDate(entry.savedAt) }}</td>

            <!-- Actions -->
            <td class="actions-cell">
              <template v-if="editingId === entry.id">
                <button class="btn-save" @click="saveEdit(entry)">Save</button>
                <button class="btn-cancel" @click="cancelEdit">Cancel</button>
              </template>
              <template v-else>
                <button class="btn-edit" @click="startEdit(entry)">Edit</button>
                <button class="btn-delete" @click="remove(entry.id)">Delete</button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.watchlist-page { display: flex; flex-direction: column; gap: 1.2rem; }

.page-header { display: flex; align-items: baseline; gap: 1rem; }
.page-header h2 { font-size: 1.5rem; color: #c9d1d9; }
.count { color: #8b949e; font-size: 0.9rem; }

.status-msg { color: #8b949e; text-align: center; padding: 3rem; }

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #8b949e;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: center;
}

.btn-primary {
  margin-top: 0.6rem;
  padding: 0.6rem 1.4rem;
  background: #1f6feb;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.15s;
}
.btn-primary:hover { background: #388bfd; }

.table-wrap { overflow-x: auto; }

.watchlist-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}

.watchlist-table th {
  background: #161b22;
  color: #8b949e;
  font-weight: 600;
  padding: 0.6rem 0.8rem;
  text-align: left;
  border-bottom: 1px solid #30363d;
  white-space: nowrap;
}

.watchlist-table td {
  padding: 0.65rem 0.8rem;
  border-bottom: 1px solid #21262d;
  vertical-align: middle;
  color: #c9d1d9;
}

.watchlist-table tr:hover td { background: #161b22; }

.mono { font-family: monospace; color: #58a6ff; font-size: 0.92rem; }

.isp-cell { max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.flag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  margin-right: 2px;
}
.flag-ok   { background: #1a4a2e; color: #3fb950; }
.flag-warn { background: #4a1a1a; color: #f85149; }
.flag-info { background: #1a2d4a; color: #58a6ff; }

.notes-cell { max-width: 200px; }
.notes-text { color: #8b949e; font-size: 0.85rem; white-space: pre-wrap; }

.date-cell { white-space: nowrap; color: #8b949e; font-size: 0.82rem; }

.select-input {
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  color: #c9d1d9;
  padding: 0.3rem 0.5rem;
  font-size: 0.85rem;
  outline: none;
}

.notes-input {
  width: 100%;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  color: #c9d1d9;
  padding: 0.35rem 0.5rem;
  font-size: 0.85rem;
  font-family: inherit;
  resize: vertical;
  outline: none;
}

.actions-cell { display: flex; gap: 0.4rem; white-space: nowrap; }

.btn-edit, .btn-delete, .btn-save, .btn-cancel {
  padding: 0.3rem 0.7rem;
  border: 1px solid;
  border-radius: 5px;
  font-size: 0.8rem;
  cursor: pointer;
  background: none;
  transition: background 0.15s;
}

.btn-edit   { border-color: #30363d; color: #c9d1d9; }
.btn-edit:hover { background: #21262d; }

.btn-delete { border-color: #4a1a1a; color: #f85149; }
.btn-delete:hover { background: #4a1a1a; }

.btn-save   { border-color: #1a4a2e; color: #3fb950; }
.btn-save:hover { background: #1a4a2e; }

.btn-cancel { border-color: #30363d; color: #8b949e; }
.btn-cancel:hover { background: #21262d; }
</style>
