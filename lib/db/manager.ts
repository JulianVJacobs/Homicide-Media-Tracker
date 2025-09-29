import * as server from './server';
import * as client from './client';

const isServer = typeof window === 'undefined';

export const dbm = isServer ? server.dbm : client.dbm;
export const DatabaseManager = isServer ? server.DatabaseManagerServer : client.DatabaseManagerClient;
