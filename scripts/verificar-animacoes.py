"""Teste de motion e WebGL; não envia formulário nem altera dados externos."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json

out=Path(__file__).resolve().parents[1]/"outputs"
out.mkdir(exist_ok=True)
results=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={"width":1440,"height":900})
    errors=[]
    page.on("pageerror",lambda error:errors.append(str(error)))
    page.goto("http://localhost:3190",wait_until="networkidle")
    page.wait_for_timeout(3500)
    page.screenshot(path=str(out/"original-motion-1440.png"))
    hero=page.locator('[data-depth="hero"] [data-depth-plane]')
    page.mouse.move(500,400)
    page.mouse.move(1000,250,steps=12)
    page.wait_for_timeout(650)
    assert "matrix3d" in hero.evaluate("el=>getComputedStyle(el).transform")
    page.mouse.move(0,0)
    page.locator("#projetos").evaluate("el=>window.scrollTo({top:el.offsetTop,behavior:'instant'})")
    page.wait_for_timeout(1800)
    first=page.locator('[data-depth="project"]').first
    box=first.bounding_box()
    assert box is not None
    page.mouse.move(box["x"]+box["width"]*.65,box["y"]+box["height"]*.4,steps=12)
    page.wait_for_timeout(1500)
    assert first.locator("canvas").count()==1
    assert first.locator('[data-pronto="true"]').count()==1
    page.screenshot(path=str(out/"projetos-motion-1440.png"))
    page.mouse.move(0,0)
    page.wait_for_timeout(800)
    assert first.locator('[data-pronto="true"]').count()==0
    page.emulate_media(reduced_motion="reduce")
    page.wait_for_timeout(600)
    assert page.locator("canvas").count()==0
    assert page.locator('[data-depth-plane]').first.evaluate("el=>getComputedStyle(el).transform") == "none"
    assert not errors,errors
    results.append({"desktop_3d":True,"webgl_refraction":True,"reduced_motion_cleanup":True,"errors":errors})
    page.close()
    for width in [375,768]:
        page=browser.new_page(viewport={"width":width,"height":900},has_touch=True,is_mobile=True)
        page.goto("http://localhost:3190",wait_until="networkidle")
        page.wait_for_timeout(3500)
        assert page.locator("canvas").count()==0
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        page.screenshot(path=str(out/f"original-motion-{width}.png"))
        results.append({"width":width,"no_webgl":True,"no_overflow":True})
        page.close()
    browser.close()
print(json.dumps(results,indent=2))
