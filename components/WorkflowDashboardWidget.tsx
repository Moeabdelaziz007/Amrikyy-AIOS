

import React from 'react';
import { WorkflowIcon } from './Icons.tsx';
import { AppID } from '../types.ts';

/**
 * Props for the WorkflowDashboardWidget component.
 */
interface WorkflowDashboardWidgetProps {
    /**
     * Callback function to open an application by its ID.
     * @param {AppID} appId - The ID of the application to open.
     */
    onOpenApp: (appId: AppID) => void;
}

/**
 *