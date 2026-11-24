#!/usr/bin/env python3
"""Generate Google Play listing images for Hewa.

Run:  python3 store-assets/google-play/src/build.py
Writes HTML into src/html/ and PNGs into store-assets/google-play/.
Needs Google Chrome and node_modules (for the icon font).
"""
import json, os, subprocess, pathlib

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE.parent
ROOT = OUT.parent.parent
HTML = HERE / "html"
HTML.mkdir(exist_ok=True)
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
MDI_DIR = ROOT / "node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons"
GLYPHS = json.load(open(MDI_DIR / "glyphmaps/MaterialCommunityIcons.json"))
FONTS = ROOT / "assets/fonts"

PRIMARY, SECONDARY = "#224496", "#FFB200"


def ic(name, size=None, color=None, cls=""):
    code = GLYPHS.get(name) or GLYPHS["help-circle-outline"]
    style = ""
    if size:
        style += f"font-size:{size}px;"
    if color:
        style += f"color:{color};"
    return f'<i class="mdi {cls}" style="{style}">&#{code};</i>'


BASE_CSS = f"""
@font-face {{ font-family: Lato; src: url('file://{FONTS}/Lato-Regular.ttf'); font-weight: 400; }}
@font-face {{ font-family: Lato; src: url('file://{FONTS}/Lato-SemiBold.ttf'); font-weight: 600; }}
@font-face {{ font-family: Lato; src: url('file://{FONTS}/Lato-Bold.ttf'); font-weight: 700; }}
@font-face {{ font-family: Poppins; src: url('file://{FONTS}/Poppins-Medium.ttf'); font-weight: 500; }}
@font-face {{ font-family: Poppins; src: url('file://{FONTS}/Poppins-SemiBold.otf'); font-weight: 600; }}
@font-face {{ font-family: Poppins; src: url('file://{FONTS}/Poppins-Bold.ttf'); font-weight: 700; }}
@font-face {{ font-family: MDI; src: url('file://{MDI_DIR}/Fonts/MaterialCommunityIcons.ttf'); }}
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
html, body {{ overflow: hidden; }}
body {{ font-family: Lato, sans-serif; color: #fff; -webkit-font-smoothing: antialiased; }}
.mdi {{ font-family: MDI; font-style: normal; line-height: 1; display: inline-block; }}
.amber {{ color: {SECONDARY}; }}
"""

# ---------- shared app-screen pieces (designed at 412px phone width) ----------
SCREEN_CSS = """
.screen { width: 412px; height: 892px; position: relative; overflow: hidden;
  background: linear-gradient(180deg, #23578f 0%, #224496 45%, #33388f 100%); }
.status { height: 30px; display: flex; justify-content: space-between; align-items: center;
  padding: 0 22px; font: 600 13px Lato; opacity: .95; }
.topbar { display: flex; align-items: center; justify-content: space-between; padding: 10px 20px 4px; }
.place { font: 600 20px Poppins; display: flex; align-items: center; gap: 6px; }
.date { font: 400 13px Lato; opacity: .75; margin-top: 2px; }
.card { background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.14);
  border-radius: 20px; padding: 14px 16px; margin: 10px 16px; }
.card h4 { font: 600 14px Poppins; display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.muted { color: rgba(255,255,255,.72); }
.row { display: flex; align-items: center; justify-content: space-between; }
.pill { display: inline-flex; align-items: center; gap: 6px; padding: 5px 11px; border-radius: 99px;
  font: 700 12px Lato; }
.good { background: rgba(76, 217, 100, .2); color: #7CF29A; }
.warn { background: rgba(255,178,0,.2); color: #FFCB4D; }
.bad { background: rgba(255,90,90,.22); color: #FF9C9C; }
.tabbar { position: absolute; left: 0; right: 0; bottom: 0; height: 74px; display: flex;
  justify-content: space-around; align-items: center; background: rgba(20,30,80,.55);
  border-top: 1px solid rgba(255,255,255,.12); border-radius: 24px 24px 0 0; }
.tabbar div { display: flex; flex-direction: column; align-items: center; gap: 3px; font: 600 11px Lato; opacity: .6; }
.tabbar div.on { opacity: 1; color: #FFB200; }
.bar { height: 8px; border-radius: 8px; background: rgba(255,255,255,.15); overflow: hidden; }
.bar > span { display: block; height: 100%; border-radius: 8px; }
"""


def status_bar():
    return f'<div class="status"><span>9:41</span><span>{ic("signal",14)} {ic("wifi",14)} {ic("battery-80",14)}</span></div>'


def topbar(place="Dar es Salaam", date="Monday, 24 November", right="share-variant"):
    return f"""<div class="topbar"><div><div class="place">{ic('map-marker',20,SECONDARY)}{place}</div>
    <div class="date">{date}</div></div>
    <div style="display:flex;gap:16px">{ic('volume-high',24)}{ic(right,24)}</div></div>"""


def tabbar(active=0):
    items = [("home-variant", "Weather"), ("magnify", "Search"), ("cog", "Settings")]
    html = "".join(
        f'<div class="{"on" if i == active else ""}">{ic(n,24)}<span>{t}</span></div>'
        for i, (n, t) in enumerate(items)
    )
    return f'<div class="tabbar">{html}</div>'


def hero():
    return f"""
<div style="text-align:center;margin-top:6px">
  {ic('weather-partly-cloudy',140,None)}
  <div style="display:flex;justify-content:center;align-items:flex-start;margin-top:-18px">
    <span style="font:600 104px/1.1 Lato">31</span><span style="font:400 54px Lato;margin-top:8px">°</span></div>
  <div style="font:600 22px Poppins;margin-top:-4px">Partly cloudy</div>
  <div class="muted" style="font:400 15px Lato;margin-top:6px">High 32°&nbsp;&nbsp; Low 25°&nbsp;&nbsp; Feels like <b class="amber">35°</b></div>
</div>
<div class="card" style="display:flex;justify-content:space-around;padding:14px 6px;margin-top:16px">
  {''.join(f'<div style="text-align:center">{ic(i,22,SECONDARY)}<div style="font:700 16px Lato;margin-top:4px">{v}</div><div class="muted" style="font:400 12px Lato">{l}</div></div>' for i,v,l in [('weather-windy','18 km/h','Wind'),('water-percent','74%','Humidity'),('umbrella-outline','20%','Rain chance')])}
</div>"""


def hourly():
    hrs = [("Now", "weather-partly-cloudy", 31), ("13:00", "weather-sunny", 32), ("14:00", "weather-sunny", 32),
           ("15:00", "weather-cloudy", 31), ("16:00", "weather-rainy", 29), ("17:00", "weather-pouring", 27)]
    cells = "".join(
        f'<div style="text-align:center;padding:10px 0;width:56px;border-radius:16px;{"background:rgba(255,255,255,.18)" if i==0 else ""}">'
        f'<div class="muted" style="font:600 12px Lato">{h}</div><div style="margin:8px 0">{ic(n,26)}</div><div style="font:700 15px Lato">{t}°</div></div>'
        for i, (h, n, t) in enumerate(hrs))
    return f'<div class="card"><h4>{ic("clock-outline",18,SECONDARY)}Next hours</h4><div class="row">{cells}</div></div>'


def screen(inner, active=0):
    return f'<div class="screen">{status_bar()}{inner}{tabbar(active)}</div>'


# ---------- screens ----------
def s_home():
    return screen(topbar() + hero() + hourly())


def s_forecast():
    days = [("Today", "weather-partly-cloudy", 20, 25, 32), ("Tue", "weather-rainy", 70, 24, 29),
            ("Wed", "weather-pouring", 85, 23, 28), ("Thu", "weather-lightning-rainy", 60, 24, 30),
            ("Fri", "weather-cloudy", 30, 25, 31), ("Sat", "weather-sunny", 10, 25, 33),
            ("Sun", "weather-sunny", 5, 26, 33), ("Mon", "weather-partly-cloudy", 15, 25, 32),
            ("Tue", "weather-rainy", 55, 24, 30), ("Wed", "weather-partly-cloudy", 20, 25, 31)]
    rows = ""
    for d, n, p, lo, hi in days:
        left = (lo - 22) / 13 * 100
        width = (hi - lo) / 13 * 100
        rows += f"""<div class="row" style="padding:9px 0;border-bottom:1px solid rgba(255,255,255,.08)">
          <span style="width:54px;font:700 15px Lato">{d}</span>
          <span style="width:70px;display:flex;align-items:center;gap:4px">{ic(n,24)}<span style="font:700 11px Lato;color:#8fd0ff">{p}%</span></span>
          <span class="muted" style="width:30px;font:600 15px Lato;text-align:right">{lo}°</span>
          <span class="bar" style="flex:1;margin:0 10px;position:relative"><span style="position:absolute;left:{left}%;width:{width}%;background:linear-gradient(90deg,#8fd0ff,#FFB200)"></span></span>
          <span style="width:30px;font:700 15px Lato">{hi}°</span></div>"""
    summary = f"""<div class="card" style="background:rgba(255,255,255,.14);border:2px solid rgba(255,178,0,.75)">
      <h4>{ic('lightbulb-on',18,SECONDARY)}Summary</h4>
      <div style="font:400 14px/1.45 Lato">Warm and partly cloudy today. Heavy rain likely Wednesday — carry an umbrella. <span class="muted">1.4° warmer than this day last year.</span></div></div>"""
    return screen(topbar() + summary + f'<div class="card"><h4>{ic("calendar-month",18,SECONDARY)}10-day forecast</h4>{rows}</div>')


def s_farmer():
    body = f"""
<div class="card"><h4>{ic('sprout',20,'#7CF29A')}Farmer mode · Kilimo</h4>
  <div class="row" style="padding:8px 0"><span style="display:flex;gap:10px;align-items:center">{ic('spray',22,SECONDARY)}<span style="font:700 15px Lato">Spraying</span></span><span class="pill good">Good until 11:00</span></div>
  <div class="row" style="padding:8px 0"><span style="display:flex;gap:10px;align-items:center">{ic('seed-outline',22,SECONDARY)}<span style="font:700 15px Lato">Planting</span></span><span class="pill good">Soil is moist</span></div>
  <div class="row" style="padding:8px 0"><span style="display:flex;gap:10px;align-items:center">{ic('sprinkler-variant',22,SECONDARY)}<span style="font:700 15px Lato">Irrigation</span></span><span class="pill warn">Not needed</span></div>
</div>
<div class="card"><h4>{ic('water',18,'#8fd0ff')}Soil & rain</h4>
  {''.join(f'<div style="margin:10px 0"><div class="row" style="font:600 13px Lato;margin-bottom:6px"><span class="muted">{l}</span><span>{v}</span></div><div class="bar"><span style="width:{w}%;background:{c}"></span></div></div>' for l,v,w,c in [('Soil moisture','Moist · 0.31 m³/m³',68,'#7CF29A'),('Rain this week','46 mm',58,'#8fd0ff'),('Evapotranspiration (ET₀)','4.8 mm/day',48,'#FFB200')])}
</div>
<div class="card"><h4>{ic('calendar-month',18,SECONDARY)}Rainy season · Vuli</h4>
  <div style="font:400 14px/1.45 Lato">Rains started <b>2 Nov</b>. Rainfall is <b class="amber">12% above normal</b>. Longest dry spell: 4 days.</div></div>
<div class="card"><h4>{ic('hanger',18,SECONDARY)}Siku ya kuanika</h4>
  <div style="font:400 14px/1.45 Lato">Best hours to dry maize & coffee: <b class="amber">09:00 – 14:00</b></div></div>"""
    return screen(topbar("Morogoro") + body)


def s_alerts():
    body = f"""
<div class="card" style="background:rgba(255,90,90,.18);border-color:rgba(255,120,120,.45)">
  <h4>{ic('weather-lightning-rainy',22,'#FF9C9C')}Severe weather alert</h4>
  <div style="font:700 17px Poppins">Heavy rain & thunderstorms</div>
  <div style="font:400 14px/1.45 Lato;margin-top:6px" class="muted">Expected 16:00 – 21:00 · up to 38 mm. Avoid low-lying roads.</div></div>
<div class="card"><h4>{ic('sail-boat',20,'#8fd0ff')}Fishers' safety tonight</h4>
  {''.join(f'<div class="row" style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,.08)"><span style="font:700 15px Lato">{n}</span><span class="pill {c}">{t}</span></div>' for n,t,c in [('Lake Victoria','High storm risk','bad'),('Lake Tanganyika','Moderate','warn'),('Lake Nyasa','Low','good'),('Indian Ocean coast','Low · waves 0.8 m','good')])}
</div>
<div class="card"><h4>{ic('waves',20,'#8fd0ff')}River flood risk</h4>
  <div class="row"><span style="font:400 14px Lato" class="muted">Rufiji River · next 7 days</span><span class="pill warn">Rising</span></div></div>
<div class="card"><h4>{ic('car',20,SECONDARY)}Commute</h4>
  <div class="row" style="font:400 14px Lato"><span>Morning 07:00</span><span class="pill good">Dry</span></div>
  <div class="row" style="font:400 14px Lato;margin-top:8px"><span>Evening 17:30</span><span class="pill bad">{ic('umbrella-outline',14)} Rain likely</span></div></div>"""
    return screen(topbar("Mwanza", right="bell-ring") + body)


def s_insights():
    cells = [("Rain", ["good", "good", "warn", "bad", "bad", "warn"]),
             ("Heat", ["good", "warn", "bad", "bad", "warn", "good"]),
             ("Strong sun", ["good", "bad", "bad", "warn", "good", "good"]),
             ("Mosquitoes", ["warn", "good", "good", "good", "warn", "bad"]),
             ("Exercise", ["good", "warn", "bad", "bad", "warn", "good"]),
             ("Drying", ["warn", "good", "good", "warn", "bad", "bad"])]
    colors = {"good": "#4CD964", "warn": "#FFB200", "bad": "#FF6B6B"}
    hours = ["06", "09", "12", "15", "18", "21"]
    grid = '<div class="row" style="font:600 11px Lato;margin-bottom:6px"><span style="width:92px"></span>' + "".join(f'<span class="muted" style="width:36px;text-align:center">{h}</span>' for h in hours) + "</div>"
    for name, vals in cells:
        grid += f'<div class="row" style="margin:6px 0"><span style="width:92px;font:600 13px Lato">{name}</span>' + "".join(f'<span style="width:36px;height:24px;border-radius:7px;background:{colors[v]};opacity:.85"></span>' for v in vals) + "</div>"
    body = f"""
<div style="padding:8px 20px 0"><div style="font:700 24px Poppins">Maarifa <span class="muted" style="font:500 16px Poppins">· Insights</span></div></div>
<div style="display:flex;gap:12px;padding:6px 16px;overflow:hidden">
  <div class="card" style="margin:6px 0;min-width:300px;background:rgba(255,255,255,.14);border:2px solid rgba(255,178,0,.75)">
    <h4>{ic('white-balance-sunny',20,SECONDARY)}Very high UV at midday</h4>
    <div style="font:400 14px/1.45 Lato">UV 11 from 11:00 to 14:00. Wear a hat and drink water.</div>
    <div class="muted" style="font:600 12px Lato;margin-top:8px">Why? Clear skies + sun high overhead</div></div>
  <div class="card" style="margin:6px 0;min-width:300px"><h4>{ic('bug',20,SECONDARY)}Mosquitoes active</h4></div>
</div>
<div class="card"><h4>{ic('calendar-month',18,SECONDARY)}Day planner</h4>{grid}
  <div style="display:flex;gap:14px;margin-top:10px;font:600 12px Lato" class="muted">
  <span>{ic('circle',10,'#4CD964')} Good</span><span>{ic('circle',10,'#FFB200')} Fair</span><span>{ic('circle',10,'#FF6B6B')} Avoid</span></div></div>
<div class="card"><h4>{ic('lightbulb-on',18,SECONDARY)}Tip · Health</h4>
  <div style="font:400 14px/1.45 Lato">Outdoor workers: take a 15-minute shade break every hour between 12:00 and 15:00.</div></div>"""
    return screen(topbar() + body)


def s_swahili():
    body = f"""
<div style="text-align:center;margin-top:6px">
  {ic('weather-sunny',120,SECONDARY)}
  <div style="display:flex;justify-content:center;align-items:flex-start;margin-top:-6px">
    <span style="font:600 96px/1.1 Lato">29</span><span style="font:400 50px Lato;margin-top:8px">°</span></div>
  <div style="font:600 22px Poppins">Jua kali</div>
  <div class="muted" style="font:400 15px Lato;margin-top:6px">Juu 31°&nbsp;&nbsp; Chini 23°&nbsp;&nbsp; Inahisi <b class="amber">33°</b></div>
</div>
<div class="card" style="margin-top:16px"><h4>{ic('clock-outline',18,SECONDARY)}Saa za Kiswahili</h4>
  <div class="row">{''.join(f'<div style="text-align:center;width:72px"><div class="muted" style="font:600 12px Lato">{h}</div><div style="margin:8px 0">{ic(n,26)}</div><div style="font:700 15px Lato">{t}°</div></div>' for h,n,t in [('Saa 1 asubuhi','weather-sunset-up',24),('Saa 4','weather-sunny',29),('Saa 7 mchana','weather-sunny',31),('Saa 10 jioni','weather-partly-cloudy',29)])}</div></div>
<div class="card"><h4>{ic('volume-high',18,SECONDARY)}Sikiliza</h4>
  <div style="font:400 14px/1.45 Lato">“Leo Arusha kuna jua kali, nyuzi 29. Hakuna mvua inayotarajiwa.”</div></div>
<div class="card row" style="padding:12px 16px"><span style="display:flex;gap:10px;align-items:center;font:700 15px Lato">{ic('translate',22,SECONDARY)}Lugha · Language</span>
  <span style="display:flex;gap:6px"><span class="pill" style="background:#FFB200;color:#1b2a66">Kiswahili</span><span class="pill" style="background:rgba(255,255,255,.12)">English</span></span></div>"""
    return screen(topbar("Arusha", "Jumatatu, 24 Novemba") + body)


# ---------- marketing frames ----------
PHONE_CSS = """
.canvas { width: 1080px; height: 1920px; position: relative; overflow: hidden;
  background: radial-gradient(circle at 88% 6%, rgba(143,208,255,.30) 0, rgba(143,208,255,0) 34%),
              linear-gradient(170deg, #1f5a95 0%, #224496 50%, #2c3488 100%); }
.wave { position: absolute; left: -10%; width: 120%; bottom: -260px; height: 760px; border-radius: 50%;
  background: rgba(16, 95, 160, .55); }
.head { position: absolute; top: 120px; left: 80px; right: 80px; text-align: center; }
.head h1 { font: 700 76px/1.12 Poppins; letter-spacing: -1px; }
.head h1 .dot { color: #FFB200; }
.head p { font: 400 38px/1.35 Lato; opacity: .85; margin-top: 22px; }
.phone { position: absolute; left: 50%; top: 520px; width: 778px; height: 1620px; margin-left: -389px;
  background: #0d1330; border-radius: 96px; padding: 22px;
  box-shadow: 0 40px 90px rgba(5,10,40,.55), inset 0 0 0 3px rgba(255,255,255,.08); }
.phone .glass { width: 734px; height: 1589px; border-radius: 76px; overflow: hidden; position: relative; }
.phone .glass .screen { transform: scale(1.7816); transform-origin: 0 0; }
.cam { position: absolute; top: 44px; left: 50%; width: 26px; height: 26px; margin-left: -13px;
  border-radius: 50%; background: #05081a; z-index: 5; }
"""


def page(css, body, w, h):
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{BASE_CSS}{css}
html,body{{width:{w}px;height:{h}px}}</style></head><body>{body}</body></html>"""


def shot(title, sub, scr):
    body = f"""<div class="canvas"><div class="wave"></div>
<div class="head"><h1>{title}</h1><p>{sub}</p></div>
<div class="phone"><div class="cam"></div><div class="glass">{scr}</div></div></div>"""
    return page(SCREEN_CSS + PHONE_CSS, body, 1080, 1920)


SHOTS = [
    ("01-weather", "Weather for where<br>you are<span class='dot'>.</span>", "Live conditions, hourly forecast and feels-like temperature.", s_home),
    ("02-forecast", "Plan your week<br>with confidence<span class='dot'>.</span>", "10-day forecast with a plain-language summary.", s_forecast),
    ("03-farmers", "Made for farmers<span class='dot'>.</span>", "Spraying & planting advice, soil moisture and the rainy season.", s_farmer),
    ("04-alerts", "Stay safe on land<br>and water<span class='dot'>.</span>", "Storm alerts, lake safety for fishers, floods and commute rain.", s_alerts),
    ("05-insights", "Know the best time<br>for everything<span class='dot'>.</span>", "Day planner and practical tips — each with a “why”.", s_insights),
    ("06-kiswahili", "Kwa Kiswahili<br>na English<span class='dot'>.</span>", "Saa za Kiswahili, weather read aloud, in your language.", s_swahili),
]


def feature_graphic():
    mini = s_home()
    css = SCREEN_CSS + """
.fg { width: 1024px; height: 500px; position: relative; overflow: hidden;
  background: radial-gradient(circle at 92% 0%, rgba(143,208,255,.30) 0, rgba(143,208,255,0) 38%),
              linear-gradient(120deg, #1f5a95 0%, #224496 55%, #2c3488 100%); }
.fg .wave { position: absolute; left: -20%; width: 90%; bottom: -330px; height: 520px; border-radius: 50%;
  background: rgba(16, 95, 160, .55); }
.brand { position: absolute; left: 72px; top: 96px; }
.brand .logo { font: 700 104px/1 Lato; letter-spacing: -2px; }
.brand .logo i { display: inline-block; width: 24px; height: 24px; border-radius: 50%; background: #FFB200; margin-left: 14px; }
.brand .tag { font: 600 34px/1.25 Poppins; margin-top: 22px; }
.brand .chips { display: flex; gap: 10px; margin-top: 28px; }
.brand .chips span { font: 700 18px Lato; padding: 8px 16px; border-radius: 99px; background: rgba(255,255,255,.14); display: flex; align-items: center; gap: 8px; }
.ph { position: absolute; right: 70px; top: 52px; width: 300px; height: 620px; background: #0d1330; border-radius: 44px;
  padding: 10px; box-shadow: 0 30px 60px rgba(5,10,40,.5); transform: rotate(-6deg); }
.ph .glass { width: 280px; height: 600px; border-radius: 36px; overflow: hidden; }
.ph .glass .screen { transform: scale(.6796); transform-origin: 0 0; }
"""
    body = f"""<div class="fg"><div class="wave"></div>
<div class="brand"><div class="logo">Hewa<i></i></div>
<div class="tag">Accurate weather for Tanzania,<br>in Kiswahili and English.</div>
<div class="chips"><span>{ic('sprout',20,'#7CF29A')}Farmers</span><span>{ic('sail-boat',20,'#8fd0ff')}Fishers</span><span>{ic('bell-ring',20,SECONDARY)}Alerts</span></div></div>
<div class="ph"><div class="glass">{mini}</div></div></div>"""
    return page(css, body, 1024, 500)


def icon():
    css = """.ic { width: 512px; height: 512px; background: #224496; display: flex; align-items: center; justify-content: center; }
.ic span { font: 700 132px/1 Lato; letter-spacing: -2px; color: #fff; display: flex; align-items: flex-end; }
.ic i { display: inline-block; width: 30px; height: 30px; border-radius: 50%; background: #FFB200; margin: 0 0 14px 18px; }"""
    return page(css, '<div class="ic"><span>Hewa<i></i></span></div>', 512, 512)


def render(name, html, w, h, alpha=False):
    f = HTML / f"{name}.html"
    f.write_text(html)
    out = OUT / f"{name}.png"
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                    "--force-device-scale-factor=1", "--allow-file-access-from-files",
                    "--virtual-time-budget=3000", f"--window-size={w},{h}",
                    *(["--default-background-color=00000000"] if alpha else []),
                    f"--screenshot={out}", f"file://{f}"],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print("wrote", out.relative_to(ROOT))


if __name__ == "__main__":
    # Play wants a 32-bit PNG: scale the real app icon (it already has alpha).
    subprocess.run(["sips", "-z", "512", "512", str(ROOT / "assets/app-icon.png"),
                    "--out", str(OUT / "icon-512.png")], check=True, stdout=subprocess.DEVNULL)
    print("wrote", (OUT / "icon-512.png").relative_to(ROOT))
    render("feature-graphic-1024x500", feature_graphic(), 1024, 500)
    for name, t, s, fn in SHOTS:
        render(f"phone-{name}", shot(t, s, fn()), 1080, 1920)
