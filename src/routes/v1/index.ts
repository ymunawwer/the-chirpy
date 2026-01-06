import express, { Router } from 'express';
import authRoute from './auth.route';
import docsRoute from './swagger.route';
import userRoute from './user.route';
import permissionRoute from './permission.route';
import licenceRoute from './licence.route';
import config from '../../config/config';
import acharyaRoute from './acharya.route';
import contactsRoute from './contacts.route';
import eventsRoute from './events.route';
import callLogsRoute from './callLogs.route';
// import {verifyTokenMiddleware} from '../../modules/auth/test.service';
const router = express.Router();

interface IRoute {
  path: string;
  route: Router;
}

const defaultIRoute: IRoute[] = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/permission',
    route: permissionRoute,
  },
  {
    path: '/licence',
    route: licenceRoute,
  },
  {
    path: '/acharya',
    route: acharyaRoute,
  },
  {
    path: '/contacts',
    route: contactsRoute,
  },
  {
    path: '/events',
    route: eventsRoute,
  },
  {
    path: '/call-logs',
    route: callLogsRoute,
  },
];

const devIRoute: IRoute[] = [
  // IRoute available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultIRoute.forEach((route) => {
  router.use(route.path, route.route);
});
devIRoute.forEach((route) => {
  router.use(route.path, route.route);
});
/* istanbul ignore next */
if (config.env === 'development') {
  devIRoute.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
