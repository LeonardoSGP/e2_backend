<template>
  <AppLayout>
    <div v-if="loading" class="loading"><div class="spinner"></div></div>
    <div v-else>
      <!-- HEADER / SELECTOR -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem">
        <h2 style="font-size:1.5rem;font-weight:700;color:var(--text-primary);margin:0">Dashboard del Participante</h2>
        
        <div style="display:flex;align-items:center;gap:.75rem">
          <span style="font-size:.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase">Evento Seleccionado:</span>
          <select v-model="activeContextId" class="modal-select">
            <optgroup v-if="data.participaciones?.length" label="Tus Equipos (Activos/Historial)">
              <option v-for="p in data.participaciones" :key="p.proyecto_id" :value="'p:' + p.proyecto_id">
                {{ p.evento_nombre }} - {{ p.equipo_nombre }}
              </option>
            </optgroup>
          </select>
        </div>
      </div>



      <!-- ======================================== -->
      <!--  INVITACIONES PENDIENTES                  -->
      <!-- ======================================== -->
      <div v-if="data.invitaciones?.length" class="invitaciones-banner">
        <div class="inv-banner-header">
          <div class="inv-icon-wrapper">
            <div class="inv-icon-pulse"></div>
            <svg class="inv-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          </div>
          <div>
            <h3 class="inv-title">
              Tienes {{ data.invitaciones.length }} invitación{{ data.invitaciones.length > 1 ? 'es' : '' }} pendiente{{ data.invitaciones.length > 1 ? 's' : '' }}
            </h3>
            <p class="inv-subtitle">Líderes de equipos te han invitado a unirte a sus proyectos</p>
          </div>
        </div>
        <div class="inv-list">
          <div v-for="inv in data.invitaciones" :key="inv.id" class="inv-card">
            <div class="inv-card-left">
              <div class="inv-team-avatar">{{ (inv.equipo?.nombre || 'E').charAt(0).toUpperCase() }}</div>
              <div class="inv-card-info">
                <span class="inv-team-name">{{ inv.equipo?.nombre || 'Equipo' }}</span>
                <span class="inv-role-badge">{{ inv.rol }}</span>
              </div>
            </div>
            <div class="inv-card-actions">
              <button class="btn btn-sm btn-indigo" @click="respondInvite(inv.id, 'aceptada')">
                <svg style="width:.875rem;height:.875rem;margin-right:.25rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                Aceptar
              </button>
              <button class="btn btn-sm btn-outline" @click="respondInvite(inv.id, 'rechazada')">
                Rechazar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ======================================== -->
      <!--  CON EQUIPO: Vista completa              -->
      <!-- ======================================== -->
      <template v-if="data.equipo && !showEnrollmentSection">
        <div class="grid-layout">
          <!-- COLUMNA IZQUIERDA (2/3) -->
          <div class="col-left">
            <!-- Status Row -->
            <div class="status-row">
              <div class="status-card">
                <div><p class="stat-label">Estado Actual</p><h4 style="font-size:1.125rem;font-weight:700;color:var(--text-primary);margin-top:.25rem">Inscrito</h4></div>
                <div class="status-icon green-bg"><svg style="width:1.5rem;height:1.5rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
              </div>
              <div class="status-card" style="flex:1">
                <div style="min-width:0; flex:1">
                  <div v-if="data.evento_inscrito" style="margin-bottom: 0.25rem;">
                    <span v-if="!data.evento_inscrito.configuracion_lista && new Date() >= new Date(data.evento_inscrito.fecha_inicio) && new Date() <= new Date(data.evento_inscrito.fecha_fin)"
                          style="font-size: 0.65rem; font-weight: 800; text-transform: uppercase; background: #fff7ed; color: #c2410c; padding: 2px 8px; border-radius: 4px; border: 1px solid #fdba74;">
                      En Configuración
                    </span>
                    <span v-else-if="new Date() < new Date(data.evento_inscrito.fecha_inicio)" style="font-size: 0.65rem; font-weight: 800; text-transform: uppercase; background: #fff7ed; color: #c2410c; padding: 2px 8px; border-radius: 4px; border: 1px solid #fdba74;">
                      Próximo
                    </span>
                    <span v-else-if="new Date() > new Date(data.evento_inscrito.fecha_fin)" style="font-size: 0.65rem; font-weight: 800; text-transform: uppercase; background: #f3f4f6; color: #4b5563; padding: 2px 8px; border-radius: 4px; border: 1px solid #d1d5db;">
                      Finalizado
                    </span>
                    <span v-else style="font-size: 0.65rem; font-weight: 800; text-transform: uppercase; background: #f0fdf4; color: #15803d; padding: 2px 8px; border-radius: 4px; border: 1px solid #86efac;">
                      Evento Activo
                    </span>
                  </div>
                  <p v-else class="stat-label">Sin Evento</p>
                  <h4 style="font-size:.95rem;font-weight:800;color:var(--text-primary);margin-top:.25rem;line-height:1.3">
                    {{ data.evento_inscrito?.nombre || 'Ninguno' }}
                  </h4>
                </div>
                <div class="status-icon indigo-bg" style="flex-shrink:0"><svg style="width:1.5rem;height:1.5rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div>
              </div>
            </div>

            <!-- Banner Descalificado -->
            <div v-if="data.descalificado" style="margin:0 0 1.25rem;background:linear-gradient(135deg,#fef2f2,#fee2e2);border:1.5px solid #fca5a5;border-radius:1rem;padding:1.25rem 1.5rem;display:flex;align-items:flex-start;gap:1rem;">
              <div style="flex-shrink:0;width:2.5rem;height:2.5rem;background:#ef4444;border-radius:50%;display:flex;align-items:center;justify-content:center">
                <svg style="width:1.25rem;height:1.25rem" fill="none" stroke="white" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
              </div>
              <div>
                <p style="font-weight:800;font-size:1rem;color:#b91c1c;margin-bottom:.25rem">Equipo Descalificado</p>
                <p style="font-size:.875rem;color:#dc2626;line-height:1.5">El evento ya inicio y su equipo no tiene los <strong>5 integrantes requeridos ({{ data.miembros?.length || 0 }}/5)</strong>. Los jueces no podran ver ni evaluar su proyecto.</p>
              </div>
            </div>

            <!-- Team & Project Card -->
            <div class="card" style="overflow:hidden">
              <div class="card-header" style="background:var(--card-muted);padding:1.5rem;display:flex;flex-direction:column;gap:1rem;align-items:flex-start">
                <h3 style="font-weight:800;font-size:1.25rem;color:var(--text-primary);display:flex;align-items:center;gap:.5rem">
                  <span style="width:.6rem;height:.6rem;border-radius:50%;background:#4f46e5;display:inline-block"></span>
                  {{ data.equipo.nombre }}
                </h3>
                  <div style="display:flex;gap:.75rem;align-items:center;flex-wrap:wrap">
                    <router-link v-if="data.es_lider && data.equipo && !data.descalificado" :to="{ path: `/participante/equipos/editar/${data.equipo.id}`, query: { evento_id: data.evento_inscrito?.id || undefined } }" 
                      class="btn-manage" :class="{ 'opacity-50 cursor-not-allowed pointer-events-none': !data.evento_inscrito?.configuracion_lista }">
                      <svg style="width:1rem;height:1rem;margin-right:.25rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      Gestionar
                    </router-link>
                    <router-link v-if="data.proyecto && !data.descalificado && isEventoActivo" :to="{ path: '/participante/bitacora', query: { proyectoId: data.proyecto.id } }" 
                      class="btn btn-sm btn-indigo" :class="{ 'opacity-50 cursor-not-allowed pointer-events-none': !data.evento_inscrito?.configuracion_lista }">
                      <svg style="width:1rem;height:1rem;margin-right:.25rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 11l3 3L22 4m-2 1v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h11"/></svg>
                      Subir Avances
                    </router-link>
                    <button v-else-if="data.proyecto && !data.descalificado && !isEventoActivo" disabled class="btn-leave" style="opacity:0.5; cursor:not-allowed;" title="El evento no está activo">
                      <svg style="width:1rem;height:1rem;margin-right:.25rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                      Bloqueado
                    </button>
                  <button v-if="canLeaveTeam" @click="handleAbandonarClick" class="btn-leave">
                    <svg style="width:1rem;height:1rem;margin-right:.25rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                    Abandonar Equipo
                  </button>
                  <button v-else-if="!data.descalificado" disabled class="btn-leave" style="opacity:0.5; cursor:not-allowed;" title="No puedes abandonar un equipo de un evento activo o finalizado.">
                    <svg style="width:1rem;height:1rem;margin-right:.25rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                    Bloqueado
                  </button>
                </div>
              </div>
              <div style="padding:1.5rem">
                <!-- Project Info -->
                <div style="margin-bottom:1.5rem">
                  <h4 class="section-label">Proyecto</h4>
                  <h2 style="font-size:1.5rem;font-weight:700;color:var(--text-primary);margin-bottom:.5rem">{{ data.proyecto?.nombre || 'Sin definir' }}</h2>
                  <p class="project-desc">{{ data.proyecto?.descripcion || 'Agrega una descripción para los jueces.' }}</p>
                  <a v-if="data.proyecto?.repositorio_url" :href="data.proyecto.repositorio_url" target="_blank" class="repo-link">
                    <svg style="width:1rem;height:1rem;margin-right:.25rem" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    Ver Repositorio
                  </a>
                </div>
                <!-- Members -->
                <div>
                  <h4 class="section-label">Integrantes ({{ data.miembros?.length || 0 }}/5)</h4>
                  <div style="display:flex;flex-wrap:wrap;gap:1rem">
                    <div v-for="m in data.miembros" :key="m.id" class="member-chip">
                      <div class="member-avatar">{{ m.nombre?.charAt(0).toUpperCase() }}</div>
                      <div style="display:flex;flex-direction:column">
                        <span style="font-size:.75rem;font-weight:700;color:var(--text-primary)">{{ m.nombre?.split(' ')[0] }}</span>
                        <span style="font-size:.625rem;color:var(--text-muted)">{{ m.perfil || 'Miembro' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            <!-- ======================================== -->
            <!--  WIDGET: SOLICITUDES PENDIENTES (Líder)  -->
            <!-- ======================================== -->
            <div v-if="data.es_lider && data.solicitudes_pendientes?.length" class="solicitudes-widget">
              <div class="widget-header">
                <h3 class="widget-title">
                  <span class="dot"></span>
                  Solicitudes Pendientes
                  <span class="badge">{{ data.solicitudes_pendientes.length }}</span>
                </h3>
              </div>
              <div class="widget-body">
                <div v-for="sol in data.solicitudes_pendientes" :key="sol.id" class="solicitud-item">
                  <div class="user-info">
                    <div class="avatar-mini">{{ sol.participante.user.name.charAt(0) }}</div>
                    <div class="text-info">
                      <p class="name">{{ sol.participante.user.name }}</p>
                      <p class="meta">
                        {{ sol.participante.no_control || 'N/A' }}
                        <span v-if="sol.perfilSugerido" class="role-preview">
                          • {{ sol.perfilSugerido.nombre }}
                        </span>
                      </p>
                    </div>
                  </div>
                  <router-link :to="'/participante/equipos/' + data.equipo.id + '/solicitudes'" class="btn-review">
                    Revisar
                  </router-link>
                </div>
                <router-link :to="'/participante/equipos/' + data.equipo.id + '/solicitudes'" class="view-all">
                  Ver todas las solicitudes →
                </router-link>
              </div>
            </div>

            <!-- Retroalimentación de Jueces -->
            <div class="card">
              <div class="card-body" style="padding:1.5rem">
                <h3 style="font-size:.875rem;font-weight:700;color:var(--text-primary);margin-bottom:1.5rem;display:flex;align-items:center">
                  <svg style="width:1.25rem;height:1.25rem;margin-right:.5rem;color:#4f46e5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/></svg>
                  Retroalimentación de Jueces
                </h3>
                <div v-if="data.comentarios?.length" style="display:flex;flex-direction:column;gap:1.5rem">
                  <div v-for="(comm, i) in data.comentarios" :key="i" style="background:var(--card-muted);padding:1.5rem;border-radius:1rem;border-left:5px solid var(--indigo-500);box-shadow:0 4px 6px -1px rgba(0,0,0,0.03);position:relative">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem">
                       <span style="font-size:0.875rem;font-weight:700;color:var(--indigo-500)">{{ comm.juez }}</span>
                       <span style="font-size:0.75rem;color:var(--text-muted);font-weight:500">{{ timeAgo(comm.fecha) }}</span>
                    </div>
                    <div style="display:flex;gap:0.75rem;align-items:flex-start">
                       <p style="font-size:.9rem;color:var(--text-secondary);line-height:1.7;font-style:italic">"{{ comm.texto }}"</p>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-dashed">
                  <p style="font-size:.875rem;color:var(--text-muted);font-style:italic">Aún no hay mensajes de retroalimentación de los jueces.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- COLUMNA DERECHA (1/3) -->
          <div class="col-right">
            <!-- Calificación Global -->
            <div class="status-card">
              <div>
                <p class="stat-label">Calificación Global</p>
                <h4 style="font-size:1.25rem;font-weight:700;color:var(--text-primary);margin-top:.25rem">
                  {{ Number(data.puntajeTotal || 0).toFixed(1) }} <span style="font-size:.75rem;color:var(--text-muted);font-weight:400">/ 100</span>
                </h4>
              </div>
              <div class="status-icon blue-bg">
                <svg style="width:1.5rem;height:1.5rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              </div>
            </div>

            <!-- Mini Chart / Criterios -->
            <div class="card" style="cursor:pointer" @click="showMetrics = true">
              <div class="card-body" style="padding:1.25rem">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
                  <h3 style="font-size:.875rem;font-weight:700;color:var(--text-primary)">Calificación por criterio</h3>
                  <span style="font-size:.625rem;background:var(--card-muted);color:var(--text-muted);padding:.25rem .5rem;border-radius:.25rem">Ver Detalle</span>
                </div>
                <div v-if="data.puntajeTotal > 0" style="display:flex;flex-direction:column;gap:.5rem">
                  <div v-for="(label, i) in data.chartLabels?.slice(0,3)" :key="i">
                    <div style="display:flex;justify-content:space-between;font-size:.7rem;margin-bottom:.125rem">
                      <span style="color:var(--text-secondary)">{{ label }}</span>
                      <span style="font-weight:700;color:#4f46e5">{{ data.chartData[i] }}</span>
                    </div>
                    <div style="background:var(--border-color);border-radius:9999px;height:.25rem;overflow:hidden">
                      <div style="background:var(--indigo-500);height:100%;border-radius:9999px" :style="{ width: (data.chartData[i] || 0) + '%' }"></div>
                    </div>
                  </div>
                </div>
                <div v-else style="text-align:center;padding:1.5rem;position:relative">
                  <span style="font-size:.75rem;color:var(--text-muted);background:var(--bg-card);padding:.25rem .75rem;border-radius:9999px;border:1px solid var(--border-color)">Pendiente</span>
                </div>
              </div>
            </div>

            <!-- Próximos Eventos -->
            <div class="card">
              <div class="card-body" style="padding:1.25rem">
                <h3 style="font-size:.875rem;font-weight:700;color:var(--text-primary);margin-bottom:1rem">Próximos Eventos</h3>
                <div v-if="!data.eventos?.length" style="text-align:center;padding:1rem">
                  <p style="font-size:.75rem;color:var(--text-muted)">No hay eventos disponibles actualmente.</p>
                </div>
                <div v-else style="max-height: 350px; overflow-y: auto; padding-right: 0.5rem;">
                  <div style="display:flex;flex-direction:column;gap:.75rem">
                    <div v-for="e in data.eventos" :key="e.id" class="event-item" style="padding:.5rem">
                      <div class="event-date-box" style="width:2.5rem;height:2.5rem;font-size:.5rem">
                        <span class="month" style="font-size:.5rem">{{ getMonth(e.fecha_inicio) }}</span>
                        <span class="day" style="font-size:.875rem">{{ getDay(e.fecha_inicio) }}</span>
                      </div>
                      <div style="overflow:hidden;min-width:0">
                        <p style="font-size:.875rem;font-weight:700;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ e.nombre }}</p>
                        <p style="font-size:.625rem;color:var(--text-muted)">Cierre: {{ formatShortDate(e.fecha_fin) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ======================================== -->
      <!--  SIN EQUIPO O ENROLAMIENTO: Cards de acción  -->
      <!-- ======================================== -->
      <template v-else>
        <div class="action-grid">
          <!-- Crear Equipo -->
          <router-link :to="{ path: '/participante/equipos/crear', query: { evento_id: data.evento_inscrito?.id } }" class="action-card" style="--accent:#4f46e5;--accent-bg:rgba(79,70,229,.08)">
            <div class="action-icon">
              <svg style="width:2rem;height:2rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            </div>
            <h3 class="action-title">Crear un Nuevo Equipo</h3>
            <p class="action-desc">Registra tu idea para <strong>{{ data.evento_inscrito?.nombre }}</strong> y recluta compañeros.</p>
            <span class="action-cta">
              Registro →
            </span>
          </router-link>

          <!-- Unirse a Equipo -->
          <router-link :to="{ path: '/participante/equipos/unirse', query: { evento_id: data.evento_inscrito?.id } }" class="action-card" style="--accent:#8b5cf6;--accent-bg:rgba(139,92,246,.08)">
            <div class="action-icon" style="background:var(--accent-bg)">
              <svg style="width:2rem;height:2rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            </div>
            <h3 class="action-title" style="color:var(--accent)">Unirme a un Equipo</h3>
            <p class="action-desc">Explora vacantes activas en <strong>{{ data.evento_inscrito?.nombre }}</strong>.</p>
            <span class="action-cta" style="color:var(--accent)">
              Ver Vacantes →
            </span>
          </router-link>

          <!-- Próximos Eventos (sin equipo) -->
          <div class="card" style="display:flex;flex-direction:column;min-height:240px">
            <div class="card-body" style="padding:1.25rem;flex:1">
              <h3 style="font-size:.8rem;font-weight:700;color:var(--text-primary);margin-bottom:.75rem">Próximos Eventos</h3>
              <div v-if="!data.eventos?.length" style="text-align:center;padding:1rem"><p style="font-size:.7rem;color:var(--text-muted)">No hay eventos.</p></div>
              <div v-else style="max-height: 200px; overflow-y: auto; padding-right: 0.25rem;">
                <div style="display:flex;flex-direction:column;gap:.5rem">
                  <div v-for="e in data.eventos" :key="e.id" class="event-item" style="padding: 0.4rem; gap: 0.75rem">
                    <div class="event-date-box" style="width: 2.25rem; height: 2.25rem">
                      <span class="month" style="font-size: 0.45rem">{{ getMonth(e.fecha_inicio) }}</span>
                      <span class="day" style="font-size: 0.8rem">{{ getDay(e.fecha_inicio) }}</span>
                    </div>
                    <div style="overflow:hidden;min-width:0">
                      <p style="font-size:.75rem;font-weight:700;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap" :title="e.nombre">{{ e.nombre }}</p>
                      <p style="font-size:.6rem;color:var(--text-muted)">Cierre: {{ formatShortDate(e.fecha_fin) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ======================================== -->
      <!--  MODAL: Detalle de Métricas              -->
      <!-- ======================================== -->
      <div v-if="showMetrics" class="modal-overlay" @click.self="showMetrics = false">
        <div class="modal-content" style="max-width:800px">
          <div class="modal-header">
            <h3 style="font-size:1.125rem;font-weight:700;color:var(--text-primary)">Desglose de Calificaciones</h3>
            <button @click="showMetrics = false" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:1.25rem"></button>
          </div>
          <div class="modal-body" style="padding:2rem">
            <div class="metrics-grid">
              <!-- Radar Chart Container -->
              <div class="chart-container">
                <canvas id="radarMetrics"></canvas>
              </div>
              
              <!-- Criteria List -->
              <div class="criteria-details">
                <p style="font-size:.75rem;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:1.5rem">Detalle por Criterio</p>
                <div v-if="data.chartLabels?.length" style="display:flex;flex-direction:column;gap:1.25rem">
                  <div v-for="(label, i) in data.chartLabels" :key="i">
                    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:.4rem">
                      <span style="font-size:.875rem;font-weight:500;color:var(--text-secondary)">{{ label }}</span>
                      <span style="font-size:.875rem;font-weight:700;color:var(--indigo-500)">{{ data.chartData[i] || 0 }}<span style="font-size:.75rem;color:var(--text-muted);font-weight:400">/100</span></span>
                    </div>
                    <div style="background:var(--border-color);border-radius:9999px;height:.4rem;overflow:hidden">
                      <div style="background:var(--indigo-500);height:100%;border-radius:9999px" :style="{ width: (data.chartData[i] || 0) + '%' }"></div>
                    </div>
                  </div>
                </div>
                <p v-else style="color:var(--text-muted);font-size:.875rem">Sin datos para mostrar.</p>
              </div>
            </div>
          </div>
          <div class="modal-footer" style="background:var(--bg-card);border:none;justify-content:flex-end">
            <button @click="showMetrics = false" class="btn btn-outline" style="min-width:120px;border-radius:.75rem">Cerrar</button>
          </div>
        </div>
      </div>

      <!-- ======================================== -->
      <!--  MODAL: Transferencia de Liderazgo       -->
      <!-- ======================================== -->
      <div v-if="showLeaveModal" class="modal-overlay" @click.self="showLeaveModal = false">
        <div class="modal-content" style="max-width:500px">
          <div class="modal-header">
            <h3 style="font-size:1.125rem;font-weight:700;color:var(--text-primary)">Transferir Liderazgo</h3>
            <button @click="showLeaveModal = false" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:1.25rem"></button>
          </div>
          <div class="modal-body" style="padding:1.5rem">
            <p style="font-size:0.875rem;color:var(--text-secondary);margin-bottom:1.5rem;line-height:1.5">
              Como eres el único líder actual, debes designar a un sucesor antes de poder abandonar el equipo.
            </p>
            <div class="form-group">
              <label style="display:block;font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:0.5rem">Nuevo Líder del Equipo</label>
              <select v-model="selectedSuccessorId" class="modal-select" style="width:100%">
                <option value="">-- Selecciona un integrante --</option>
                <option v-for="m in data.miembros.filter(mi => mi.id != auth.user?.id)" :key="m.id" :value="m.id">
                  {{ m.nombre }} ({{ m.perfil || 'Miembro' }})
                </option>
              </select>
            </div>
          </div>
          <div class="modal-footer" style="display:flex;justify-content:flex-end;gap:1rem">
            <button @click="showLeaveModal = false" class="btn btn-outline">Cancelar</button>
            <button @click="confirmAbandonarConLider" class="btn btn-indigo" :disabled="!selectedSuccessorId">
              Confirmar y Salir
            </button>
          </div>
        </div>
      </div>

        <!-- Calendario Siempre Visible al Final -->
        <CalendarWidget :eventos="data.eventos || []" v-if="data.eventos" />
      </div>
    </AppLayout>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppLayout from '../../components/layout/AppLayout.vue'
import CalendarWidget from '../../components/CalendarWidget.vue'
import api from '../../plugins/axios'
import alerts from '../../services/alerts'
import Chart from 'chart.js/auto'
import { useAuthStore } from '../../stores/auth.store'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const data = ref({})
const loading = ref(true)
const showEnrollmentSection = ref(false)

const filteredAvailableEvents = computed(() => {
  if (!data.value.eventos) return []
  const enrolledIds = data.value.participaciones?.map(p => p.evento_id) || []
  return data.value.eventos.filter(e => !enrolledIds.includes(e.id))
})

const isEventoActivo = computed(() => {
  if (!data.value.evento_inscrito) return false;
  const now = new Date();
  const start = new Date(data.value.evento_inscrito.fecha_inicio);
  const end = new Date(data.value.evento_inscrito.fecha_fin);
  return now >= start && now <= end;
});

const canLeaveTeam = computed(() => {
  if (!data.value.evento_inscrito) return true
  const now = new Date()
  const start = new Date(data.value.evento_inscrito.fecha_inicio)
  return now < start
})
const showMetrics = ref(false)
const showLeaveModal = ref(false)
const selectedSuccessorId = ref('')
const activeContextId = ref(null) // Format: 'p:ID' or 'e:ID'
let radarChart = null

watch(showMetrics, (val) => {
  if (val) {
    nextTick(() => {
      initRadar()
    })
  } else {
    if (radarChart) radarChart.destroy()
  }
})

function initRadar() {
  const canvas = document.getElementById('radarMetrics')
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  
  if (radarChart) radarChart.destroy()
  
  radarChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: data.value.chartLabels || [],
      datasets: [{
        label: 'Calificación',
        data: data.value.chartData || [],
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderColor: '#6366f1',
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#6366f1',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          min: 0,
          max: 100,
          beginAtZero: true,
          ticks: { display: false, stepSize: 20 },
          grid: { color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || '#e5e7eb' },
          angleLines: { color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || '#e5e7eb' },
          pointLabels: {
            font: { size: 10, weight: '600' },
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#6b7280'
          }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  })
}

const getMonth = d => d ? new Date(d).toLocaleDateString('es-MX',{month:'short'}).toUpperCase() : ''
const getDay = d => d ? new Date(d).getDate() : ''
const formatShortDate = d => d ? new Date(d).toLocaleDateString('es-MX',{day:'2-digit',month:'2-digit'}) : ''
const timeAgo = (date) => {
  if (!date) return ''
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return `${seconds} seconds ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minutes ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hours ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} days ago`
  return new Date(date).toLocaleDateString()
}

async function respondInvite(id, estado) {
  try {
    await api.post(`/participante/invitaciones/${id}/responder`, { estado })
    fetchData()
  } catch(e) { console.error(e) }
}

async function fetchData(id = null) {
  try {
    loading.value = true
    const params = {}
    
    // Parse the context ID (p:proyectoId or e:eventoId)
    if (id) {
      const [type, val] = id.split(':')
      if (type === 'p') params.proyectoId = val
      else if (type === 'e') params.eventoId = val
    }
    
    const r = await api.get('/participante/dashboard', { params })
    data.value = r.data.data
    
    // Auto-select context on first load if not set AND not in enrollment mode
    if (!showEnrollmentSection.value && !activeContextId.value && data.value.participaciones?.length) {
      activeContextId.value = `p:${data.value.proyecto?.id || data.value.participaciones[0].proyecto_id}`
    } else if (!activeContextId.value && !data.value.participaciones?.length && data.value.eventos?.length) {
      // Fallback to first available event if no team
      activeContextId.value = `e:${data.value.eventos[0].id}`
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

watch(activeContextId, (newVal) => {
  if (newVal) {
    // Si elegimos un proyecto, quitamos el modo enrolamiento
    showEnrollmentSection.value = false
    // Quitamos el query del URL para que el sidebar funcione de nuevo al dar click
    router.replace({ query: {} })
    fetchData(newVal)
  }
})

// Accion desde Sidebar (Reforzada)
watch(() => route.query, (q) => {
  if (q.enroll === 'true') {
    showEnrollmentSection.value = true
    activeContextId.value = null // Limpiar selector
    fetchData() // Cargar datos limpios para inscripcion
  } else {
    showEnrollmentSection.value = false
  }
}, { immediate: true, deep: true })

async function handleAbandonarClick() {
  if (!await alerts.confirm('¿Estás seguro de abandonar el equipo?', 'Abandonar Equipo', 'Sí, abandonar', 'Cancelar')) return;
  
  // Si es el único líder y hay más gente
  const otrosMiembros = data.value.miembros.filter(m => m.id != auth.user?.id);
  const otrosLideres = otrosMiembros.filter(m => m.es_lider || m.perfil === 'LIDER');
  
  if (data.value.es_lider && otrosLideres.length === 0) {
    if (otrosMiembros.length === 0) {
       alerts.warning('No puedes abandonar el equipo siendo el único integrante. Para eliminarlo contacta al administrador.');
       return;
    }
    // Abrir modal de transferencia
    selectedSuccessorId.value = '';
    showLeaveModal.value = true;
  } else {
    // Caso normal
    abandonarEquipo();
  }
}

async function confirmAbandonarConLider() {
  if (!selectedSuccessorId.value) return;
  await abandonarEquipo(selectedSuccessorId.value);
  showLeaveModal.value = false;
}

async function abandonarEquipo(nuevoLiderId = null) {
  try {
    loading.value = true;
    const eventoId = data.value.evento_inscrito?.id || undefined;
    const res = await api.delete('/participante/equipos/salir', {
      data: { nuevoLiderId },
      params: { evento_id: eventoId }
    });
    if (res.data.success) {
      alerts.success(res.data.message);
      fetchData();
    }
  } catch (e) {
    alerts.error(e.response?.data?.message || 'Error al abandonar el equipo');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* Layout */
.grid-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
.col-left { display: flex; flex-direction: column; gap: 1.5rem; }
.col-right { display: flex; flex-direction: column; gap: 1.5rem; }
@media (max-width: 1024px) { .grid-layout { grid-template-columns: 1fr; } }

/* Status Row */
.status-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.status-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: .75rem; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,.04); display: flex; align-items: center; justify-content: space-between; }
.status-icon { padding: .75rem; border-radius: 9999px; }
.green-bg { background: rgba(16,185,129,.1); color: #10b981; }
.indigo-bg { background: rgba(79,70,229,.1); color: var(--indigo-500); }
.blue-bg { background: rgba(59,130,246,.1); color: #3b82f6; }

/* Labels */
.section-label { font-size: .7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .05em; margin-bottom: .5rem; }
.project-desc { font-size: .875rem; color: var(--text-secondary); line-height: 1.6; background: var(--card-muted); padding: 1rem; border-radius: .5rem; border: 1px solid var(--border-color); }
.repo-link { display: inline-flex; align-items: center; font-size: .875rem; color: var(--indigo-500); text-decoration: none; margin-top: 1rem; }
.repo-link:hover { text-decoration: underline; }

/* Members */
.member-chip { display: flex; align-items: center; gap: .75rem; padding: .5rem 1rem .5rem .5rem; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 9999px; box-shadow: 0 1px 2px rgba(0,0,0,.04); }
.member-avatar { width: 2rem; height: 2rem; border-radius: 9999px; background: linear-gradient(135deg, var(--indigo-500), #8b5cf6); display: flex; align-items: center; justify-content: center; font-size: .75rem; font-weight: 700; color: #fff; text-transform: uppercase; }

/* Action Cards (sin equipo) */
.action-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
@media (max-width: 768px) { .action-grid { grid-template-columns: 1fr; } }

.action-card { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; min-height: 240px; padding: 1.25rem; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: .75rem; box-shadow: 0 1px 3px rgba(0,0,0,.04); text-decoration: none; transition: all .4s ease; }
.action-card:hover { box-shadow: 0 15px 40px rgba(0,0,0,.12); transform: translateY(-.5rem); border-color: var(--accent); }
.action-icon { width: 4rem; height: 4rem; border-radius: 9999px; background: var(--accent-bg); display: flex; align-items: center; justify-content: center; color: var(--accent); margin-bottom: 1rem; transition: all .4s ease; }
.action-card:hover .action-icon { background: var(--accent); color: #fff; transform: scale(1.1); }
.action-title { font-size: 1.125rem; font-weight: 700; color: var(--text-primary); margin-bottom: .5rem; transition: color .3s; }
.action-card:hover .action-title { color: var(--accent); }
.action-desc { font-size: .8rem; color: var(--text-muted); margin-bottom: 1.25rem; max-width: 14rem; line-height: 1.4; }
.action-cta { display: inline-flex; align-items: center; font-size: .8rem; font-weight: 700; color: var(--accent, var(--indigo-500)); transition: transform .3s; }
.action-card:hover .action-cta { transform: scale(1.05); }

/* Invitations Banner */
.invitaciones-banner {
  background: linear-gradient(135deg, rgba(79,70,229,0.08), rgba(129,140,248,0.06));
  border: 1px solid rgba(99,102,241,0.25);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  animation: fadeSlideIn 0.4s ease;
}
@keyframes fadeSlideIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }

.inv-banner-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
.inv-icon-wrapper { position: relative; width: 2.75rem; height: 2.75rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.inv-icon { width: 1.5rem; height: 1.5rem; color: var(--indigo-500); position: relative; z-index: 1; }
.inv-icon-pulse {
  position: absolute; inset: 0; border-radius: 50%;
  background: rgba(99,102,241,0.15);
  animation: invPulse 2s ease-in-out infinite;
}
@keyframes invPulse { 0%,100% { transform:scale(1); opacity:0.6; } 50% { transform:scale(1.25); opacity:0; } }
.inv-title { font-size: 1.05rem; font-weight: 700; color: var(--text-primary); }
.inv-subtitle { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.15rem; }

.inv-list { display: flex; flex-direction: column; gap: 0.5rem; }
.inv-card {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.inv-card:hover { border-color: rgba(99,102,241,0.4); box-shadow: 0 2px 12px rgba(99,102,241,0.08); }
.inv-card-left { display: flex; align-items: center; gap: 0.75rem; }
.inv-team-avatar {
  width: 2.25rem; height: 2.25rem; border-radius: 0.625rem;
  background: linear-gradient(135deg, var(--indigo-500), var(--indigo-600, #4f46e5));
  color: white; font-weight: 800; font-size: 0.85rem;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.inv-card-info { display: flex; flex-direction: column; gap: 0.15rem; }
.inv-team-name { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }
.inv-role-badge {
  font-size: 0.7rem; font-weight: 700; color: var(--indigo-500);
  text-transform: uppercase; letter-spacing: 0.03em;
}
.inv-card-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }

@media (max-width: 640px) {
  .inv-card { flex-direction: column; align-items: stretch; gap: 0.75rem; }
  .inv-card-actions { justify-content: flex-end; }
}

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 1rem; }
.modal-content { background: var(--bg-card); border-radius: 1.5rem; max-width: 40rem; width: 100%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); border: 1px solid var(--border-color); overflow: hidden; }
.modal-header { padding: 1.5rem 2rem; background: var(--bg-card); border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
.modal-body { padding: 1.5rem; max-height: 85vh; overflow-y: auto; }
.modal-footer { padding: 1.25rem 2rem; background: var(--card-muted); border-top: 1px solid var(--border-color); }

.metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; align-items: center; }
@media (max-width: 640px) { .metrics-grid { grid-template-columns: 1fr; } .chart-container { height: 250px; } }
.chart-container { height: 320px; position: relative; }
.criteria-details { display: flex; flex-direction: column; }

/* Empty state */
.empty-dashed { text-align: center; padding: 1.5rem; border: 2px dashed var(--border-color); border-radius: .5rem; }

/* Action Buttons */
.btn-manage {
  display: inline-flex;
  align-items: center;
  font-size: .75rem;
  padding: .375rem .75rem;
  border-radius: .5rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-weight: 500;
  transition: all .2s;
  text-decoration: none;
}
.btn-manage:hover { background: var(--card-muted); color: var(--text-primary); }

.btn-leave {
  display: inline-flex;
  align-items: center;
  font-size: .75rem;
  padding: .375rem .75rem;
  border-radius: .5rem;
  background: var(--bg-card);
  border: 1px solid #fee2e2;
  color: #dc2626;
  font-weight: 500;
  transition: all .2s;
  cursor: pointer;
}
.btn-leave:hover { background: #fee2e2; }

/* Solicitudes Widget */
.solicitudes-widget {
  background: var(--bg-card);
  border-radius: 0.75rem;
  border: 1px solid var(--border-color);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 1.5rem;
}
.widget-header {
  padding: 1rem 1.5rem;
  background: var(--card-muted);
  border-bottom: 1px solid var(--border-color);
}
.widget-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.widget-title .dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--indigo-500);
}
.widget-title .badge {
  margin-left: auto;
  background: var(--border-color);
  color: var(--text-primary);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
}
.widget-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.solicitud-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  background: var(--card-muted);
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
}
.solicitud-item .user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  flex: 1;
}
.avatar-mini {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background: var(--border-color);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}
.text-info {
  min-width: 0;
}
.text-info .name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.text-info .meta {
  font-size: 0.75rem;
  color: var(--text-muted);
}
.role-preview {
  color: var(--indigo-500);
  font-weight: 600;
}
.btn-review {
  background: var(--indigo-500);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  text-decoration: none;
  transition: background 0.2s;
}
.btn-review:hover {
  background: var(--indigo-600);
}
.view-all {
  display: block;
  text-align: center;
  margin-top: 1rem;
  color: var(--indigo-600);
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
}
.view-all:hover {
  text-decoration: underline;
}

/* Modal Select Custom */
.modal-select {
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid var(--border-color);
  background: var(--bg-input);
  color: var(--text-primary);
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
  appearance: auto;
}
.modal-select:focus {
  border-color: var(--indigo-500);
}

</style>
