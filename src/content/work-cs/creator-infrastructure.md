---
title: "Stabilizace infrastruktury tvůrčí platformy"
eyebrow: "Mapování infrastruktury · Řízení · Aktivní náprava"
summary: "Proměna levné, ale roztříštěné tvůrčí platformy zahrnující web, poštu, úložiště, analytiku a mediální služby v srozumitelný a řiditelný systém."
order: 2
status: "Aktivní"
period: "2025 — aktivní"
role: "Systémový architekt · Provozovatel · Vedoucí technického programu"
evidence: "Podloženo zdroji"
visibility: "Anonymizované"
featured: true
outcomes:
  - "Vytvořen inventář služeb a oddělena veřejná architektura od soukromých provozních důkazů."
  - "Odhaleny rozdíly ve verzích, konfigurační dluh, nejasné provozní odpovědnosti a křehké závislosti na fakturaci."
  - "Zavedena náprava začínající zálohou a cesta od změn přes administrační panely k řízenému nasazování z Gitu."
capabilities:
  - "Průzkum infrastruktury"
  - "Linux a sdílený hosting"
  - "Provoz pošty a DNS"
  - "Nextcloud"
  - "Řízení rizik a nákladů"
---

## Situace

Organizace vedená tvůrci postupně nashromáždila užitečnou, ale volně řízenou platformu: weby,
poštu, cloudové úložiště, analytiku, mediální aplikace, správu zdrojového kódu a malý virtuální
server. Stack byl levný a produktivní, ale odpovědnosti a rozhodnutí o životním cyklu existovaly
především v hlavách lidí a obrazovkách administračních panelů.

Viditelnými příznaky byly nejednotné verze runtime, dluh v aktualizacích aplikací, neúplná
konfigurace pošty a cache, provozní varování a přímá závislost mezi měsíční fakturací a dostupností
důležitých komunikačních služeb.

## Omezení

Platforma musela zůstat levná a nepřetržitě užitečná. Kompletní přestavba by vytvořila více rizika
než hodnoty. Surové provozní snímky navíc obsahovaly identifikátory účtů, názvy hostitelů, historii
plateb a údaje o topologii, proto byly klasifikovány jako interní důkazy, nikoli jako materiál do
portfolia.

## Přístup

K prostředí jsem přistoupil jako k problému řízení infrastruktury, nikoli jako k sadě nesouvisejících
požadavků podpory:

1. zmapovat služby, vlastníky, závislosti a datové toky;
2. klasifikovat provozní důkazy a odstranit tajné údaje z veřejných artefaktů;
3. určit rizika podle dopadu, vratnosti a míry jistoty;
4. stabilizovat kritické služby změnami, kterým předchází záloha;
5. tam, kde je to praktické, omezit ruční práci v panelech pomocí kontrolovaného nasazování z Gitu.

## Současný výsledek

Prostředí má nyní explicitní architektonický model a prioritizovaný plán nápravy. Práce pokračuje:
kontinuita služeb, nezávislost pošty, údržba cloudového úložiště a kvalita nasazování se zlepšují
postupně, místo aby byly kouzelně prohlášeny za hotové.

V této případové studii nejsou zveřejněny žádné živé identifikátory, údaje o účtech, faktury ani
soukromá topologie.
