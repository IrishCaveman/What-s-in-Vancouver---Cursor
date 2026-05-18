export type SourceCategory =
  | 'Nightlife & Music'
  | 'Hospitality & Pubs'
  | 'Ticketing Platform'
  | 'Civic, Culture & Community'
  | 'Municipal & Regional';

export interface EventSourceTarget {
  id: string;
  name: string;
  venue?: string;
  url: string;
  category: SourceCategory;
  neighborhood?: string;
  extractionHints?: string[];
}

export const eventSourceTargets: EventSourceTarget[] = [
  {
    id: 'celebrities-nightclub',
    name: 'Celebrities Nightclub',
    venue: 'Celebrities Nightclub',
    url: 'https://www.celebritiesnightclub.com/events',
    category: 'Nightlife & Music',
    neighborhood: 'Davie Village'
  },
  {
    id: 'red-room-vancouver',
    name: 'Red Room Vancouver',
    venue: 'Red Room Vancouver',
    url: 'https://redroomvancouver.com/events/',
    category: 'Nightlife & Music',
    neighborhood: 'Downtown'
  },
  {
    id: 'commodore-ballroom',
    name: 'Commodore Ballroom',
    venue: 'Commodore Ballroom',
    url: 'https://www.livenation.com/venue/KovZpZAJ6vlA/commodore-ballroom-events',
    category: 'Nightlife & Music',
    neighborhood: 'Downtown'
  },
  {
    id: 'vogue-theatre',
    name: 'Vogue Theatre',
    venue: 'Vogue Theatre',
    url: 'https://www.voguetheatre.com/events/',
    category: 'Nightlife & Music',
    neighborhood: 'Downtown'
  },
  {
    id: 'hollywood-theatre',
    name: 'Hollywood Theatre',
    venue: 'Hollywood Theatre',
    url: 'https://www.hollywoodtheatre.ca/events',
    category: 'Nightlife & Music',
    neighborhood: 'Kitsilano'
  },
  {
    id: 'foys-irish-bar',
    name: "Foy's Irish Bar",
    venue: "Foy's Irish Bar",
    url: 'https://www.foysirishbar.com/',
    category: 'Hospitality & Pubs',
    neighborhood: 'Vancouver'
  },
  {
    id: 'good-co-bars',
    name: 'Good Co. Bars',
    venue: 'Good Co. Bars',
    url: 'https://goodcobars.com/events/',
    category: 'Hospitality & Pubs',
    neighborhood: 'Granville'
  },
  {
    id: 'ticketmaster-vancouver',
    name: 'Ticketmaster Vancouver Region',
    url: 'https://www.ticketmaster.ca/discover/concerts/vancouver',
    category: 'Ticketing Platform',
    neighborhood: 'Vancouver',
    extractionHints: ['Prefer Vancouver-region listings and use each event detail URL as ticket_link.']
  },
  {
    id: 'eventbrite-vancouver',
    name: 'Eventbrite Vancouver Region',
    url: 'https://www.eventbrite.ca/d/canada--vancouver/events/',
    category: 'Ticketing Platform',
    neighborhood: 'Vancouver'
  },
  {
    id: 'do604',
    name: 'Do604',
    url: 'https://do604.com/events',
    category: 'Ticketing Platform',
    neighborhood: 'Vancouver'
  },
  {
    id: 'vancouver-is-awesome-events',
    name: 'Vancouver Is Awesome Events',
    url: 'https://www.vancouverisawesome.com/local-events',
    category: 'Ticketing Platform',
    neighborhood: 'Vancouver'
  },
  {
    id: 'vancouver-civic-theatres',
    name: 'Vancouver Civic Theatres',
    url: 'https://www.vancouvercivictheatres.com/events/',
    category: 'Civic, Culture & Community',
    neighborhood: 'Downtown'
  },
  {
    id: 'science-world',
    name: 'Science World Events Calendar',
    venue: 'Science World',
    url: 'https://www.scienceworld.ca/events/',
    category: 'Civic, Culture & Community',
    neighborhood: 'False Creek'
  },
  {
    id: 'richmond-night-market',
    name: 'Richmond Night Market Schedule',
    venue: 'Richmond Night Market',
    url: 'https://richmondnightmarket.com/',
    category: 'Civic, Culture & Community',
    neighborhood: 'Richmond'
  },
  {
    id: 'eatlocal-farmers-markets',
    name: 'EatLocal Vancouver Farmers Markets',
    url: 'https://eatlocal.org/markets/',
    category: 'Civic, Culture & Community',
    neighborhood: 'Vancouver'
  },
  {
    id: 'got-craft-markets',
    name: 'Got Craft Markets',
    url: 'https://www.gotcraft.com/markets',
    category: 'Civic, Culture & Community',
    neighborhood: 'Vancouver'
  },
  {
    id: 'tedxvancouver',
    name: 'TEDxVancouver',
    venue: 'TEDxVancouver',
    url: 'https://tedxvancouver.ca/',
    category: 'Civic, Culture & Community',
    neighborhood: 'Vancouver'
  },
  {
    id: 'city-of-vancouver-events',
    name: 'City of Vancouver Events',
    url: 'https://vancouver.ca/news-calendar/calendar-of-events.aspx',
    category: 'Municipal & Regional',
    neighborhood: 'Vancouver'
  },
  {
    id: 'city-of-burnaby-events',
    name: 'City of Burnaby Events',
    url: 'https://www.burnaby.ca/recreation-and-arts/events',
    category: 'Municipal & Regional',
    neighborhood: 'Burnaby'
  },
  {
    id: 'coquitlam-events',
    name: 'Coquitlam Events',
    url: 'https://www.coquitlam.ca/calendar.aspx',
    category: 'Municipal & Regional',
    neighborhood: 'Coquitlam'
  },
  {
    id: 'port-moody-events',
    name: 'Port Moody Events',
    url: 'https://www.portmoody.ca/en/arts-culture-and-heritage/events.aspx',
    category: 'Municipal & Regional',
    neighborhood: 'Port Moody'
  },
  {
    id: 'new-westminster-events',
    name: 'New Westminster Events',
    url: 'https://www.newwestcity.ca/calendar-of-events',
    category: 'Municipal & Regional',
    neighborhood: 'New Westminster'
  },
  {
    id: 'destination-vancouver',
    name: 'Destination Vancouver',
    url: 'https://www.destinationvancouver.com/events/',
    category: 'Municipal & Regional',
    neighborhood: 'Vancouver'
  },
  {
    id: 'whistler-blackcomb',
    name: 'Whistler Blackcomb Regional Itineraries',
    url: 'https://www.whistlerblackcomb.com/explore-the-resort/activities-and-events/events.aspx',
    category: 'Municipal & Regional',
    neighborhood: 'Whistler'
  }
];
