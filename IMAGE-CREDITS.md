# Image credits

Non-photographic / non-IrrigTech imagery used on the site, its source, and how it was generated or licensed. Kept so provenance can be re-verified at any time.

## Homepage "Everything feeds one field record" section (index.html, de/index.html, fr/index.html)

All five images below were supplied by the site owner (AI-generated concept renders, not real photographs of deployed IrrigTech hardware, not stock photography). Each was inspected for embedded text/claims before use; cards showing IrrigTech device concepts carry a visible **"Concept illustration"** badge (**"Konzeptdarstellung"** / **"Illustration conceptuelle"**) so they're never mistaken for real product photography.

| Card | File | Subject | Badge shown |
|---|---|---|---|
| Drone | `images/ecosystem-drone.jpg` (+`-480`) | Concept render of a multispectral scanning drone over a crop field. Clean — no embedded text. | Concept illustration |
| Field Nodes | `images/ecosystem-fieldnodes.jpg` (+`-480`) | Concept render of a solar-powered field sensor node among crop rows, with generic capability labels (Soil Moisture, Soil Temperature, etc.) — no live numeric readings. | Concept illustration |
| Water | `images/ecosystem-water.jpg` (+`-480`) | Water splash / flowing water. No device, no text. | none (not device/analytics imagery) |
| Soil | `images/ecosystem-soil.jpg` (+`-480`) | Crop seedling with exposed roots in soil. No device, no text. | none (not device/analytics imagery) |
| AI-Assisted Analysis | inline SVG (no file) | Self-made abstract field-zone color grid. Not a photo — no license needed. | Illustrative |

All four photographic files were cropped locally to a uniform 4:3 frame and resized to base (1000×750) + 480w variants (~10–190KB each). Software card is unchanged: `images/software-dashboard-demo.png`, a screenshot of this site's own demo dashboard, badged "Demo".

## Larger Field Scanner Drone feature section (index.html only — see note below)

| File | Subject |
|---|---|
| `images/field-scanner-drone-concept.jpg` (+`-480`) | Concept render of the Field Scanner Drone over a gridded crop field with a scan-quality color overlay. Cropped from the supplied source to remove its own baked-in "FIELD SCANNER DRONE / PROTOTYPE" caption and side info panel — that labeling is now provided by the page's own HTML caption instead (`FIELD SCANNER DRONE` · `Concept illustration` · `Prototype`), for accessibility and consistency with the rest of the site. |

**Note:** this larger feature section only exists on the English homepage (`.split-section` / `.field-visual`). The German and French homepages implement this same content area as a plain icon+text list with no image slot — a pre-existing structural difference unrelated to this change. No image was added there, to avoid an uninvited layout change; flag if you'd like that section rebuilt to match English.

## Images supplied but excluded — could not be cleanly used

| Supplied file (by timestamp) | Intended for | Why excluded |
|---|---|---|
| `12_18_09` | AI-Assisted Analysis | Contains extensive fabricated live data baked into the pixels: a specific "Estimated Yield 7.8 ton/ha, +12% vs last season," a "Crop Health 78% / Soil Moisture 65%" dashboard, specific soil readings (Moisture 28%, pH 6.8, EC 1.2 dS/m, etc.), and an "AI Recommendations" list (fertilizer, irrigation zone changes, harvest timing). This is dense, overlapping fabricated content that can't be cropped out without also removing the entire image. Kept the existing self-made illustrative SVG instead. |
| `12_20_12` | Software | Same fabricated live-data problem as above, plus the dashboard is branded **"AgriSense"** — a different product name, not IrrigTech. Kept the existing genuine demo-dashboard screenshot instead. |
| `12_31_45` and `12_31_57` (identical duplicates, confirmed by file hash) | Nutrient Stress | Presents a confident, specific diagnostic result (a colorized deficiency map with "Suspected Deficiency" / "High Stress" zones, a Nitrogen/Phosphorus/Potassium "Possible Causes" breakdown, and labeled "Moderate Stress" / "High Stress" leaf photos) as if validated — the site's own copy for this row explicitly says these patterns need "lab or field verification." There's no existing image slot for this row (it's icon+text only), so it was left unchanged rather than adding an image that overclaims. |
| `12_32_02` | Crop Health | Similar issue: a "Detected Issues" panel with a warning icon points at a specific field location as a confirmed problem, implying a validated finding the site doesn't claim to make. Same as above — left the existing icon+text row unchanged. |

Nothing generated or supplied was used to imply live sensor readings, yield predictions, or automated diagnoses that IrrigTech has not validated.


## Device renders removed from pages

Five AI-generated device renders were used on device pages and were not documented here. All five are now removed from every page (EN, DE, FR) and replaced with a neutral text placeholder. The files stay on disk in `images/` but are no longer referenced.

| File | Previously used on | Why removed | Now shown |
|---|---|---|---|
| `images/pump-controller.png` | Hardware card and Pump Controller page (index, devices, pump-controller) | AI-generated render with a lit live-status panel and readout, which implies a running unit. Not a photo of deployed hardware. | Text placeholder: "Clean photo pending" / "Foto folgt" / "Photo à venir" |
| `images/field-gateway.png` | Field Gateway card and page (index, devices, field-gateway) | AI-generated render with a lit LED status panel (Power, Status, LoRa, Wi-Fi / LTE, Ethernet), a "Pak-EL LAB" brand plate and a web address baked into the pixels. The lit indicators imply live connectivity status. | Text placeholder (same wording) |
| `images/iot-sensor-node.png` | IoT Sensor Node card and page (index, devices, iot-sensor-node) | AI-generated render presenting a finished product: "Long Battery Life", "IP65" and "LoRa" badges, a marketing headline ("Smart Sensing. Smarter Farming.") and a www.pakellab.com address baked into the image. Not a photo of deployed hardware. | Text placeholder (same wording as above) |
| `images/soil-moisture-sensor.png` | Soil Moisture Sensor card and page (index, devices, soil-moisture-sensor) | AI-generated render presenting a finished product: "Long Battery Life" badge, "Accurate Soil Insights" headline and a www.pakellab.com address baked into the image. | Text placeholder (same wording as above) |
| `images/smart-valve-controller.png` | Smart Valve Controller card and page (index, devices, smart-valve-controller) | AI-generated render presenting a finished product: "Low Power" badge, marketing copy ("enables precise automation … for optimal water usage and healthier crops") and a www.pakellab.com address baked into the image. | Text placeholder (same wording as above) |

All five device renders above were reviewed and are no longer used. The concept illustrations on the homepage and Field Scanner Drone section remain, each labelled "Concept illustration".
