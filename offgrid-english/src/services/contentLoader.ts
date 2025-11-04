import { ModuleSchema, ItemSchema, type Item } from '../types/schemas';
import { db } from '../db/database';

export async function loadModuleFromJSON(filename: string, appVersion: string) {
  try {
    const res = await fetch(`/modules/${filename}?v=${encodeURIComponent(appVersion)}`);
    if (!res.ok) {
      console.error(`Failed to fetch ${filename}: ${res.status}`);
      return;
    }
    const data = await res.json();

    const { items, ...moduleMeta } = data;
    const validModule = ModuleSchema.parse(moduleMeta);
    await db.modules.put(validModule);

    const parsedItems: Item[] = [];
    for (const it of items) {
      const validItem = ItemSchema.parse(it);
      parsedItems.push(validItem);
    }
    await db.items.bulkPut(parsedItems);
    console.log(`✓ Loaded module: ${filename}`);
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
  }
}

export async function ensureSeedContent(appVersion: string) {
  const count = await db.modules.count();
  console.log(`Database has ${count} modules`);

  // Load all 9 modules if not all are present
  if (count >= 9) {
    console.log('All 9 modules already loaded');
    return;
  }

  console.log('Loading all modules...');

  // All 9 grammar modules (329 items total)
  const files = [
    'tense-form.json',                 // 50 items
    'subject-verb-agreement.json',     // 40 items
    'prepositions.json',               // 30 items
    'word-order.json',                 // 30 items
    'plurality.json',                  // 20 items
    'articles.json',                   // 20 items
    'auxiliaries.json',                // 20 items
    'cameroonian-scenarios.json',      // 69 items
    'false-cognates.json'              // 50 items
  ];

  for (const f of files) {
    await loadModuleFromJSON(f, appVersion);
  }

  const finalCount = await db.modules.count();
  console.log(`Finished loading. Database now has ${finalCount} modules`);
}
