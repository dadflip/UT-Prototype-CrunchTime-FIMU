import crypto from 'crypto';
import { localDB, AdminUser, JuryMember } from './local-storage';

// Fonctions de hashage
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function hashPIN(pin: string): string {
  return crypto.createHash('sha256').update(pin).digest('hex');
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

function verifyPIN(pin: string, hash: string): boolean {
  return hashPIN(pin) === hash;
}

// Authentification Admin
export async function authenticateAdmin(email: string, password: string): Promise<AdminUser | null> {
  try {
    await localDB.init();
    const adminUser = await localDB.findAdminByEmail(email.toLowerCase());
    
    if (!adminUser || !adminUser.is_active) {
      return null;
    }
    
    if (!verifyPassword(password, adminUser.password_hash)) {
      return null;
    }
    
    // Retourner l'utilisateur sans le hash du mot de passe
    const { password_hash, ...userWithoutHash } = adminUser;
    return userWithoutHash as AdminUser;
  } catch (error) {
    console.error('Admin authentication error:', error);
    return null;
  }
}

// Authentification Jury par PIN
export async function authenticateJuryByPIN(pin: string): Promise<JuryMember | null> {
  try {
    await localDB.init();
    const juryMembers = await localDB.getAll('jury_members') as JuryMember[];
    
    // Chercher un juré avec ce PIN
    const juryMember = juryMembers.find((member: JuryMember) => {
      return member.is_active && verifyPIN(pin, member.pin_hash);
    });
    
    if (!juryMember) {
      return null;
    }
    
    // Retourner le juré sans le hash du PIN
    const { pin_hash, ...memberWithoutHash } = juryMember;
    return memberWithoutHash as JuryMember;
  } catch (error) {
    console.error('Jury authentication error:', error);
    return null;
  }
}

// Authentification Jury par email (gardé pour compatibilité)
export async function authenticateJury(email: string, pin: string): Promise<JuryMember | null> {
  try {
    await localDB.init();
    const juryMember = await localDB.findJuryByEmail(email.toLowerCase());
    
    if (!juryMember || !juryMember.is_active) {
      return null;
    }
    
    if (!verifyPIN(pin, juryMember.pin_hash)) {
      return null;
    }
    
    // Retourner le juré sans le hash du PIN
    const { pin_hash, ...memberWithoutHash } = juryMember;
    return memberWithoutHash as JuryMember;
  } catch (error) {
    console.error('Jury authentication error:', error);
    return null;
  }
}

// Gestion des sessions avec localStorage
export function setAdminSession(admin: AdminUser): void {
  if (typeof window === 'undefined') return;
  
  const sessionData = {
    user: admin,
    timestamp: Date.now(),
    type: 'admin'
  };
  
  localStorage.setItem('admin_session', JSON.stringify(sessionData));
}

export function setJurySession(jury: JuryMember): void {
  if (typeof window === 'undefined') return;
  
  const sessionData = {
    user: jury,
    timestamp: Date.now(),
    type: 'jury'
  };
  
  localStorage.setItem('jury_session', JSON.stringify(sessionData));
}

export function getAdminSession(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const sessionData = localStorage.getItem('admin_session');
    if (!sessionData) return null;
    
    const session = JSON.parse(sessionData);
    
    // Vérifier si la session n'est pas expirée (24h)
    const isExpired = Date.now() - session.timestamp > 24 * 60 * 60 * 1000;
    if (isExpired) {
      localStorage.removeItem('admin_session');
      return null;
    }
    
    return session.user;
  } catch (error) {
    console.error('Error getting admin session:', error);
    return null;
  }
}

export function getJurySession(): JuryMember | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const sessionData = localStorage.getItem('jury_session');
    if (!sessionData) return null;
    
    const session = JSON.parse(sessionData);
    
    // Vérifier si la session n'est pas expirée (24h)
    const isExpired = Date.now() - session.timestamp > 24 * 60 * 60 * 1000;
    if (isExpired) {
      localStorage.removeItem('jury_session');
      return null;
    }
    
    return session.user;
  } catch (error) {
    console.error('Error getting jury session:', error);
    return null;
  }
}

export function clearAdminSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('admin_session');
}

export function clearJurySession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('jury_session');
}

export function clearAllSessions(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('admin_session');
  localStorage.removeItem('jury_session');
}
