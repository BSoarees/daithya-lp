# Daithya Bikes: nova landing page

Página de revenda da Daithya Bikes. O mesmo código gera duas versões:

- **Oficial** (daithyabikes.com.br): `npm run publicar:oficial` monta e publica no Worker `daithya-bikes` da conta Cloudflare do Derick. Precisa de `CLOUDFLARE_API_TOKEN`.
- **Demonstração** (https://bsoarees.github.io/daithya-lp/): cada push na `main` republica sozinho. Fica fora do Google.

A nova página substitui só a inicial. As fichas técnicas (`/modelos/...`) e a página `/sobre/` continuam sendo as do site anterior, guardadas em `site-atual/` (cópia de 01/10/2026 feita com `node scripts/copiar-site-atual.mjs`, que também serve de backup).

- Rodar local: `npm install` e depois `npm run dev`
- Preços e modelos: `src/data/modelos.ts`

Não há carrinho nem pagamento: os pedidos vão pelo WhatsApp do comercial (botões dos modelos e simulador de pedido).
