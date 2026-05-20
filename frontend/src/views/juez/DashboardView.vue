<template>
  <AppLayout>
    <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:1.5rem;color:var(--text-primary)">Sala de Evaluación</h2>
    <div v-if="loading" class="loading"><div class="spinner"></div></div>
    <template v-else>

      <!-- KPI Stats Cards -->
      <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
        <!-- Total Proyectos -->
        <div class="stat-card kpi-card" style="--kpi-hover:#4f46e5">
          <div class="stat-top">
            <div>
              <p class="stat-label">Total Proyectos</p>
              <h3 class="stat-value" style="font-size:2rem;font-weight:800">{{ totalProyectos }}</h3>
            </div>
            <div class="kpi-icon kpi-indigo">
              <svg style="width:2rem;height:2rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            </div>
          </div>
        </div>
        <!-- Calificados -->
        <div class="stat-card kpi-card" style="--kpi-hover:#10b981">
          <div class="stat-top">
            <div>
              <p class="stat-label">Calificados</p>
              <h3 class="stat-value" style="font-size:2rem;font-weight:800">{{ proyectosEvaluados }}</h3>
            </div>
            <div class="kpi-icon kpi-green">
              <svg style="width:2rem;height:2rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
        </div>
        <!-- Pendientes -->
        <div class="stat-card kpi-card" style="--kpi-hover:#f59e0b">
          <div class="stat-top">
            <div>
              <p class="stat-label">Pendientes</p>
              <h3 class="stat-value" style="font-size:2rem;font-weight:800">{{ pendientes }}</h3>
            </div>
            <div class="kpi-icon kpi-yellow">
              <svg style="width:2rem;height:2rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Eventos en Curso Section -->
      <div v-if="eventosActivos.length" style="margin-top:2rem">
        <h3 style="font-size:1.125rem;font-weight:700;color:var(--text-primary);margin-bottom:1.5rem;display:flex;align-items:center;gap:.5rem">
          <svg style="width:1.25rem;height:1.25rem;color:#4f46e5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          Eventos en Curso
        </h3>

        <div class="eventos-grid">
          <div v-for="ev in eventosActivos" :key="ev.id" class="evento-card">
            <div class="evento-card-body" style="padding: 1.25rem">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.75rem">
                <div style="flex:1;min-width:0">
                  <h4 style="font-size:1.1rem;font-weight:700;color:var(--text-primary);margin-bottom:.15rem">{{ ev.nombre }}</h4>
                  <p style="font-size:.8rem;color:var(--text-muted);display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden">{{ ev.descripcion || 'En curso' }}</p>
                </div>
                <span class="badge badge-muted" style="flex-shrink:0;margin-left:.75rem; font-size: 0.65rem">{{ ev.proyectos?.length || 0 }} Proyectos</span>
              </div>

              <!-- Proyectos List -->
              <div v-if="ev.proyectos?.length" style="display:flex;flex-direction:column;gap:.5rem;margin-top:0.75rem">
                <div v-for="p in ev.proyectos" :key="p.id" class="proyecto-item" style="padding: 0.6rem 0.75rem" @click="$router.push(`/juez/evaluar/${p.id}`)">
                  <div class="proyecto-icon" style="width:2rem; height:2rem">
                    <svg style="width:1rem;height:1rem;color:#4f46e5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                  </div>
                  <div style="flex:1;min-width:0">
                    <h4 style="font-size:.8rem;font-weight:700;color:var(--text-primary); margin:0">{{ p.nombre }}</h4>
                    <p style="font-size:.7rem;color:var(--text-muted); margin:0">{{ p.equipo?.nombre || p.equipo || '-' }}</p>
                  </div>
                  <span v-if="p.evaluado" class="badge badge-participante" style="font-size: 0.65rem"> Calificado</span>
                  <span v-else class="badge badge-juez" style="font-size: 0.65rem">Pendiente</span>
                </div>
              </div>

              <!-- Progress Bar -->
              <div style="margin-top:1rem">
                <div style="background:var(--bg-muted, #e5e7eb);border-radius:9999px;height:.25rem;overflow:hidden">
                  <div style="background:#4f46e5;height:100%;border-radius:9999px;transition:width .5s" :style="{ width: getProgress(ev) + '%' }"></div>
                </div>
              </div>
            </div>
            <div class="evento-card-footer" style="padding: 0.85rem 1.25rem">
              <div style="display:flex;align-items:center;font-size:.7rem;color:var(--text-muted);font-weight:600">
                <svg style="width:0.875rem;height:0.875rem;margin-right:.25rem;color:#4f46e5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Cierre: {{ formatDate(ev.fecha_fin) }}
              </div>
              <router-link :to="`/juez/eventos/${ev.id}`" class="entrar-link" style="font-size: 0.8rem" @click.stop>
                Evaluar
                <svg style="width:0.875rem;height:0.875rem;margin-left:.15rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!eventos.length" class="empty-state-card" style="margin-top: 2rem">
        <svg style="width:3rem;height:3rem;color:#9ca3af;margin:0 auto 1rem" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
        <h3 style="font-size:.875rem;font-weight:600;color:var(--text-primary)">Sin eventos asignados</h3>
        <p style="font-size:.875rem;color:var(--text-muted);margin-top:.25rem">No tienes eventos asignados para evaluar en este momento.</p>
      </div>

    </template>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../plugins/axios'

const eventos = ref([])
const loading = ref(true)

const totalProyectos = computed(() => {
  return eventos.value.reduce((sum, ev) => sum + (ev.proyectos?.length || 0), 0)
})

const proyectosEvaluados = computed(() => {
  return eventos.value.reduce((sum, ev) => {
    return sum + (ev.proyectos?.filter(p => p.evaluado)?.length || 0)
  }, 0)
})

const pendientes = computed(() => totalProyectos.value - proyectosEvaluados.value)

const eventosActivos = computed(() => {
  const now = new Date()
  return eventos.value.filter(ev => new Date(ev.fecha_fin) >= now)
})

function getProgress(ev) {
  const total = ev.proyectos?.length || 0
  if (!total) return 0
  const evaluated = ev.proyectos.filter(p => p.evaluado).length
  return Math.round((evaluated / total) * 100)
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

onMounted(async () => {
  try {
    const r = await api.get('/juez/dashboard')
    eventos.value = r.data.data.eventos || []
  } catch(e) { console.error(e) }
  finally { loading.value = false }
})
</script>

<style scoped>
.kpi-card { transition: all .3s ease; cursor: default; }
.kpi-card:hover { border-color: var(--kpi-hover, #4f46e5) !important; }
.kpi-icon { padding: 1rem; border-radius: .75rem; transition: all .3s ease; }
.kpi-indigo { background: rgba(79,70,229,.08); color: #4f46e5; }
.kpi-green { background: rgba(16,185,129,.08); color: #10b981; }
.kpi-yellow { background: rgba(245,158,11,.08); color: #f59e0b; }
.kpi-card:hover .kpi-indigo { background: #4f46e5; color: #fff; }
.kpi-card:hover .kpi-green { background: #10b981; color: #fff; }
.kpi-card:hover .kpi-yellow { background: #f59e0b; color: #fff; }

.eventos-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
@media (max-width: 1024px) { .eventos-grid { grid-template-columns: 1fr; } }

.evento-card { display: flex; flex-direction: column; background: var(--card-bg, #fff); border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,.06); border: 1px solid var(--border, #e5e7eb); overflow: hidden; transition: box-shadow .3s ease; }
.evento-card:hover { box-shadow: 0 10px 25px rgba(0,0,0,.1); }
.evento-card-body { padding: 1.5rem; flex: 1; }
.evento-card-footer { padding: 1rem 1.5rem; background: var(--card-muted, #f9fafb); border-top: 1px solid var(--border, #f3f4f6); display: flex; align-items: center; justify-content: space-between; }

.proyecto-item { display: flex; align-items: center; gap: .75rem; padding: .75rem; border-radius: .75rem; border: 1px solid var(--border, #f3f4f6); background: var(--card-muted, #fafafa); cursor: pointer; transition: all .2s; }
.proyecto-item:hover { background: rgba(79,70,229,.04); border-color: rgba(79,70,229,.2); }
.proyecto-icon { width: 2.5rem; height: 2.5rem; border-radius: .5rem; background: rgba(79,70,229,.1); border: 1px solid rgba(79,70,229,.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

.empty-state-card { background: var(--card-bg, #fff); border-radius: 1rem; padding: 3rem; text-align: center; border: 2px dashed var(--border, #d1d5db); }

.entrar-link { display: inline-flex; align-items: center; font-size: .875rem; font-weight: 700; color: #4f46e5; text-decoration: none; transition: color .2s; }
.entrar-link:hover { color: #3730a3; }

.badge-muted { background: var(--card-muted, #f3f4f6); color: var(--text-secondary); font-size: .75rem; font-weight: 700; padding: .25rem .625rem; border-radius: 9999px; }
</style>
