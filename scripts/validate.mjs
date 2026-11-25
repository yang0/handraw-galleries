#!/usr/bin/env node
/**
 * Handraw Gallery Market Validator (Format 1)
 *
 * Validates:
 * 1. Market registry `index.json` schema, unique IDs, non-reserved IDs, standard source types (`json` | `zip`), HTTPS URLs.
 * 2. With `--check-remote`: fetches each gallery's manifest URL (falling back across declared mirrors)
 *    and validates that every `json` gallery conforms to Handraw Standard Gallery Manifest Format 1.
 *
 * Usage:
 *   node scripts/validate.mjs
 *   node scripts/validate.mjs --check-remote
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const INDEX_PATH = path.join(ROOT, 'index.json');

const RESERVED_IDS = new Set([
  'styles', 'layouts', 'colors', 'tones', 'assets', 'characters', 'props', 'scenes',
]);
const VALID_ID_RE = /^[a-z0-9][a-z0-9_-]{0,40}$/;
const ALLOWED_SOURCE_TYPES = new Set(['json', 'zip']);

const errors = [];
const warnings = [];

function fail(msg) { errors.push(msg); }
function warn(msg) { warnings.push(msg); }

function isHttpsUrl(u) {
  return typeof u === 'string' && /^https:\/\/[^\s]+$/i.test(u.trim());
}

function hasPathTraversal(p) {
  if (typeof p !== 'string') return false;
  const s = p.replace(/\\/g, '/').trim();
  return s.startsWith('/') || s.split('/').includes('..');
}

function validateStandardGalleryManifest(doc, expectedId, sourceLabel) {
  if (!doc || typeof doc !== 'object') {
    fail(`[${expectedId}] ${sourceLabel}: manifest must be a JSON object`);
    return;
  }
  if (doc.format !== 1) {
    fail(`[${expectedId}] ${sourceLabel}: manifest "format" must be 1 (got ${JSON.stringify(doc.format)})`);
  }
  if (typeof doc.id !== 'string' || doc.id.trim().toLowerCase() !== expectedId) {
    fail(`[${expectedId}] ${sourceLabel}: manifest "id" (${JSON.stringify(doc.id)}) must match market id "${expectedId}"`);
  }
  if (typeof doc.name !== 'string' || !doc.name.trim()) {
    fail(`[${expectedId}] ${sourceLabel}: manifest "name" is required`);
  }
  if (doc.imageMirrors !== undefined) {
    if (!doc.imageMirrors || typeof doc.imageMirrors !== 'object' || Array.isArray(doc.imageMirrors)) {
      fail(`[${expectedId}] ${sourceLabel}: "imageMirrors" must be an object mapping mirror name -> https:// base URL`);
    } else {
      for (const [mk, mv] of Object.entries(doc.imageMirrors)) {
        if (!isHttpsUrl(mv)) {
          fail(`[${expectedId}] ${sourceLabel}: imageMirrors.${mk} must be an https:// URL`);
        }
      }
    }
  }
  if (doc.imageBaseUrl !== undefined && doc.imageBaseUrl !== '' && !isHttpsUrl(doc.imageBaseUrl)) {
    fail(`[${expectedId}] ${sourceLabel}: "imageBaseUrl" must be an https:// URL`);
  }
  if (!Array.isArray(doc.items) || doc.items.length === 0) {
    fail(`[${expectedId}] ${sourceLabel}: "items" must be a non-empty array`);
    return;
  }
  const seenItemIds = new Set();
  for (let i = 0; i < doc.items.length; i++) {
    const it = doc.items[i];
    if (!it || typeof it !== 'object') {
      fail(`[${expectedId}] items[${i}] must be an object`);
      continue;
    }
    const itemId = String(it.id || '').trim();
    if (!itemId) {
      fail(`[${expectedId}] items[${i}].id is required`);
      continue;
    }
    const lowerId = itemId.toLowerCase();
    if (seenItemIds.has(lowerId)) {
      fail(`[${expectedId}] duplicate item id "${itemId}"`);
    }
    seenItemIds.add(lowerId);
    if (typeof it.name !== 'string' || !it.name.trim()) {
      fail(`[${expectedId}] items[${i}] (${itemId}): "name" is required`);
    }
    for (const f of ['image', 'thumb', 'remoteImage', 'remoteThumb']) {
      if (it[f] && !isHttpsUrl(it[f]) && hasPathTraversal(it[f])) {
        fail(`[${expectedId}] items[${i}] (${itemId}): unsafe relative path in "${f}": ${it[f]}`);
      }
    }
    const hasVariants = Array.isArray(it.variants) && it.variants.length > 0;
    const hasImage = Boolean(it.image || it.thumb || it.remoteImage || it.remoteThumb);
    if (!hasVariants && !hasImage) {
      fail(`[${expectedId}] items[${i}] (${itemId}): must provide image/remoteImage or non-empty variants[]`);
    }
    if (hasVariants) {
      const vKeys = new Set();
      for (let j = 0; j < it.variants.length; j++) {
        const v = it.variants[j];
        const vk = String(v?.key || '').trim();
        if (!vk) {
          fail(`[${expectedId}] items[${i}] (${itemId}) variants[${j}].key is required`);
          continue;
        }
        if (vKeys.has(vk.toLowerCase())) {
          fail(`[${expectedId}] items[${i}] (${itemId}) duplicate variant key "${vk}"`);
        }
        vKeys.add(vk.toLowerCase());
        if (!v.image && !v.thumb && !v.remoteImage && !v.remoteThumb) {
          fail(`[${expectedId}] items[${i}] (${itemId}) variant "${vk}" has no image/remoteImage`);
        }
        for (const f of ['image', 'thumb', 'remoteImage', 'remoteThumb']) {
          if (v[f] && !isHttpsUrl(v[f]) && hasPathTraversal(v[f])) {
            fail(`[${expectedId}] items[${i}] (${itemId}) variant "${vk}" unsafe path in "${f}"`);
          }
        }
      }
    }
  }
}

async function fetchRemote(urls) {
  let lastErr;
  for (const u of urls) {
    try {
      const resp = await fetch(u, {
        headers: { 'User-Agent': 'handraw-galleries-validator/1.0' },
        signal: AbortSignal.timeout(30_000),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return { url: u, resp };
    } catch (err) {
      lastErr = new Error(`${u}: ${err.message}`);
    }
  }
  throw lastErr || new Error('no reachable URL');
}

async function main() {
  const checkRemote = process.argv.includes('--check-remote');
  const raw = await fs.readFile(INDEX_PATH, 'utf8');
  const idx = JSON.parse(raw);

  if (idx.format !== 1) fail(`index.json "format" must be 1 (got ${JSON.stringify(idx.format)})`);
  if (!idx.title?.zh && !idx.title?.en) fail('index.json "title.zh" or "title.en" is required');
  if (!Array.isArray(idx.galleries) || idx.galleries.length === 0) {
    fail('index.json "galleries" must be a non-empty array');
  }
  if (idx.mirrors) {
    for (const [k, v] of Object.entries(idx.mirrors)) {
      if (!isHttpsUrl(v)) fail(`index.json mirrors.${k} must be an https:// URL`);
    }
  }

  const definedCategories = new Set(Object.keys(idx.metadata?.categories || {}));
  const seenIds = new Set();

  for (let i = 0; i < (idx.galleries || []).length; i++) {
    const g = idx.galleries[i];
    const id = String(g?.id || '').trim().toLowerCase();
    if (!VALID_ID_RE.test(id)) {
      fail(`galleries[${i}].id (${JSON.stringify(g?.id)}) must match ${VALID_ID_RE}`);
      continue;
    }
    if (RESERVED_IDS.has(id)) {
      fail(`galleries[${i}].id "${id}" is reserved for built-in Handraw galleries`);
    }
    if (seenIds.has(id)) {
      fail(`duplicate gallery id "${id}" in index.json`);
    }
    seenIds.add(id);

    if (!g.name?.trim()) fail(`[${id}] "name" is required`);
    if (!g.description?.trim()) fail(`[${id}] "description" is required`);
    if (!g.author?.trim()) fail(`[${id}] "author" is required`);
    if (!g.license?.trim()) fail(`[${id}] "license" is required (e.g. MIT, CC-BY-4.0, CC0-1.0)`);
    if (!g.version?.trim()) warn(`[${id}] "version" is recommended (e.g. "1.0.0")`);
    if (g.homepage && !isHttpsUrl(g.homepage)) fail(`[${id}] "homepage" must be an https:// URL`);

    if (!Array.isArray(g.categories) || g.categories.length === 0) {
      fail(`[${id}] "categories" must be a non-empty array`);
    } else {
      for (const c of g.categories) {
        if (definedCategories.size > 0 && !definedCategories.has(c)) {
          fail(`[${id}] category "${c}" is not listed in metadata.categories`);
        }
      }
    }

    const src = g.source;
    if (!src || typeof src !== 'object') {
      fail(`[${id}] "source" object is required`);
      continue;
    }
    const srcType = String(src.type || '').trim().toLowerCase();
    if (!ALLOWED_SOURCE_TYPES.has(srcType)) {
      fail(`[${id}] source.type "${src.type}" is not supported; use standard "json" or "zip"`);
    }

    const candidateUrls = [];
    if (src.url) {
      if (!isHttpsUrl(src.url)) fail(`[${id}] source.url must be an https:// URL`);
      else candidateUrls.push(src.url);
    }
    if (src.mirrors && typeof src.mirrors === 'object') {
      for (const [mk, mv] of Object.entries(src.mirrors)) {
        if (!isHttpsUrl(mv)) fail(`[${id}] source.mirrors.${mk} must be an https:// URL`);
        else if (!candidateUrls.includes(mv)) candidateUrls.push(mv);
      }
    }
    if (candidateUrls.length === 0) {
      fail(`[${id}] source must provide at least one https:// "url" or "mirrors" entry`);
    }

    if (checkRemote && candidateUrls.length > 0) {
      try {
        if (srcType === 'json') {
          const { url, resp } = await fetchRemote(candidateUrls);
          const doc = await resp.json();
          validateStandardGalleryManifest(doc, id, url);
          console.log(`[ok] remote ${id}: ${doc.items?.length ?? 0} items verified from ${url}`);
        } else if (srcType === 'zip') {
          const { url, resp } = await fetchRemote(candidateUrls);
          const buf = Buffer.from(await resp.arrayBuffer());
          if (buf.length < 4 || buf[0] !== 0x50 || buf[1] !== 0x4b) {
            fail(`[${id}] ${url}: downloaded file is not a valid ZIP archive`);
          } else {
            console.log(`[ok] remote ${id}: valid ZIP (${(buf.length / 1024).toFixed(1)} KB) from ${url}`);
          }
        }
      } catch (err) {
        fail(`[${id}] remote check failed: ${err.message}`);
      }
    }
  }

  for (const w of warnings) console.warn(`[warn] ${w}`);
  if (errors.length > 0) {
    console.error(`\nValidation failed with ${errors.length} error(s):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(`\nValidation passed: ${idx.galleries.length} gallery entries in index.json${checkRemote ? ' (remote manifests verified)' : ''}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
