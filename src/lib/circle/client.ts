import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';

let circleClient: ReturnType<typeof initiateDeveloperControlledWalletsClient> | null = null;

export function getCircleClient() {
  if (!circleClient) {
    if (!process.env.CIRCLE_API_KEY || !process.env.CIRCLE_ENTITY_SECRET) {
      throw new Error('Missing Circle credentials. Set CIRCLE_API_KEY and CIRCLE_ENTITY_SECRET.');
    }
    circleClient = initiateDeveloperControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY,
      entitySecret: process.env.CIRCLE_ENTITY_SECRET,
    });
  }
  return circleClient;
}

/** Poll for transaction completion */
export async function waitForTransaction(
  txId: string,
  label: string = 'transaction',
  maxRetries: number = 30
): Promise<string> {
  const client = getCircleClient();
  for (let i = 0; i < maxRetries; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const { data } = await client.getTransaction({ id: txId });
    if (data?.transaction?.state === 'COMPLETE') {
      return data.transaction.txHash ?? '';
    }
    if (data?.transaction?.state === 'FAILED') {
      throw new Error(`${label} failed on-chain`);
    }
  }
  throw new Error(`${label} timed out after ${maxRetries * 2}s`);
}
