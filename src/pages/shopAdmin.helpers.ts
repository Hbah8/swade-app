/**
 * Sync current admin state to server and open read-only player shop view.
 */
export async function openPlayerView(
  syncToServer: () => Promise<boolean>,
  navigate: (to: string) => void,
  locationId: string,
): Promise<void> {
  const didSync = await syncToServer();
  if (!didSync) {
    return;
  }

  navigate(`/shop/${locationId}`);
}

export async function copyTextToClipboard(value: string): Promise<boolean> {
  if (!value) {
    return false;
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Continue to fallback copy strategy.
    }
  }

  if (typeof document === 'undefined') {
    return false;
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);

  textarea.select();
  const successful = typeof document.execCommand === 'function' ? document.execCommand('copy') : false;

  document.body.removeChild(textarea);
  return successful;
}
