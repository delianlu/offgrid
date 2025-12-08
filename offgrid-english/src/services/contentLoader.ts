import { ModuleSchema, ItemSchema, type Item } from '../types/schemas';
import { z } from 'zod';
import { db } from '../db/database';

// Increment this version to force re-seeding
export const CONTENT_VERSION = '1.0.36';

export async function loadModuleFromJSON(filename: string, appVersion: string) {
  try {
    const res = await fetch(`/modules/${filename}?v=${encodeURIComponent(appVersion)}`);
    if (!res.ok) {
      const msg = `Failed to fetch ${filename}: ${res.status}`;
      console.error(msg);
      return;
    }
    const data = await res.json();

    // Separate items from module metadata
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { items, ...moduleMeta } = data;

    const validModule = ModuleSchema.parse(moduleMeta);
    await db.modules.put(validModule);

    const parsedItems: Item[] = [];
    if (items && Array.isArray(items)) {
      for (const it of items) {
        const validItem = ItemSchema.parse(it);
        parsedItems.push(validItem);
      }
      await db.items.bulkPut(parsedItems);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`Validation error for module ${filename}:`, JSON.stringify(error.format(), null, 2));
    } else {
      console.error(`Error loading ${filename}:`, error);
    }
    throw error;
  }
}

export async function loadPhase2Items(baseFilename: string, appVersion: string) {
  const phase2Filename = baseFilename.replace('.json', '_phase2.json');

  try {
    const res = await fetch(`/modules/${phase2Filename}?v=${encodeURIComponent(appVersion)}`);
    if (!res.ok) {
      // It's expected that some modules might not have phase 2 content yet
      if (res.status === 404) {
        return;
      }
      console.warn(`Failed to fetch ${phase2Filename}: ${res.status}`);
      return;
    }

    const items = await res.json();
    if (Array.isArray(items)) {
      const parsedItems: Item[] = [];
      for (const it of items) {
        // Phase 2 items are just items, no module meta wrapper
        const validItem = ItemSchema.parse(it);
        parsedItems.push(validItem);
      }
      if (parsedItems.length > 0) {
        await db.items.bulkPut(parsedItems);
      } else {
        console.warn(`Phase 2 file ${phase2Filename} contained no items`);
      }
    } else {
      console.warn(`Phase 2 file ${phase2Filename} did not contain an array`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`Validation error for ${phase2Filename}:`, JSON.stringify(error.format(), null, 2));
    } else {
      console.error(`Error loading phase 2 content ${phase2Filename}:`, error);
    }
  }
}

export async function ensureSeedContent(appVersion: string) {
  const count = await db.modules.count();

  // Check stored version
  const storedVersion = localStorage.getItem('content_version');

  // Load all 19 modules if not all are present OR if version changed
  if (count >= 19 && storedVersion === appVersion) {
    return;
  }

  // Clear existing items if version changed to ensure clean update
  if (storedVersion !== appVersion) {
    await db.items.clear();
    await db.modules.clear();
  }

  // All 19 grammar modules
  const files = [
    'tense-form.json',
    'subject-verb-agreement.json',
    'prepositions.json',
    'word-order.json',
    'plurality.json',
    'articles.json',
    'auxiliaries.json',
    'pronouns-possessives.json',
    'gerunds-infinitives.json',
    'comparatives-superlatives.json',
    'conditionals.json',
    'sentence-connectors.json',
    'countable-uncountable.json',
    'question-tags.json',
    'relative-clauses.json',
    'false-cognates.json',
    'passive-voice.json',
    'reported-speech.json',
    'phonology.json'
  ];

  for (const f of files) {
    await loadModuleFromJSON(f, appVersion);
    // Try to load phase 2 content for this module
    await loadPhase2Items(f, appVersion);
  }

  localStorage.setItem('content_version', appVersion);
}
