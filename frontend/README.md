# Frontend - React + TypeScript + shadcn/ui

Este directorio contiene el frontend moderno de la aplicación Agentic Payments Demo.

## Tecnologías

- **React 19** - Biblioteca de JavaScript para construir interfaces de usuario
- **TypeScript** - Tipado estático para JavaScript
- **Vite** - Herramienta de construcción rápida
- **Tailwind CSS** - Framework de CSS utilitario
- **shadcn/ui** - Componentes de UI reutilizables
- **Radix UI** - Componentes primitivos accesibles

## Ejecutar en desarrollo

### Desde el directorio raíz del proyecto:
```bash
npm run start:frontend
```

### Desde este directorio:
```bash
npx --no-install vite
```

## Construir para producción

```bash
npm run build:frontend
```

## Estructura

```
src/
├── components/
│   └── ui/           # Componentes shadcn/ui
├── lib/
│   └── utils.ts      # Funciones utilitarias
├── App.tsx           # Componente principal
└── index.css         # Estilos globales con Tailwind
```

## Configuración

**TypeScript (Project References):**
- `tsconfig.json` - Coordinador principal de TypeScript
- `tsconfig.app.json` - Configuración para la aplicación React
- `tsconfig.node.json` - Configuración para herramientas Node.js (Vite)

**Otras configuraciones:**
- `components.json` - Configuración de shadcn/ui
- `vite.config.ts` - Configuración de Vite con aliases (@/)
- `postcss.config.js` - Configuración de PostCSS para Tailwind v4
- `index.css` - Configuración CSS de Tailwind v4 (usando @theme)

## Integración con Backend

El frontend se conecta con los servicios backend:
- Consumer Agent (puerto 4000)
- Provider Agent (puerto 4001)  
- Payment Orchestrator (puerto 4002)
