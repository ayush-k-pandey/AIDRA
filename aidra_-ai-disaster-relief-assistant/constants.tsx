
import { ZoneType, DisasterZone, EmergencyService, NewsUpdate, Language } from './types';

export const DISASTER_ZONES: DisasterZone[] = [
  {
    id: 'z1',
    name: 'Flood Risk Area A',
    type: ZoneType.RED,
    coordinates: [40.7128, -74.0060],
    radius: 2000,
    description: 'Critical flooding in progress. Immediate evacuation required.',
    instructions: [
      'Evacuate to designated shelters.',
      'Do not attempt to drive through flood waters.',
      'Switch off electricity and gas mains.'
    ]
  },
  {
    id: 'z2',
    name: 'Relief Hub B',
    type: ZoneType.YELLOW,
    coordinates: [40.7589, -73.9851],
    radius: 1500,
    description: 'Moderate risk. Active relief operations. Volunteers needed.',
    instructions: [
      'Masks required for all personnel.',
      'Donation drop-offs only at marked locations.',
      'Check in at the mobile command unit.'
    ]
  }
];

export const MOCK_SERVICES: EmergencyService[] = [
  {
    id: 's1',
    name: 'Metropolitan General Hospital',
    type: 'Hospital',
    distance: '1.2 km',
    contact: '+1 (555) 123-4567',
    address: '123 Health Ave, NY',
    lat: 40.730610,
    lng: -73.935242
  },
  {
    id: 's2',
    name: 'Central Police Station',
    type: 'Police',
    distance: '2.5 km',
    contact: '+1 (555) 987-6543',
    address: '45 Precinct Plaza, NY',
    lat: 40.7282,
    lng: -73.7949
  },
  {
    id: 's3',
    name: 'Harbor Shelter Center',
    type: 'Shelter',
    distance: '0.8 km',
    contact: '+1 (555) 000-1111',
    address: '88 Safe Haven St, NY',
    lat: 40.7831,
    lng: -73.9712
  }
];

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'hi', name: 'हिन्दी' }
];

export const EMERGENCY_CONTACTS = [
  { label: 'General Emergency', number: '911' },
  { label: 'Disaster Helpline', number: '1-800-456-HELP' },
  { label: 'Fire Department', number: '912' },
  { label: 'Medical Emergency', number: '913' }
];
