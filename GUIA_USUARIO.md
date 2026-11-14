# Guía de Usuario — RutaMisti

> Plataforma web de turismo local para Arequipa, Perú.
> Versión MVP · 2026

---

## 1. ¿Qué es RutaMisti?

RutaMisti conecta a turistas con los mejores negocios turísticos locales de Arequipa: picanterías, artesanos, talleres de cocina, guías locales y más. Todo sin intermediarios y directo desde tu celular, sin instalar ninguna app.

**Para quién es:**
- 🧳 Turistas (nacionales e internacionales) que quieren descubrir la Arequipa auténtica
- 🏪 Dueños de negocios turísticos locales que quieren tener presencia digital
- 🔑 Administradores de la plataforma

**Acceso:** `http://localhost:3000` (desarrollo) · disponible en español 🇵🇪 e inglés 🇬🇧

---

## 2. Para el turista 🧳

### Explorar negocios

1. Desde la página de inicio, haz clic en **"Explorar ahora"** o en **"Explorar"** en el menú superior.
2. Verás una cuadrícula de tarjetas con negocios disponibles en Arequipa.
3. Usa los filtros para encontrar lo que buscas:
   - **Categoría:** Picantería, Artesanía, Taller de cocina, Guía local, etc.
   - **Distrito:** Yanahuara, Cercado, Cayma, San Lázaro, Sachaca
   - **Precio:** Económico (S/), Moderado (S/S/), Premium (S/S/S/)
   - **Acepta Yape:** marca este checkbox para filtrar solo negocios con Yape
4. También puedes escribir en la barra de búsqueda para buscar por nombre.
5. Alterna entre vista de **lista** y vista de **mapa** con los botones en la parte superior derecha.

> 💡 En la vista de mapa verás pines de cada negocio. Haz clic en un pin para ver su nombre y un botón "Ver perfil".

---

### Ver el perfil de un negocio

Al hacer clic en una tarjeta o en un pin del mapa, llegas al perfil completo del negocio:

- **Galería de fotos** — haz clic en las miniaturas para ver cada foto
- **Indicador Abierto/Cerrado** — calculado automáticamente según el horario del negocio (zona horaria Arequipa)
- **Descripción** — disponible en español e inglés según el idioma seleccionado
- **Servicios** — lista de lo que ofrece con precios
- **Horario** — tabla de lunes a domingo
- **Mapa** — ubicación exacta del negocio
- **Reseñas** — con insignia "Reseña verificada" en las que provienen de reservas confirmadas

**Botones de acción:**
| Botón | Qué hace |
|-------|----------|
| **Reservar** | Abre el formulario de reserva |
| **Escribir por WhatsApp** | Abre WhatsApp con un mensaje prellenado |
| **Cómo llegar** | Abre Google Maps con la ubicación exacta |

---

### Hacer una reserva (sin cuenta obligatoria)

No necesitas crear una cuenta para reservar. Sigue estos pasos:

1. En el perfil del negocio, haz clic en **"Reservar"**
2. Completa el formulario:
   - **Tu nombre** — nombre completo
   - **Correo electrónico** — para recibir confirmación
   - **WhatsApp** — el negocio te contactará aquí
   - **País** — tu país de origen
   - **Fecha** — el día que quieres ir
   - **Hora** — hora de llegada
   - **Número de personas**
   - **Servicio** (opcional) — elige uno de los servicios del negocio
   - **Comentario** (opcional) — solicitudes especiales
   - Marca el checkbox de **política de privacidad**
3. Haz clic en **"Confirmar reserva"**
4. Recibirás un **código de reserva** con formato `AQP-XXXX`

> 📱 Después de reservar aparecerá el botón **"Avisar al negocio por WhatsApp"** con el resumen ya escrito. ¡Solo tienes que enviarlo!

---

### Ver el estado de tu reserva

Guarda el código `AQP-XXXX` que recibiste. Con él puedes:
- Acceder a `/reserva/AQP-XXXX` para ver el estado actual
- Estados posibles: **Pendiente** → **Confirmada** → **Completada**

---

### Dejar una reseña verificada ⭐

Solo puedes reseñar cuando el negocio haya marcado tu reserva como **"Completada"**.

1. Accede a `/resena/AQP-XXXX` (con tu código de reserva)
2. Elige un puntaje del 1 al 5
3. Escribe tu comentario
4. Envía — tu reseña aparecerá con la insignia **"Reseña verificada"**

> Una sola reseña por reserva. Esto garantiza que todas las reseñas son auténticas.

---

### Rutas temáticas 🗺️

1. Haz clic en **"Rutas"** en el menú superior
2. Verás las rutas disponibles: "Ruta de las Picanterías", "Ruta del Sillar", "Arequipa Artesanal"
3. Al entrar a una ruta, verás:
   - Mapa con todas las paradas numeradas
   - Lista ordenada de negocios con foto, nombre y nota del curador
   - Botón **"Reservar aquí"** en cada parada

---

### Cambiar el idioma 🌐

Haz clic en el botón **EN** o **ES** en la esquina superior derecha del header para alternar entre español e inglés. La URL cambia de `/es/...` a `/en/...`.

---

## 3. Para el dueño del negocio 🏪

### Registrarse

1. Haz clic en **"Registra tu negocio"** en el menú o en el banner de la página de inicio
2. Crea tu cuenta con nombre, correo y contraseña (mínimo 6 caracteres)
3. Acepta la política de privacidad
4. ¡Listo! Tu cuenta se crea con rol **negocio**

> Tu negocio quedará en estado **"Pendiente"** hasta que el administrador lo apruebe. Mientras tanto, no aparecerá en las búsquedas públicas.

---

### Acceder a tu panel

1. Ve a **"Ingresar"** en el menú superior
2. Escribe tu correo y contraseña
3. Serás redirigido automáticamente a **Mi panel** (`/panel/negocio`)

---

### Dashboard 📊

El dashboard muestra tus métricas principales:

| Métrica | Qué significa |
|---------|---------------|
| Reservas pendientes | Reservas nuevas que aún no has confirmado o rechazado |
| Reservas de hoy | Reservas confirmadas para el día de hoy |
| Rating promedio | Promedio de estrellas de tus reseñas verificadas |
| Total de reseñas | Cuántos turistas han dejado reseña |

---

### Gestionar reservas

Ve a **"Reservas"** en el menú lateral del panel.

**Acciones disponibles por reserva:**

| Botón | Resultado | Cuándo usarlo |
|-------|-----------|---------------|
| ✅ **Confirmar** | Estado → Confirmada | Cuando puedes atender la reserva |
| ❌ **Rechazar** | Estado → Rechazada | Cuando no hay disponibilidad |
| ✔️ **Completada** | Estado → Completada | Cuando el turista asistió. Habilita la reseña |
| 🚫 **No asistió** | Estado → No asistió | Cuando el turista no vino |

> Después de confirmar, usa el botón **"Avisar por WhatsApp"** para notificar al turista con un mensaje prellenado.

---

### Editar tu perfil

Ve a **"Perfil"** en el menú lateral del panel. Puedes editar:
- Descripción en español e inglés
- Información de contacto (WhatsApp, teléfono, redes sociales)
- Rango de precio, métodos de pago (Yape, tarjeta)
- Idiomas de atención
- Si aceptas reservas y capacidad máxima por reserva

---

### Responder reseñas

Ve a **"Reseñas"** en el menú lateral del panel. Para cada reseña visible puedes escribir una respuesta pública que verán todos los turistas.

---

### QR de tu negocio 📱

> Esta función está en la hoja de ruta (próxima versión). Podrás generar un código QR personalizado para poner en mesas, hoteles y puntos turísticos que lleve directamente a tu perfil.

---

## 4. Para el administrador 🔑

### Credenciales de prueba (seed)

```
Email:    admin@rutamisti.com
Password: Admin123!
```

Accede en `/ingresar`. El header mostrará **"Mi panel"** que lleva al panel admin.

---

### Aprobar o rechazar negocios

1. Ve a `/admin/negocios`
2. Usa los tabs para filtrar: **Pendientes**, **Aprobados**, **Rechazados**, **Suspendidos**
3. Para cada negocio pendiente:
   - **Aprobar** → el negocio aparece en las búsquedas públicas
   - **Rechazar** → el negocio no es publicado (puedes indicar el motivo)
   - **Suspender** → oculta temporalmente un negocio ya aprobado

---

### Moderar reseñas

1. Ve a `/admin/resenas`
2. Verás todas las reseñas del sistema
3. Acciones disponibles:
   - **Ocultar** → la reseña deja de aparecer en el perfil público
   - **Mostrar** → vuelve a hacerla visible

---

### Gestionar el Libro de Reclamaciones

1. Ve a `/admin/reclamos`
2. Verás todos los reclamos y quejas enviados desde el formulario público
3. Cada reclamo tiene un **código de seguimiento**
4. Puedes responder directamente desde la plataforma
5. El plazo legal es **15 días hábiles** (Ley peruana)

---

### Dashboard admin

Ve a `/admin` para ver las métricas generales:
- Total de negocios por estado
- Reservas por estado
- Negocios más visitados

---

## 5. Preguntas frecuentes ❓

**¿Puedo reservar sin crear una cuenta?**
Sí. El formulario de reserva solo pide nombre, correo y WhatsApp. No necesitas registrarte.

**¿Cómo sé que mi reserva fue confirmada?**
El negocio tiene un botón para avisarte por WhatsApp. También puedes verificar el estado en `/reserva/AQP-XXXX`.

**¿Qué es una "Reseña verificada"?**
Solo puede dejar una reseña quien tuvo una reserva marcada como "Completada". Esto garantiza que las reseñas son de personas que realmente visitaron el negocio.

**¿Cómo cambio el idioma?**
Haz clic en el botón **EN** / **ES** en la esquina superior derecha del header.

**¿Puedo registrar mi negocio gratis?**
Sí. En esta versión el registro es completamente gratuito.

**¿Cuánto tiempo tarda en aprobarse mi negocio?**
Depende del administrador. Generalmente menos de 48 horas hábiles.

**¿Qué pasa si el negocio no confirma mi reserva?**
Puedes contactarlo directamente por el botón de WhatsApp en su perfil.

**¿Mis datos están seguros?**
Sí. Solo el negocio con quien reservas ve tu WhatsApp y correo. Los datos se almacenan de acuerdo a la Ley N.° 29733 de Protección de Datos Personales del Perú.

---

*RutaMisti · Arequipa, Perú 🇵🇪 · © 2026*
