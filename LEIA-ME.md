# TKD VIEW — v1.0.7

Visualização interactiva de projectos para clientes: tour 360º com hotspots, revisões, decisões rápidas e mensagens. Segue o blueprint do TKD HUB (APP_VERSION ↔ CACHE_VERSION, sincronização Firebase com escritas parciais, PWA offline).

## Publicar
1. Coloque os 6 ficheiros na mesma pasta do seu alojamento (GitHub Pages, etc.): `index.html`, `sw.js`, `manifest.webmanifest` e os 3 ícones.
2. Abra o `index.html` e mude o `ADMIN_PIN` (por omissão `8484`).
3. **Firebase pelo painel de Ajustes (recomendado):** entre na administração, toque em ⚙ e cole a configuração do Firebase (a mesma do TKD HUB). Fica guardada no aparelho e liga de imediato. Em alternativa, pode fixá-la no código (`FIREBASE_CONFIG` no topo do `<script>`). Sem configuração, a app funciona só em modo local — os clientes noutros aparelhos não verão nada.
   No painel de Ajustes também pode: desligar/religar a sincronização, ver o estado do upload directo (requer `storageBucket`), procurar actualizações e recarregar a app com limpeza de cache.
4. A cada nova publicação, suba `APP_VERSION` no `index.html` **e** `CACHE_VERSION` no `sw.js` na mesma sequência (1.0.0 → 1.0.1 → …). O rodapé mostra a versão activa e o aviso «Nova versão disponível» aparece nos aparelhos dos clientes.

## Fluxo de trabalho
- **Administração**: no portão, toque em «Acesso TKD» e insira o PIN. Crie o projecto (a senha única é gerada automaticamente), adicione as cenas 360º, coloque os hotspots clicando na imagem, publique revisões e peça decisões.
- **Cliente**: recebe o convite (botão «Copiar convite» — link + senha). Entra com a senha e vê apenas o seu projecto: passeia pelo 360º, acompanha as revisões, decide com um toque e conversa consigo. O link com `?k=SENHA` pré-preenche a senha.

## Upload directo (Firebase Storage)
Os botões «⭱ Carregar do aparelho» (cenas, pranchas, capa e revisões) sobem as imagens para o Firebase Storage já redimensionadas e comprimidas. Requisitos: o `FIREBASE_CONFIG` deve incluir `storageBucket`, e as regras do Storage devem permitir leitura pública e escrita (idealmente limitada — p. ex. só com App Check ou autenticação anónima). Sem Storage configurado, continue a colar URLs.

## Acta de decisões (PDF)
No editor, aba Decisões → «Exportar acta (PDF)»: abre um documento imprimível com todas as decisões (respondidas e pendentes), as notas ancoradas nas pranchas e linhas de assinatura. Use «Guardar como PDF» na janela de impressão. Permita pop-ups no browser.

## Imagens 360º
- Formato equirectangular, proporção 2:1 (ex.: 8192×4096). Alojamento com CORS aberto: GitHub (raw), Firebase Storage ou imgbb. Sem CORS, o browser bloqueia a textura.
- Imagens normais das revisões podem vir de qualquer alojamento.

## Nota de segurança (importante)
A senha é verificada por hash SHA-256 no browser e o índice `tkdview/indice/{hash}` devolve só o projecto correspondente — é uma barreira de conveniência, adequada para partilhar renders com clientes. Para proteger de facto os dados, defina regras no Firebase Realtime Database limitando escrita (ideal: só a administração escreve em `tkdview/projetos/*` excepto `decisoes`, `msgs` e `visto`). Não guarde aqui informação sensível.

## Estrutura de dados (nó `tkdview`)
```
tkdview/
  indice/{senhaHash} = projectoId
  projetos/{id} = { nome, cliente, estado, capa, nota, senha, senhaHash,
                    cenas{...hotspots}, revisoes{}, decisoes{}, msgs{}, visto }
```
