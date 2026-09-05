# Plugin de Autenticación OAuth Antigravity + Gemini CLI para OpenCode

**[ English ](README.md) · [ Español ](README.es.md)**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Permite a OpenCode autenticarse contra **Antigravity** (el IDE de Google) mediante OAuth para aprovechar los límites de cuota de Antigravity y acceder a modelos como `gemini-3.7-flash`, `gemini-3.1-pro` y `claude-opus-4-6-thinking` utilizando tus credenciales de Google.

## Características principales

- **Claude Opus 4.6, Sonnet 4.6** y **Gemini 3.7 Flash / 3.1 Pro** mediante Google OAuth.
- **Soporte multi-cuenta** — Agrega múltiples cuentas de Google con rotación automática ante límites de tasa (*rate limits*).
- **Sistema de cuota dual** — Accede tanto a la cuota de Antigravity como a la de Gemini CLI desde un único plugin.
- **Modelos con pensamiento (Thinking)** — Pensamiento extendido para Claude y Gemini 3 con presupuestos configurables.
- **Búsqueda web integrada (Google Search)** — Búsqueda en internet para modelos Gemini (automática o explícita).
- **Auto-recuperación de sesiones** — Maneja errores de sesión y fallos de herramientas automáticamente.
- **Compatibilidad total de plugins** — Funciona en conjunto con otros plugins de OpenCode (oh-my-opencode, dcp, etc.).

---

<details open>
<summary><b>⚠️ Advertencia de Términos de Servicio — Leer antes de instalar</b></summary>

> [!CAUTION]
> El uso de este plugin (y de cualquier proxy para Antigravity) puede violar los Términos de Servicio de Google. Algunos usuarios han reportado bloqueos en sus cuentas de Google.
>
> **Al usar este plugin, reconoces que:**
> - Es una herramienta no oficial no respaldada por Google.
> - Tu cuenta podría ser suspendida o bloqueada.
> - Asumes todos los riesgos asociados con el uso de este plugin.

</details>

---

## Instalación

<details open>
<summary><b>Para Humanos</b></summary>

**Opción A: Dejar que un agente de IA lo haga**

Pega esta instrucción en tu agente de IA (Claude Code, OpenCode, Cursor, etc.):

```
Instala el plugin opencode-antigravity-auth y agrega las definiciones de modelos de Antigravity a ~/.config/opencode/opencode.json siguiendo las instrucciones de: https://raw.githubusercontent.com/EdwinEstrella/opencode-antigravity-auth/main/README.es.md
```

**Opción B: Configuración manual**

1. **Agrega el plugin** en `~/.config/opencode/opencode.json`:

   ```json
   {
     "plugin": ["opencode-antigravity-auth@latest"]
   }
   ```

2. **Inicia sesión** con tu cuenta de Google:

   ```bash
   opencode auth login
   ```

3. **Configura los modelos** — elige una opción:
   - Ejecuta `opencode auth login` → Google → OAuth with Google (Antigravity) → selecciona **"Configure models in opencode.json"** (auto-configura todos los modelos automáticamente).
   - O copia manualmente la [configuración completa](#modelos) debajo.

4. **Úsalo:**

   ```bash
   opencode run "Hola" --model=google/antigravity-claude-opus-4-6-thinking --variant=max
   ```

</details>

<details>
<summary><b>Para Agentes de IA</b></summary>

### Instrucciones paso a paso

1. Edita el archivo de configuración de OpenCode en `~/.config/opencode/opencode.json`.
   > **Nota**: Esta ruta funciona en todas las plataformas. En Windows, `~` apunta al directorio home de usuario (`C:\Users\TuNombre`).

2. Agrega el plugin al array `plugin`.

3. Agrega las definiciones de modelos de la sección [Configuración completa de modelos](#modelos).

4. Configura el proveedor `google` y elige el modelo deseado.

### Verificación

```bash
opencode run "Hola" --model=google/antigravity-claude-opus-4-6-thinking --variant=max
```

</details>

---

## Modelos

### Referencia de modelos

**Cuota de Antigravity** (enrutamiento predeterminado para Claude y Gemini):

| Modelo | Variantes | Notas |
|-------|----------|-------|
| `antigravity-gemini-3.8-flash` | minimal, low, medium, high | Gemini 3.8 Flash con thinking (Antigravity tiered) |
| `antigravity-gemini-3.7-flash` | minimal, low, medium, high | Gemini 3.7 Flash con thinking (Antigravity tiered) |
| `antigravity-gemini-3.1-flash-lite` | — | Gemini 3.1 Flash Lite |
| `antigravity-gemini-3.1-pro` | low, high | Gemini 3.1 Pro con thinking |
| `antigravity-gemini-3-flash` | minimal, low, medium, high | Gemini 3 Flash con thinking |
| `antigravity-gemini-3-pro` | low, high | Gemini 3 Pro con thinking |
| `antigravity-claude-sonnet-4-6` | — | Claude Sonnet 4.6 |
| `antigravity-claude-opus-4-6-thinking` | low, max | Claude Opus 4.6 con pensamiento extendido |

**Cuota de Gemini CLI** (independiente de Antigravity; usada con `cli_first` o como respaldo):

| Modelo | Notas |
|-------|-------|
| `gemini-2.5-flash` | Gemini 2.5 Flash |
| `gemini-2.5-pro` | Gemini 2.5 Pro |
| `gemini-3-flash-preview` | Gemini 3 Flash (preview) |
| `gemini-3-pro-preview` | Gemini 3 Pro (preview) |
| `gemini-3.1-pro-preview` | Gemini 3.1 Pro (preview) |
| `gemini-3.1-pro-preview-customtools` | Gemini 3.1 Pro Preview Custom Tools |

<details>
<summary><b>Configuración completa de modelos (copiar y pegar)</b></summary>

Agrega esto a tu `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-antigravity-auth@latest"],
  "provider": {
    "google": {
      "models": {
        "antigravity-gemini-3.8-flash": {
          "name": "Gemini 3.8 Flash (Antigravity)",
          "limit": { "context": 1048576, "output": 65536 },
          "modalities": { "input": ["text", "image", "pdf"], "output": ["text"] },
          "variants": {
            "minimal": { "thinkingLevel": "minimal" },
            "low": { "thinkingLevel": "low" },
            "medium": { "thinkingLevel": "medium" },
            "high": { "thinkingLevel": "high" }
          }
        },
        "antigravity-gemini-3.7-flash": {
          "name": "Gemini 3.7 Flash (Antigravity)",
          "limit": { "context": 1048576, "output": 65536 },
          "modalities": { "input": ["text", "image", "pdf"], "output": ["text"] },
          "variants": {
            "minimal": { "thinkingLevel": "minimal" },
            "low": { "thinkingLevel": "low" },
            "medium": { "thinkingLevel": "medium" },
            "high": { "thinkingLevel": "high" }
          }
        },
        "antigravity-gemini-3.1-flash-lite": {
          "name": "Gemini 3.1 Flash Lite (Antigravity)",
          "limit": { "context": 1048576, "output": 65536 },
          "modalities": { "input": ["text", "image", "pdf"], "output": ["text"] }
        },
        "antigravity-gemini-3.1-pro": {
          "name": "Gemini 3.1 Pro (Antigravity)",
          "limit": { "context": 1048576, "output": 65535 },
          "modalities": { "input": ["text", "image", "pdf"], "output": ["text"] },
          "variants": {
            "low": { "thinkingLevel": "low" },
            "high": { "thinkingLevel": "high" }
          }
        },
        "antigravity-gemini-3-flash": {
          "name": "Gemini 3 Flash (Antigravity)",
          "limit": { "context": 1048576, "output": 65536 },
          "modalities": { "input": ["text", "image", "pdf"], "output": ["text"] },
          "variants": {
            "minimal": { "thinkingLevel": "minimal" },
            "low": { "thinkingLevel": "low" },
            "medium": { "thinkingLevel": "medium" },
            "high": { "thinkingLevel": "high" }
          }
        },
        "antigravity-gemini-3-pro": {
          "name": "Gemini 3 Pro (Antigravity)",
          "limit": { "context": 1048576, "output": 65535 },
          "modalities": { "input": ["text", "image", "pdf"], "output": ["text"] },
          "variants": {
            "low": { "thinkingLevel": "low" },
            "high": { "thinkingLevel": "high" }
          }
        },
        "antigravity-claude-sonnet-4-6": {
          "name": "Claude Sonnet 4.6 (Antigravity)",
          "limit": { "context": 200000, "output": 64000 },
          "modalities": { "input": ["text", "image", "pdf"], "output": ["text"] }
        },
        "antigravity-claude-opus-4-6-thinking": {
          "name": "Claude Opus 4.6 Thinking (Antigravity)",
          "limit": { "context": 200000, "output": 64000 },
          "modalities": { "input": ["text", "image", "pdf"], "output": ["text"] },
          "variants": {
            "low": { "thinkingConfig": { "thinkingBudget": 8192 } },
            "max": { "thinkingConfig": { "thinkingBudget": 32768 } }
          }
        },
        "gemini-2.5-flash": {
          "name": "Gemini 2.5 Flash (Gemini CLI)",
          "limit": { "context": 1048576, "output": 65536 },
          "modalities": { "input": ["text", "image", "pdf"], "output": ["text"] }
        },
        "gemini-2.5-pro": {
          "name": "Gemini 2.5 Pro (Gemini CLI)",
          "limit": { "context": 1048576, "output": 65536 },
          "modalities": { "input": ["text", "image", "pdf"], "output": ["text"] }
        },
        "gemini-3-flash-preview": {
          "name": "Gemini 3 Flash Preview (Gemini CLI)",
          "limit": { "context": 1048576, "output": 65536 },
          "modalities": { "input": ["text", "image", "pdf"], "output": ["text"] }
        },
        "gemini-3-pro-preview": {
          "name": "Gemini 3 Pro Preview (Gemini CLI)",
          "limit": { "context": 1048576, "output": 65535 },
          "modalities": { "input": ["text", "image", "pdf"], "output": ["text"] }
        },
        "gemini-3.1-pro-preview": {
          "name": "Gemini 3.1 Pro Preview (Gemini CLI)",
          "limit": { "context": 1048576, "output": 65535 },
          "modalities": { "input": ["text", "image", "pdf"], "output": ["text"] }
        },
        "gemini-3.1-pro-preview-customtools": {
          "name": "Gemini 3.1 Pro Preview Custom Tools (Gemini CLI)",
          "limit": { "context": 1048576, "output": 65535 },
          "modalities": { "input": ["text", "image", "pdf"], "output": ["text"] }
        }
      }
    }
  }
}
```

</details>

---

## Configuración Multi-Cuenta

Agrega múltiples cuentas de Google para obtener mayor capacidad acumulada. El plugin rota automáticamente entre cuentas cuando una alcanza su límite de tasa.

```bash
opencode auth login  # Ejecútalo nuevamente para agregar más cuentas
```

**Opciones de gestión (vía `opencode auth login`):**
- **Configure models** — Auto-configura todos los modelos en `opencode.json`.
- **Check quotas** — Consulta la cuota restante de cada cuenta en una interfaz interactiva.
- **Manage accounts** — Habilita o deshabilita cuentas específicas para la rotación.

---

## Configuración opcional (`antigravity.json`)

Crea `~/.config/opencode/antigravity.json` para ajustes avanzados:

```json
{
  "$schema": "https://raw.githubusercontent.com/EdwinEstrella/opencode-antigravity-auth/main/assets/antigravity.schema.json"
}
```

### Comportamiento de modelos

| Opción | Predeterminado | Descripción |
|--------|---------|--------------|
| `keep_thinking` | `false` | Preserva el bloque de pensamiento de Claude entre turnos. |
| `session_recovery` | `true` | Auto-recuperación ante errores de llamadas a herramientas. |
| `cli_first` | `false` | Enruta modelos Gemini a la cuota de Gemini CLI primero. |

### Estrategia de rotación de cuentas

| Tu configuración | Configuración recomendada |
|------------|-------------------|
| **1 cuenta** | `"account_selection_strategy": "sticky"` |
| **2-5 cuentas** | Predeterminada (`"hybrid"`) |
| **5+ cuentas** | `"account_selection_strategy": "round-robin"` |
| **Agentes paralelos** | Agregar `"pid_offset_enabled": true` |

---

## Solución de problemas

> **Reinicio rápido**: La mayoría de los problemas se solucionan eliminando `~/.config/opencode/antigravity-accounts.json` y ejecutando `opencode auth login` nuevamente.

Consulta la [Guía completa de solución de problemas (en inglés)](docs/TROUBLESHOOTING.md).

---

## Créditos y Agradecimientos

- **[Noé Fabris](https://github.com/NoeFabris)** — Autor original y creador del proyecto [opencode-antigravity-auth](https://github.com/NoeFabris/opencode-antigravity-auth).
- **[opencode-gemini-auth](https://github.com/jenslys/opencode-gemini-auth)** por [@jenslys](https://github.com/jenslys).
- **[CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI)**.

---

## Licencia

Licencia MIT. Consulta [LICENSE](LICENSE) para más detalles.
