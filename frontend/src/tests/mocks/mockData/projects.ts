export const mockProjects = [
  {
    id: 'project-1',
    userId: 'user-1',
    title: 'Product Explainer Video',
    description: 'A short explainer video for our SaaS product',
    status: 'completed',
    aspectRatio: '16:9',
    targetDuration: 60,
    styleData: {
      srefCode: 'style-001',
      keywords: ['professional', 'tech', 'clean'],
      colorPalette: ['#1F2937', '#3B82F6', '#F9FAFB']
    },
    screenplay: {
      concept: 'Explaining our product features in a simple way',
      sections: [
        {
          id: 'section-1',
          text: 'Introduction to the problem we solve',
          order: 0
        },
        {
          id: 'section-2',
          text: 'Presenting our solution',
          order: 1
        },
        {
          id: 'section-3',
          text: 'Key features overview',
          order: 2
        },
        {
          id: 'section-4',
          text: 'Benefits for the users',
          order: 3
        },
        {
          id: 'section-5',
          text: 'Call to action and conclusion',
          order: 4
        }
      ]
    },
    storyboard: [
      {
        id: 'storyboard-1',
        sectionId: 'section-1',
        imageUrl: 'https://example.com/storyboard-1.jpg',
        prompt: 'Business person looking frustrated at computer',
        cameraSettings: {
          movement: 'pan',
          duration: 5
        },
        order: 0
      },
      {
        id: 'storyboard-2',
        sectionId: 'section-2',
        imageUrl: 'https://example.com/storyboard-2.jpg',
        prompt: 'Product interface showing solution',
        cameraSettings: {
          movement: 'zoom',
          duration: 5
        },
        order: 1
      }
    ],
    production: {
      videoUrl: 'https://example.com/final-video.mp4',
      audioTracks: [
        {
          id: 'audio-1',
          type: 'music',
          url: 'https://example.com/background-music.mp3',
          settings: {
            volume: 0.7
          }
        },
        {
          id: 'audio-2',
          type: 'voiceover',
          url: 'https://example.com/voiceover.mp3',
          settings: {
            volume: 1.0
          }
        }
      ],
      exportSettings: {
        format: 'mp4',
        quality: 'high',
        resolution: '1080p'
      }
    },
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-02-20T14:45:00Z'
  },
  {
    id: 'project-2',
    userId: 'user-1',
    title: 'Social Media Promo',
    description: 'Short promotional video for Instagram',
    status: 'in-progress',
    aspectRatio: '1:1',
    targetDuration: 30,
    styleData: {
      srefCode: 'style-002',
      keywords: ['vibrant', 'young', 'energetic'],
      colorPalette: ['#EC4899', '#8B5CF6', '#06B6D4']
    },
    screenplay: {
      concept: 'Promoting our summer collection with vibrant colors',
      sections: [
        {
          id: 'section-1',
          text: 'Attention-grabbing opening',
          order: 0
        },
        {
          id: 'section-2',
          text: 'Product showcase',
          order: 1
        },
        {
          id: 'section-3',
          text: 'Customer testimonial',
          order: 2
        },
        {
          id: 'section-4',
          text: 'Special offer details',
          order: 3
        },
        {
          id: 'section-5',
          text: 'Call to action',
          order: 4
        }
      ]
    },
    storyboard: [
      {
        id: 'storyboard-1',
        sectionId: 'section-1',
        imageUrl: 'https://example.com/promo-storyboard-1.jpg',
        prompt: 'Vibrant summer scene with young people',
        cameraSettings: {
          movement: 'static',
          duration: 3
        },
        order: 0
      }
    ],
    production: null,
    createdAt: '2025-03-01T09:20:00Z',
    updatedAt: '2025-03-10T11:30:00Z'
  },
  {
    id: 'project-3',
    userId: 'user-1',
    title: 'Tutorial Video',
    description: 'How-to tutorial for new software features',
    status: 'draft',
    aspectRatio: '16:9',
    targetDuration: 120,
    styleData: {
      srefCode: 'style-003',
      keywords: ['educational', 'clear', 'helpful'],
      colorPalette: ['#0F172A', '#64748B', '#CBD5E1']
    },
    screenplay: {
      concept: 'Step-by-step guide to using our new features',
      sections: [
        {
          id: 'section-1',
          text: 'Introduction to the new features',
          order: 0
        },
        {
          id: 'section-2',
          text: 'Step 1: Accessing the features',
          order: 1
        },
        {
          id: 'section-3',
          text: 'Step 2: Basic configuration',
          order: 2
        },
        {
          id: 'section-4',
          text: 'Step 3: Advanced usage',
          order: 3
        },
        {
          id: 'section-5',
          text: 'Troubleshooting and conclusion',
          order: 4
        }
      ]
    },
    storyboard: null,
    production: null,
    createdAt: '2025-03-05T15:45:00Z',
    updatedAt: '2025-03-05T16:10:00Z'
  }
];
