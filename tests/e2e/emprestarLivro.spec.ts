import { test, expect } from '@playwright/test';

import {
  login,
  loginNoNavegador,
  criarlivro,
  apagarlivro,
  buscaremprestimoativo,
  apagaremprestimo
} from '../Support/api-helpers';

import { admin, leitor, novolivro } from '../Support/dados';
test.use({ baseURL: 'http://localhost:3000' });

let tokenAdmin: string;
let livro: number;
test.beforeEach(async ({ request, page }) => {
  tokenAdmin = await login(request, admin.email, admin.senha);

  livro = await criarlivro(
    request,
    tokenAdmin,
    novolivro(1, '9780000000018')
  );

  await loginNoNavegador(
    page,
    request,
    leitor.email,
    leitor.senha
  );
});
test('leitor consegue emprestar um livro pela tela', async ({ page }) => {
  await page.goto(`/livros/${livro}`);

  await expect(page.getByTestId('livro-detalhe')).toBeVisible();

  await page.getByTestId('botao-emprestar').click();

  await expect(page.getByTestId('mensagem-sucesso'))
    .toHaveText('Empréstimo realizado com sucesso');

  await expect(page.getByTestId('livro-disponibilidade'))
    .toHaveText('Indisponível');
});
test.afterEach(async ({ request }) => {
  const emprestimo = await buscaremprestimoativo(
    request,
    tokenAdmin,
    livro
  );

  if (emprestimo !== undefined) {
    await apagaremprestimo(
      request,
      tokenAdmin,
      emprestimo
    );
  }

  await apagarlivro(
    request,
    tokenAdmin,
    livro
  );
});