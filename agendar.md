# Flujo de reserva pública — Cómo funciona + Mejoras propuestas

---

## ¿Qué pasa cuando el cliente llena "Tus datos" y confirma?

Cuando el cliente presiona **"Confirmar Cita"**, el wizard envía un `POST /api/book/[slug]`
a BarberPro con: nombre, teléfono, email, notas, serviceId, barberId, fecha y hora.

BarberPro hace lo siguiente automáticamente:
1. **Busca o crea el cliente** en la BD del tenant (solo con rol `CLIENT`, no puede iniciar sesión en el ERP)
2. **Verifica disponibilidad** del barbero en ese horario (evita doble booking a nivel de BD)
3. **Crea la cita** con estado `PENDING` en la tabla `barber_appointments`
4. **Devuelve** nombre del barbero, servicio y hora para mostrar la confirmación en pantalla

**✅ SÍ — la cita aparece inmediatamente en el módulo Citas de BarberPro** con estado
"Pendiente" (naranja). El dueño la ve en la lista y en el calendario.

---

## Problemas actuales identificados

| # | Problema | Impacto |
|---|---------|---------|
| 1 | Solo se guarda el **primer servicio** — los demás del multi-select se pierden silenciosamente | Alto |
| 2 | **No hay notificación** al negocio cuando llega una reserva web | Medio |
| 3 | No hay forma visual de distinguir **citas web vs citas internas** en el módulo Citas | Bajo |
| 4 | No hay confirmación automática por **email/WhatsApp al cliente** | Bajo |

---

## Plan de mejoras — Orden recomendado

### Mejora 1 (CRÍTICA) — Fix multi-servicio en el backend

**Archivo:** `C:\ProjectosDev\barber-pro\src\app\api\book\[slug]\route.ts`

El backend actualmente solo lee `body.serviceId` (un número). Con multi-select, el wizard
envía también `serviceIds: [1, 2, 3]`. El fix: leer `serviceIds[]` y crear **una cita por
servicio en cadena** (endTime del primero = startTime del segundo).

---

### Mejora 2 (ALTA) — Notificación WhatsApp al negocio sin costo

**Archivo:** `C:\ProjectosDev\barber-pro\src\app\api\book\[slug]\route.ts`

Después de crear la cita, el backend devuelve una `waUrl` al frontend. El frontend
la abre en la pantalla de confirmación como botón **"Notificar al negocio"**.

Mensaje pre-llenado al teléfono del tenant:
```
📅 Nueva reserva web — BookStyle
👤 Cliente: Juan Pérez (+503 7000-0000)
✂️ Servicio: Corte Clásico
👨 Barbero: Carlos López
🗓️ Sábado 12 Abr a las 10:00 AM
```

No requiere ninguna API de pago. Funciona con `https://wa.me/{phone}?text=...`

---

### Mejora 3 (MEDIA) — Badge "WEB" en módulo Citas de BarberPro

**Archivos:**
- `C:\ProjectosDev\barber-pro\prisma\schema.prisma` — agregar campo `source: AppointmentSource` (INTERNAL | WEB)
- `C:\ProjectosDev\barber-pro\src\app\api\book\[slug]\route.ts` — al crear, setear `source: 'WEB'`
- `C:\ProjectosDev\barber-pro\src\app\(dashboard)\appointments\page.tsx` — mostrar tag "WEB" en columna cliente

**Alternativa sin migración de BD:** detectar por email patrón `^\d+@guest\.speeddan\.com$`
(ya funciona hoy, solo agregar el badge visual).

---

## Resumen de archivos a tocar

| Archivo | Cambio |
|---------|--------|
| `barber-pro/.../book/[slug]/route.ts` | Multi-servicio (citas en cadena) + `waUrl` en respuesta |
| `barber-pro/prisma/schema.prisma` | (Opcional) campo `source` en BarberAppointment |
| `barber-pro/.../appointments/page.tsx` | (Opcional) badge WEB |
| `bookstyle-landing/src/pages/agendar.astro` | Mostrar botón WA al negocio en confirmación |

---

## Orden de implementación sugerido

1. **Fix multi-servicio en backend** — sin esto los servicios extra se pierden
2. **Notificación WA al negocio** — costo cero, alto valor operativo, 30 min de trabajo
3. **Badge WEB** — mejora visual para distinguir origen de citas en el ERP
