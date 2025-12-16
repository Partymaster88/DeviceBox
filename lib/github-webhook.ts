import { createHmac } from 'crypto';
import { execSync } from 'child_process';
import simpleGit, { SimpleGit } from 'simple-git';

// Bestimme Projektverzeichnis (für Next.js Build)
// In Next.js ist process.cwd() das Projektverzeichnis
const PROJECT_DIR = process.cwd();
const git: SimpleGit = simpleGit(PROJECT_DIR);

/**
 * Führt Deployment aus: Pull, Build, Restart
 */
async function deploy(): Promise<boolean> {
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
    execSync('npm install', { stdio: 'inherit', cwd: PROJECT_DIR });

    // Baue Next.js App
    console.log('Baue Next.js App...');
    execSync('npm run build', { stdio: 'inherit', cwd: PROJECT_DIR });

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

/**
 * Verifiziert GitHub Webhook Signature
 */
export function verifyGitHubSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!signature || !secret) {
    return false;
  }

  const hmac = createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  
  return signature === digest;
}

/**
 * Verarbeitet GitHub Webhook Event
 */
export async function handleGitHubWebhook(
  event: string,
  payload: any,
  signature: string,
  secret: string
): Promise<{ success: boolean; message: string }> {
  // Verifiziere Signature
  if (!verifyGitHubSignature(JSON.stringify(payload), signature, secret)) {
    return {
      success: false,
      message: 'Ungültige Signature'
    };
  }

  // Verarbeite nur push Events
  if (event !== 'push') {
    return {
      success: true,
      message: `Event ${event} ignoriert`
    };
  }

  // Prüfe ob es ein Push zum main/master Branch ist
  const ref = payload.ref;
  if (!ref || (!ref.includes('refs/heads/main') && !ref.includes('refs/heads/master'))) {
    return {
      success: true,
      message: 'Push zu anderem Branch ignoriert'
    };
  }

  // Führe Deployment aus
  console.log(`Deployment ausgelöst durch Push zu ${ref}`);
  const deploySuccess = await deploy();

  return {
    success: deploySuccess,
    message: deploySuccess 
      ? 'Deployment erfolgreich' 
      : 'Deployment fehlgeschlagen'
  };
}

