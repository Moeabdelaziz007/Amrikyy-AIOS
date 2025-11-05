// This file will hold the definitions for all applications, making it easy to manage and lazy-load them.

// Example structure:
/*
import { lazy } from 'react';

export const appComponents = {
  DevConsole: {
    name: 'Dev Console',
    component: lazy(() => import('../../apps/devconsole/src/main')),
  },
  CreatorStudio: {
    name: 'Creator Studio',
    component: lazy(() => import('../../apps/creatorstudio/src/main')),
  },
  // ... more apps
};

export const APP_LIST = Object.keys(appComponents);
*/

export const appComponents = {};
export const APP_LIST: string[] = [];
