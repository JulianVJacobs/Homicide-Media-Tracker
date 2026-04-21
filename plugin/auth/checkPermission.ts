import type { PluginAuthContext } from '../contracts/http';

export const checkPermission = async (
  _authContext: PluginAuthContext | undefined,
  _permission: string,
): Promise<boolean> => true;
