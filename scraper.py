#!/usr/bin/env python3
"""
Parducci — Social Media Scraper (no API)
Extrai dados de GitHub, Instagram, TikTok, LinkedIn e X/Twitter
sem usar APIs oficiais (apenas scraping).
"""
import json
import re
import time
import sys
from pathlib import Path
from urllib.parse import quote

import requests
from bs4 import BeautifulSoup

try:
    from playwright.sync_api import sync_playwright
    HAS_PLAYWRIGHT = True
except ImportError:
    HAS_PLAYWRIGHT = False
    print("⚠️  Playwright não instalado. Alguns scrapers vão falhar.")
    print("   Instale com: pip install playwright && playwright install chromium")

# ---------------------------------------------------------------------------
CONFIG = {
    "github": "Edgaarsq",
    "instagram": "edparducci",
    "tiktok": "edparducci",
    "linkedin": "edgarparducci",
    "x": "snewkiz",
}

OUTPUT_DIR = Path("./data")
OUTPUT_DIR.mkdir(exist_ok=True)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9,pt-BR;q=0.8",
}


# ---------------------------------------------------------------------------
# GITHUB — usa API pública (é permitido sem token, com rate limit)
# ---------------------------------------------------------------------------
def scrape_github():
    print("→ GitHub...")
    user = CONFIG["github"]
    data = {"profile": None, "repos": []}

    try:
        r = requests.get(f"https://api.github.com/users/{user}", headers=HEADERS, timeout=15)
        if r.status_code == 200:
            p = r.json()
            data["profile"] = {
                "login": p.get("login"),
                "name": p.get("name"),
                "bio": p.get("bio"),
                "avatar_url": p.get("avatar_url"),
                "html_url": p.get("html_url"),
                "public_repos": p.get("public_repos"),
                "followers": p.get("followers"),
                "following": p.get("following"),
            }

        r = requests.get(
            f"https://api.github.com/users/{user}/repos?per_page=100&sort=updated",
            headers=HEADERS, timeout=15
        )
        if r.status_code == 200:
            for repo in r.json():
                if repo.get("fork") or repo.get("archived"):
                    continue
                data["repos"].append({
                    "name": repo.get("name"),
                    "description": repo.get("description"),
                    "html_url": repo.get("html_url"),
                    "language": repo.get("language"),
                    "stars": repo.get("stargazers_count"),
                    "forks": repo.get("forks_count"),
                    "has_pages": repo.get("has_pages"),
                })
    except Exception as e:
        print(f"  ✗ GitHub falhou: {e}")

    (OUTPUT_DIR / "github.json").write_text(
        json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print(f"  ✓ {len(data['repos'])} repositórios")


# ---------------------------------------------------------------------------
# INSTAGRAM — scraping com Playwright (JS rendering) + fallback de API privada
# ---------------------------------------------------------------------------
def scrape_instagram():
    print("→ Instagram...")
    user = CONFIG["instagram"]
    data = {"profile": None, "posts": []}

    # Tentativa 1: endpoint ?__a=1 (funciona intermitentemente)
    try:
        url = f"https://www.instagram.com/{user}/?__a=1&__d=dis"
        r = requests.get(url, headers=HEADERS, timeout=15)
        if r.status_code == 200 and "graphql" in r.text:
            j = r.json()
            u = j.get("graphql", {}).get("user") or j.get("user")
            if u:
                data["profile"] = {
                    "username": u.get("username"),
                    "full_name": u.get("full_name"),
                    "biography": u.get("biography"),
                    "profile_pic_url": u.get("profile_pic_url_hd") or u.get("profile_pic_url"),
                    "followers": u.get("edge_followed_by", {}).get("count"),
                    "following": u.get("edge_follow", {}).get("count"),
                    "posts_count": u.get("edge_owner_to_timeline_media", {}).get("count"),
                }
                edges = u.get("edge_owner_to_timeline_media", {}).get("edges", [])
                for e in edges[:12]:
                    n = e["node"]
                    data["posts"].append({
                        "shortcode": n.get("shortcode"),
                        "display_url": n.get("display_url"),
                        "caption": (n.get("edge_media_to_caption", {}).get("edges") or [{}])[0].get("node", {}).get("text", ""),
                        "is_video": n.get("is_video"),
                        "video_url": n.get("video_url"),
                        "likes": n.get("edge_liked_by", {}).get("count"),
                        "comments": n.get("edge_media_to_comment", {}).get("count"),
                    })
    except Exception as e:
        print(f"  ! ?__a=1 falhou: {e}")

    # Tentativa 2: Playwright se ainda não temos dados
    if not data["profile"] and HAS_PLAYWRIGHT:
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                ctx = browser.new_context(
                    user_agent=HEADERS["User-Agent"],
                    viewport={"width": 1366, "height": 900},
                )
                page = ctx.new_page()
                page.goto(f"https://www.instagram.com/{user}/", wait_until="networkidle", timeout=30000)

                # Meta tags OG
                meta = page.evaluate("""() => {
                  const g = (n) => document.querySelector(`meta[property="${n}"]`)?.content;
                  return {
                    title: g('og:title'),
                    desc: g('og:description'),
                    img: g('og:image'),
                  };
                }""")

                if meta.get("title"):
                    followers = re.search(r"([\d.,]+[KMB]?)\s+Followers", meta.get("desc", ""))
                    following = re.search(r"([\d.,]+[KMB]?)\s+Following", meta.get("desc", ""))
                    posts = re.search(r"([\d.,]+[KMB]?)\s+Posts", meta.get("desc", ""))
                    data["profile"] = {
                        "username": user,
                        "full_name": meta.get("title", "").split("(")[0].strip(),
                        "biography": meta.get("desc", "").split(":")[0] if ":" in meta.get("desc", "") else "",
                        "profile_pic_url": meta.get("img"),
                        "followers": followers.group(1) if followers else "—",
                        "following": following.group(1) if following else "—",
                        "posts_count": posts.group(1) if posts else "—",
                    }

                browser.close()
        except Exception as e:
            print(f"  ! Playwright Instagram falhou: {e}")

    (OUTPUT_DIR / "instagram.json").write_text(
        json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print(f"  ✓ {len(data['posts'])} posts")


# ---------------------------------------------------------------------------
# TIKTOK — scraping via Playwright
# ---------------------------------------------------------------------------
def scrape_tiktok():
    print("→ TikTok...")
    user = CONFIG["tiktok"]
    data = {"profile": None, "videos": []}

    # Tentativa 1: endpoint JSON público
    try:
        url = f"https://www.tiktok.com/api/user/detail/?uniqueId={user}"
        r = requests.get(url, headers=HEADERS, timeout=15)
        if r.status_code == 200:
            j = r.json()
            u = j.get("userInfo", {}).get("user")
            s = j.get("userInfo", {}).get("stats")
            if u:
                data["profile"] = {
                    "username": u.get("uniqueId"),
                    "nickname": u.get("nickname"),
                    "signature": u.get("signature"),
                    "avatar": u.get("avatarLarger"),
                    "followers": s.get("followerCount") if s else 0,
                    "following": s.get("followingCount") if s else 0,
                    "videos_count": s.get("videoCount") if s else 0,
                }
    except Exception as e:
        print(f"  ! API TikTok falhou: {e}")

    # Tentativa 2: Playwright
    if not data["profile"] and HAS_PLAYWRIGHT:
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                ctx = browser.new_context(user_agent=HEADERS["User-Agent"])
                page = ctx.new_page()
                page.goto(f"https://www.tiktok.com/@{user}", wait_until="networkidle", timeout=30000)
                html = page.content()
                soup = BeautifulSoup(html, "lxml")

                title = soup.find("meta", {"property": "og:title"})
                desc = soup.find("meta", {"property": "og:description"})
                img = soup.find("meta", {"property": "og:image"})

                if title:
                    data["profile"] = {
                        "username": user,
                        "nickname": title.get("content", "").split("(")[0].strip(),
                        "signature": desc.get("content", "") if desc else "",
                        "avatar": img.get("content") if img else "",
                        "followers": "—",
                        "following": "—",
                        "videos_count": "—",
                    }
                browser.close()
        except Exception as e:
            print(f"  ! Playwright TikTok falhou: {e}")

    (OUTPUT_DIR / "tiktok.json").write_text(
        json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print(f"  ✓ {len(data['videos'])} vídeos")


# ---------------------------------------------------------------------------
# LINKEDIN — scraping com Playwright (perfil + certificados)
# ---------------------------------------------------------------------------
def scrape_linkedin():
    print("→ LinkedIn...")
    user = CONFIG["linkedin"]
    data = {"profile": None, "certificates": [], "posts": []}

    if not HAS_PLAYWRIGHT:
        print("  ! Playwright necessário para LinkedIn")
        (OUTPUT_DIR / "linkedin.json").write_text(
            json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8"
        )
        return

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            ctx = browser.new_context(
                user_agent=HEADERS["User-Agent"],
                viewport={"width": 1366, "height": 900},
            )
            page = ctx.new_page()

            # Perfil público
            page.goto(f"https://www.linkedin.com/in/{user}/", wait_until="domcontentloaded", timeout=30000)
            time.sleep(2)
            html = page.content()
            soup = BeautifulSoup(html, "lxml")

            title = soup.find("meta", {"property": "og:title"})
            desc = soup.find("meta", {"property": "og:description"})
            img = soup.find("meta", {"property": "og:image"})

            if title:
                data["profile"] = {
                    "username": user,
                    "name": title.get("content", ""),
                    "headline": desc.get("content", "") if desc else "",
                    "avatar": img.get("content") if img else "",
                }

            # Certificações (página de detalhes)
            try:
                page.goto(
                    f"https://www.linkedin.com/in/{user}/details/certifications/",
                    wait_until="domcontentloaded", timeout=30000
                )
                time.sleep(3)
                html2 = page.content()
                soup2 = BeautifulSoup(html2, "lxml")

                # Blocos de certificação
                for li in soup2.select("li.pvs-list__paged-list-item, li.artdeco-list__item"):
                    h3 = li.find("h3")
                    if h3:
                        title_text = h3.get_text(strip=True)
                        issuer = ""
                        date = ""
                        # Tentar encontrar issuer e date
                        spans = li.find_all("span", class_=re.compile("visually-hidden"))
                        for s in spans:
                            txt = s.get_text(strip=True)
                            if "Issued" in txt or "Emitido" in txt:
                                date = txt
                            elif title_text not in txt and len(txt) > 2:
                                issuer = issuer or txt
                        if title_text:
                            data["certificates"].append({
                                "title": title_text,
                                "issuer": issuer or "LinkedIn Learning",
                                "date": date,
                                "url": f"https://www.linkedin.com/in/{user}/details/certifications/",
                            })
            except Exception as e:
                print(f"  ! Erro certificados: {e}")

            browser.close()
    except Exception as e:
        print(f"  ! LinkedIn falhou: {e}")

    # Fallback: se LinkedIn bloqueou, tentar via Google cache
    if not data["certificates"]:
        print("  → LinkedIn bloqueou. Tentando via DuckDuckGo...")
        try:
            r = requests.get(
                f"https://duckduckgo.com/html/?q=site:linkedin.com/in/{user}+certifications",
                headers=HEADERS, timeout=15
            )
            soup = BeautifulSoup(r.text, "lxml")
            for res in soup.select(".result__body")[:10]:
                title_el = res.select_one(".result__title")
                if title_el:
                    data["certificates"].append({
                        "title": title_el.get_text(strip=True),
                        "issuer": "LinkedIn",
                        "date": "",
                        "url": title_el.find("a")["href"] if title_el.find("a") else "",
                    })
        except Exception as e:
            print(f"  ! DuckDuckGo falhou: {e}")

    (OUTPUT_DIR / "linkedin.json").write_text(
        json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print(f"  ✓ {len(data['certificates'])} certificados")


# ---------------------------------------------------------------------------
# X / TWITTER — scraping via nitter ou syndication
# ---------------------------------------------------------------------------
def scrape_x():
    print("→ X / Twitter...")
    user = CONFIG["x"]
    data = {"profile": None, "tweets": []}

    # Tentativa: syndication.twimg.com
    try:
        url = f"https://cdn.syndication.twimg.com/timeline/profile?screen_name={user}&dnt=false&with_replies=false"
        r = requests.get(url, headers=HEADERS, timeout=15)
        if r.status_code == 200:
            j = r.json()
            u = j.get("user")
            if u:
                data["profile"] = {
                    "screen_name": u.get("screen_name"),
                    "name": u.get("name"),
                    "description": u.get("description"),
                    "avatar": u.get("profile_image_url_https", "").replace("_normal", "_400x400"),
                }
            for entry in j.get("timeline", {}).get("entries", [])[:12]:
                t = entry.get("content", {}).get("tweet")
                if t:
                    data["tweets"].append({
                        "id": t.get("id_str"),
                        "text": t.get("full_text") or t.get("text"),
                        "created_at": t.get("created_at"),
                        "likes": t.get("favorite_count"),
                        "retweets": t.get("retweet_count"),
                    })
    except Exception as e:
        print(f"  ! X syndication falhou: {e}")

    # Fallback: nitter instances (podem estar offline)
    if not data["profile"]:
        nitter_instances = [
            "https://nitter.net",
            "https://nitter.poast.org",
            "https://nitter.privacydev.net",
        ]
        for inst in nitter_instances:
            try:
                r = requests.get(f"{inst}/{user}", headers=HEADERS, timeout=10)
                if r.status_code == 200:
                    soup = BeautifulSoup(r.text, "lxml")
                    name = soup.select_one(".profile-card-fullname")
                    bio = soup.select_one(".profile-bio")
                    avatar = soup.select_one(".profile-card-avatar img")
                    if name:
                        data["profile"] = {
                            "screen_name": user,
                            "name": name.get_text(strip=True),
                            "description": bio.get_text(strip=True) if bio else "",
                            "avatar": inst + avatar["src"] if avatar else "",
                        }
                        for tweet in soup.select(".timeline-item")[:12]:
                            content = tweet.select_one(".tweet-content")
                            if content:
                                data["tweets"].append({
                                    "text": content.get_text(strip=True),
                                })
                        break
            except Exception:
                continue

    (OUTPUT_DIR / "x.json").write_text(
        json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print(f"  ✓ {len(data['tweets'])} tweets")


# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------
def main():
    print("=" * 60)
    print("  PARDUCCI — Social Scraper (no API)")
    print("=" * 60)

    scrape_github()
    scrape_instagram()
    scrape_tiktok()
    scrape_linkedin()
    scrape_x()

    # Consolidar certificados no formato do site
    li_file = OUTPUT_DIR / "linkedin.json"
    if li_file.exists():
        li_data = json.loads(li_file.read_text(encoding="utf-8"))
        certs = li_data.get("certificates", [])
        (Path("./certificates.json")).write_text(
            json.dumps(certs, indent=2, ensure_ascii=False), encoding="utf-8"
        )
        print(f"\n✓ certificates.json escrito com {len(certs)} certificados")

    print("\n" + "=" * 60)
    print(f"  Dados salvos em: {OUTPUT_DIR.resolve()}")
    print("=" * 60)


if __name__ == "__main__":
    main()