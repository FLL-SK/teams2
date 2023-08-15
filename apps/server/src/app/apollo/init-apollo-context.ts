import { ExpressContextFunctionArgument } from '@apollo/server/express4';
import { userRepository } from '../models';
import { UserGuard } from '../utils/user-guard';
import {
  ApolloContext,
  ApolloContextDataSources,
  apolloContextEmpty,
  AuthProfileData,
} from './apollo-context';
import {
  EventDataSource,
  FileDataSource,
  InvoiceItemDataSource,
  NoteDataSource,
  ProgramDataSource,
  RegistrationDataSource,
  SettingsDataSource,
  TagDataSource,
  TeamDataSource,
  UserDataSource,
} from './datasources';
import { logger } from '@teams2/logger';
import { AuthUser } from '@teams2/auth-node';

interface ExpressContextFunctionArgumentWithUser extends ExpressContextFunctionArgument {
  req: ExpressContextFunctionArgument['req'] & {
    user?: AuthUser;
    auth?: AuthUser;
  };
}

export async function initApolloContext(cfg: ExpressContextFunctionArgumentWithUser) {
  const { req } = cfg;

  if (!req.user) {
    //debug('No req.user, returning empty context');
    logger('apollo').error('No req.user, returning empty context');
    return { ...apolloContextEmpty };
  }

  const profileData: AuthProfileData = {
    email: req.user?.username ?? '',
  };

  const user = await userRepository.findActiveByUsername(profileData.email);
  if (!user) {
    logger('apollo').error('User not found in DB, returning empty context');
    return { ...apolloContextEmpty };
  }

  const context: ApolloContext = {
    user: { ...user.toObject() },
    userGuard: new UserGuard(user),
    userTimeZone: 'Europe/Bratislava',
    authProfileData: profileData,
  };

  const ds: ApolloContextDataSources = {
    user: new UserDataSource({ context }),
    event: new EventDataSource({ context }),
    team: new TeamDataSource({ context }),
    program: new ProgramDataSource({ context }),
    invoice: new InvoiceItemDataSource({ context }),
    file: new FileDataSource({ context }),
    registration: new RegistrationDataSource({ context }),
    tag: new TagDataSource({ context }),
    note: new NoteDataSource({ context }),
    settings: new SettingsDataSource({ context }),
  };

  context.dataSources = ds;

  return context;
}
