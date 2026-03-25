import { db } from './db';

export async function getTargetSubscribers({ marketIds, zipCodes }: { marketIds: string[]; zipCodes?: string[] }) {
  return db.subscriber.findMany({
    where: {
      marketId: { in: marketIds },
      status: 'ACTIVE',
      consentStatus: 'ACTIVE',
      ...(zipCodes?.length ? { zipCode: { in: zipCodes } } : {}),
    },
    include: { preferences: true, market: true },
  });
}
