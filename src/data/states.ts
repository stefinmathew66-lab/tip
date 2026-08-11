export interface StateData {
  slug: string;
  name: string;
  code: string;
  minWage: string;
  minWageEffectiveDate: string;
  tipCreditAllowed: boolean;
  tippedCashWage: string | null;
  tipCreditAmount: string | null;
  hasRegionalRates: boolean;
  sourceUrl: string;
  sourceName: string;
  lastVerified: string;
  specialNotes: string;
  seoTitle: string;
  seoDescription: string;
  contentTitle: string;
  paragraphs: string[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

export const states: StateData[] = [
  {
    slug: "california",
    name: "California",
    code: "CA",
    minWage: "16.90",
    minWageEffectiveDate: "2026-01-01",
    tipCreditAllowed: false,
    tippedCashWage: null,
    tipCreditAmount: null,
    hasRegionalRates: false,
    sourceUrl: "https://www.dir.ca.gov/",
    sourceName: "California Department of Industrial Relations",
    lastVerified: "2026-08-11",
    specialNotes: "No tip credit permitted under any circumstances. Many CA cities set their own higher local minimum wage (e.g. Los Angeles $17.87, San Diego $17.75, West Hollywood $20.25 as of 2026) — the highest applicable rate must be paid.",
    seoTitle: "California Tip Pooling Calculator (2026) — Free & Law-Aware | TipSplit",
    seoDescription: "Free tip pooling calculator for California restaurants. No tip credit allowed — see how that affects who can join your tip pool. Updated for 2026.",
    contentTitle: "California Tip Pooling Rules & Regulations (2026)",
    paragraphs: [
      "Under California Labor Code Section 351, all tips left for an employee are the sole property of that employee. Employers are strictly prohibited from taking any portion of employee tips, nor can they claim a 'tip credit' against their minimum wage obligations. This means every restaurant worker in California must be paid the full state minimum wage (or applicable local minimum wage) directly by the employer, before tips are added.",
      "As of January 1, 2026, the California statewide minimum wage is $16.90 per hour. This rate applies to all employers regardless of staff size. Many municipalities have set higher minimum rates, such as Los Angeles ($17.87), San Diego ($17.75), and West Hollywood ($20.25). Under the law, the highest applicable wage rate must always be paid to the employee.",
      "Because California prohibits tip credits, the federal restriction that blocks back-of-house (BOH) staff from joining tip pools does not apply. In California, kitchen staff like cooks, prep cooks, and dishwashers are legally allowed to participate in a tip pool alongside servers, runners, and bartenders, provided they are part of the 'chain of service.' However, managers, supervisors, and owners who act as agents of the employer are strictly excluded from participating in or receiving tips from any employee tip pool, even if they perform direct customer service duties."
    ],
    faqs: [
      {
        question: "Can California restaurants include kitchen staff (cooks, dishwashers) in a tip pool?",
        answer: "Generally yes. Unlike most states, California does not allow employers to take a tip credit, so the federal restriction that blocks back-of-house inclusion when a tip credit is claimed does not apply here. Tip pool participants still need to meaningfully contribute to the service customers receive, so confirm current guidance from the California Labor Commissioner's Office before including purely non-customer-facing roles."
      },
      {
        question: "Can a manager or supervisor ever participate in a California tip pool?",
        answer: "No. Under California Labor Code Section 351, managers, supervisors, and owners are strictly prohibited from keeping or receiving any part of a gratuity left for an employee. This applies even if the manager performs service tasks like bussing tables or running food during a busy shift."
      },
      {
        question: "What is the minimum wage for tipped employees in California in 2026?",
        answer: "Tipped employees in California must receive the full state minimum wage of $16.90 per hour (or the higher local minimum wage of their city/county), as California does not permit a tipped cash wage or tip credit."
      }
    ]
  },
  {
    slug: "texas",
    name: "Texas",
    code: "TX",
    minWage: "7.25",
    minWageEffectiveDate: "2009-07-24",
    tipCreditAllowed: true,
    tippedCashWage: "2.13",
    tipCreditAmount: "5.12",
    hasRegionalRates: false,
    sourceUrl: "https://www.twc.texas.gov/",
    sourceName: "Texas Workforce Commission",
    lastVerified: "2026-08-11",
    specialNotes: "Texas follows the federal FLSA baseline. Back-of-house (BOH) employees cannot participate in a tip pool if the employer claims a tip credit. Managers and supervisors cannot participate under any circumstances.",
    seoTitle: "Texas Tip Pooling Calculator (2026) — Free & Law-Aware | TipSplit",
    seoDescription: "Free tip pooling calculator for Texas restaurants. Uses the $2.13 cash wage baseline — see how tip credits restrict BOH inclusion. Updated for 2026.",
    contentTitle: "Texas Tip Pooling Rules & Regulations (2026)",
    paragraphs: [
      "Texas tip pooling regulations strictly adhere to the federal Fair Labor Standards Act (FLSA) guidelines. In Texas, the state minimum wage is aligned with the federal minimum wage of $7.25 per hour, which has been unchanged since 2009. Employers are allowed to claim a tip credit of up to $5.12 per hour, meaning they can pay tipped employees a direct cash wage of just $2.13 per hour, provided the employee receives enough tips to make up the difference.",
      "The use of a tip credit has a direct impact on who can participate in a restaurant's tip pool. When a Texas employer claims a tip credit to meet minimum wage requirements, only employees in 'customarily and regularly' tipped roles (typically front-of-house staff like servers, bartenders, hosts, and bussers) can be included in the tip pool. Back-of-house (BOH) employees like cooks and dishwashers must be excluded.",
      "To legally include BOH staff in a Texas tip pool, the employer must pay all participating employees the full minimum wage of $7.25 per hour (with no tip credit claimed). Regardless of whether a tip credit is claimed, managers and supervisors are strictly barred from participating in or receiving tips from any employee tip pool."
    ],
    faqs: [
      {
        question: "Since Texas allows a tip credit, does that limit who can be in the tip pool?",
        answer: "Yes. If a Texas restaurant claims a tip credit (paying the lower tipped minimum wage of $2.13/hr), federal law prohibits including back-of-house staff like cooks and dishwashers in the pool. To legally include kitchen staff, the employer must pay the full Texas minimum wage of $7.25/hr with no tip credit taken."
      },
      {
        question: "Can managers in Texas participate in a tip pool if they run food?",
        answer: "No. Under both Texas state law and federal FLSA guidelines, managers and supervisors can never participate in or receive tips from a tip pool, even if they are doing hands-on tipped work during a busy shift."
      },
      {
        question: "What is the tipped minimum wage in Texas for 2026?",
        answer: "Tipped employees in Texas can be paid a minimum cash wage of $2.13 per hour, provided their tips plus cash wage equal at least the state minimum wage of $7.25 per hour. If they do not, the employer must pay the difference."
      }
    ]
  },
  {
    slug: "new-york",
    name: "New York",
    code: "NY",
    minWage: "16.00",
    minWageEffectiveDate: "2026-01-01",
    tipCreditAllowed: true,
    tippedCashWage: "11.35",
    tipCreditAmount: "5.65",
    hasRegionalRates: true,
    sourceUrl: "https://dol.ny.gov/minimum-wage-tipped-workers",
    sourceName: "New York State Department of Labor",
    lastVerified: "2026-08-11",
    specialNotes: "New York enforces a regional split. Downstate (NYC, Long Island, Westchester) minimum wage is $17.00/hr, with food service cash wage of $11.35/hr and $5.65 tip credit. Upstate (rest of NY) minimum wage is $16.00/hr, with food service cash wage of $10.70/hr and $5.30 tip credit. NY also enforces strict FOH-only rules for tip sharing, generally excluding BOH staff.",
    seoTitle: "New York Tip Pooling Calculator (2026) — Free & Law-Aware | TipSplit",
    seoDescription: "Free tip pooling calculator for New York restaurants. Handles Downstate ($17.00) and Upstate ($16.00) rules and FOH-only restrictions. Updated for 2026.",
    contentTitle: "New York Tip Pooling Rules & Regulations (2026)",
    paragraphs: [
      "New York State governs tip pooling under the strict provisions of the NYS Department of Labor's Hospitality Wage Order. NY has a unique regional split that affects minimum wage calculations. As of January 1, 2026, Downstate (New York City, Long Island, and Westchester) minimum wage is $17.00 per hour, while Upstate (the rest of the state) is $16.00 per hour. The tip credits and tipped cash wages also vary by region and by role type (food service vs. service employee).",
      "For food service workers (e.g. servers and bartenders), the Downstate tipped cash wage is $11.35 per hour with a $5.65 tip credit, while the Upstate tipped cash wage is $10.70 per hour with a $5.30 tip credit. For service employees (e.g. delivery workers, coat checks), different rates apply, such as a Downstate cash wage of $14.15 per hour and a $2.85 tip credit.",
      "Additionally, New York has some of the nation's strictest rules regarding who can participate in a tip pool. Under the Hospitality Wage Order, tip pooling and tip sharing are restricted strictly to front-of-house employees in direct customer service roles. Back-of-house staff (such as cooks, dishwashers, and food prep workers) are generally excluded from participating in tip pools or tip shares under NY law, regardless of whether a tip credit is claimed. Managers, supervisors, and owners are strictly prohibited from participating in any tip pool."
    ],
    faqs: [
      {
        question: "Are there differences in tip pooling rules between New York City and the rest of the state?",
        answer: "The core eligibility rules are generally consistent statewide, but minimum wage and tip credit amounts differ by region. Under New York's Hospitality Wage Order, Downstate (NYC, Long Island, Westchester) has a minimum wage of $17.00/hr, while Upstate (the rest of NY) is $16.00/hr. This regional split directly affects the tipped cash wage and tip credit amounts used in your calculations."
      },
      {
        question: "Can kitchen staff in New York participate in a tip pool?",
        answer: "Generally no. New York state law enforces strict FOH-only rules for tip sharing and tip pooling. Back-of-house staff (like cooks, dishwashers, and food preppers) are excluded from sharing in employee tips, even if the employer pays full minimum wage with no tip credit."
      },
      {
        question: "What is a food service worker in New York?",
        answer: "Under the NYS Hospitality Wage Order, a food service worker is an employee who primarily serves food or beverages to customers and customarily receives tips, such as a server, bartender, or busser."
      }
    ]
  },
  {
    slug: "florida",
    name: "Florida",
    code: "FL",
    minWage: "14.00",
    minWageEffectiveDate: "2025-09-30",
    tipCreditAllowed: true,
    tippedCashWage: "10.98",
    tipCreditAmount: "3.02",
    hasRegionalRates: false,
    sourceUrl: "https://www.floridajobs.org/",
    sourceName: "Florida Commerce",
    lastVerified: "2026-08-11",
    specialNotes: "Florida has a scheduled minimum wage increase. Through September 29, 2026, the minimum wage is $14.00/hr, with a tipped cash wage of $10.98/hr. Starting September 30, 2026, the minimum wage rises to $15.00/hr and the tipped cash wage rises to $11.98/hr. The tip credit remains fixed at $3.02/hr.",
    seoTitle: "Florida Tip Pooling Calculator (2026) — Free & Law-Aware | TipSplit",
    seoDescription: "Free tip pooling calculator for Florida restaurants. Handles the $14.00 wage, rising to $15.00 on Sept 30, 2026. Includes compliance rules. Updated for 2026.",
    contentTitle: "Florida Tip Pooling Rules & Regulations (2026)",
    paragraphs: [
      "Florida tip pooling regulations are defined by both the federal FLSA and the Florida Constitution (Amendment 2), which outlines scheduled minimum wage increases. Through September 29, 2026, Florida's minimum wage is $14.00 per hour. On September 30, 2026, the rate rises to $15.00 per hour. Florida allows employers to claim a maximum tip credit of $3.02 per hour, meaning the direct tipped cash wage is $10.98 per hour, rising to $11.98 per hour starting September 30, 2026.",
      "Because Florida allows a tip credit, employers must be very careful when designing their tip pool. Under federal and Florida regulations, if an employer claims a tip credit to meet minimum wage requirements, back-of-house (BOH) staff like cooks and dishwashers cannot participate in the tip pool. The pool must be restricted to customarily tipped front-of-house (FOH) roles.",
      "If a Florida employer pays all employees full Florida minimum wage ($14.00 or $15.00 depending on the date) without claiming any tip credit, BOH staff can legally participate in the tip pool under federal FLSA guidelines. Regardless of the setup, managers, owners, and supervisors can never participate in or take money from an employee tip pool."
    ],
    faqs: [
      {
        question: "Since Florida's minimum wage is different from the federal minimum, how does that affect the tip credit?",
        answer: "Florida employers taking a tip credit must ensure a tipped employee's cash wage plus tips reaches Florida's minimum wage ($14.00 or $15.00) rather than the lower federal minimum. Because Florida's minimum wage increases annually on September 30, the tipped cash wage also rises, while the tip credit remains fixed at $3.02/hr."
      },
      {
        question: "When does Florida's minimum wage rise to $15.00 per hour?",
        answer: "Florida's minimum wage is scheduled to increase to $15.00 per hour on September 30, 2026. At that time, the tipped cash wage will rise from $10.98 per hour to $11.98 per hour, and the tip credit will remain at $3.02 per hour."
      },
      {
        question: "Can a Florida restaurant include prep cooks in a tip pool?",
        answer: "Only if the restaurant pays full Florida minimum wage ($14.00/hr, rising to $15.00/hr) to all tipped staff with no tip credit claimed. If the employer pays the tipped minimum wage of $10.98/hr ($11.98/hr after Sept 30), prep cooks are excluded."
      }
    ]
  }
];
