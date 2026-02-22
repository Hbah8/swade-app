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
