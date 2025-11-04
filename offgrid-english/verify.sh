set -e
ok()  { printf "✅ %s\n" "$1"; }
bad() { printf "❌ %s\n" "$1"; exit 1; }

for f in \
  src/index.css \
  src/main.tsx \
  src/App.tsx \
  src/types/schemas.ts \
  src/db/database.ts \
  src/services/contentLoader.ts \
  src/components/MultipleChoice.tsx \
  src/pages/ModulePractice.tsx \
  src/pages/Diagnostics.tsx \
  vite.config.ts \
  tailwind.config.js \
  postcss.config.js \
  public/modules/tense-form.json \
  scripts/validateContent.ts \
  package.json
do
  [ -f "$f" ] || bad "Missing: $f"
done
ok "All expected files present"

grep -q "content: \\['\\./index.html','\\./src/\\*\\*/\\*\\.{ts,tsx}'\\]" tailwind.config.js \
  && ok "tailwind.config.js content globs OK" || bad "tailwind.config.js content globs not correct"

grep -q "@tailwind base;" src/index.css && grep -q "@tailwind components;" src/index.css && grep -q "@tailwind utilities;" src/index.css \
  && ok "src/index.css has Tailwind directives" || bad "Tailwind directives missing in src/index.css"

grep -q "import './index.css';" src/main.tsx \
  && ok "main.tsx imports index.css" || bad "main.tsx does not import index.css"

grep -q "tailwindcss" postcss.config.js && grep -q "autoprefixer" postcss.config.js \
  && ok "postcss.config.js includes tailwindcss + autoprefixer" || bad "PostCSS plugins missing"

grep -q "vite-plugin-pwa" package.json && grep -q "VitePWA" vite.config.ts \
  && ok "vite-plugin-pwa present and used" || bad "vite-plugin-pwa not configured"

grep -q "urlPattern: /\\\\/modules\\\\/.*\\\\.json\\$/" vite.config.ts \
  && ok "Runtime caching for /modules/*.json is set" || bad "Runtime caching for modules JSON missing"

has_jq=1; command -v jq >/dev/null 2>&1 || has_jq=0
if [ $has_jq -eq 1 ]; then
  jq -e '.schema_version=="1" and (.module_version|type=="string")' public/modules/tense-form.json >/dev/null \
    && ok "tense-form.json has schema_version and module_version" || bad "schema_version/module_version missing in JSON"
  A=$(jq '[.items[]|select(.formType=="A")]|length' public/modules/tense-form.json)
  B=$(jq '[.items[]|select(.formType=="B")]|length' public/modules/tense-form.json)
  [ "$A" = "$B" ] && ok "A/B item counts match ($A each)" || bad "A/B mismatch: A=$A B=$B"
else
  node -e '
    const j=require("./public/modules/tense-form.json");
    if(j.schema_version!=="1"||typeof j.module_version!=="string"){process.exit(2)}
    const A=j.items.filter(i=>i.formType==="A").length;
    const B=j.items.filter(i=>i.formType==="B").length;
    if(A!==B){console.error(`A=${A} B=${B}`);process.exit(3)}
  ' && ok "JSON checks passed (node fallback)" || bad "JSON checks failed (node fallback)"
fi

grep -q '"validate:content": "tsx scripts/validateContent.ts"' package.json \
  && ok "validate:content script exists" || bad "validate:content script missing"

npm run -s build >/dev/null && ok "Production build OK" || bad "Production build failed"

echo; ok "VERIFICATION COMPLETE"
