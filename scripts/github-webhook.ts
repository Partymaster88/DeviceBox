#!/usr/bin/env tsx
import { createHmac } from 'crypto';
import { deploy } from './deploy';

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

