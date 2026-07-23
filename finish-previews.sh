#!/usr/bin/env bash
# Finish the lead-designer routine after re-authenticating Firebase.
#
# PREREQUISITE (run once, interactively — Claude cannot do this):
#     firebase login --reauth
#
# Then:
#     cd ~/data/gigawatt/development/gigawatt-previews && ./finish-previews.sh
#
# It will: deploy all previews -> verify each URL is 200 -> commit ->
# PATCH each CRM lead's previewUrl. It only PATCHes leads whose preview
# actually returns 200, so no dead links reach the board.
set -euo pipefail
cd "$(dirname "$0")"

TOKEN=$(cat ~/.config/gigawatt/crm-routine-token)
BASE="https://gigawatt-previews.web.app"

# business name <TAB> slug  (name is url-encoded at PATCH time)
LEADS=$(cat <<'EOF'
Cliffy Care Landscaping LLC	cliffy-care-landscaping-llc
Shawnee Heating & Cooling Inc.	shawnee-heating-cooling-inc
JRS Painting Company	jrs-painting-company
Ridgeview Animal Hospital, LLC	ridgeview-animal-hospital-llc
Best Regards	best-regards
Family Pet Hospital of Shawnee	family-pet-hospital-of-shawnee
Davenport Service Company	davenport-service-company
True Grit Roofing	true-grit-roofing
LDK Lawn Services	ldk-lawn-services
Pawsitively Perfect	pawsitively-perfect
Fetchers Play, Stay & Grooming	fetchers-play-stay-grooming
Fulk Chiropractic	fulk-chiropractic
Air-Pro Comfort Systems	air-pro-comfort-systems
Mears Lawn	mears-lawn
Poor John's Plumbing	poor-john-s-plumbing
Mountain Landscaping	mountain-landscaping
Ronnie's Restaurant	ronnie-s-restaurant
Weaver's & Sons A-OK Exterminators	weaver-s-sons-a-ok-exterminators
The Dorsch Law Firm, LLC	the-dorsch-law-firm-llc
Gregory's Fine Floral	gregory-s-fine-floral
McAuley & Crandall, PA	mcauley-crandall-pa
Quivira Crossing Veterinary Clinic	quivira-crossing-veterinary-clinic
Olathe Karate Academy	olathe-karate-academy
Old 56 Family Restaurant	old-56-family-restaurant
Rooted Landscape, Inc.	rooted-landscape-inc
Overland Park CrossFit	overland-park-crossfit
Blue Valley Eyecare	blue-valley-eyecare
Kiddi Kollege of Leawood	kiddi-kollege-of-leawood
Don's Body Shop, Inc.	don-s-body-shop-inc
Capstone Insurance Agency, Inc.	capstone-insurance-agency-inc
Orman's Furniture	orman-s-furniture
Focus Hearing, Inc.	focus-hearing-inc
M&M Roofing Co., Inc.	m-m-roofing-co-inc
Moon Orthodontics	moon-orthodontics
Total Home Fence and Deck	total-home-fence-and-deck
Garage Door Masters KC	garage-door-masters-kc
The Aesthetic Place	the-aesthetic-place
JF Denney, Inc.	jf-denney-inc
EOF
)

echo "==> Deploying to Firebase Hosting (previews)…"
firebase deploy --only hosting:previews --non-interactive

echo "==> Verifying + patching each lead…"
ok=0; fail=0
while IFS=$'\t' read -r name slug; do
  [ -z "${slug:-}" ] && continue
  code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/$slug/")
  if [ "$code" != "200" ]; then
    echo "  SKIP  $slug -> HTTP $code (not patching)"; fail=$((fail+1)); continue
  fi
  enc=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$name")
  pc=$(curl -s -o /dev/null -w '%{http_code}' -X PATCH \
        -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
        -d "{\"previewUrl\":\"$BASE/$slug/\"}" \
        "https://gigawatt-crm.web.app/api/leads/$enc")
  if [ "$pc" = "200" ]; then
    echo "  OK    $slug (200) -> CRM patched"; ok=$((ok+1))
  else
    echo "  WARN  $slug live but CRM PATCH returned $pc"; fail=$((fail+1))
  fi
done <<< "$LEADS"

echo "==> Committing repo…"
git add -A
git commit -m "preview: deploy + link 38 lead concepts" || echo "(nothing to commit)"

echo "==> Done. patched=$ok  issues=$fail"
