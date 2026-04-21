import { registerPluginRoutes } from '../routes/register-plugin-routes';
import { PluginScaffold } from '../scaffold/plugin-scaffold';
import type {
  ActorPayload,
  ClaimRecordPayload,
  EventPayload,
  PerpetratorPayload,
  ParticipantPayload,
  PluginDomainServices,
  VictimPayload,
} from '../contracts/plugin-api-contract';

const createListService = <T extends { id: string }>(
  seed: T,
  createShape: (input: Omit<T, 'id'>) => T,
) => ({
  list: jest.fn(async () => ({ items: [seed], total: 1 })),
  create: jest.fn(async (input: Omit<T, 'id'>) => createShape(input)),
});

describe('plugin API contract routes', () => {
  const actorSeed: ActorPayload = {
    id: 'actor-1',
    canonicalLabel: 'Jane Doe',
    actorKind: 'person',
    aliases: ['J. Doe'],
  };
  const eventSeed: EventPayload = {
    id: 'event-1',
    title: 'Case event',
    occurredOn: '2026-01-01',
    location: 'Johannesburg',
  };
  const claimSeed: ClaimRecordPayload = {
    id: 'claim-1',
    eventId: 'event-1',
    recordType: 'homicide',
    summary: 'Victim found at location',
  };
  const victimSeed: VictimPayload = {
    id: 'victim-1',
    eventId: 'event-1',
    name: 'Victim Name',
  };
  const perpetratorSeed: PerpetratorPayload = {
    id: 'perp-1',
    eventId: 'event-1',
    name: 'Perp Name',
  };
  const participantSeed: ParticipantPayload = {
    id: 'participant-1',
    eventId: 'event-1',
    actorId: 'actor-1',
    role: 'witness',
  };

  const services: PluginDomainServices = {
    actors: createListService(actorSeed, (input) => ({ id: 'actor-2', ...input })),
    events: createListService(eventSeed, (input) => ({ id: 'event-2', ...input })),
    claims: createListService(claimSeed, (input) => ({ id: 'claim-2', ...input })),
    victims: createListService(victimSeed, (input) => ({ id: 'victim-2', ...input })),
    perpetrators: createListService(perpetratorSeed, (input) => ({
      id: 'perp-2',
      ...input,
    })),
    participants: createListService(participantSeed, (input) => ({
      id: 'participant-2',
      ...input,
    })),
  };

  const scaffold = new PluginScaffold();
  registerPluginRoutes(scaffold, services);

  it.each([
    ['/actors', actorSeed],
    ['/events', eventSeed],
    ['/claims', claimSeed],
    ['/victims', victimSeed],
    ['/perpetrators', perpetratorSeed],
    ['/participants', participantSeed],
  ] as const)('GET %s returns list contract shape', async (path, expectedItem) => {
    const response = await scaffold.dispatch('GET', path, {
      query: { limit: '10', offset: '0' },
      auth: { userId: 'user-1' },
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        items: [expectedItem],
        total: 1,
      },
    });
  });

  it.each([
    ['/actors', { canonicalLabel: 'New Actor', actorKind: 'person', aliases: [] }],
    ['/events', { title: 'New Event', occurredOn: null, location: null }],
    [
      '/claims',
      { eventId: 'event-1', recordType: 'claim', summary: 'Claim summary' },
    ],
    ['/victims', { eventId: 'event-1', name: 'New Victim' }],
    ['/perpetrators', { eventId: 'event-1', name: 'New Perpetrator' }],
    [
      '/participants',
      { eventId: 'event-1', actorId: 'actor-1', role: 'observer' },
    ],
  ] as const)('POST %s returns entity contract shape', async (path, input) => {
    const response = await scaffold.dispatch('POST', path, {
      body: input,
      auth: { userId: 'user-1' },
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        id: expect.any(String),
        ...input,
      },
    });
  });
});
