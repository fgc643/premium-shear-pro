# Elite Barber Studio

Demonstração de sistema de agendamento online com atendente de IA para barbearias.

> Projeto de demonstração feito com apoio de IA (Lovable). Todos os dados e textos são de exemplo.

**Ver funcionando:** https://elite-barbearia-studio.vercel.app/

## O que o sistema faz

- O cliente escolhe serviço, barbeiro e horário e agenda online.
- Um horário já reservado não pode ser marcado duas vezes: a regra é aplicada no banco de dados.
- Atendente de IA (Concierge) conversa com o cliente e ajuda a agendar.
- Consultor de estilo: o cliente envia uma selfie e a IA sugere cortes.
- Painel do administrador para ver e gerenciar os agendamentos.

## Tecnologias

React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Supabase (banco de dados, login e funções de servidor), migrações com Drizzle, publicação na Vercel.

## Como protegi o uso da IA

As funções de IA têm limite por visitante (5 pedidos por hora) e limite diário do site (60 pedidos), com tamanho máximo de 5 MB para a foto. O visitante é identificado por um código embaralhado, sem guardar o endereço de internet puro.

## Limitações atuais

- É uma demonstração: o endereço e os textos são de exemplo.
- Quando os créditos de IA acabam, o chat e o consultor mostram uma mensagem de indisponibilidade.
- Ainda não há testes automatizados.
- Não há pagamento online.

## Como rodar

1. Instale as dependências com `npm install`.
2. Crie um projeto no Supabase e aplique as migrações da pasta `supabase/migrations`.
3. Configure no `.env` a URL e a chave pública do seu projeto Supabase.
4. Rode com `npm run dev`.

## Autor

Flávio Silva, desenvolvedor de aplicações web assistido por IA, Diadema, SP.
