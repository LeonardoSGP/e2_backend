import express, { Application } from 'express';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

import { errorMiddleware } from './middlewares/error.middleware';
import { config } from './config';

import { authRouter } from './modules/auth/auth.router';
import { userRouter } from './users/user.router';
import { eventoRouter } from './modules/eventos/evento.router';
import { criterioRouter } from './modules/criterios/criterio.router';
import { equipoRouter } from './modules/equipos/equipo.router';
import { proyectoRouter } from './modules/proyectos/proyecto.router';
import { adminRouter } from './modules/admin/admin.router';
import { resultadosRouter } from './modules/resultados/resultados.router';
import { juezRouter } from './modules/jueces/juez.router';
import { avanceRouter } from './modules/avances/avance.router';
import { invitacionRouter } from './modules/invitaciones/invitacion.router';
import { constanciaRouter } from './modules/constancias/constancias.router';
import { reportesRouter } from './modules/reportes/reportes.router';
import { participanteDashboardRouter } from './modules/participante/participante.router';
import { carreraRouter } from './modules/carreras/carrera.router';
import { perfilesRouter } from './modules/perfiles/perfiles.router';

const app: Application = express();

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Deltos API', version: '1.0.0', description: 'API Node + Express + Prisma' },
    servers: [{ url: `http://localhost:${config.port}` }],
    components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/modules/**/*.router.ts', './src/modules/**/*.schema.ts'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middlewares
// En producción, CORS acepta solo el dominio del frontend (FRONTEND_URL).
// En desarrollo acepta cualquier origen.
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:5173', 'http://localhost:8080'];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (Postman, servidor a servidor, Swagger)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS bloqueado para el origen: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());

// Serve uploaded files (avatars, etc.)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Root route for API health check
app.get('/', (req, res) => {
  res.json({
    message: 'API del Sistema de Gestión de Proyectos Académicos (Deltos) funcionando',
    version: '1.0.0',
    docs: '/api-docs'
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

import { authMiddleware } from './middlewares/auth.middleware';
import { requireRole } from './middlewares/role.middleware';

// Guards de seguridad global por grupo de rutas
const adminGuard = [authMiddleware, requireRole(['ADMIN'])];
const juezGuard = [authMiddleware, requireRole(['JUEZ'])];
const participanteGuard = [authMiddleware, requireRole(['PARTICIPANTE'])];

// Main Routes
app.use('/api/auth', authRouter);

// Admin Routes (Protegidas solo para ADMIN)
app.use('/api/admin/usuarios', adminGuard, userRouter);
app.use('/api/admin/carreras', adminGuard, carreraRouter);
app.use('/api/admin/perfiles', adminGuard, perfilesRouter);
app.use('/api/admin/eventos', adminGuard, eventoRouter);
app.use('/api/admin/criterios', adminGuard, criterioRouter);
app.use('/api/admin/equipos', adminGuard, equipoRouter);
app.use('/api/admin/proyectos', adminGuard, proyectoRouter);
app.use('/api/admin/dashboard', adminGuard, adminRouter);
app.use('/api/admin/resultados', adminGuard, resultadosRouter);
app.use('/api/admin/constancias', adminGuard, constanciaRouter);
app.use('/api/admin/reportes', adminGuard, reportesRouter);

// Juez Routes (Protegidas solo para JUEZ)
app.use('/api/juez', juezGuard, juezRouter);

// Participante Routes (Protegidas solo para PARTICIPANTE)
app.use('/api/participante/avances', participanteGuard, avanceRouter);
app.use('/api/participante/invitaciones', participanteGuard, invitacionRouter);
app.use('/api/participante/resultados', participanteGuard, resultadosRouter);
app.use('/api/participante', participanteGuard, participanteDashboardRouter);

// Swagger Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Global Error Handler (must be last middleware)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  errorMiddleware(err, req, res, next);
});

export default app;
