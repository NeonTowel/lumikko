import { Hono } from "hono";
import { cors } from 'hono/cors';
import type { CloudflareBindings } from './types';
import { apiRoutes } from "./routes";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use('*', cors({
  origin: '*',
  allowMethods: ['POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Handle versioned routes by mounting the same routes at different paths
app.route('/v1', apiRoutes)
app.route('/v2beta', apiRoutes)
app.route('/', apiRoutes)

export default app;
