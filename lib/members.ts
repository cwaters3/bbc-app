export const MEMBERS = [
  'cwaters',
  'btaylor',
  'kjutkiewicz',
  'wrose',
  'asegoshi',
  'aadvani',
  'msebela',
  'dweimer',
  'tcourneen',
] as const;

export type Member = (typeof MEMBERS)[number];

export const HOST: Member = 'cwaters';

export function isMember(value: string): value is Member {
  return (MEMBERS as readonly string[]).includes(value);
}
