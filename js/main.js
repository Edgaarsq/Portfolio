/* ============================================================
   PARDUCCI — MAIN.JS v3.0.0
   Modular script for the portfolio index.
   Handles: theme, language, command palette, GitHub live data,
   reveal, counters, toasts, scroll spy, progress bar, mobile menu.
   ============================================================ */

(() => {
    "use strict";

    /* ============================================================
       CONFIG
       ============================================================ */
    const CONFIG = {
        github: {
            username: "Edgaarsq",
            api: "https://api.github.com",
            // ✅ Correto: a versão anterior ("2026-03-10") era uma data
            // futura e a API do GitHub rejeitava as requisições.
            apiVersion: "2022-11-28",
            cacheKey: "parducci-github-cache",
            cacheTTL: 1000 * 60 * 30, // 30 minutos
        },

        contact: {
            email: "edgar.parducci.s@gmail.com",
            phone: "+5513981120320",
        },

        social: {
            github: "https://github.com/Edgaarsq",
            linkedin: "https://www.linkedin.com/in/edgarparducci/",
            instagram: "https://www.instagram.com/edparducci/",
            x: "https://x.com/brske",
            fiverr: "https://www.fiverr.com/",
            freelancer: "https://www.freelancer.com/",
            youtube: "https://www.youtube.com/@edparducci",
        },

        storage: {
            theme: "parducci-theme",
            language: "parducci-language",
        },
    };

    /* ============================================================
       DOM HELPERS
       ============================================================ */
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    /* ============================================================
       TOAST
       ============================================================ */
    const toastStack = $("#toastStack");

    function toast(message, type = "info", duration = 3000) {
        if (!toastStack) return;

        const el = document.createElement("div");
        el.className = "toast" + (type !== "info" ? " " + type : "");
        el.setAttribute("role", type === "error" ? "alert" : "status");
        el.textContent = message;

        toastStack.appendChild(el);

        setTimeout(() => {
            el.classList.add("out");
            setTimeout(() => el.remove(), 320);
        }, duration);
    }

    /* ============================================================
       YEAR
       ============================================================ */
    const yearEl = $("#year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ============================================================
       LIVE CLOCK — São Paulo time
       ============================================================ */
    const clockFormatter = new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Sao_Paulo",
        hour12: false,
    });

    const dateFormatter = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    function updateClock() {
        const now = new Date();
        const time = clockFormatter.format(now);

        $$("[data-live-clock]").forEach((el) => (el.textContent = time));

        const dateEl = $("[data-live-date]");
        if (dateEl) dateEl.textContent = dateFormatter.format(now);
    }

    updateClock();
    setInterval(updateClock, 30_000);

    /* ============================================================
       HEADER — scrolled state + scroll progress
       ============================================================ */
    const header = $("#siteHeader");
    const progressBar = $(".scroll-progress i");
    let ticking = false;

    function handleScroll() {
        const y = window.scrollY;

        header?.classList.toggle("is-scrolled", y > 30);

        if (progressBar) {
            const h = document.documentElement.scrollHeight - window.innerHeight;
            progressBar.style.width = h > 0 ? (y / h) * 100 + "%" : "0%";
        }

        ticking = false;
    }

    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(handleScroll);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();

    /* ============================================================
       THEME
       ============================================================ */
    const themeToggle = $("#themeToggle");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

    const savedTheme = localStorage.getItem(CONFIG.storage.theme);
    const initialTheme = savedTheme || (prefersDark.matches ? "dark" : "light");

    document.documentElement.dataset.theme = initialTheme;

    function syncThemeColorMeta(theme) {
        const meta = document.querySelector('meta[name="theme-color"]:not([media])');
        if (meta) meta.setAttribute("content", theme === "dark" ? "#000000" : "#f5f5f7");
    }
    syncThemeColorMeta(initialTheme);

    themeToggle?.addEventListener("click", () => {
        const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        localStorage.setItem(CONFIG.storage.theme, next);
        syncThemeColorMeta(next);
        toast("Theme: " + next, "info", 1500);
    });

    // Reage a mudanças do sistema enquanto o usuário não escolheu manualmente
    prefersDark.addEventListener?.("change", (e) => {
        if (localStorage.getItem(CONFIG.storage.theme)) return;
        const next = e.matches ? "dark" : "light";
        document.documentElement.dataset.theme = next;
        syncThemeColorMeta(next);
    });

    /* ============================================================
       LANGUAGE / i18n
       ============================================================ */
    const translations = {
        en: {
            status: "Available for select projects",
            hero: "Software, premium web experiences, automotive concepts and digital work — engineered with intention.",

            metric_projects: "Projects shipped",
            metric_langs: "Languages learning",
            metric_tech: "Technologies",

            about_eyebrow: "About",
            about_lead:
                "A portfolio should show how someone thinks, builds and keeps moving when things get difficult.",
            about_quote: "I build things because I want to see how far they can go.",
            about_p1:
                "I'm Parducci — a developer and independent creator focused on software, web experiences and ambitious digital projects.",
            about_p2:
                "My work lives across different disciplines: front-end, back-end, software development, automation, interfaces and automotive concepts.",
            about_p3: "The goal is simple: make things that feel intentional, useful and memorable.",

            now_eyebrow: "Now",
            now_title: "Currently focused on",
            now_1: "Refining the GED travel platform experience",
            now_2: "Expanding front-end systems with motion & accessibility",
            now_3: "Learning Italian, Russian and Mandarin",
            now_4: "Studying automotive design concepts",

            sources_eyebrow: "Digital presence",
            sources_lead:
                "My work is distributed across the platforms where I build, publish, experiment and work with people.",
            src_github: "Software, repositories, experiments and source code.",
            src_linkedin: "Professional work, Parducci Puma and current projects.",
            src_instagram: "Photos, visual work, reels and personal content.",
            src_x: "Ideas, comments and development updates.",
            src_fiverr: "Freelance services, web development and gigs.",
            src_freelancer: "Freelance projects, proposals and client work.",

            work_eyebrow: "Selected work",
            work_lead:
                "Premium web experiences, software and concepts connected directly to their original sources.",
            work_web: "Interface systems designed around hierarchy, motion, responsiveness and detail.",
            work_sw: "Applications, automation, logic and experiments.",
            work_auto: "Concepts and ideas around automotive design and engineering.",

            gh_eyebrow: "Live data",
            gh_lead: "This section reads the public GitHub profile and repositories directly — with local caching.",
            gh_repos: "Repos",
            gh_followers: "Followers",
            gh_stars: "Stars",

            skills_eyebrow: "Skills",
            skills_lead: "The important part is knowing what to build with them.",

            lang_eyebrow: "Languages · Linked apps",
            lang_lead: "Six languages in progress — each with its own learning companion app.",
            lang_native: "Native",
            lang_dev: "Developing",
            lang_learning: "Learning",
            lang_pt: "First language. Fluent in speaking, writing and technical contexts.",
            lang_en: "Reading docs, technical writing and daily communication.",
            lang_it: "Growing vocabulary and everyday conversation.",
            lang_ru: "Cyrillic alphabet and foundational phrases.",
            lang_zh: "Tones, pinyin and basic characters.",
            lang_de: "Grammar foundations and structured vocabulary.",

            journey_eyebrow: "Perspective",
            inf_po: "Everyone expected him to become something else. He kept going, found his own path and became the Dragon Warrior.",
            inf_aang: "Running from a destiny does not erase it. Sometimes you have to face the weight of what you were called to become.",
            inf_iroh: "Strength can mean forgiveness, patience and reconciliation — not only victory.",
            inf_jesus: "A central reference for character, forgiveness, service and purpose beyond status.",
            inf_ippo: "Discipline and the willingness to keep showing up can transform someone who once doubted himself.",
            inf_heroes: "Spider-Man, Batman, Robin, Nightwing, Flash, Iron Man, Cristiano Ronaldo, Neymar, Messi — different versions of resilience and ambition.",

            connect_eyebrow: "Connect",
            contact_eyebrow: "Contact",
            contact_lead: "For projects, freelance work, collaborations or simply a conversation.",
        },

        pt: {
            status: "Disponível para projetos selecionados",
            hero: "Software, experiências web premium, conceitos automotivos e criação digital — construídos com intenção.",

            metric_projects: "Projetos entregues",
            metric_langs: "Idiomas em estudo",
            metric_tech: "Tecnologias",

            about_eyebrow: "Sobre",
            about_lead:
                "Um portfólio deve mostrar como alguém pensa, constrói e continua avançando quando as coisas ficam difíceis.",
            about_quote: "Eu construo coisas porque quero ver até onde elas podem ir.",
            about_p1:
                "Sou o Parducci — desenvolvedor e criador independente focado em software, experiências web e projetos digitais ambiciosos.",
            about_p2:
                "Meu trabalho vive em diferentes disciplinas: front-end, back-end, desenvolvimento de software, automação, interfaces e conceitos automotivos.",
            about_p3: "O objetivo é simples: fazer coisas que pareçam intencionais, úteis e memoráveis.",

            now_eyebrow: "Agora",
            now_title: "Foco atual",
            now_1: "Refinando a experiência da plataforma GED",
            now_2: "Expandindo sistemas front-end com motion e acessibilidade",
            now_3: "Aprendendo italiano, russo e mandarim",
            now_4: "Estudando conceitos de design automotivo",

            sources_eyebrow: "Presença digital",
            sources_lead:
                "Meu trabalho está distribuído pelas plataformas onde construo, publico, experimento e trabalho com pessoas.",
            src_github: "Software, repositórios, experimentos e código-fonte.",
            src_linkedin: "Trabalho profissional, Parducci Puma e projetos atuais.",
            src_instagram: "Fotos, trabalho visual, reels e conteúdo pessoal.",
            src_x: "Ideias, comentários e atualizações de desenvolvimento.",
            src_fiverr: "Serviços freelance, desenvolvimento web e gigs.",
            src_freelancer: "Projetos freelance, propostas e trabalho com clientes.",

            work_eyebrow: "Trabalho selecionado",
            work_lead:
                "Experiências web premium, software e conceitos conectados diretamente às suas fontes originais.",
            work_web: "Sistemas de interface desenhados em torno de hierarquia, movimento, responsividade e detalhe.",
            work_sw: "Aplicações, automação, lógica e experimentos.",
            work_auto: "Conceitos e ideias em torno de design e engenharia automotiva.",

            gh_eyebrow: "Dados ao vivo",
            gh_lead: "Esta seção lê o perfil público do GitHub e os repositórios diretamente — com cache local.",
            gh_repos: "Repos",
            gh_followers: "Seguidores",
            gh_stars: "Estrelas",

            skills_eyebrow: "Habilidades",
            skills_lead: "O importante é saber o que construir com elas.",

            lang_eyebrow: "Idiomas · Apps vinculados",
            lang_lead: "Seis idiomas em progresso — cada um com seu app de aprendizado.",
            lang_native: "Nativo",
            lang_dev: "Desenvolvendo",
            lang_learning: "Aprendendo",
            lang_pt: "Primeira língua. Fluente em fala, escrita e contextos técnicos.",
            lang_en: "Leitura de docs, escrita técnica e comunicação diária.",
            lang_it: "Ampliando vocabulário e conversação do dia a dia.",
            lang_ru: "Alfabeto cirílico e frases fundamentais.",
            lang_zh: "Tons, pinyin e caracteres básicos.",
            lang_de: "Fundamentos gramaticais e vocabulário estruturado.",

            journey_eyebrow: "Perspectiva",
            inf_po: "Todos esperavam que ele se tornasse outra coisa. Ele continuou, encontrou seu próprio caminho e se tornou o Dragão Guerreiro.",
            inf_aang: "Fugir de um destino não o apaga. Às vezes você precisa encarar o peso daquilo que foi chamado a se tornar.",
            inf_iroh: "Força pode significar perdão, paciência e reconciliação — não apenas vitória.",
            inf_jesus: "Uma referência central de caráter, perdão, serviço e propósito além do status.",
            inf_ippo: "Disciplina e a vontade de continuar aparecendo podem transformar alguém que antes duvidava de si.",
            inf_heroes: "Spider-Man, Batman, Robin, Asa Noturna, Flash, Homem de Ferro, Cristiano Ronaldo, Neymar, Messi — diferentes versões de resiliência e ambição.",

            connect_eyebrow: "Conectar",
            contact_eyebrow: "Contato",
            contact_lead: "Para projetos, trabalho freelance, colaborações ou simplesmente uma conversa.",
        },
    };

    let currentLanguage =
        localStorage.getItem(CONFIG.storage.language) || "en";

    function applyLanguage() {
        const data = translations[currentLanguage];
        if (!data) return;

        $$("[data-i18n]").forEach((el) => {
            const key = el.dataset.i18n;
            if (data[key]) el.textContent = data[key];
        });

        const label = $("[data-lang-label]");
        if (label) label.textContent = currentLanguage === "en" ? "PT" : "EN";

        document.documentElement.lang = currentLanguage;
    }

    function toggleLanguage() {
        currentLanguage = currentLanguage === "en" ? "pt" : "en";
        localStorage.setItem(CONFIG.storage.language, currentLanguage);
        applyLanguage();
    }

    $("#languageToggle")?.addEventListener("click", toggleLanguage);
    applyLanguage();

    /* ============================================================
       MOBILE MENU
       ============================================================ */
    const menuBtn = $("#menuButton");
    const mobileMenu = $("#mobileMenu");

    function openMenu() {
        mobileMenu?.classList.add("open");
        mobileMenu?.setAttribute("aria-hidden", "false");
        menuBtn?.setAttribute("aria-expanded", "true");
        document.body.classList.add("menu-open");
    }

    function closeMenu() {
        mobileMenu?.classList.remove("open");
        mobileMenu?.setAttribute("aria-hidden", "true");
        menuBtn?.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
    }

    menuBtn?.addEventListener("click", () => {
        const isOpen = menuBtn.getAttribute("aria-expanded") === "true";
        isOpen ? closeMenu() : openMenu();
    });

    $$("#mobileMenu a").forEach((a) => a.addEventListener("click", closeMenu));

    // Fecha com ESC
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && mobileMenu?.classList.contains("open")) {
            closeMenu();
        }
    });

    /* ============================================================
       SMOOTH SCROLL — with header offset
       ============================================================ */
    function scrollToSelector(selector) {
        const el = typeof selector === "string" ? document.querySelector(selector) : selector;
        if (!el) return;

        const offset = (header?.offsetHeight || 64) + 12;
        const top = el.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({ top, behavior: "smooth" });
    }

    document.addEventListener("click", (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;

        const href = link.getAttribute("href");
        if (!href || href === "#") return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        scrollToSelector(target);

        if (history.pushState) history.pushState(null, "", href);
    });

    /* ============================================================
       SCROLL SPY — active nav link
       ============================================================ */
    const navLinks = $$("[data-nav]");
    const spySections = navLinks
        .map((a) => document.querySelector(a.getAttribute("href")))
        .filter(Boolean);

    if ("IntersectionObserver" in window && spySections.length) {
        const spy = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const id = "#" + entry.target.id;
                    navLinks.forEach((a) =>
                        a.classList.toggle("active", a.getAttribute("href") === id)
                    );
                });
            },
            { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
        );

        spySections.forEach((s) => spy.observe(s));
    }

    /* ============================================================
       REVEAL ON SCROLL
       ============================================================ */
    const revealEls = $$(".reveal");

    if ("IntersectionObserver" in window) {
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("visible");
                    obs.unobserve(entry.target);
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
        );

        revealEls.forEach((el) => obs.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add("visible"));
    }

    /* ============================================================
       COUNTERS (hero metrics)
       ============================================================ */
    const counters = $$("[data-count]");

    function animateCounter(el) {
        const target = Number(el.dataset.count) || 0;
        const duration = 1400;
        const start = performance.now();

        function step(now) {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.round(eased * target);
            if (t < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    }

    if ("IntersectionObserver" in window && counters.length) {
        const cObs = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                });
            },
            { threshold: 0.4 }
        );

        counters.forEach((c) => cObs.observe(c));
    } else {
        counters.forEach((c) => (c.textContent = c.dataset.count));
    }

    /* ============================================================
       COPY EMAIL
       ============================================================ */
    $$("[data-copy]").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const value = btn.dataset.copy;
            const label = $("[data-copy-label]", btn);
            const original = label?.textContent || "Copy";

            try {
                await navigator.clipboard.writeText(value);
                if (label) label.textContent = "Copied!";
                toast("Email copied to clipboard", "info", 2000);
            } catch {
                window.location.href = "mailto:" + value;
            }

            setTimeout(() => {
                if (label) label.textContent = original;
            }, 1800);
        });
    });

    /* ============================================================
       COMMAND PALETTE (⌘K / Ctrl+K)
       ============================================================ */
    const overlay = $("#commandOverlay");
    const cmdInput = $("#commandInput");
    const cmdResults = $("#commandResults");

    const COMMANDS = [
        { id: "home", label: "Home", desc: "Back to the top", icon: "★", action: () => scrollToSelector("#home") },
        { id: "about", label: "About", desc: "More than code", icon: "◐", action: () => scrollToSelector("#about") },
        { id: "now", label: "Now", desc: "Currently focused on", icon: "◉", action: () => scrollToSelector(".now-section") },
        { id: "work", label: "Work", desc: "Selected projects", icon: "◆", action: () => scrollToSelector("#work") },
        { id: "github", label: "Code", desc: "Live GitHub data", icon: "◇", action: () => scrollToSelector("#github") },
        { id: "skills", label: "Skills", desc: "Tools & focus", icon: "⬢", action: () => scrollToSelector("#skills") },
        { id: "languages", label: "Languages", desc: "Linked learning apps", icon: "⬡", action: () => scrollToSelector("#languages") },
        { id: "journey", label: "Journey", desc: "Perspective & influences", icon: "✦", action: () => scrollToSelector("#journey") },
        { id: "contact", label: "Contact", desc: "Let's build something", icon: "✉", action: () => scrollToSelector("#contact") },
        {
            id: "theme",
            label: "Toggle theme",
            desc: "Switch between dark and light",
            icon: "◐",
            action: () => {
                const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
                document.documentElement.dataset.theme = next;
                localStorage.setItem(CONFIG.storage.theme, next);
                syncThemeColorMeta(next);
                toast("Theme: " + next, "info", 1500);
            },
        },
        {
            id: "lang",
            label: "Toggle language",
            desc: "EN ↔ PT",
            icon: "文",
            action: toggleLanguage,
        },
        {
            id: "copy",
            label: "Copy email",
            desc: CONFIG.contact.email,
            icon: "⌘",
            action: async () => {
                try {
                    await navigator.clipboard.writeText(CONFIG.contact.email);
                    toast("Email copied", "info", 2000);
                } catch {
                    toast("Copy failed", "error", 2000);
                }
            },
        },
        {
            id: "gh-profile",
            label: "Open GitHub profile",
            desc: "github.com/Edgaarsq",
            icon: "↗",
            action: () => window.open(CONFIG.social.github, "_blank"),
        },
        {
            id: "gh-refresh",
            label: "Refresh GitHub data",
            desc: "Reload repositories",
            icon: "↻",
            action: () => loadGitHub(true),
        },
    ];

    let cmdSelected = 0;
    let cmdFiltered = COMMANDS.slice();

    function renderCmdResults() {
        if (!cmdResults) return;

        if (!cmdFiltered.length) {
            cmdResults.innerHTML = '<div class="cmd-empty">No results found</div>';
            return;
        }

        cmdResults.innerHTML = cmdFiltered
            .map(
                (cmd, i) => `
        <div class="cmd-item" role="option" data-index="${i}" aria-selected="${i === cmdSelected}">
          <span class="cmd-icon">${cmd.icon}</span>
          <span class="cmd-label">
            <strong>${cmd.label}</strong>
            <small>${cmd.desc}</small>
          </span>
          <span class="cmd-kbd">↵</span>
        </div>`
            )
            .join("");

        $$(".cmd-item", cmdResults).forEach((el) => {
            el.addEventListener("click", () => {
                const idx = Number(el.dataset.index);
                cmdFiltered[idx]?.action();
                closeCommand();
            });
        });
    }

    function openCommand() {
        if (!overlay || !cmdInput) return;
        overlay.hidden = false;
        document.body.classList.add("command-open");
        cmdInput.value = "";
        cmdFiltered = COMMANDS.slice();
        cmdSelected = 0;
        renderCmdResults();
        setTimeout(() => cmdInput.focus(), 50);
    }

    function closeCommand() {
        if (!overlay) return;
        overlay.hidden = true;
        document.body.classList.remove("command-open");
    }

    $$("[data-command-open]").forEach((b) => b.addEventListener("click", openCommand));

    overlay?.addEventListener("click", (e) => {
        if (e.target === overlay) closeCommand();
    });

    cmdInput?.addEventListener("input", () => {
        const q = cmdInput.value.toLowerCase().trim();
        cmdFiltered = COMMANDS.filter(
            (c) =>
                c.label.toLowerCase().includes(q) ||
                c.desc.toLowerCase().includes(q)
        );
        cmdSelected = 0;
        renderCmdResults();
    });

    document.addEventListener("keydown", (e) => {
        const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
        if (isCmdK) {
            e.preventDefault();
            overlay?.hidden ? openCommand() : closeCommand();
            return;
        }
        if (!overlay || overlay.hidden) return;

        if (e.key === "Escape") closeCommand();
        else if (e.key === "ArrowDown") {
            e.preventDefault();
            cmdSelected = Math.min(cmdSelected + 1, cmdFiltered.length - 1);
            renderCmdResults();
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            cmdSelected = Math.max(cmdSelected - 1, 0);
            renderCmdResults();
        } else if (e.key === "Enter") {
            e.preventDefault();
            cmdFiltered[cmdSelected]?.action();
            closeCommand();
        }
    });

    /* ============================================================
       GITHUB
       ============================================================ */
    const ghCard = $("#githubProfileCard");
    const repositoriesGrid = $("#repositoriesGrid");
    const ghName = $("[data-github-name]");
    const ghBio = $("[data-github-bio]");
    const ghLink = $("[data-github-link]");
    const ghAvatar = $(".github-avatar");

    const LANG_COLORS = {
        JavaScript: "#f1e05a",
        TypeScript: "#3178c6",
        HTML: "#e34c26",
        CSS: "#563d7c",
        Python: "#3572A5",
        C: "#555555",
        "C#": "#178600",
        "C++": "#f34b7d",
        Ruby: "#701516",
        Go: "#00ADD8",
        Rust: "#dea584",
        Java: "#b07219",
        PHP: "#4F5D95",
        Shell: "#89e051",
        Vue: "#41b883",
        Kotlin: "#A97BFF",
        Swift: "#F05138",
    };

    function escapeHTML(value) {
        const div = document.createElement("div");
        div.textContent = String(value ?? "");
        return div.innerHTML;
    }

    async function githubRequest(endpoint) {
        const response = await fetch(CONFIG.github.api + endpoint, {
            headers: {
                Accept: "application/vnd.github+json",
                "X-GitHub-Api-Version": CONFIG.github.apiVersion,
            },
        });

        if (!response.ok) {
            throw new Error(`GitHub returned ${response.status}`);
        }

        return response.json();
    }

    function skeletonHTML() {
        return Array.from({ length: 4 })
            .map(
                () => `
        <div class="repository-card" style="pointer-events:none">
          <div class="repository-top">
            <div class="skeleton-line" style="width:80px"></div>
            <div class="skeleton-line" style="width:40px"></div>
          </div>
          <div class="skeleton-line" style="width:60%; height:18px; margin-bottom:10px"></div>
          <div class="skeleton-line" style="width:100%; margin-bottom:6px"></div>
          <div class="skeleton-line" style="width:80%"></div>
          <div class="repository-meta">
            <div class="skeleton-line" style="width:60px"></div>
            <div class="skeleton-line" style="width:40px"></div>
          </div>
        </div>`
            )
            .join("");
    }

    function createRepositoryCard(repo) {
        const lang = repo.language || "Code";
        const color = LANG_COLORS[lang] || "#8b8b8b";

        const article = document.createElement("article");
        article.className = "repository-card reveal";

        article.innerHTML = `
      <div class="repository-top">
        <span>Repository</span>
        <span>${escapeHTML(repo.visibility || "public")}</span>
      </div>

      <h3>${escapeHTML(repo.name)}</h3>
      <p>${escapeHTML(repo.description || "No description provided.")}</p>

      <div class="repository-meta">
        <span class="repository-lang" style="--lang-color:${color}">
          ${escapeHTML(lang)}
        </span>
        <span>★ ${repo.stargazers_count || 0}</span>
        <span>⑂ ${repo.forks_count || 0}</span>
      </div>

      <a class="button" style="margin-top:auto; min-height:38px; font-size:12.5px"
         href="${escapeHTML(repo.html_url)}"
         target="_blank"
         rel="noopener noreferrer">
        View repository →
      </a>
    `;

        requestAnimationFrame(() => article.classList.add("visible"));

        return article;
    }

    function readCache() {
        try {
            const raw = localStorage.getItem(CONFIG.github.cacheKey);
            if (!raw) return null;

            const data = JSON.parse(raw);
            if (Date.now() - data.ts > CONFIG.github.cacheTTL) return null;

            return data.payload;
        } catch {
            return null;
        }
    }

    function writeCache(payload) {
        try {
            localStorage.setItem(
                CONFIG.github.cacheKey,
                JSON.stringify({ ts: Date.now(), payload })
            );
        } catch {
            /* storage quota or privacy mode — safe to ignore */
        }
    }

    function renderGitHub(profile, repos) {
        // Avatar
        if (ghAvatar && profile.avatar_url) {
            ghAvatar.classList.remove("skeleton-circle");
            ghAvatar.innerHTML = `
        <img
          src="${escapeHTML(profile.avatar_url)}"
          alt="${escapeHTML(profile.login)}"
          loading="lazy"
        >`;
        }

        // Profile
        if (ghName) ghName.textContent = profile.name || profile.login;
        if (ghBio) ghBio.textContent = profile.bio || "Software developer and independent creator.";
        if (ghLink) ghLink.href = profile.html_url;

        // Stats
        const stars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
        const statsMap = {
            repositories: profile.public_repos || 0,
            followers: profile.followers || 0,
            stars,
        };

        $$("[data-github-stat]").forEach((el) => {
            const key = el.dataset.githubStat;
            if (key in statsMap) el.textContent = statsMap[key].toLocaleString("en-US");
        });

        // Repositories
        const filtered = repos.filter((r) => !r.fork && !r.archived).slice(0, 6);

        if (repositoriesGrid) {
            if (!filtered.length) {
                repositoriesGrid.innerHTML = `
          <div class="repository-empty">No public repositories found.</div>`;
            } else {
                repositoriesGrid.innerHTML = "";
                filtered.forEach((repo) =>
                    repositoriesGrid.appendChild(createRepositoryCard(repo))
                );
            }
        }

        ghCard?.setAttribute("aria-busy", "false");
    }

    async function loadGitHub(force = false) {
        if (!repositoriesGrid) return;

        // Cache hit (só quando não é refresh manual)
        if (!force) {
            const cached = readCache();
            if (cached) {
                renderGitHub(cached.profile, cached.repos);
                return;
            }
        }

        ghCard?.setAttribute("aria-busy", "true");
        repositoriesGrid.innerHTML = skeletonHTML();
        if (ghName) ghName.textContent = "Loading…";
        if (ghBio) ghBio.textContent = "Connecting to GitHub…";

        try {
            const username = CONFIG.github.username;

            const [profile, repos] = await Promise.all([
                githubRequest(`/users/${encodeURIComponent(username)}`),
                githubRequest(
                    `/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated&direction=desc`
                ),
            ]);

            writeCache({ profile, repos });
            renderGitHub(profile, repos);

            if (force) toast("GitHub data refreshed", "info", 2000);
        } catch (error) {
            console.error("GitHub connection failed:", error);

            if (ghName) ghName.textContent = "GitHub";
            if (ghBio) ghBio.textContent = "Could not load profile right now.";

            if (repositoriesGrid) {
                repositoriesGrid.innerHTML = `
          <div class="repository-empty">
            <strong>GitHub is temporarily unavailable.</strong>
            <br><br>
            <a class="button"
               href="${CONFIG.social.github}"
               target="_blank"
               rel="noopener noreferrer">
              Open GitHub directly →
            </a>
          </div>`;
            }

            ghCard?.setAttribute("aria-busy", "false");
            if (force) toast("GitHub unavailable", "error", 2500);
        }
    }

    $("#githubRefresh")?.addEventListener("click", () => loadGitHub(true));

    // Initial load (auto, respeitando cache)
    loadGitHub();

    /* ============================================================
       EXPOSE — window.PARDUCCI
       ============================================================ */
    window.PARDUCCI = {
        version: "3.0.0",
        config: CONFIG,
        github: {
            load: loadGitHub,
            refresh: () => loadGitHub(true),
        },
        theme: {
            toggle: () => themeToggle?.click(),
            set: (theme) => {
                document.documentElement.dataset.theme = theme;
                localStorage.setItem(CONFIG.storage.theme, theme);
                syncThemeColorMeta(theme);
            },
        },
        language: {
            toggle: toggleLanguage,
            current: () => currentLanguage,
            set: (lang) => {
                if (!translations[lang]) return;
                currentLanguage = lang;
                localStorage.setItem(CONFIG.storage.language, lang);
                applyLanguage();
            },
        },
        toast,
    };

    /* ============================================================
       CONSOLE BRANDING
       ============================================================ */
    console.log(
        "%cPARDUCCI v3.0.0",
        "font-weight:700;background:#000;color:#30d158;padding:6px 12px;border-radius:6px;font-family:monospace;font-size:12px"
    );
    console.log(
        "%cTry: PARDUCCI.github.refresh() · PARDUCCI.theme.toggle() · PARDUCCI.language.toggle()",
        "color:#a1a1a6;font-family:monospace;font-size:11px"
    );

})();