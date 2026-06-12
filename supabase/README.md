# Supabase — migraciones

Esquema del proyecto (ver `docs/adr/0001-modelo-de-datos.md`). Las migraciones en
`migrations/` son la fuente de verdad del esquema, versionadas en git.

## Aplicarlas

**Opción A — MCP de Supabase (recomendada).** Con el MCP autenticado (`claude /mcp`),
el agente aplica cada migración con `apply_migration` contra el proyecto
`ncpdpkkbojwhrzprkxgw`.

**Opción B — Supabase CLI.**

```bash
supabase link --project-ref ncpdpkkbojwhrzprkxgw
supabase db push
```

## Regenerar tipos

Tras aplicar el esquema, regenerar `src/lib/supabase/types.ts`:

```bash
supabase gen types typescript --project-id ncpdpkkbojwhrzprkxgw > src/lib/supabase/types.ts
```

(Hoy ese archivo está escrito a mano según el mismo esquema; regenerarlo lo deja 1:1
con la base real.)

## Orden

1. `*_profiles.sql` — profiles + trigger handle_new_user
2. `*_habits.sql` — enum frecuencia + tabla habits + constraints + índices
3. `*_checkins.sql` — checkins + trigger anti-archivado (criterio 17)
4. `*_subscriptions.sql` — subscriptions + reminder_log
5. `*_rls.sql` — RLS de todas las tablas + trigger de límite de hábitos
