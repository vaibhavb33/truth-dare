import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Brand Identity & Asset Verification', () => {
  const rootDir = process.cwd();
  const brandingDir = path.join(rootDir, 'public/branding');
  const iconsDir = path.join(rootDir, 'public/icons');
  const docsDir = path.join(rootDir, 'project-docs/47-brand-assets');

  const expectedBrandingFiles = [
    'logo-horizontal-dark.svg',
    'logo-horizontal-light.svg',
    'logo-horizontal-transparent.svg',
    'logo-icon-dark.svg',
    'logo-icon-light.svg',
    'logo-icon-transparent.svg',
    'favicon.svg',
    'favicon.ico',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'apple-touch-icon.png',
    'icon-192.png',
    'icon-512.png',
    'icon-maskable-512x512.png',
  ];

  it('contains all 14 required files in /public/branding/', () => {
    expectedBrandingFiles.forEach((file) => {
      const filePath = path.join(brandingDir, file);
      expect(fs.existsSync(filePath), `Missing asset: ${file}`).toBe(true);
      const stat = fs.statSync(filePath);
      expect(stat.size, `File empty: ${file}`).toBeGreaterThan(0);
    });
  });

  it('contains valid SVG content in vector logo assets', () => {
    const svgFiles = expectedBrandingFiles.filter((f) => f.endsWith('.svg'));
    svgFiles.forEach((file) => {
      const content = fs.readFileSync(path.join(brandingDir, file), 'utf-8');
      expect(content).toContain('<svg');
      expect(content).toContain('viewBox=');
      expect(content).toContain('</svg>');
    });
  });

  it('contains mirrored PWA icons in /public/icons/', () => {
    const pwaIcons = [
      'apple-touch-icon.png',
      'icon-192x192.png',
      'icon-512x512.png',
      'icon-maskable-512x512.png',
    ];
    pwaIcons.forEach((file) => {
      const filePath = path.join(iconsDir, file);
      expect(fs.existsSync(filePath), `Missing PWA icon: ${file}`).toBe(true);
      expect(fs.statSync(filePath).size).toBeGreaterThan(0);
    });
  });

  it('contains root favicon and og-image in /public/', () => {
    const rootFiles = [
      'favicon.ico',
      'favicon.svg',
      'favicon.png',
      'apple-touch-icon.png',
      'og-image.png',
    ];
    rootFiles.forEach((file) => {
      const filePath = path.join(rootDir, 'public', file);
      expect(fs.existsSync(filePath), `Missing root file: ${file}`).toBe(true);
      expect(fs.statSync(filePath).size).toBeGreaterThan(0);
    });
  });

  it('contains all required documentation in /project-docs/47-brand-assets/', () => {
    const requiredDocs = [
      'logo-design.md',
      'favicon-validation.md',
      'asset-inventory.md',
    ];
    requiredDocs.forEach((doc) => {
      const docPath = path.join(docsDir, doc);
      expect(fs.existsSync(docPath), `Missing documentation: ${doc}`).toBe(true);
      const content = fs.readFileSync(docPath, 'utf-8');
      expect(content.length).toBeGreaterThan(200);
    });
  });
});

