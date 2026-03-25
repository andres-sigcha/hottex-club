import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction([
    prisma.clickEvent.deleteMany(),
    prisma.redemptionEvent.deleteMany(),
    prisma.messageEvent.deleteMany(),
    prisma.campaignRecipient.deleteMany(),
    prisma.campaign.deleteMany(),
    prisma.deal.deleteMany(),
    prisma.subscriberPreference.deleteMany(),
    prisma.consentLog.deleteMany(),
    prisma.subscriber.deleteMany(),
    prisma.restaurant.deleteMany(),
    prisma.market.deleteMany(),
    prisma.setting.deleteMany(),
    prisma.adminUser.deleteMany(),
  ]);

  const passwordHash = await bcrypt.hash('admin123!', 10);
  await prisma.adminUser.create({
    data: { email: 'admin@hottext.club', name: 'HotText Admin', passwordHash },
  });

  await prisma.setting.create({
    data: {
      quietHoursStart: 21,
      quietHoursEnd: 8,
      optInTemplate: 'Reply YES to confirm HotText Club deals. Msg frequency varies. Msg&data rates may apply. Reply STOP to opt out, HELP for help.',
      welcomeTemplate: 'Welcome to HotText Club! You\'re in for local restaurant deals. Reply STOP to opt out, HELP for help.',
      helpTemplate: 'HotText Club: Daily local restaurant deals. Reply STOP to unsubscribe.',
      stopTemplate: 'You are unsubscribed from HotText Club. Reply START to re-subscribe.',
      twilioFromNumber: '+16025550000',
    },
  });

  const markets = await Promise.all([
    prisma.market.create({ data: { city: 'Phoenix', cluster: 'West Phoenix', slug: 'west-phoenix' } }),
    prisma.market.create({ data: { city: 'Phoenix', cluster: 'Central Phoenix', slug: 'central-phoenix' } }),
    prisma.market.create({ data: { city: 'Scottsdale', cluster: 'Scottsdale', slug: 'scottsdale' } }),
    prisma.market.create({ data: { city: 'Glendale', cluster: 'Glendale', slug: 'glendale' } }),
    prisma.market.create({ data: { city: 'Peoria', cluster: 'Peoria/Surprise', slug: 'peoria-surprise' } }),
  ]);

  const restaurantsData = [
    ['Sonoran Smash Grill', 'Glendale', '85301', 'Burgers'],
    ['Cactus Taco Works', 'Phoenix', '85017', 'Mexican'],
    ['Desert Bowl Kitchen', 'Scottsdale', '85251', 'Healthy'],
    ['Copper State Pizza Co', 'Peoria', '85345', 'Pizza'],
    ['Canal Street Shawarma', 'Phoenix', '85014', 'Mediterranean'],
    ['Sunset Noodle House', 'Surprise', '85374', 'Asian'],
    ['Agave Brunch Bar', 'Scottsdale', '85260', 'Brunch'],
    ['Camelback BBQ', 'Phoenix', '85018', 'BBQ'],
    ['Westgate Chicken Lab', 'Glendale', '85305', 'Chicken'],
    ['Saguaro Salad Club', 'Peoria', '85382', 'Salads'],
  ];

  const restaurants = await Promise.all(
    restaurantsData.map((r, i) =>
      prisma.restaurant.create({
        data: {
          name: r[0],
          city: r[1],
          zipCode: r[2],
          cuisine: r[3],
          address1: `${100 + i} Main St`,
          contactName: `Manager ${i + 1}`,
          contactEmail: `manager${i + 1}@example.com`,
          contactPhone: `+16025550${(100 + i).toString().slice(-3)}`,
          marketId: markets[i % markets.length].id,
        },
      })
    )
  );

  const cuisines = ['Mexican', 'Pizza', 'Burgers', 'Mediterranean', 'BBQ', 'Healthy'];
  const diets = ['none', 'vegan', 'gluten-free', 'keto'];

  const subscribers = [];
  for (let i = 0; i < 32; i++) {
    const market = markets[i % markets.length];
    const sub = await prisma.subscriber.create({
      data: {
        phone: `+1480555${(1000 + i).toString().slice(-4)}`,
        zipCode: ['85017', '85014', '85251', '85301', '85382'][i % 5],
        neighborhood: ['Downtown', 'Arcadia', 'Old Town', 'Westgate', 'Arrowhead'][i % 5],
        source: ['meta-ads', 'restaurant-flyer', 'organic', 'qr-poster'][i % 4],
        consentStatus: 'ACTIVE',
        status: i % 11 === 0 ? 'UNSUBSCRIBED' : 'ACTIVE',
        optedInAt: new Date(Date.now() - i * 86400000),
        confirmedAt: new Date(Date.now() - i * 86400000 + 300000),
        unsubscribedAt: i % 11 === 0 ? new Date(Date.now() - i * 3600000) : null,
        marketId: market.id,
        totalMessagesSent: Math.floor(Math.random() * 12),
        totalClicks: Math.floor(Math.random() * 6),
        totalRedemptions: Math.floor(Math.random() * 3),
      },
    });
    subscribers.push(sub);

    await prisma.subscriberPreference.create({
      data: {
        subscriberId: sub.id,
        cuisine: cuisines[i % cuisines.length],
        dietary: diets[i % diets.length],
      },
    });

    await prisma.consentLog.create({
      data: {
        subscriberId: sub.id,
        eventType: 'DOUBLE_OPT_IN_CONFIRMED',
        message: 'Subscriber replied YES to confirm.',
        source: sub.source,
      },
    });
  }

  const deals = [];
  for (let i = 0; i < 12; i++) {
    const deal = await prisma.deal.create({
      data: {
        title: `Deal ${i + 1}: ${['BOGO tacos', '2-for-1 bowls', '$8 lunch combo', 'Free dessert'][i % 4]}`,
        shortOfferText: `Limited-time local offer #${i + 1}`,
        redemptionType: ['SHARED_CODE', 'QR_PAGE', 'SHOW_TEXT', 'UNIQUE_CODE'][i % 4],
        redemptionInstructions: 'Show this text or landing page to cashier before payment.',
        sharedPromoCode: i % 4 === 0 ? `HOT${100 + i}` : null,
        uniqueCouponPrefix: i % 4 === 3 ? `UNI${i}` : null,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 5 * 86400000),
        status: i < 4 ? 'SENT' : 'DRAFT',
        restaurantId: restaurants[i % restaurants.length].id,
        markets: { connect: [{ id: markets[i % markets.length].id }] },
      },
    });
    deals.push(deal);
  }

  for (let i = 0; i < 6; i++) {
    const campaign = await prisma.campaign.create({
      data: {
        name: `Phoenix Lunch Push ${i + 1}`,
        smsBody: `HotText: ${deals[i].title}. Tap {{link}}. Reply STOP to opt out.`,
        status: i < 3 ? 'SENT' : 'DRAFT',
        sentAt: i < 3 ? new Date(Date.now() - i * 7200000) : null,
        dealId: deals[i].id,
      },
    });

    const recipients = subscribers.filter((s) => s.marketId === markets[i % markets.length].id).slice(0, 8);

    for (const recipient of recipients) {
      const sent = i < 3;
      await prisma.campaignRecipient.create({
        data: {
          campaignId: campaign.id,
          subscriberId: recipient.id,
          status: sent ? 'sent' : 'queued',
          sentAt: sent ? new Date(Date.now() - i * 7200000) : null,
        },
      });

      if (sent) {
        await prisma.messageEvent.create({
          data: {
            campaignId: campaign.id,
            subscriberId: recipient.id,
            direction: 'OUTBOUND',
            type: 'CAMPAIGN',
            body: campaign.smsBody,
            status: 'sent',
            fromNumber: '+16025550000',
            toNumber: recipient.phone,
          },
        });
      }
    }
  }

  console.log('Seed completed');
}

main().finally(async () => prisma.$disconnect());
