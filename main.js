<script>

    /* =================================================
    CONFIG
    ================================================= */

    const CONFIG = {

        github: {

        username: "Edgaarsq",

    api:
    "https://api.github.com"

      },

    contact: {

        email:
    "edgar.parducci.s@gmail.com",

    phone:
    "+5513981120320"

      },

    social: {

        github:
    "https://github.com/Edgaarsq",

    linkedin:
    "https://www.linkedin.com/in/edgarparducci/",

    instagram:
    "https://www.instagram.com/",

    x:
    "https://x.com/brske",

    fiverr:
    "https://www.fiverr.com/",

    freelancer:
    "https://www.freelancer.com/",

    youtube:
    "https://www.youtube.com/"

      }

    };


    /* =================================================
       DOM
    ================================================= */

    const $ = selector =>
    document.querySelector(selector);


    const $$ = selector =>
    document.querySelectorAll(selector);


    /* =================================================
       YEAR
    ================================================= */

    $("#year").textContent =
    new Date().getFullYear();


    /* =================================================
       HEADER
    ================================================= */

    const header =
    $(".site-header");


    window.addEventListener(
    "scroll",
      () => {

        header.classList.toggle(
            "is-scrolled",
            window.scrollY > 30
        );

      },
    {
        passive: true
      }
    );


    /* =================================================
       SMOOTH NAVIGATION
    ================================================= */

    $$("a[href^='#']").forEach(
      link => {

        link.addEventListener(
            "click",
            event => {

                const id =
                    link.getAttribute("href");

                if (
                    id === "#"
                ) {
                    return;
                }


                const target =
                    document.querySelector(id);

                if (!target) {
                    return;
                }


                event.preventDefault();


                const offset =
                    header.offsetHeight + 12;


                const position =
                    target.getBoundingClientRect().top +
                    window.scrollY -
                    offset;


                window.scrollTo({

                    top:
                        position,

                    behavior:
                        "smooth"

                });

            }
        );

      }
    );


    /* =================================================
       REVEAL
    ================================================= */

    const revealElements =
    $$(".reveal");


    const revealObserver =
    new IntersectionObserver(
        entries => {

        entries.forEach(
            entry => {

                if (
                    !entry.isIntersecting
                ) {
                    return;
                }


                entry.target.classList.add(
                    "visible"
                );


                revealObserver.unobserve(
                    entry.target
                );

            }
        );

        },
    {
        threshold: .12,

    rootMargin:
    "0px 0px -40px 0px"
        }
    );


    revealElements.forEach(
      element =>
    revealObserver.observe(element)
    );


    /* =================================================
       SKILL BARS
    ================================================= */

    const skillBars =
    $$(".skill-bar");


    const skillObserver =
    new IntersectionObserver(
        entries => {

        entries.forEach(
            entry => {

                if (
                    !entry.isIntersecting
                ) {
                    return;
                }


                const bar =
                    entry.target;


                const value =
                    bar.style
                        .getPropertyValue(
                            "--skill"
                        );


                const span =
                    bar.querySelector("span");


                span.style.width =
                    value;


                skillObserver.unobserve(
                    bar
                );

            }
        );

        },
    {
        threshold: .4
        }
    );


    skillBars.forEach(
      bar =>
    skillObserver.observe(bar)
    );


    /* =================================================
       THEME
    ================================================= */

    const themeToggle =
    $("#themeToggle");


    const savedTheme =
    localStorage.getItem(
    "parducci-theme"
    );


    if (savedTheme) {

        document.documentElement.dataset.theme =
        savedTheme;

    }


    themeToggle.addEventListener(
    "click",
      () => {

        const current =
    document.documentElement.dataset.theme;


    const next =
    current === "dark"
    ? "light"
    : "dark";


    document.documentElement.dataset.theme =
    next;


    localStorage.setItem(
    "parducci-theme",
    next
    );

      }
    );


    /* =================================================
       LANGUAGE
    ================================================= */

    let currentLanguage =
    localStorage.getItem(
    "parducci-language"
    ) || "en";


    const translations = {

        en: {

        location:
    "São Paulo, Brazil",

    hero:
    "Software, premium web experiences, automotive concepts and digital work — built with intention."

      },

    pt: {

        location:
    "São Paulo, Brasil",

    hero:
    "Software, experiências web premium, conceitos automotivos e criação digital — construídos com intenção."

      }

    };


    function updateLanguage() {

      const data =
    translations[currentLanguage];


    $$("[data-i18n]").forEach(
        element => {

          const key =
    element.dataset.i18n;


    if (data[key]) {

        element.textContent =
        data[key];

          }

        }
    );


    $("#languageToggle").textContent =
    currentLanguage === "en"
    ? "PT"
    : "EN";


    document.documentElement.lang =
    currentLanguage;

    }


    $("#languageToggle").addEventListener(
    "click",
      () => {

        currentLanguage =
        currentLanguage === "en"
            ? "pt"
            : "en";


    localStorage.setItem(
    "parducci-language",
    currentLanguage
    );


    updateLanguage();

      }
    );


    updateLanguage();


    /* =================================================
       COPY EMAIL
    ================================================= */

    $("#copyEmail").addEventListener(
    "click",
      async () => {

        const button =
    $("#copyEmail");


    const original =
    button.textContent;


    try {

        await navigator.clipboard.writeText(
            CONFIG.contact.email
        );


    button.textContent =
    "Email copied";

        } catch {

        window.location.href =
        `mailto:${CONFIG.contact.email}`;

        }


    setTimeout(
          () => {

        button.textContent =
        original;

          },
    1800
    );

      }
    );


    /* =================================================
       GITHUB
    ================================================= */

    const githubProfile =
    $(".github-profile-card");


    const githubName =
    $("[data-github-name]");


    const githubBio =
    $("[data-github-bio]");


    const githubLink =
    $("[data-github-link]");


    const repositoriesGrid =
    $("#repositoriesGrid");


    const githubStats =
    $$("[data-github-stat]");


    function escapeHTML(value) {

      const div =
    document.createElement("div");


    div.textContent =
    String(value ?? "");


    return div.innerHTML;

    }


    async function githubRequest(
    endpoint
    ) {

      const response =
    await fetch(
    CONFIG.github.api +
    endpoint,
    {
        headers: {
        Accept:
    "application/vnd.github+json",

    "X-GitHub-Api-Version":
    "2026-03-10"
            }
          }
    );


    if (!response.ok) {

        throw new Error(
    `GitHub returned ${response.status}`
    );

      }


    return response.json();

    }


    function createRepositoryCard(
    repo
    ) {

      const article =
    document.createElement("article");


    article.className =
    "repository-card reveal";


    const description =
    repo.description ||
    "No description provided.";


    const language =
    repo.language ||
    "Code";


    article.innerHTML = `

    <div class="repository-top">

        <span class="repository-type">
            PUBLIC REPOSITORY
        </span>

        <span class="repository-visibility">
            ${escapeHTML(
                repo.visibility ||
                "public"
            )}
        </span>

    </div>


    <h3>
        ${escapeHTML(repo.name)}
    </h3>


    <p>
        ${escapeHTML(description)}
    </p>


    <div class="repository-meta">

        <span>
            ${escapeHTML(language)}
        </span>

        <span>
            ★
            ${repo.stargazers_count || 0}
        </span>

        <span>
            Forks
            ${repo.forks_count || 0}
        </span>

    </div>


    <a
        class="project-link"
        href="${escapeHTML(repo.html_url)}"
        target="_blank"
        rel="noopener noreferrer"
    >
        View repository →
    </a>

    `;


    requestAnimationFrame(
        () => {

        article.classList.add(
            "visible"
        );

        }
    );


    return article;

    }


    async function loadGitHub() {

        repositoriesGrid.innerHTML = `

                <div class="repository-empty">

                    Connecting to GitHub…

                </div>

            `;


    try {

        const username =
    CONFIG.github.username;


    const profile =
    await githubRequest(
    `/users/${encodeURIComponent(username)}`
    );


    const repositories =
    await githubRequest(
    `/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated&direction=desc`
    );


    /* -----------------------------------------
       PROFILE
    ----------------------------------------- */

    const avatar =
    $(".github-avatar");


    avatar.innerHTML = `

    <img
        src="${escapeHTML(profile.avatar_url)}"
        alt="${escapeHTML(profile.login)}"
        loading="lazy"
    >

        `;


        githubName.textContent =
        profile.name ||
        profile.login;


        githubBio.textContent =
        profile.bio ||
        "Software developer and independent creator.";


        githubLink.href =
        profile.html_url;


        /* -----------------------------------------
           STATS
        ----------------------------------------- */

        const publicRepos =
        profile.public_repos || 0;


        const followers =
        profile.followers || 0;


        const stars =
        repositories.reduce(
            (total, repo) =>
        total +
        (repo.stargazers_count || 0),
        0
        );


        const stats = {

            repositories:
        publicRepos,

        followers:
        followers,

        stars:
        stars

        };


        githubStats.forEach(
          element => {

            const key =
        element.dataset.githubStat;


        if (
        key in stats
        ) {

            element.textContent =
            stats[key].toLocaleString(
                "en-US"
            );

            }

          }
        );


        /* -----------------------------------------
           REPOSITORIES
        ----------------------------------------- */

        const filtered =
        repositories
        .filter(
              repo =>
        !repo.fork &&
        !repo.archived
        )
        .slice(0, 8);


        repositoriesGrid.innerHTML =
        "";


        if (!filtered.length) {

            repositoriesGrid.innerHTML = `

                        <div class="repository-empty">

                            No public repositories found.

                        </div>

                    `;

        return;

        }


        filtered.forEach(
          repo => {

            repositoriesGrid.appendChild(
                createRepositoryCard(repo)
            );

          }
        );


      } catch (error) {

            console.error(
                "GitHub connection failed:",
                error
            );


        repositoriesGrid.innerHTML = `

        <div class="repository-empty">

            <strong>
                GitHub is temporarily unavailable.
            </strong>

            <br><br>

                <a
                    class="project-link"
                    href="${CONFIG.social.github}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Open GitHub directly →
                </a>

            </div>

                `;

      }

    }


                $("#githubRefresh").addEventListener(
                "click",
                loadGitHub
                );


                loadGitHub();


                /* =================================================
                   GLOBAL
                ================================================= */

                window.PARDUCCI = {

                    version:
                "2.0.0",

                config:
                CONFIG,

                github: {

                    load:
                loadGitHub

      }

    };

            </script>