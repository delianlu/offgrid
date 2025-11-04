set -e
ok()  { printf "✅ %s\n" "$1"; }

cp public/modules/tense-form.json public/modules/tense-form.json.bak || true

if command -v jq >/dev/null 2>&1; then
  jq '.items += [
    {"id":"tense-2-A","moduleId":"tense-form","questionText":"Right now, she _____ for the exam.","options":["studies","is studying","study"],"correctAnswer":"is studying","feedback":"“Right now” → present continuous.","formType":"A","transferType":"near","item_version":"1.0.0"},
    {"id":"tense-2-B","moduleId":"tense-form","questionText":"Look! The kids _____ in the garden.","options":["play","are playing","plays"],"correctAnswer":"are playing","feedback":"Present continuous for actions happening now.","formType":"B","transferType":"near","item_version":"1.0.0"}
  ]' public/modules/tense-form.json > public/modules/tense-form.json.tmp
  mv public/modules/tense-form.json.tmp public/modules/tense-form.json
  ok "Added second A/B pair via jq"
else
  node -e '
    const fs=require("fs"); const f="public/modules/tense-form.json";
    const j=JSON.parse(fs.readFileSync(f,"utf8"));
    j.items.push(
      {"id":"tense-2-A","moduleId":"tense-form","questionText":"Right now, she _____ for the exam.","options":["studies","is studying","study"],"correctAnswer":"is studying","feedback":"“Right now” → present continuous.","formType":"A","transferType":"near","item_version":"1.0.0"},
      {"id":"tense-2-B","moduleId":"tense-form","questionText":"Look! The kids _____ in the garden.","options":["play","are playing","plays"],"correctAnswer":"are playing","feedback":"Present continuous for actions happening now.","formType":"B","transferType":"near","item_version":"1.0.0"}
    );
    fs.writeFileSync(f, JSON.stringify(j,null,2));
  ' && ok "Added second A/B pair via node"
fi

npm run -s validate:content

cp src/App.tsx src/App.tsx.bak || true
grep -q "ensureSeedContent" src/App.tsx || sed -i '' '1a\
import { ensureSeedContent } from "./services/contentLoader";\
' src/App.tsx
grep -q "useEffect(() =>" src/App.tsx || sed -i '' '1a\
import { useEffect } from "react";\
' src/App.tsx

grep -q "ensureSeedContent(APP_VERSION)" src/App.tsx || \
  awk '1;/function App\(\) \{/{print "  useEffect(() => { try { void ensureSeedContent(APP_VERSION); } catch {} }, []);"}' src/App.tsx > src/App.tsx.tmp && mv src/App.tsx.tmp src/App.tsx

ok "Seed-on-home ensured (App.tsx updated)"

npm run -s build >/dev/null && ok "Build OK after fixes"
echo; ok "FIXES COMPLETE"
