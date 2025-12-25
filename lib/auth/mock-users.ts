import type { UserProfile } from '@/types';

export type MockUser = {
  email: string;
  password: string;
  profile: UserProfile;
};

export const MOCK_USERS: MockUser[] = [
  {
    email: 'rm_user@nuvama.com',
    password: 'cockpit2025',
    profile: {
      id: 'rm-001',
      name: 'Rajesh Kumar',
      email: 'rm_user@nuvama.com',
      role: 'rm',
      rmId: 'RM-MUM-001',
      photoUrl: undefined,
    },
  },
  {
    email: 'exec_user@nuvama.com',
    password: 'cockpit2025',
    profile: {
      id: 'exec-001',
      name: 'Amit Saxena',
      email: 'exec_user@nuvama.com',
      role: 'executive',
      territories: ['Mumbai', 'Delhi', 'Bangalore'],
      teamIds: ['team-west', 'team-north', 'team-south'],
      photoUrl: undefined,
    },
  },
];
