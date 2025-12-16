#!/usr/bin/env tsx
import simpleGit, { SimpleGit } from 'simple-git';
import { execSync } from 'child_process';
import { join } from 'path';

const git: SimpleGit = simpleGit(process.cwd());

/**
 * Führt Deployment aus: Pull, Build, Restart
 */
export async function deploy(): Promise<boolean> {
  try {
    console.log('Starte Deployment...');

    // Prüfe ob wir in einem Git Repository sind
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      console.error('Kein Git Repository gefunden');
      return false;
    }

    // Hole aktuellen Branch
    const currentBranch = await git.revParse(['--abbrev-ref', 'HEAD']);
    console.log(`Aktueller Branch: ${currentBranch}`);

    // Pull neuesten Code
    console.log('Pulle neuesten Code...');
    await git.pull('origin', currentBranch);

    // Installiere Dependencies
    console.log('Installiere Dependencies...');
    execSync('npm install', { stdio: 'inherit', cwd: process.cwd() });

    // Baue Next.js App
    console.log('Baue Next.js App...');
    execSync('npm run build', { stdio: 'inherit', cwd: process.cwd() });

    // Restart PM2
    console.log('Starte PM2 neu...');
    try {
      execSync('pm2 restart devicebox', { stdio: 'inherit' });
    } catch {
      // Falls PM2 noch nicht läuft, starte es
      execSync('pm2 start ecosystem.config.js', { stdio: 'inherit' });
    }

    console.log('Deployment erfolgreich abgeschlossen');
    return true;
  } catch (error) {
    console.error('Deployment Fehler:', error);
    return false;
  }
}

// CLI Usage
if (require.main === module) {
  deploy().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

