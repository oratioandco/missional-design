import data from '../data/app-library.json';
import deepDives from '../../public/api/deep-dives.json';
export const library = data;
export const apps = data.apps;
export const organisations = data.organisations;
export const screens = data.screens;
export const flows = data.flows;
export const appFor = (id: string) => apps.find(a => a.id === id)!;
export const organisationFor = (id: string) => organisations.find(o => o.id === id)!;
export const screenFor = (id: string) => screens.find(s => s.id === id)!;
export const screensFor = (appId: string) => screens.filter(s => s.app_id === appId);
export const dateLabel = (value: string) => new Date(value).toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
export const articleNames: Record<string,string> = {
  "ai-persona": "How human the assistant seems",
  "ai-spiritual-acts": "Spiritual acts and AI",
  "chat-scope": "What the assistant talks about",
  "check-ins-and-assessments": "Check-ins and assessments",
  "highlights-and-notes": "Highlights and notes",
  "meeting-the-person": "Meeting the person where they are",
  "prayer": "Prayer",
  "progress-and-streaks": "Progress and streaks",
  "reading-plans": "Reading plans",
  "speaking-as": "AI personas and roles",
  "whose-theology": "Whose theology"
};
const deepDiveTitles:Record<string,string>=Object.fromEntries(deepDives.deep_dives.map((d:any)=>[d.slug,d.title]));
export const articleTitle = (slug:string) => articleNames[slug] || deepDiveTitles[slug] || slug.split('-').map(x=>x[0].toUpperCase()+x.slice(1)).join(' ');
