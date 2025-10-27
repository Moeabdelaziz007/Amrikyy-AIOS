import { CreatorBounty } from '../types';

export const bounties: CreatorBounty[] = [
    {
        id: 'bounty-1',
        title: 'Share Your First Creation',
        description: 'Generate an image, video, or travel plan and share it to the Creator Spotlight.',
        creditReward: 250,
        action: {
            type: 'share_content'
        }
    },
    {
        id: 'bounty-2',
        title: 'Forge Your First Agent',
        description: 'Use the Agent Forge to design and deploy your very first custom AI agent.',
        creditReward: 300,
        action: {
            type: 'create_agent'
        }
    },
    {
        id: 'bounty-3',
        title: 'Explore the Hub',
        description: 'Open the new Resource Hub to discover tools and libraries.',
        creditReward: 50,
        action: {
            type: 'open_app',
            appId: 'resourceHub'
        }
    },
    {
        id: 'bounty-4',
        title: 'Weave a Prompt',
        description: 'Create and run your first multi-step prompt in the Prompt Weaver.',
        creditReward: 150,
        action: {
            type: 'open_app',
            // FIX: Corrected AppID from non-existent 'promptWeaver' to 'workflow' which matches the description.
            appId: 'workflow'
        }
    },
];