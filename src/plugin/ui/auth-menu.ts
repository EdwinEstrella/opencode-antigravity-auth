import { ANSI } from './ansi';
import { select, type MenuItem } from './select';
import { confirm } from './confirm';

export type AccountStatus = 'active' | 'rate-limited' | 'expired' | 'verification-required' | 'unknown';

export interface AccountInfo {
  email?: string;
  index: number;
  addedAt?: number;
  lastUsed?: number;
  status?: AccountStatus;
  isCurrentAccount?: boolean;
  enabled?: boolean;
}

export type AuthMenuAction =
  | { type: 'add' }
  | { type: 'select-account'; account: AccountInfo }
  | { type: 'delete-all' }
  | { type: 'check' }
  | { type: 'verify' }
  | { type: 'verify-all' }
  | { type: 'configure-models' }
  | { type: 'cancel' };

export type AccountAction = 'back' | 'delete' | 'refresh' | 'toggle' | 'verify' | 'cancel';

function formatRelativeTime(timestamp: number | undefined): string {
  if (!timestamp) return 'never';
  const days = Math.floor((Date.now() - timestamp) / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(timestamp).toLocaleDateString();
}

function formatDate(timestamp: number | undefined): string {
  if (!timestamp) return 'unknown';
  return new Date(timestamp).toLocaleDateString();
}

function getStatusBadge(status: AccountStatus | undefined): string {
  switch (status) {
    case 'active': return `${ANSI.green}[active]${ANSI.reset}`;
    case 'rate-limited': return `${ANSI.yellow}[rate-limited]${ANSI.reset}`;
    case 'expired': return `${ANSI.red}[expired]${ANSI.reset}`;
    case 'verification-required': return `${ANSI.red}[needs verification]${ANSI.reset}`;
    default: return '';
  }
}

export async function showAuthMenu(accounts: AccountInfo[]): Promise<AuthMenuAction> {
  const items: MenuItem<AuthMenuAction>[] = [
    { label: 'Actions', value: { type: 'cancel' }, kind: 'heading' },
    { label: 'Add account', value: { type: 'add' }, color: 'cyan' },
    { label: 'Check quotas', value: { type: 'check' }, color: 'cyan' },
    { label: 'Verify one account', value: { type: 'verify' }, color: 'cyan' },
    { label: 'Verify all accounts', value: { type: 'verify-all' }, color: 'cyan' },
    { label: 'Configure models in opencode.json', value: { type: 'configure-models' }, color: 'cyan' },

    { label: '', value: { type: 'cancel' }, separator: true },

    { label: 'Accounts', value: { type: 'cancel' }, kind: 'heading' },

    ...accounts.map(account => {
      const statusBadge = getStatusBadge(account.status);
      const currentBadge = account.isCurrentAccount ? ` ${ANSI.cyan}[current]${ANSI.reset}` : '';
      const disabledBadge = account.enabled === false ? ` ${ANSI.red}[disabled]${ANSI.reset}` : '';
      const baseLabel = account.email || `Account ${account.index + 1}`;
      const numbered = `${account.index + 1}. ${baseLabel}`;
      const fullLabel = `${numbered}${currentBadge}${statusBadge ? ' ' + statusBadge : ''}${disabledBadge}`;

      return {
        label: fullLabel,
        hint: account.lastUsed ? `used ${formatRelativeTime(account.lastUsed)}` : '',
        value: { type: 'select-account' as const, account },
      };
    }),

    { label: '', value: { type: 'cancel' }, separator: true },

    { label: 'Danger zone', value: { type: 'cancel' }, kind: 'heading' },
    { label: 'Delete all accounts', value: { type: 'delete-all' }, color: 'red' as const },
  ];

  while (true) {
    const result = await select(items, { 
      message: 'Google accounts (Antigravity)',
      subtitle: 'Select an action or account',
      clearScreen: true,
    });

    if (!result) return { type: 'cancel' };

    if (result.type === 'delete-all') {
      const confirmed = await confirm('Delete ALL accounts? This cannot be undone.');
      if (!confirmed) continue;
    }

    return result;
  }
}

export async function showAccountDetails(account: AccountInfo): Promise<AccountAction> {
  const label = account.email || `Account ${account.index + 1}`;
  const badge = getStatusBadge(account.status);
  const disabledBadge = account.enabled === false ? ` ${ANSI.red}[disabled]${ANSI.reset}` : '';
  const header = `${label}${badge ? ' ' + badge : ''}${disabledBadge}`;
  const subtitleParts = [
    `Added: ${formatDate(account.addedAt)}`,
    `Last used: ${formatRelativeTime(account.lastUsed)}`,
  ];

  while (true) {
    const result = await select([
      { label: 'Back', value: 'back' as const },
      { label: 'Verify account access', value: 'verify' as const, color: 'cyan' },
      { label: account.enabled === false ? 'Enable account' : 'Disable account', value: 'toggle' as const, color: account.enabled === false ? 'green' : 'yellow' },
      { label: 'Refresh token', value: 'refresh' as const, color: 'cyan' },
      { label: 'Delete this account', value: 'delete' as const, color: 'red' },
    ], { 
      message: header,
      subtitle: subtitleParts.join(' | '),
      clearScreen: true,
    });

    if (result === 'delete') {
      const confirmed = await confirm(`Delete ${label}?`);
      if (!confirmed) continue;
    }

    if (result === 'refresh') {
      const confirmed = await confirm(`Re-authenticate ${label}?`);
      if (!confirmed) continue;
    }

    return result ?? 'cancel';
  }
}

export interface QuotaScreenModel {
  name: string;
  remainingFraction?: number;
  resetTime?: string;
}

export interface QuotaScreenAccount {
  label: string;
  disabled?: boolean;
  error?: string;
  antigravityModels: QuotaScreenModel[];
  geminiCliModels: QuotaScreenModel[];
}

function getQuotaColor(remaining?: number): string {
  if (typeof remaining !== 'number') return ANSI.reset;
  if (remaining < 0.2) return ANSI.red;
  if (remaining < 0.6) return ANSI.yellow;
  return ANSI.green;
}

function createProgressBar(remaining?: number, width: number = 18): string {
  if (typeof remaining !== 'number') return '░'.repeat(width) + ' ???';
  const filled = Math.round(remaining * width);
  const empty = width - filled;
  const color = getQuotaColor(remaining);
  const bar = `${color}${'█'.repeat(filled)}${ANSI.reset}${'░'.repeat(empty)}`;
  const pctNum = `${Math.round(remaining * 100)}%`.padStart(4);
  return `${bar} ${color}${pctNum}${ANSI.reset}`;
}

function formatResetTime(resetTime?: string): string {
  if (!resetTime) return '';
  const ms = Date.parse(resetTime) - Date.now();
  if (ms <= 0) return ' (resetting...)';

  const hours = ms / (1000 * 60 * 60);
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    if (remainingHours > 0) {
      return ` (resets in ${days}d ${remainingHours}h)`;
    }
    return ` (resets in ${days}d)`;
  }
  const totalMinutes = Math.floor(ms / (1000 * 60));
  const remainingMinutes = totalMinutes % 60;
  const fullHours = Math.floor(totalMinutes / 60);
  if (fullHours > 0) {
    return ` (resets in ${fullHours}h ${remainingMinutes}m)`;
  }
  return ` (resets in ${remainingMinutes}m)`;
}

export async function showQuotaScreen(accounts: QuotaScreenAccount[]): Promise<void> {
  const items: MenuItem<string>[] = [
    { label: '← Back to main menu', value: 'back', color: 'cyan' },
    { label: '', value: '', separator: true },
  ];

  for (const acc of accounts) {
    const disabledStr = acc.disabled ? ` ${ANSI.red}[disabled]${ANSI.reset}` : '';
    items.push({ label: `${acc.label}${disabledStr}`, value: `heading-${acc.label}`, kind: 'heading' });

    if (acc.error) {
      items.push({ label: `  ${ANSI.red}Error: ${acc.error}${ANSI.reset}`, value: `err-${acc.label}`, disabled: true });
      items.push({ label: '', value: '', separator: true });
      continue;
    }

    if (acc.antigravityModels.length > 0) {
      items.push({ label: `${ANSI.dim}Antigravity Quota:${ANSI.reset}`, value: `ag-hdr-${acc.label}`, kind: 'heading' });
      for (const m of acc.antigravityModels) {
        const bar = createProgressBar(m.remainingFraction);
        const reset = formatResetTime(m.resetTime);
        const name = m.name.padEnd(20);
        items.push({
          label: `  ${name} ${bar}${reset}`,
          value: `ag-${acc.label}-${m.name}`,
          disabled: true,
        });
      }
    }

    if (acc.geminiCliModels.length > 0) {
      items.push({ label: `${ANSI.dim}Gemini CLI Quota:${ANSI.reset}`, value: `cli-hdr-${acc.label}`, kind: 'heading' });
      for (const m of acc.geminiCliModels) {
        const bar = createProgressBar(m.remainingFraction);
        const reset = formatResetTime(m.resetTime);
        const name = m.name.padEnd(20);
        items.push({
          label: `  ${name} ${bar}${reset}`,
          value: `cli-${acc.label}-${m.name}`,
          disabled: true,
        });
      }
    }

    if (acc.antigravityModels.length === 0 && acc.geminiCliModels.length === 0) {
      items.push({ label: `  ${ANSI.dim}No quota available${ANSI.reset}`, value: `none-${acc.label}`, disabled: true });
    }

    items.push({ label: '', value: '', separator: true });
  }

  items.push({ label: '← Back to main menu', value: 'back', color: 'cyan' });

  await select(items, {
    message: 'Google Accounts Quota Overview',
    subtitle: 'Press Enter or Esc to return to main menu',
    clearScreen: true,
  });
}

export { isTTY } from './ansi';
