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
5. Defina `ADMIN_PASSWORD` para proteger o formulario de cadastro.

Sem Supabase configurado, o site usa dados mockados para permitir desenvolvimento visual.
