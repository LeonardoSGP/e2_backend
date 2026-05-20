<template>
  <AppLayout>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem">
      <div>
        <h2 style="font-size:1.875rem;font-weight:800;color:var(--text-primary);letter-spacing:-0.025em">Configuración del Equipo</h2>
        <p style="color:var(--text-muted);font-size:0.875rem;margin-top:0.25rem">Gestiona los integrantes y la información de tu proyecto.</p>
      </div>
      <router-link to="/participante/dashboard" class="btn btn-sm btn-white">
        <svg style="width:1.25rem;height:1.25rem;margin-right:0.5rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"/></svg>
        Volver al Panel
      </router-link>
    </div>

    <div v-if="loading" class="loading"><div class="spinner"></div></div>
    <template v-else>
      <div class="edit-grid">
        
        <!-- COLUMNA IZQUIERDA: Miembros y Reclutamiento (4 cols) -->
        <div class="side-col">
          
          <!-- KPI: Miembros y Diversidad -->
          <div class="card stat-mini shadow-sm">
             <div class="stat-top">
                <p class="stat-label">Composición del Equipo</p>
             </div>
             <div class="stat-main">
                <span class="val">{{ miembros.length }}</span>
                <span class="total">/ 5 Miembros</span>
             </div>
             <div class="stat-footer">
                <div class="status-item" :class="isComplete ? 'success' : 'warning'">
                  <svg v-if="isComplete" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  <span>{{ isComplete ? 'Mínimo alcanzado' : 'Faltan integrantes (mín. 2)' }}</span>
                </div>
                <div class="status-item mt-1" :class="isDiverse ? 'diverse' : 'muted'">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
                  <span>{{ isDiverse ? 'Equipo Multidisciplinario' : 'Falta diversidad de carreras' }}</span>
                </div>
             </div>
          </div>

          <!-- Card de Reclutamiento -->
          <div class="card shadow-sm">
            <div class="card-header-inner" style="letter-spacing:0.05em; padding: 1.5rem 2rem">RECLUTAR TALENTO</div>
            <div class="card-body" style="padding:1.5rem 2rem">
              <div v-if="esLider">
                <div v-if="miembros.length < 5">
                  <div class="relative">
                    <div class="search-box">
                      <input type="text" v-model="searchQuery" @input="searchCandidatos" placeholder="Buscar por nombre..." class="form-control search-input focus-indigo">
                      <div class="search-icon">
                        <svg style="width:1.25rem;height:1.25rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                      </div>
                    </div>
                    
                    <div v-if="candidatos.length > 0" class="search-dropdown shadow-2xl">
                      <div v-for="c in candidatos" :key="c.id" class="candidato-item" @click="openInviteModal(c)">
                        <div class="candidato-info">
                          <p class="c-name">{{ c.name.toUpperCase() }}</p>
                          <p class="c-meta">{{ c.carrera.toUpperCase() }}</p>
                        </div>
                        <div class="c-action">
                          <svg style="width:1.5rem;height:1.5rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        </div>
                      </div>
                    </div>
                    <p v-else-if="searchQuery.length > 2" class="no-results">No se encontraron participantes disponibles.</p>
                  </div>
                </div>
                <div v-else class="team-full-badge">
                  <span>EQUIPO COMPLETO</span>
                </div>
              </div>
              <div v-else class="lider-only-alert">
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                 <p>Solo el líder del equipo puede reclutar nuevos miembros.</p>
              </div>
            </div>

            <!-- Lista de Miembros Actuales -->
            <div class="members-section">
              <h4 class="section-subtitle">INTEGRANTES ACTUALES</h4>
              <div class="members-list">
                <div v-for="m in miembros" :key="m.id" class="member-row">
                  <div class="member-info-col">
                    <div class="member-avatar">{{ m.nombre?.charAt(0).toUpperCase() }}</div>
                    <div class="member-text">
                      <span class="m-name">{{ m.nombre }}</span>
                      <span class="m-carrera-badge">{{ m.carrera || 'Sin carrera' }}</span>
                    </div>
                  </div>
                  <div class="member-status-col">
                    <span class="m-role-badge">{{ m.rol }}</span>
                    <div class="member-actions">
                      <button v-if="m.id !== currentUser.id && esLider && eventoProximo" @click="removeMember(m.id)" class="btn-remove" title="Sacar del equipo">
                        <svg style="width:1.25rem;height:1.25rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                      <span v-else-if="m.id !== currentUser.id && esLider && !eventoProximo" class="event-lock-tag" title="No puedes eliminar miembros porque el evento ya inició o finalizó">
                        <svg style="width:0.875rem;height:0.875rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                      </span>
                      <span v-else-if="m.id === currentUser.id" class="self-tag">Tú</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- COLUMNA DERECHA: Proyecto e Invitaciones (8 cols) -->
        <div class="main-col">
          <div class="card shadow-sm mb-6">
            <div class="card-header" style="padding: 1.5rem 2rem">
              <h3 style="font-size:1.25rem;font-weight:700;color:var(--text-primary)">Detalles del Proyecto</h3>
              <p style="font-size:0.875rem;color:var(--text-muted);margin-top:0.25rem">Información visible para jueces y otros participantes.</p>
            </div>
            <div class="card-body" style="padding: 1.5rem 2rem">
              <form @submit.prevent="saveProject" class="project-form">
                <div class="form-row">
                  <div class="form-group flex-1">
                    <label class="form-label-premium">Nombre del Equipo</label>
                    <div class="input-with-icon">
                      <input type="text" v-model="form.nombre" class="form-control premium" :disabled="!esLider" required>
                      <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                    </div>
                  </div>
                  <div class="form-group flex-1">
                    <label class="form-label-premium">Título del Proyecto</label>
                    <div class="input-with-icon">
                      <input type="text" v-model="form.proyecto_nombre" class="form-control premium" :disabled="!esLider" required>
                      <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label-premium">Repositorio URL</label>
                  <div class="input-with-icon">
                    <input type="url" v-model="form.repositorio_url" class="form-control premium font-mono" placeholder="https://github.com/usuario/mi-proyecto" :disabled="!esLider">
                    <svg class="input-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label-premium">Descripción</label>
                  <textarea v-model="form.proyecto_descripcion" class="form-control premium textarea-large" rows="5" :disabled="!esLider"></textarea>
                </div>

                <div v-if="esLider" class="form-actions">
                  <button type="submit" class="btn btn-indigo shadow-lg" :disabled="saving">
                    <div v-if="saving" class="spinner" style="width:1.25rem;height:1.25rem;border-width:2px;margin-right:0.5rem"></div>
                    <span v-else>Guardar Cambios</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- SECCIÓN DE INVITACIONES ENVIADAS (Solo Líder) -->
          <div v-if="esLider" class="card shadow-sm Invitaciones-card">
            <div class="card-header" style="padding: 1.5rem 2rem">
              <h3 style="font-size:1.25rem;font-weight:700;color:var(--text-primary)">Invitaciones Enviadas</h3>
            </div>
            <div class="card-body" style="padding: 0 2rem 2rem 2rem">
               <div v-if="invitaciones.length === 0" class="empty-invs" style="margin-bottom: 1.5rem">
                  <p class="text-gray-400">No hay invitaciones recientes.</p>
               </div>
               <button @click="toggleInvsList" class="btn btn-blue shadow-lg h-12 px-6" style="margin-top: 1rem">
                  <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  Ver Historial
               </button>

               <div v-if="showInvsList" class="mt-6 border rounded-xl overflow-hidden">
                  <div class="invitations-table">
                    <div v-for="inv in invitaciones" :key="inv.id" class="invitation-row">
                       <div class="inv-info">
                          <p class="inv-name">{{ inv.usuario.name }}</p>
                          <p class="inv-date">{{ formatDate(inv.created_at) }} <span v-if="inv.perfil_nombre" style="color:var(--indigo-500);font-weight:600">· {{ inv.perfil_nombre }}</span></p>
                       </div>
                       <div class="inv-status" style="display:flex;align-items:center;gap:0.5rem">
                          <span class="badge" :class="statusClass(inv.estado)">{{ inv.estado }}</span>
                          <template v-if="inv.estado === 'PENDIENTE'">
                            <button @click="openEditInvModal(inv)" class="btn-icon-action" title="Editar rol">
                              <svg style="width:1rem;height:1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                            </button>
                            <button @click="cancelInvitation(inv.id)" class="btn-icon-action btn-icon-danger" title="Cancelar invitación">
                              <svg style="width:1rem;height:1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </button>
                          </template>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Modal de Invitación Refinado (Paridad Laravel) -->
    <div v-if="inviteModal.show" class="modal-overlay" @click.self="inviteModal.show = false">
      <div class="modal-content shadow-2xl scale-in" style="max-width: 500px">
        <div class="modal-header">
          <h3 style="font-weight:700;font-size:1.25rem;color:var(--text-primary)">Enviar Invitación</h3>
          <button class="modal-close" @click="inviteModal.show = false">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="modal-body p-6">
          <div class="form-group mb-4">
            <label class="modal-label">Candidato:</label>
            <div class="banner-box">
              <p class="banner-name">{{ inviteModal.user.name }}</p>
            </div>
          </div>
          
          <div class="form-group mb-4">
            <label class="modal-label">Rol Sugerido (Opcional)</label>
            <select v-model="inviteModal.perfil_id" class="form-control modal-select focus-blue">
              <option value="">-- Sin especificar --</option>
              <option v-for="p in perfiles" :key="p.id" :value="p.id">{{ p.nombre }}</option>
            </select>
          </div>

          <div class="form-group mb-1">
            <label class="modal-label">Mensaje Personal (Opcional)</label>
            <textarea v-model="inviteModal.mensaje" class="form-control modal-textarea" rows="4" maxlength="500" placeholder="Cuéntale por qué lo invitas a tu equipo..."></textarea>
          </div>
          <p class="char-count">{{ inviteModal.mensaje.length }}/500 caracteres</p>
        </div>
        
        <div class="modal-footer">
           <button @click="inviteModal.show = false" class="btn-modal-cancel">Cancelar</button>
           <button @click="sendInvitation" class="btn-modal-send" :disabled="inviting">
              <span v-if="!inviting"> Enviar Invitación</span>
              <div v-else class="spinner-white" style="width:1.25rem;height:1.25rem"></div>
           </button>
        </div>
      </div>
    </div>

    <!-- Modal Editar Rol de Invitación -->
    <div v-if="editInvModal.show" class="modal-overlay" @click.self="editInvModal.show = false">
      <div class="modal-content shadow-2xl scale-in" style="max-width: 420px">
        <div class="modal-header">
          <h3 style="font-weight:700;font-size:1.125rem;color:var(--text-primary)">Editar Rol de Invitación</h3>
          <button class="modal-close" @click="editInvModal.show = false">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="modal-body p-6">
          <p style="font-size:.875rem;color:var(--text-muted);margin-bottom:1rem">Invitación para: <strong style="color:var(--text-primary)">{{ editInvModal.userName }}</strong></p>
          <div class="form-group">
            <label class="modal-label">Nuevo Rol</label>
            <select v-model="editInvModal.perfil_id" class="form-control modal-select focus-blue">
              <option value="">-- Sin especificar --</option>
              <option v-for="p in perfiles" :key="p.id" :value="p.id">{{ p.nombre }}</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="editInvModal.show = false" class="btn-modal-cancel">Cancelar</button>
          <button @click="saveEditInv" class="btn-modal-send" :disabled="savingEditInv">
            <span v-if="!savingEditInv">Guardar</span>
            <div v-else class="spinner-white" style="width:1.25rem;height:1.25rem"></div>
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.store'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../plugins/axios'
import alerts from '../../services/alerts'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const loading = ref(true)
const loadingInvs = ref(false)
const saving = ref(false)
const inviting = ref(false)
const searchQuery = ref('')
const candidatos = ref([])
const miembros = ref([])
const perfiles = ref([])
const invitaciones = ref([])
const showInvsList = ref(false)
const eventoData = ref(null)

const form = ref({
  nombre: '',
  proyecto_nombre: '',
  proyecto_descripcion: '',
  repositorio_url: ''
})

const inviteModal = ref({
  show: false,
  user: null,
  mensaje: '',
  perfil_id: ''
})

const currentUser = computed(() => auth.user || {})

// Logic from Laravel
const isComplete = computed(() => miembros.value.length >= 2)
const isDiverse = computed(() => {
  const distinct = new Set(miembros.value.map(m => m.carrera).filter(Boolean))
  return distinct.size > 1
})
const esLider = computed(() => miembros.value.some(m => m.id === currentUser.value.id && m.es_lider))

// Determinar si el evento está próximo (aún no inicia) para permitir eliminar miembros
const eventoProximo = computed(() => {
  if (!eventoData.value || !eventoData.value.fecha_inicio) return true // sin evento = permitir
  const ahora = new Date()
  const inicio = new Date(eventoData.value.fecha_inicio)
  return ahora < inicio
})

async function fetchData() {
  try {
    loading.value = true
    const evIdCtx = route.query.evento_id;
    const [teamRes, profilesRes] = await Promise.all([
      api.get(`/participante/equipos/${route.params.id}`, { params: { evento_id: evIdCtx } }),
      api.get('/participante/perfiles')
    ])

    const { equipo, proyecto, miembros: membersData } = teamRes.data.data
    form.value = {
      nombre: equipo.nombre,
      proyecto_nombre: proyecto?.nombre || '',
      proyecto_descripcion: proyecto?.descripcion || '',
      repositorio_url: proyecto?.repositorio_url || ''
    }
    miembros.value = membersData
    eventoData.value = teamRes.data.data.proyecto?.evento || null
    perfiles.value = (profilesRes.data.data || []).filter(p => {
      const n = p.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return !n.includes('lider');
    })

    if (esLider.value) {
      await fetchInvitations()
    }
  } catch(e) {
    alerts.error('No se pudo cargar la información')
    router.push('/participante/dashboard')
  } finally {
    loading.value = false
  }
}

async function fetchInvitations() {
  try {
    loadingInvs.value = true
    const r = await api.get(`/participante/equipos/${route.params.id}/invitaciones`)
    invitaciones.value = r.data.data
  } catch(e) {} finally {
    loadingInvs.value = false
  }
}

function toggleInvsList() {
  if (invitaciones.value.length === 0) {
    alerts.info('Aún no has enviado ninguna solicitud de unión a este equipo.')
    return
  }
  showInvsList.value = !showInvsList.value
}

async function saveProject() {
  try {
    saving.value = true
    await api.put(`/participante/equipos/${route.params.id}`, form.value)
    alerts.success('Información actualizada correctamente')
  } catch(e) {
    alerts.error(e.response?.data?.message || 'Error al guardar')
  } finally {
    saving.value = false
  }
}

async function searchCandidatos() {
  if (searchQuery.value.length < 3) { candidatos.value = []; return }
  try {
    const eventoId = eventoData.value?.id || ''
    const equipoId = route.params.id || ''
    const r = await api.get(`/participante/candidatos?q=${searchQuery.value}&evento_id=${eventoId}&equipo_id=${equipoId}`)
    candidatos.value = r.data.data
  } catch(e) {}
}

function openInviteModal(user) {
  inviteModal.value = { show: true, user, mensaje: '', perfil_id: '' }
}

async function sendInvitation() {
  try {
    inviting.value = true
    await api.post('/participante/equipos/invitar', {
      participante_id: inviteModal.value.user.id,
      equipo_id: route.params.id,
      mensaje: inviteModal.value.mensaje,
      perfil_id: inviteModal.value.perfil_id
    })
    alerts.success('Invitación enviada')
    inviteModal.value.show = false
    searchQuery.value = ''
    candidatos.value = []
    fetchInvitations()
  } catch(e) {
    alerts.error(e.response?.data?.message || 'Error al enviar invitación')
  } finally {
    inviting.value = false
  }
}

async function removeMember(userId) {  
  if (!await alerts.confirm('¿Seguro que deseas eliminar a este miembro del equipo?', '¿Eliminar miembro?', 'Sí, eliminar', 'Cancelar')) return
  try {
    const evId = eventoData.value?.id || undefined;
    await api.delete(`/participante/equipos/miembros/${userId}`, {
      params: { evento_id: evId }
    })
    await fetchData()
  } catch(e) {
    alerts.error(e.response?.data?.message || 'Error al eliminar')
  }
}

const formatDate = d => new Date(d).toLocaleDateString()
const statusClass = s => {
  if (s === 'ACEPTADA') return 'badge-participante'
  if (s === 'RECHAZADA') return 'badge-admin'
  return 'badge-blue'
}

onMounted(fetchData)

const editInvModal = ref({ show: false, invId: null, perfil_id: '', userName: '' })
const savingEditInv = ref(false)

function openEditInvModal(inv) {
  editInvModal.value = {
    show: true,
    invId: inv.id,
    perfil_id: inv.perfil_id || '',
    userName: inv.usuario.name
  }
}

async function saveEditInv() {
  try {
    savingEditInv.value = true
    await api.put(`/participante/equipos/invitaciones/${editInvModal.value.invId}`, {
      perfil_id: editInvModal.value.perfil_id || null
    })
    editInvModal.value.show = false
    alerts.success('Rol actualizado')
    await fetchInvitations()
  } catch (e) {
    alerts.error(e.response?.data?.message || 'Error al actualizar')
  } finally {
    savingEditInv.value = false
  }
}

async function cancelInvitation(invId) {
  if (!await alerts.confirmDelete('¿Cancelar esta invitación? El participante ya no la verá.')) return
  try {
    await api.delete(`/participante/equipos/invitaciones/${invId}`)
    alerts.success('Invitación cancelada')
    await fetchInvitations()
  } catch (e) {
    alerts.error(e.response?.data?.message || 'Error al cancelar')
  }
}
</script>

<style scoped>
.edit-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 1.5rem; }
.side-col { grid-column: span 4 / span 12; display: flex; flex-direction: column; gap: 1.5rem; }
.main-col { grid-column: span 8 / span 12; }

@media (max-width: 1024px) { .side-col, .main-col { grid-column: span 12 / span 12; } }

/* Stat Mini */
.stat-mini { padding: 1.5rem; }
.stat-label { font-size: 0.7rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
.indicator { width: 0.75rem; height: 0.75rem; border-radius: 50%; }
.indicator.green { background: var(--success-500); box-shadow: 0 0 10px rgba(16,185,129,0.3); }
.indicator.orange { background: var(--warning-500); box-shadow: 0 0 10px rgba(245,158,11,0.3); }
.stat-main { display: flex; align-items: flex-end; gap: 0.375rem; margin-bottom: 1rem; }
.stat-main .val { font-size: 2.75rem; font-weight: 800; color: var(--text-primary); line-height: 1; }
.stat-main .total { font-size: 0.875rem; color: var(--text-muted); font-weight: 600; padding-bottom: 0.25rem; }
.status-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; font-weight: 600; }
.status-item.success { color: var(--success-600); }
.status-item.warning { color: var(--warning-600); }
.status-item.diverse { color: var(--indigo-500); }
.status-item.muted { color: var(--text-muted); }

/* Recruitment */
.lider-only-alert { display: flex; align-items: center; gap: 0.75rem; background: var(--bg-input); border: 1px solid var(--border-color); padding: 0.75rem; border-radius: 0.75rem; color: var(--text-secondary); font-size: 0.875rem; font-weight: 500; }
.team-full-badge { text-align: center; background: var(--card-muted); color: var(--text-muted); padding: 0.75rem; border-radius: 0.75rem; font-size: 0.7rem; font-weight: 800; border: 1px dashed var(--border-color); }

.search-box { position: relative; margin-bottom: 0.5rem; }
.search-input { padding-left: 3rem; background: var(--bg-input); height: 3.25rem; border-radius: 1rem; border: 2px solid transparent; font-size: 1rem; font-weight: 500; transition: all 0.2s; color: var(--text-primary); }
.search-input.focus-indigo:focus { border-color: var(--indigo-500); background: var(--bg-card); box-shadow: 0 0 0 4px rgba(99,102,241,0.1); outline: none; }
.search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); width: 1.25rem; color: var(--text-muted); }
.search-dropdown { position: absolute; top: 3.75rem; left: 0; right: 0; z-index: 50; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 1.25rem; max-height: 18rem; overflow-y: auto; padding: 0.5rem; box-shadow: var(--shadow-xl); }
.candidato-item { background: var(--card-muted); border-radius: 1rem; margin-bottom: 0.5rem; padding: 0.875rem 1.25rem; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s; border: 1px solid var(--border-color); }
.candidato-item:hover { background: var(--bg-input); transform: translateY(-2px); }
.c-name { font-weight: 800; color: var(--indigo-500); letter-spacing: 0.025em; font-size: 0.9375rem; }
.c-meta { font-size: 0.7rem; color: var(--text-muted); font-weight: 700; letter-spacing: 0.05em; margin-top: 0.125rem; }
.c-action { color: var(--indigo-500); }
.c-action svg { width: 1.5rem; height: 1.5rem; stroke-width: 1.5; }

/* Members */
.members-section { border-top: 1px solid var(--border); padding-bottom: 1rem; }
.section-subtitle { padding: 1.25rem 1.5rem 0.75rem; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border-color); }
.members-list { display: flex; flex-direction: column; }
.member-row { display: flex; justify-content: space-between; align-items: center; padding: 0.875rem 1.5rem; border-bottom: 1px solid var(--border-color); }
.member-row:last-child { border-bottom: none; }

.member-info-col { display: flex; align-items: center; gap: 1rem; flex: 1; min-width: 0; }
.member-avatar { width: 2.25rem; height: 2.25rem; border-radius: 0.75rem; background: linear-gradient(135deg, var(--indigo-500) 0%, var(--indigo-600) 100%); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; flex-shrink: 0; }
.member-text { display: flex; flex-direction: column; gap: 0rem; flex: 1; min-width: 0; }
.m-name { font-size: 0.9375rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.01e; line-height: 1.2; margin-bottom: 0.125rem; }
.m-carrera-badge { color: var(--text-muted); font-size: 0.75rem; font-weight: 500; line-height: 1.3; }

.member-status-col { display: flex; align-items: center; gap: 1rem; flex-shrink: 0; }
.m-role-badge { font-size: 0.6rem; font-weight: 800; color: var(--indigo-600); text-transform: uppercase; letter-spacing: 0.025em; background: var(--indigo-50); padding: 0.2rem 0.6rem; border-radius: 9999px; min-width: 80px; text-align: center; }
.dark .m-role-badge { background: var(--bg-input); color: var(--indigo-400); }

.member-actions { display: flex; align-items: center; width: 2.5rem; justify-content: flex-end; }
.self-tag { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); padding-right: 0.5rem; }
.dark .m-role-badge { background: var(--bg-input); color: var(--indigo-400); }

/* Remove Member Button & Action Icons */
.btn-remove, .btn-icon-action {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.625rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-remove:hover, .btn-icon-action:hover {
  color: var(--indigo-600);
  background: var(--card-muted);
  transform: scale(1.1);
}
.btn-remove:hover, .btn-icon-action.btn-icon-danger:hover {
  color: var(--danger-600);
}
.btn-remove svg, .btn-icon-action svg {
  width: 1.125rem;
  height: 1.125rem;
}

/* Invitations Table */
.invitations-table { display: flex; flex-direction: column; }
.invitation-row { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 0; border-bottom: 1px solid var(--border); }
.invitation-row:last-child { border-bottom: none; }
.inv-name { font-weight: 700; color: var(--text-primary); font-size: 0.9375rem; letter-spacing: -0.01em; }
.inv-date { font-size: 0.7rem; color: var(--text-muted); }

/* Form Premium */
.form-label-premium { font-size: 0.875rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.375rem; display: block; }
.input-with-icon { position: relative; }
.input-with-icon .input-icon { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); width: 1.125rem; color: var(--text-muted); }
.form-control.premium { width: 100%; border-radius: 0.75rem; border: 1.5px solid var(--border-color); min-height: 3rem; padding: 0.75rem 1.25rem; transition: all 0.2s; font-size: 0.875rem; background: var(--bg-card); color: var(--text-primary); }
.form-control.premium:focus { border-color: var(--indigo-500); outline: none; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
.select-fix { background: var(--bg-muted); appearance: auto !important; }

.card-header-inner { padding: 1.5rem; font-size: 1.25rem; font-weight: 700; color: var(--text-primary); border-bottom: 1px solid var(--border); }

.btn-blue { background: var(--indigo-600); color: white; display: flex; align-items: center; font-weight: 700; transition: all 0.2s; border-radius: 0.875rem; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3); border: none; font-size: 0.875rem; cursor: pointer; }
.btn-blue:hover { background: var(--indigo-700); transform: translateY(-1px); }
.btn-blue:active { transform: translateY(0); }

/* Modal Laravel Parity */
.modal-label { font-size: 0.875rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.5rem; display: block; }
.banner-box { background: var(--indigo-50); border-radius: 0.75rem; padding: 1rem 1.25rem; border: 1px solid var(--indigo-100); }
.dark .banner-box { background: var(--bg-input); border-color: var(--border-color); }
.banner-name { color: var(--indigo-600); font-weight: 600; font-size: 1rem; }
.dark .banner-name { color: var(--indigo-400); }
.modal-select { border: 2px solid var(--indigo-500); border-radius: 0.75rem; height: 3.5rem; appearance: auto; transition: all 0.2s; font-size: 0.875rem; background: var(--bg-card); color: var(--text-primary); }
.modal-select:focus { border-color: var(--indigo-600); box-shadow: 0 0 0 4px rgba(79,70,229,0.1); outline: none; }
.modal-textarea { border: 1px solid var(--border-color); border-radius: 0.75rem; padding: 1rem; resize: none; font-size: 0.875rem; background: var(--bg-card); color: var(--text-primary); }
.modal-textarea:focus { border-color: var(--indigo-500); box-shadow: 0 0 0 4px rgba(99,102,241,0.05); outline: none; }
.char-count { font-size: 0.75rem; color: var(--text-muted); text-align: left; margin-top: 0.25rem; }
.modal-footer { padding: 1rem 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem; border-top: 1px solid var(--border-color); }
.btn-modal-cancel { padding: 0.75rem 1.5rem; border: 1px solid var(--border-color); border-radius: 0.75rem; font-weight: 600; color: var(--text-secondary); background: var(--bg-card); transition: all 0.2s; cursor: pointer; }
.btn-modal-cancel:hover { background: var(--card-muted); color: var(--text-primary); }
.btn-modal-send { padding: 0.75rem 1.5rem; background: var(--indigo-600); color: white; border-radius: 0.75rem; font-weight: 600; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2); transition: all 0.2s; border: none; cursor: pointer; }
.btn-modal-send:hover { background: var(--indigo-700); transform: translateY(-1px); }
.spinner-white { border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }

.scale-in { animation: scaleIn 0.2s ease-out forwards; }

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
  padding: 1rem;
}

@keyframes scaleIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }

/* Lock icon when event is active/finished */
.event-lock-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.5rem;
  background: var(--card-muted, #f3f4f6);
  color: var(--text-muted, #9ca3af);
  cursor: not-allowed;
  border: 1px solid var(--border-color, #e5e7eb);
}
</style>
