# SOFTCAR

Sistema acadêmico para concessionária de veículos, com **backend PHP 8 / MySQL** e API REST JSON. O front-end atual ainda é HTML/CSS/JavaScript estático; o proxy Vite para a futura migração React está documentado abaixo.

## Executar no XAMPP

1. Coloque a pasta `softcar` em `C:\xampp\htdocs\`.
2. No painel do XAMPP, inicie **Apache** e **MySQL**. O backend conecta ao MySQL/MariaDB em `127.0.0.1:3306` por padrão.
3. No phpMyAdmin, importe `backend/config/database.sql`. O script cria/seleciona `softcar`, as tabelas relacionadas e os dados iniciais.
4. A configuração local está em `backend/config/database.config.php` e usa os valores padrão do XAMPP (`127.0.0.1:3306`, banco `softcar`, usuário `root`, senha vazia). Edite esse arquivo para alterar a conexão. Ele é ignorado pelo Git.
5. Acesse `http://localhost/softcar/`; a página inicial encaminha ao login em `frontend/login.html`.

O front-end deve ser acessado pelo Apache, não abrindo os HTML via `file://`, para que cookies de sessão e chamadas à API funcionem.

### Usar banco de hospedagem

Para usar outra base MySQL, altere host, porta, nome, usuário e senha em `backend/config/database.config.php`. Em hospedagem compartilhada, use o nome completo informado pelo provedor e envie o arquivo de configuração ao servidor por um meio seguro.

Em hospedagens compartilhadas, o MySQL pode aceitar conexões somente do próprio servidor de hospedagem. Para usar essa base, publique o backend no mesmo provedor. O XAMPP local usa os valores configurados no arquivo `database.config.php`. Se preferir, as variáveis `SOFTCAR_DB_HOST`, `SOFTCAR_DB_PORT`, `SOFTCAR_DB_NAME`, `SOFTCAR_DB_USER` e `SOFTCAR_DB_PASSWORD` substituem as opções do arquivo.

### Contas de clientes e administradores

O cadastro público (`frontend/cadastro.html`) cria somente contas de cliente/comprador; não há campo público para escolher privilégios. Entre com a conta administrativa de demonstração (`admin@softcar.local`, senha `123456`) e use **Administração > Contas de clientes e administradores** para criar clientes ou novos administradores. Troque a senha demonstrativa antes de publicar o sistema.

O painel também permite criar, editar e excluir veículos; imagens podem ser enviadas como JPG, PNG ou WEBP de até 5 MB, ou vinculadas por uma URL HTTPS no campo da imagem. Os uploads ficam em `frontend/imagens/uploads/`, e a API grava o caminho/URL em `veiculos.imagem`. Garanta permissão de gravação para o Apache. As antigas fotos estáticas dos veículos foram removidas; os dados iniciais agora usam URLs externas. Mantenha `frontend/imagens/sem-imagem.svg` como imagem substituta e não apague a pasta de uploads. Logo, patrocinadores e wireframes são imagens estáticas separadas, ainda localizadas em `imagens/` na raiz. Ao substituir ou remover uma imagem enviada pelo painel, o arquivo antigo é removido automaticamente.

## Organização

```text
softcar/
├── frontend/                 # HTML, CSS, JavaScript e imagens
│   ├── *.html
│   ├── app.js
│   ├── style.css
│   └── imagens/
├── backend/                  # PHP, API JSON, PDO e SQL
│   ├── api/
│   │   ├── auth.php
│   │   ├── profile.php
│   │   ├── payments.php
│   │   ├── vehicles.php                 # consulta e CRUD REST
│   │   └── admin/users.php              # gestão de contas para admins
│   ├── config/
│   │   ├── db.php
│   │   ├── database.sql
│   │   ├── inserts.sql                  # veículos de exemplo com imagens externas
│   │   └── database.config.php          # configuração local, ignorada pelo Git
│   └── includes/api.php
├── index.html                # redireciona à entrada do front-end
├── DOCUMENTACAO.md
└── README.md
```

### Endpoints principais

- `auth.php`: `GET` retorna sessão/token CSRF; `POST` com `action=login`, `register` ou `logout`.
- `admin/users.php`: `GET` lista contas e `POST` cria cliente ou administrador; exige sessão de administrador.
- `profile.php`: `GET` consulta o perfil; `PUT` atualiza dados do usuário autenticado.
- `vehicles.php`: `GET` lista/consulta; `POST` cria; `PUT` edita; `DELETE` remove. Escritas exigem perfil administrador.
- `payments.php`: `POST` grava uma simulação demonstrativa.

O backend aplica autenticação/autorização, validação CSRF e validação dos dados. A proteção não depende apenas de esconder telas no navegador.

### Proxy do Vite para React

Quando o front-end React/Vite for criado, configure `vite.config.js` para encaminhar `/backend` ao Apache. Assim o navegador chama o Vite na mesma origem durante o desenvolvimento:

```js
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/backend": {
        target: "http://localhost/softcar",
        changeOrigin: true
      }
    }
  }
});
```

No React, chame, por exemplo, `fetch("/backend/api/auth.php", { credentials: "include" })`. Para requisições que alteram dados, obtenha primeiro `csrfToken` por GET e envie-o no cabeçalho `X-CSRF-Token`. A lista de origens de desenvolvimento (`localhost:5173` e `127.0.0.1:5173`) fica no início de `backend/config/db.php`; ajuste-a se necessário. O proxy evita CORS no navegador durante o desenvolvimento.

## Funcionalidades

- Cadastro, login e logout com sessão PHP; senhas armazenadas com `password_hash`.
- Cadastro público sempre cria clientes; somente administradores podem criar contas de cliente ou administrador no painel.
- Perfil para editar nome, e-mail e senha, além de consultar simulações registradas.
- Catálogo, galeria e tabela técnica alimentados pelos mesmos dados do banco.
- CRUD de veículos por perfil administrativo, com upload validado de imagens.
- Simulador de parcelas no JavaScript e registro de formas de pagamento apenas para demonstração.

**Pagamento não é real:** não há integração com gateway, processamento financeiro ou coleta de dados de cartão. O fluxo registra no banco uma simulação relacionada ao cliente e ao veículo.

## Observações para a entrega

- A documentação em `DOCUMENTACAO.md` é um rascunho; aplicar a formatação ABNT final, exportar os diagramas como imagens e anexar o protótipo.
- Revisar os wireframes para incluir login/cadastro, perfil, administração e simulação.
- O site tem foco atual em catálogo de veículos. Peças, acessórios, manutenção e revisão aparecem no briefing institucional, mas ainda não possuem telas ou cadastro funcional.
