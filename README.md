# PhoneBase

Base de plataforma para comparar celulares, cadastrar fichas tecnicas, pontuar categorias e listar ofertas com links afiliados.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Supabase

1. Crie um projeto no Supabase.
2. Rode o SQL em `supabase/schema.sql`.
3. Copie `.env.example` para `.env.local`.
4. Preencha as chaves do Supabase.
5. Rode `supabase/auth_update.sql` se voce ja tinha criado as tabelas antes desta versao.
6. Crie sua conta em `/conta`.
7. No SQL Editor do Supabase, promova seu usuario para admin:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'seu-email@exemplo.com');
```

Sem Supabase configurado, o site usa dados mockados para permitir desenvolvimento visual.

## Variaveis de ambiente na Vercel

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```
