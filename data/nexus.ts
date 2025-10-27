import { NexusPost } from '../types';

export const initialNexusPosts: NexusPost[] = [
    {
        id: 'nexus-post-1',
        author: 'User',
        osId: 'AMRIYY-OS-USER-7890', // User's OS ID
        content: {
            type: 'image',
            title: 'My First AI-Generated Image',
            subtitle: 'A robot holding a red skateboard.',
            cta: 'View Image',
            imageUrl: 'https://storage.googleapis.com/gweb-aip.appspot.com/experiments/mediapipe/cat_and_dog.jpg'
        },
        socialPost: {
            caption: 'Just created this awesome image with the Amrikyy AI OS! What do you think?',
            hashtags: ['#AIArt', '#ImageGeneration', '#FutureTech']
        },
        likes: 120,
        views: 850,
        comments: [
            { id: 'c1-1', authorName: 'Jane Doe', osId: 'JANE-OS-USER-1111', text: 'Looks amazing! What prompt did you use?', timestamp: Date.now() - 3600000 },
            { id: 'c1-2', authorName: 'John Smith', osId: 'JOHN-OS-USER-2222', text: 'So cool! Love the colors.', timestamp: Date.now() - 1800000 },
        ]
    },
    {
        id: 'nexus-post-2',
        author: 'Jane Doe',
        osId: 'JANE-OS-USER-1111',
        content: {
            type: 'travel_plan',
            title: 'AI-Powered Trip to Tokyo',
            subtitle: 'My AI-generated 5-day itinerary for Tokyo!',
            cta: 'See My Plan',
        },
        socialPost: {
            caption: 'Can\'t wait for my trip to Tokyo, all planned by my AI Travel Agent! #AITravel #Tokyo',
            hashtags: ['#AITravel', '#Tokyo', '#TravelPlan']
        },
        likes: 75,
        views: 500,
        comments: [
            { id: 'c2-1', authorName: 'User', osId: 'AMRIYY-OS-USER-7890', text: 'That sounds incredible! Enjoy your trip!', timestamp: Date.now() - 2400000 },
        ]
    },
    {
        id: 'nexus-post-3',
        author: 'John Smith',
        osId: 'JOHN-OS-USER-2222',
        content: {
            type: 'project',
            title: 'New AI Workflow for Devs',
            subtitle: 'Automating my coding tasks with a custom workflow in Amrikyy OS!',
            cta: 'Check Workflow',
        },
        socialPost: {
            caption: 'Boosted my productivity with this new AI workflow! Devs, you gotta try this! #AIWorkflow #DevLife',
            hashtags: ['#AIWorkflow', '#DevLife', '#Productivity']
        },
        likes: 230,
        views: 1500,
        comments: []
    },
    {
        id: 'nexus-post-4',
        author: 'AI Enthusiast',
        osId: 'AI-ENTH-USER-3333',
        content: {
            type: 'image',
            title: 'Futuristic Cityscape',
            subtitle: 'Imagining tomorrow\'s cities with AI.',
            cta: 'View Image',
            imageUrl: 'https://images.unsplash.com/photo-1582769923234-9279184589d8?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        },
        socialPost: {
            caption: 'The future is now! AI is truly changing how we envision our world. #FutureCities #AIImagine',
            hashtags: ['#FutureCities', '#AIImagine', '#TechArt']
        },
        likes: 450,
        views: 2800,
        comments: []
    }
];