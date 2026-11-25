(function () {
    "use strict";

    var apiBase = "../backend/api/";
    var defaultVehicleImage = "imagens/sem-imagem.svg";
    var csrfToken = "";
    var page = document.body.dataset.page;
    var status = document.getElementById("app-status");

    function showMessage(message, type) {
        if (!status) {
            return;
        }
        status.textContent = message;
        status.className = "app-status" + (type ? " " + type : "");
    }

    async function api(endpoint, options) {
        options = options || {};
        var method = options.method || "GET";
        var headers = new Headers(options.headers || {});
        var body = options.body;

        if (method !== "GET" && method !== "HEAD" && csrfToken) {
            headers.set("X-CSRF-Token", csrfToken);
        }
        if (body && !(body instanceof FormData)) {
            headers.set("Content-Type", "application/json");
            body = JSON.stringify(body);
        }
        headers.set("Accept", "application/json");

        var response;
        try {
            response = await fetch(apiBase + endpoint, {
                method: method,
                headers: headers,
                body: body,
                credentials: "same-origin",
                cache: "no-store"
            });
        } catch (error) {
            throw new Error("Não foi possível conectar ao backend. Verifique o Apache e tente novamente.");
        }

        var payload;
        try {
            payload = await response.json();
        } catch (error) {
            throw new Error("O backend retornou uma resposta inválida.");
        }
        if (!response.ok) {
            throw new Error(payload.error || "A solicitação não pôde ser concluída.");
        }
        return payload;
    }

    function makeElement(tag, className, text) {
        var element = document.createElement(tag);
        if (className) {
            element.className = className;
        }
        if (text !== undefined) {
            element.textContent = text;
        }
        return element;
    }

    function formatCurrency(value) {
        return Number(value).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function setVehicleImage(image, path) {
        image.onerror = function () {
            image.onerror = null;
            image.src = defaultVehicleImage;
        };
        image.src = path || defaultVehicleImage;
    }

    function renderNav(user) {
        var nav = document.getElementById("app-nav");
        if (!nav || !user) {
            return;
        }
        nav.replaceChildren();
        var links = [
            ["Home", "index.html"],
            ["Empresa", "empresa.html"],
            ["Galeria", "galeria.html"],
            ["Artigos", "textos.html"],
            ["Especificações", "tabela.html"],
            ["Documentos", "documentos.html"],
            ["Perfil", "perfil.html"]
        ];
        if (user.perfil === "admin") {
            links.push(["Administração", "admin.html"]);
        }
        links.forEach(function (item) {
            var link = makeElement("a", "", item[0]);
            link.href = item[1];
            nav.appendChild(link);
        });

        var identity = makeElement("span", "nav-identidade", user.nome);
        nav.appendChild(identity);
        var logout = makeElement("button", "sair", "Sair");
        logout.type = "button";
        logout.addEventListener("click", async function () {
            try {
                await api("auth.php?acao=sair", {
                    method: "POST",
                    body: {}
                });
                window.location.replace("login.html");
            } catch (error) {
                showMessage(error.message, "mensagem-erro");
            }
        });
        nav.appendChild(logout);
    }

    function renderFooter() {
        var footer = document.querySelector("footer");
        if (!footer) {
            footer = makeElement("footer");
            document.body.appendChild(footer);
        }
        footer.id = "app-footer";
        footer.replaceChildren(
            makeElement("p", "", "Curso: Ciência da Computação - UniCEUB | Disciplina: Desenvolvimento Web | Turma: B"),
            makeElement("p", "", "Integrantes do Grupo 6: Victor Barcelos, Gabriel Henrique, Lucas Werneck e Victor Silva")
        );
    }

    async function loadVehicles() {
        var result = await api("vehicles.php");
        return result.veiculos;
    }

    function renderVehicleCard(vehicle) {
        var article = makeElement("article", "carro");
        var imageWrap = makeElement("div", "carro-imagem");
        var image = makeElement("img");
        setVehicleImage(image, vehicle.imagem);
        image.alt = vehicle.marca + " " + vehicle.modelo;
        imageWrap.appendChild(image);

        var details = makeElement("div", "carro-informacoes");
        details.appendChild(makeElement("h3", "", vehicle.marca + " " + vehicle.modelo));
        details.appendChild(makeElement("p", "", vehicle.descricao));
        var data = makeElement("div", "carro-dados");
        data.appendChild(document.createElement("hr"));
        data.appendChild(makeElement("p", "", "Preço: " + formatCurrency(vehicle.preco)));
        var availability = makeElement("p", "disponibilidade");
        availability.appendChild(makeElement("strong", "", "Disponibilidade: "));
        availability.appendChild(makeElement(
            "span",
            vehicle.disponibilidade === "disponivel" ? "dispo" : "indisponivel",
            vehicle.disponibilidade === "disponivel" ? "Disponível" : "Indisponível"
        ));
        data.appendChild(availability);
        data.appendChild(makeElement("p", "", "Quilometragem: " + Number(vehicle.quilometragem).toLocaleString("pt-BR") + " km"));
        data.appendChild(makeElement("p", "", "Ano: " + vehicle.ano));
        details.appendChild(data);

        var actions = makeElement("div", "acoes-veiculo");
        if (vehicle.disponibilidade === "disponivel") {
            var payment = makeElement("a", "botao-carro", "Simular pagamento");
            payment.href = "pagamento.html?veiculo=" + encodeURIComponent(vehicle.id);
            actions.appendChild(payment);
        }
        var finance = makeElement("button", "botao-carro", "Simular parcelas");
        finance.type = "button";
        finance.addEventListener("click", function () {
            var selector = document.getElementById("veiculo-simulacao");
            selector.value = String(vehicle.id);
            document.getElementById("entrada-simulacao").focus();
            selector.dispatchEvent(new Event("change"));
        });
        actions.appendChild(finance);

        if (vehicle.link_oficial) {
            var official = makeElement("a", "botao-carro", "Site oficial");
            official.href = vehicle.link_oficial;
            official.target = "_blank";
            official.rel = "noopener noreferrer";
            actions.appendChild(official);
        }
        details.appendChild(actions);
        article.append(imageWrap, details);
        return article;
    }

    function setupFinanceCalculator(vehicles) {
        var select = document.getElementById("veiculo-simulacao");
        var entry = document.getElementById("entrada-simulacao");
        var installments = document.getElementById("parcelas-simulacao");
        var result = document.getElementById("resultado-simulacao");
        if (!select || !entry || !installments || !result) {
            return;
        }

        select.replaceChildren();
        if (vehicles.length === 0) {
            select.disabled = true;
            entry.disabled = true;
            installments.disabled = true;
            result.textContent = "Não há veículos cadastrados para simulação.";
            return;
        }
        vehicles.forEach(function (vehicle) {
            var option = makeElement("option", "", vehicle.marca + " " + vehicle.modelo);
            option.value = String(vehicle.id);
            option.dataset.preco = vehicle.preco;
            select.appendChild(option);
        });

        function calculate() {
            var option = select.options[select.selectedIndex];
            var price = Number(option.dataset.preco);
            var downPayment = Number(entry.value);
            var term = Number(installments.value);
            if (entry.value.trim() === "" || !Number.isFinite(downPayment) || downPayment < 0 || downPayment >= price) {
                result.textContent = "A entrada deve ser igual ou maior que zero e menor que o valor do veículo.";
                return;
            }
            var balance = price - downPayment;
            result.textContent = "Saldo estimado: " + formatCurrency(balance) +
                " — " + term + " parcelas estimadas de " + formatCurrency(balance / term) +
                " (sem juros).";
        }

        document.getElementById("financiamento-form").addEventListener("input", calculate);
        document.getElementById("financiamento-form").addEventListener("change", calculate);
        calculate();
    }

    async function initHome() {
        var vehicles = await loadVehicles();
        var list = document.getElementById("lista-veiculos");
        vehicles.forEach(function (vehicle) {
            list.appendChild(renderVehicleCard(vehicle));
        });
        setupFinanceCalculator(vehicles);

        var welcome = document.getElementById("boas-vindas");
        welcome.addEventListener("click", function () {
            window.alert("Bem-vindo à SOFTCAR!\n\nSua jornada rumo ao carro dos sonhos começa aqui.");
        });
        var carousel = document.getElementById("destaque");
        var messages = [
            "Oferta especial: conheça nossa linha BMW.",
            "Descubra os veículos esportivos disponíveis.",
            "Agende seu test-drive com a equipe SOFTCAR.",
            "Veículos e informações atualizados pelo catálogo."
        ];
        var current = 0;
        carousel.textContent = messages[current];
        window.setInterval(function () {
            current = (current + 1) % messages.length;
            carousel.textContent = messages[current];
        }, 4000);
    }

    async function initGallery() {
        var vehicles = await loadVehicles();
        var gallery = document.getElementById("grid-galeria");
        vehicles.forEach(function (vehicle) {
            var figure = makeElement("figure", "item-galeria");
            var link = makeElement("a");
            link.href = "index.html#inicio";
            var image = makeElement("img");
            setVehicleImage(image, vehicle.imagem);
            image.alt = vehicle.marca + " " + vehicle.modelo;
            link.appendChild(image);
            figure.append(link, makeElement(
                "figcaption",
                "",
                vehicle.marca + " " + vehicle.modelo + " — " +
                    (vehicle.disponibilidade === "disponivel" ? "Disponível" : "Indisponível")
            ));
            gallery.appendChild(figure);
        });
    }

    async function initTable() {
        var vehicles = await loadVehicles();
        vehicles.sort(function (a, b) {
            return a.categoria.localeCompare(b.categoria, "pt-BR") ||
                a.marca.localeCompare(b.marca, "pt-BR") ||
                a.modelo.localeCompare(b.modelo, "pt-BR");
        });
        var counts = {};
        vehicles.forEach(function (vehicle) {
            counts[vehicle.categoria] = (counts[vehicle.categoria] || 0) + 1;
        });
        var table = makeElement("table");
        var head = makeElement("thead");
        var headerRow = makeElement("tr");
        ["Categoria", "Marca", "Modelo", "Motor", "0–100 km/h", "Preço"].forEach(function (label) {
            headerRow.appendChild(makeElement("th", "", label));
        });
        head.appendChild(headerRow);
        table.appendChild(head);
        var body = makeElement("tbody");
        var category = null;
        vehicles.forEach(function (vehicle) {
            var row = makeElement("tr");
            if (category !== vehicle.categoria) {
                var group = makeElement("th", "", vehicle.categoria);
                group.scope = "rowgroup";
                group.rowSpan = counts[vehicle.categoria];
                row.appendChild(group);
                category = vehicle.categoria;
            }
            [
                vehicle.marca,
                vehicle.modelo,
                vehicle.motor,
                vehicle.aceleracao_0_100 === null
                    ? "—"
                    : Number(vehicle.aceleracao_0_100).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " s",
                formatCurrency(vehicle.preco)
            ].forEach(function (value) {
                row.appendChild(makeElement("td", "", value));
            });
            body.appendChild(row);
        });
        table.appendChild(body);
        document.getElementById("tabela-veiculos").appendChild(table);
    }

    async function initProfile() {
        var result = await api("profile.php");
        var form = document.getElementById("perfil-form");
        form.elements.nome.value = result.usuario.nome;
        form.elements.email.value = result.usuario.email;
        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            try {
                var response = await api("profile.php", {
                    method: "PUT",
                    body: {
                        nome: form.elements.nome.value,
                        email: form.elements.email.value,
                        novaSenha: form.elements.novaSenha.value
                    }
                });
                form.elements.nome.value = response.usuario.nome;
                form.elements.email.value = response.usuario.email;
                form.elements.novaSenha.value = "";
                var identity = document.querySelector(".nav-identidade");
                if (identity) {
                    identity.textContent = response.usuario.nome;
                }
                showMessage(response.message, "mensagem-sucesso");
            } catch (error) {
                showMessage(error.message, "mensagem-erro");
            }
        });

        var history = document.getElementById("historico-pagamentos");
        if (result.pagamentos.length === 0) {
            history.appendChild(makeElement("p", "", "Você ainda não registrou simulações."));
            return;
        }
        var table = makeElement("table");
        var head = makeElement("thead");
        var headerRow = makeElement("tr");
        ["Veículo", "Valor", "Forma", "Status", "Data"].forEach(function (label) {
            headerRow.appendChild(makeElement("th", "", label));
        });
        head.appendChild(headerRow);
        table.appendChild(head);
        var body = makeElement("tbody");
        result.pagamentos.forEach(function (payment) {
            var row = makeElement("tr");
            [
                payment.marca + " " + payment.modelo,
                formatCurrency(payment.valor),
                payment.forma,
                payment.status,
                new Date(payment.criado_em.replace(" ", "T")).toLocaleString("pt-BR")
            ].forEach(function (value) {
                row.appendChild(makeElement("td", "", value));
            });
            body.appendChild(row);
        });
        table.appendChild(body);
        history.appendChild(table);
    }

    function setAdminForm(vehicle) {
        var form = document.getElementById("admin-veiculo-form");
        form.reset();
        form.elements.id.value = vehicle ? vehicle.id : "";
        form.elements.removerImagem.value = "0";
        document.getElementById("titulo-form-veiculo").textContent = vehicle ? "Editar veículo" : "Adicionar veículo";
        document.getElementById("cancelar-edicao").hidden = !vehicle;
        document.getElementById("remover-imagem").hidden = !vehicle || !vehicle.imagem;
        if (!vehicle) {
            return;
        }
        ["marca", "categoria", "modelo", "descricao", "motor", "aceleracao_0_100", "preco",
            "quilometragem", "ano", "disponibilidade", "imagem", "link_oficial"].forEach(function (key) {
            form.elements[key].value = vehicle[key] == null ? "" : vehicle[key];
        });
    }

    async function initAdmin() {
        var form = document.getElementById("admin-veiculo-form");
        document.getElementById("ano").max = String(new Date().getFullYear() + 2);
        document.getElementById("cancelar-edicao").addEventListener("click", function () {
            setAdminForm(null);
        });
        document.getElementById("remover-imagem").addEventListener("click", function () {
            form.elements.imagem.value = "";
            form.elements.imagemArquivo.value = "";
            form.elements.removerImagem.value = "1";
            document.getElementById("remover-imagem").hidden = true;
            showMessage("A imagem será removida quando você salvar o veículo.", "mensagem-sucesso");
        });
        form.elements.imagemArquivo.addEventListener("change", function () {
            if (form.elements.imagemArquivo.files.length > 0) {
                form.elements.removerImagem.value = "0";
            }
        });

        async function refresh() {
            var result = await api("vehicles.php");
            var list = document.getElementById("admin-veiculos");
            list.replaceChildren();
            document.getElementById("quantidade-veiculos").textContent = result.veiculos.length;
            var table = makeElement("table");
            var head = makeElement("thead");
            var row = makeElement("tr");
            ["Imagem", "Veículo", "Categoria", "Preço", "Status", "Ações"].forEach(function (label) {
                row.appendChild(makeElement("th", "", label));
            });
            head.appendChild(row);
            table.appendChild(head);
            var body = makeElement("tbody");
            result.veiculos.forEach(function (vehicle) {
                var row = makeElement("tr");
                var imageCell = makeElement("td");
                var image = makeElement("img", "admin-imagem");
                setVehicleImage(image, vehicle.imagem);
                image.alt = "";
                imageCell.appendChild(image);
                row.append(
                    imageCell,
                    makeElement("td", "", vehicle.marca + " " + vehicle.modelo),
                    makeElement("td", "", vehicle.categoria),
                    makeElement("td", "", formatCurrency(vehicle.preco)),
                    makeElement("td", "", vehicle.disponibilidade === "disponivel" ? "Disponível" : "Indisponível")
                );
                var actions = makeElement("td", "acoes-admin");
                var edit = makeElement("button", "botao-carro", "Editar");
                edit.type = "button";
                edit.addEventListener("click", function () {
                    setAdminForm(vehicle);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                });
                var remove = makeElement("button", "botao-excluir", "Excluir");
                remove.type = "button";
                remove.addEventListener("click", async function () {
                    if (!window.confirm("Excluir este veículo?")) {
                        return;
                    }
                    try {
                        await api("vehicles.php?id=" + encodeURIComponent(vehicle.id), { method: "DELETE" });
                        showMessage("Veículo excluído.", "mensagem-sucesso");
                        await refresh();
                    } catch (error) {
                        showMessage(error.message, "mensagem-erro");
                    }
                });
                actions.append(edit, remove);
                row.appendChild(actions);
                body.appendChild(row);
            });
            table.appendChild(body);
            list.appendChild(table);
        }

        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            try {
                var result = await api("vehicles.php", {
                    method: "POST",
                    body: new FormData(form)
                });
                setAdminForm(null);
                showMessage(result.message, "mensagem-sucesso");
                await refresh();
            } catch (error) {
                showMessage(error.message, "mensagem-erro");
            }
        });
        await refresh();
        await initAdminUsers();
    }

    async function initAdminUsers() {
        var form = document.getElementById("admin-usuario-form");
        var list = document.getElementById("admin-usuarios");

        async function refresh() {
            var result = await api("admin/users.php");
            list.replaceChildren();
            var table = makeElement("table");
            var head = makeElement("thead");
            var header = makeElement("tr");
            ["Nome", "E-mail", "Tipo de conta", "Criada em"].forEach(function (label) {
                header.appendChild(makeElement("th", "", label));
            });
            head.appendChild(header);
            table.appendChild(head);
            var body = makeElement("tbody");
            result.usuarios.forEach(function (user) {
                var row = makeElement("tr");
                [
                    user.nome,
                    user.email,
                    user.perfil === "admin" ? "Administrador" : "Cliente / comprador",
                    new Date(user.criado_em.replace(" ", "T")).toLocaleString("pt-BR")
                ].forEach(function (value) {
                    row.appendChild(makeElement("td", "", value));
                });
                body.appendChild(row);
            });
            table.appendChild(body);
            list.appendChild(table);
        }

        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            try {
                var result = await api("admin/users.php", {
                    method: "POST",
                    body: {
                        nome: form.elements.nome.value,
                        email: form.elements.email.value,
                        senha: form.elements.senha.value,
                        perfil: form.elements.perfil.value
                    }
                });
                form.reset();
                showMessage(result.message, "mensagem-sucesso");
                await refresh();
            } catch (error) {
                showMessage(error.message, "mensagem-erro");
            }
        });

        await refresh();
    }

    async function initPayment() {
        var vehicleId = new URLSearchParams(window.location.search).get("veiculo");
        if (!vehicleId || !/^[1-9]\d*$/.test(vehicleId)) {
            throw new Error("Veículo inválido.");
        }
        var vehicles = await loadVehicles();
        var vehicle = vehicles.find(function (item) {
            return String(item.id) === vehicleId;
        });
        if (!vehicle) {
            throw new Error("Veículo não encontrado.");
        }
        var summary = document.getElementById("resumo-veiculo");
        summary.append(
            makeElement("p", "", "Veículo: " + vehicle.marca + " " + vehicle.modelo),
            makeElement("p", "", "Valor: " + formatCurrency(vehicle.preco))
        );
        var form = document.getElementById("pagamento-form");
        if (vehicle.disponibilidade !== "disponivel") {
            form.hidden = true;
            showMessage("Este veículo está indisponível no momento.", "mensagem-erro");
            return;
        }
        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            try {
                var result = await api("payments.php", {
                    method: "POST",
                    body: { veiculoId: vehicle.id, forma: form.elements.forma.value }
                });
                form.hidden = true;
                showMessage(result.message, "mensagem-sucesso");
                var profileLink = makeElement("a", "", "Ver minhas simulações");
                profileLink.href = "perfil.html";
                summary.appendChild(profileLink);
            } catch (error) {
                showMessage(error.message, "mensagem-erro");
            }
        });
    }

    async function start() {
        try {
            var session = await api("auth.php");
            csrfToken = session.csrfToken;
            var isAuthPage = page === "login" || page === "cadastro";
            if (isAuthPage && session.user) {
                window.location.replace("index.html");
                return;
            }
            if (document.body.dataset.protected === "true" && !session.user) {
                window.location.replace("login.html");
                return;
            }
            if (document.body.dataset.admin === "true" && session.user.perfil !== "admin") {
                window.location.replace("index.html");
                return;
            }
            if (session.user) {
                renderNav(session.user);
                renderFooter();
            }

            if (page === "login") {
                initLogin();
            } else if (page === "cadastro") {
                initRegistration();
            } else if (page === "home") {
                await initHome();
            } else if (page === "galeria") {
                await initGallery();
            } else if (page === "tabela") {
                await initTable();
            } else if (page === "perfil") {
                await initProfile();
            } else if (page === "admin") {
                await initAdmin();
            } else if (page === "pagamento") {
                await initPayment();
            }
        } catch (error) {
            showMessage(error.message, "mensagem-erro");
        }
    }

    function initLogin() {
        var form = document.getElementById("login-form");
        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            try {
                var result = await api("auth.php?acao=login", {
                    method: "POST",
                    body: {
                        email: form.elements.email.value,
                        senha: form.elements.senha.value
                    }
                });
                csrfToken = result.csrfToken;
                window.location.replace("index.html");
            } catch (error) {
                showMessage(error.message, "mensagem-erro");
            }
        });
    }

    function initRegistration() {
        var form = document.getElementById("cadastro-form");
        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            try {
                var result = await api("auth.php?acao=cadastro", {
                    method: "POST",
                    body: {
                        nome: form.elements.nome.value,
                        email: form.elements.email.value,
                        senha: form.elements.senha.value,
                        confirmarSenha: form.elements.confirmarSenha.value
                    }
                });
                csrfToken = result.csrfToken;
                window.location.replace("index.html");
            } catch (error) {
                showMessage(error.message, "mensagem-erro");
            }
        });
    }

    start();
}());
