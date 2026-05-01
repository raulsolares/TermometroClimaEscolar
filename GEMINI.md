# Termómetro de Clima Escolar - Project Context

## Project Overview
Este proyecto es un MVP para medir el bienestar emocional diario de niños de kinder y primaria. La aplicación es una PWA construida con Next.js (App Router) y Supabase.

### Stack Tecnológico
- **Frontend:** Next.js 15+ (App Router), React 19, Tailwind CSS.
- **Backend/Database:** Supabase (Auth, PostgreSQL, RLS).
- **Icons:** Lucide React.
- **Utils:** clsx, tailwind-merge.

## Arquitectura de Archivos
- `src/app/`: Rutas de la aplicación y layouts.
- `src/components/`: Componentes de UI reutilizables.
- `src/lib/`: Configuración de Supabase, tipos y utilidades de scoring.
- `src/hooks/`: Custom hooks para auth y datos.

## Convenciones de Desarrollo
- **Estilo:** Seguir patrones idiomáticos de Next.js App Router.
- **Componentes:** Usar componentes funcionales y "use client" solo cuando sea necesario.
- **Mobile First:** Todo el diseño debe estar optimizado para dispositivos móviles (máximo 480px de ancho recomendado para el contenedor principal).
- **Naming:** CamelCase para componentes, kebab-case para archivos de utilidad.

## Comandos Principales
- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Construye la aplicación para producción.
- `npm run lint`: Ejecuta el linter.

## Despliegue en Vercel

1. **Subir a GitHub:** Sube el código a un repositorio de GitHub.
2. **Crear Proyecto en Vercel:** Importa el repositorio desde el dashboard de Vercel.
3. **Configurar Variables de Entorno:**
   - Agrega `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en la sección "Environment Variables" de Vercel.
4. **Configurar Supabase Redirects:**
   - En tu Dashboard de Supabase, ve a **Authentication > URL Configuration**.
   - Agrega la URL de tu despliegue de Vercel (ej. `https://tu-app.vercel.app/**`) en **Redirect URLs**. Esto es vital para que el Magic Link funcione correctamente.
5. **Listo:** Vercel detectará automáticamente que es un proyecto Next.js y ejecutará el build.

## Base de Datos (Supabase SQL)
```sql
-- Children Table
create table public.children (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  age int,
  group_name text,
  created_at timestamp with time zone default now()
);

-- Responses Table
create table public.responses (
  id uuid default gen_random_uuid() primary key,
  child_id uuid references public.children not null,
  date date default current_date,
  mood int check (mood in (1, 2, 3)), -- 1: Mal, 2: Neutral, 3: Bien
  played boolean not null,
  bullied boolean not null,
  event_type text,
  notes text,
  created_at timestamp with time zone default now()
);
```
