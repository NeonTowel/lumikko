import { Hono } from "hono";
import { cors } from 'hono/cors';
import type { CloudflareBindings } from './types';
import { apiRoutes } from "./routes";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use('*', cors({
  origin: ['https://lumikko.app', 'http://localhost:5173', 'http://localhost:4173'],
  allowMethods: ['POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Handle versioned routes by mounting the same routes at different paths
app.route('/v1', apiRoutes)
app.route('/v2beta', apiRoutes)
app.route('/', apiRoutes)

export default app;
