export interface ActorPayload {
  id: string;
  canonicalLabel: string;
  actorKind: string;
  aliases: string[];
}

export interface EventPayload {
  id: string;
  title: string;
  occurredOn: string | null;
  location: string | null;
}

export interface ClaimRecordPayload {
  id: string;
  eventId: string;
  recordType: 'homicide' | 'claim';
  summary: string;
}

export interface VictimPayload {
  id: string;
  eventId: string;
  name: string;
}

export interface PerpetratorPayload {
  id: string;
  eventId: string;
  name: string;
}

export interface ParticipantPayload {
  id: string;
  eventId: string;
  actorId: string;
  role: string;
}

export interface ListQuery {
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ListResult<TItem> {
  items: TItem[];
  total: number;
}

export interface ActorDomainService {
  list(query: ListQuery): Promise<ListResult<ActorPayload>>;
  create(input: Omit<ActorPayload, 'id'>): Promise<ActorPayload>;
}

export interface EventDomainService {
  list(query: ListQuery): Promise<ListResult<EventPayload>>;
  create(input: Omit<EventPayload, 'id'>): Promise<EventPayload>;
}

export interface ClaimDomainService {
  list(query: ListQuery): Promise<ListResult<ClaimRecordPayload>>;
  create(input: Omit<ClaimRecordPayload, 'id'>): Promise<ClaimRecordPayload>;
}

export interface VictimDomainService {
  list(query: ListQuery): Promise<ListResult<VictimPayload>>;
  create(input: Omit<VictimPayload, 'id'>): Promise<VictimPayload>;
}

export interface PerpetratorDomainService {
  list(query: ListQuery): Promise<ListResult<PerpetratorPayload>>;
  create(input: Omit<PerpetratorPayload, 'id'>): Promise<PerpetratorPayload>;
}

export interface ParticipantDomainService {
  list(query: ListQuery): Promise<ListResult<ParticipantPayload>>;
  create(input: Omit<ParticipantPayload, 'id'>): Promise<ParticipantPayload>;
}

export interface PluginDomainServices {
  actors: ActorDomainService;
  events: EventDomainService;
  claims: ClaimDomainService;
  victims: VictimDomainService;
  perpetrators: PerpetratorDomainService;
  participants: ParticipantDomainService;
}
