import type { Scenario } from '../types/schemas';

export const SCENARIOS: Record<string, NonNullable<Scenario>> = {
  'mokolo-market': {
    id: 'mokolo-market',
    name: 'At Mokolo Market',
    icon: '🏪',
    description: 'Shopping for vegetables and negotiating prices at Yaoundé\'s largest market'
  },
  'moto-taxi': {
    id: 'moto-taxi',
    name: 'Taking a Moto-Taxi',
    icon: '🏍️',
    description: 'Getting transportation around the city and discussing routes with the driver'
  },
  'health-clinic': {
    id: 'health-clinic',
    name: 'Health Clinic Visit',
    icon: '🏥',
    description: 'Describing symptoms and understanding the doctor\'s instructions'
  },
  'job-interview': {
    id: 'job-interview',
    name: 'Job Interview',
    icon: '💼',
    description: 'Answering questions and discussing qualifications for an office position'
  },
  'school-enrollment': {
    id: 'school-enrollment',
    name: 'School Enrollment',
    icon: '🎓',
    description: 'Registering a child for school and meeting with the headmaster'
  }
};
