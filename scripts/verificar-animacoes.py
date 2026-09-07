"""Teste de motion e personagem-guia; não envia formulário nem altera dados externos."""
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
    page.goto("http://localhost:3190",wait_until="domcontentloaded")
    page.wait_for_timeout(2050)
    mark=page.locator('svg[aria-label="VVC"]').first
    assert mark.locator("path").count()==4
    assert mark.locator("path").nth(1).get_attribute("d")=="M 324 38 L 448 214 L 582 14"
    page.screenshot(path=str(out/"logo-intro-1440.png"))
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1850)
    logos=page.locator('svg[aria-label="VVC"]')
    assert logos.count()>=3
    assert logos.evaluate_all("els=>els.every(el=>el.querySelectorAll('path').length===4 && el.querySelectorAll('path')[1].getAttribute('d')==='M 324 38 L 448 214 L 582 14')")
    assert page.locator("main").evaluate("el=>getComputedStyle(el).getPropertyValue('--red').trim()==='#1877ff'")
    assert page.locator("h1").first.evaluate("el=>el.getBoundingClientRect().width>300")
    robot=page.locator('aside[aria-label="Guia 3D da página"]')
    assert robot.count()==1
    assert page.locator('canvas[data-spatial-scene="true"]').count()==0
    assert page.locator('canvas[data-robot-canvas="true"]').count()==0
    robot_3d=robot.locator('canvas[data-robot3d="true"]')
    assert robot_3d.count()==1
    assert robot_3d.evaluate("el=>Boolean(el.getContext('webgl2')||el.getContext('webgl'))")
    assert robot.locator("img").count()==0
    page.mouse.wheel(0,2200)
    page.wait_for_timeout(2500)
    assert robot.evaluate("el=>Number(getComputedStyle(el).opacity)>.5")
    fala=robot.locator('[role="status"] p').text_content() or ""
    assert "Quatro frentes" in fala,fala
    assert robot.locator('[role="status"]').evaluate("el=>Number(getComputedStyle(el).opacity)>.5")
    page.screenshot(path=str(out/"original-motion-1440.png"))
    hero=page.locator('[data-depth="hero"] [data-depth-plane]')
    page.mouse.move(500,400)
    page.mouse.move(1000,250,steps=12)
    page.wait_for_timeout(650)
    assert "matrix3d" in hero.evaluate("el=>getComputedStyle(el).transform")
    page.mouse.move(0,0)
    page.locator('a[href="#projetos"]').first.evaluate("el=>el.click()")
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
    assert robot.evaluate("el=>getComputedStyle(el).display==='none'")
    assert page.locator('[data-depth-plane]').first.evaluate("el=>getComputedStyle(el).transform") == "none"
    assert not errors,errors
    results.append({"volumetric_robot":True,"section_guide":True,"old_orbits_removed":True,"reduced_motion_cleanup":True,"errors":errors})
    page.close()
    for width in [375,768]:
        page=browser.new_page(viewport={"width":width,"height":900},has_touch=True,is_mobile=True)
        page.goto("http://localhost:3190",wait_until="networkidle")
        page.wait_for_timeout(3500)
        assert page.locator('canvas[data-robot3d="true"]').count()==1
        page.mouse.wheel(0,1900)
        page.wait_for_timeout(2200)
        assert page.locator('aside[aria-label="Guia 3D da página"]').count()==1
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        page.screenshot(path=str(out/f"original-motion-{width}.png"))
        results.append({"width":width,"volumetric_robot":True,"no_overflow":True})
        page.close()
    browser.close()
print(json.dumps(results,indent=2))
