# Estudio: Login de ALTTEZ Torneos

## Resumen

Dos puntos de entrada. Un sistema de auth compartido (Supabase Auth). Tres tablas implicadas.
El módulo Torneos tiene su propio gate de auth inline además de la LandingPage pública.

---

## 1. Puntos de Entrada

### 1.1 LandingPage (`src/shared/auth/LandingPage.jsx`)

Card pública de "ALTTEZ Torneos". Botones "Registrar" e "Iniciar sesión".

```
clic "Iniciar sesión" (card Torneos)
  → source = "torneos"
  → step   = "login"
  → submit → onLogin({ email, password, redirectPath: "/torneos" })
```

`onLogin` es un prop inyectado desde `App.jsx`. Tras autenticar redirige a `/torneos`.

### 1.2 TorneosAuthScreen (inline en `src/app/torneos/TorneosApp.jsx`)

Gate de auth propio del módulo. Componente no exportado, definido localmente en `TorneosApp.jsx`.
Se muestra cuando `authUser === null`. Tiene tabs **Iniciar sesión** / **Registrarse**.

---

## 2. Máquina de Estados (`TorneosApp`)

```
authUser === undefined  →  Loading spinner (verificando sesión)
authUser === null       →  TorneosAuthScreen (login / register)
authUser = { object }  →  App completa (sidebar + módulos)
```

Hidratación en mount:

```js
// Cheque inicial
supabase.auth.getUser()
  .then(({ data: { user } }) => setAuthUser(user ?? null))

// Suscripción continua (via authService.onAuthStateChange)
event === "SIGNED_IN"  → setAuthUser(session.user)
event === "SIGNED_OUT" → setAuthUser(null)
```

---

## 3. Funciones del Service Layer

Todas en `src/shared/services/authService.js`.

| Función | Llamada Supabase | Resultado |
|---|---|---|
| `signIn(email, password)` | `auth.signInWithPassword({ email, password })` | `{ user, session, error }` |
| `signUp({ email, password, fullName, role })` | `auth.signUp({ email, password, options: { data: { full_name, role } } })` | `{ user, session, error }` |
| `signOut()` | `auth.signOut()` | `boolean` |
| `getProfile()` | `from("profiles").select("*").eq("id", user.id).single()` | `{ id, club_id, role, full_name }` o `null` |
| `linkProfileToClub(clubId)` | `from("profiles").update({ club_id }).eq("id", user.id)` | `boolean` |
| `deleteAccount()` | `rpc("delete_user")` + `auth.signOut()` | `{ error }` |
| `onAuthStateChange(cb)` | `auth.onAuthStateChange(callback)` | `{ unsubscribe }` |

---

## 4. Tablas de Supabase Implicadas

### `auth.users` (Supabase interno — no tabla pública)

Almacena credenciales, JWT, metadata del usuario.

- **Escrita por:** `signUp`, `signIn`.
- El campo `user_metadata` recibe `{ full_name, role }` pasados en `signUp`.
- No accesible directamente con SQL — solo vía `supabase.auth.*`.

### `profiles` (tabla pública)

```
id          uuid  PRIMARY KEY  (= auth.users.id)
club_id     uuid  NULL         (NULL para usuarios de torneos)
role        text               ("admin" | "coach" | "staff")
full_name   text
created_at  timestamptz
```

- **Creada automáticamente** por el trigger `handle_new_user()` al hacer `signUp`.
- **Leída** por `getProfile()` — no se llama en el flujo de login de torneos directamente.
- **Actualizada** por `linkProfileToClub()` — tampoco se llama en torneos.
- ⚠️ `club_id` queda `NULL` para usuarios de torneos (torneos usa `organizador_id`, no `club_id`).

### `torneos`, `torneo_equipos`, `torneo_partidos` (post-auth)

Solo se acceden tras autenticar exitosamente, vía `torneosService.js`. **No intervienen en el login**.

---

## 5. Función RPC

| RPC | Acción |
|---|---|
| `delete_user()` | Elimina el usuario autenticado. Llamado desde `deleteAccount()`. |

---

## 6. Diferencias: Torneos vs Clubes

| Aspecto | Torneos | Clubes |
|---|---|---|
| Campos obligatorios (registro) | `nombre`, `ciudad` | `nombre`, `ciudad`, `entrenador`, `categorias` |
| Selector de rol | ❌ No | ✅ Sí (`admin` / `coach` / `staff`) |
| Rol asignado | Siempre `"admin"` (hardcoded) | Seleccionable |
| `guardianConsent` checkbox | ❌ No requerido | ✅ Requerido |
| `consentData` checkbox | ✅ En LandingPage | ✅ En LandingPage |
| `redirectPath` | `"/torneos"` | `undefined` |
| Gate de auth adicional | ✅ `TorneosAuthScreen` (inline) | ❌ Solo LandingPage |

---

## 7. Flujo Completo

### 7.1 Login vía LandingPage

```
LandingPage — card Torneos — "Iniciar sesión"
  → source = "torneos", step = "login"
  → usuario ingresa email + password
  → submit
    → sanitizeEmail(email)
    → validateAndLogin()
    → onLogin({ email, password, redirectPath: "/torneos" })
      → [App.jsx] signIn(email, password)
        → supabase.auth.signInWithPassword({ email, password })
          → auth.users (validación credenciales)
          → JWT generado
        → retorna { user, session, error: null }
      → navigate("/torneos")
        → TorneosApp monta
          → supabase.auth.getUser() → { data: { user } }
          → setAuthUser(user)
          → authUser !== null → render app ✓
```

### 7.2 Login vía TorneosAuthScreen (gate inline)

```
Usuario navega /torneos sin sesión activa
  → TorneosApp: getUser() → null → setAuthUser(null)
  → TorneosAuthScreen se muestra
  → usuario ingresa email + password → "Ingresar"
    → handleLogin()
    → signIn(email, password)             [authService]
      → supabase.auth.signInWithPassword()
    → onAuthSuccess(user)
    → setAuthUser(user)
    → TorneosAuthScreen desmonta → app completa renderiza ✓
```

### 7.3 Registro vía TorneosAuthScreen

```
TorneosAuthScreen tab="register"
  → nombre + email + password → "Crear cuenta"
    → handleRegister()
    → signUp({ email, password, fullName: nombre, role: "admin" })
      → supabase.auth.signUp({ email, password, options: { data: { full_name, role: "admin" } } })
        → auth.users creado
        → trigger handle_new_user() → profiles row (club_id = NULL)
        → email de confirmación enviado
    → setMsg("Cuenta creada. Revisa tu correo...")
    → setTab("login")
```

---

## 8. Error Mapping (mensajes en español)

| Mensaje Supabase | Mensaje mostrado al usuario |
|---|---|
| `"Invalid login credentials"` | `"Email o contraseña incorrectos"` |
| `"Email not confirmed"` | `"Confirma tu email antes de iniciar sesion"` |
| `"User already registered"` | `"Ya existe una cuenta con ese email"` |
| `"Password should be at least"` | `"La contraseña debe tener al menos 6 caracteres"` |
| `"Unable to validate email"` | `"El email no es valido"` |
| `"Email rate limit exceeded"` | `"Demasiados intentos. Espera unos minutos"` |
| `code === "over_request_rate_limit"` | `"Demasiadas solicitudes. Intenta en unos minutos"` |

---

## 9. Guard `isSupabaseReady`

Todas las funciones de auth salen temprano si faltan las variables de entorno:

```js
if (!isSupabaseReady) return { user: null, session: null, error: "Supabase no disponible" };
```

Requiere `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
En `TorneosApp`, si `!isSupabaseReady`, `authUser` inicia como `null` (no `undefined`) → salta el loading y muestra `TorneosAuthScreen` directamente.

---

## 10. Archivos Involucrados

```
src/shared/auth/LandingPage.jsx                 Punto de entrada público (card Torneos)
src/app/torneos/TorneosApp.jsx                  Auth gate + TorneosAuthScreen (inline, no exportado)
src/shared/services/authService.js              signIn, signUp, signOut, getProfile, deleteAccount
src/shared/lib/supabase.js                      Cliente Supabase singleton
src/app/torneos/services/torneosService.js      CRUD post-auth (torneos, equipos, partidos)
```

---

## 11. Observaciones y Gaps Detectados

1. **`profiles.club_id` siempre NULL** para usuarios de torneos — si se llama `getProfile()` retorna un perfil sin club vinculado. El campo `organizador_id` mencionado en el comentario de `torneosService.js` aún no existe en la tabla `profiles`.

2. **TorneosAuthScreen sin `consentData` checkbox** — la pantalla inline no pide aceptación de política de datos, a diferencia de la LandingPage. Posible gap legal.

3. **`role: "admin"` hardcoded** — todo usuario de torneos es admin. No hay acceso granular por rol en el módulo torneos todavía.

4. **Doble gate de auth** — un usuario puede llegar a `/torneos` sin pasar por LandingPage (URL directa). El gate inline de `TorneosAuthScreen` lo captura correctamente.
