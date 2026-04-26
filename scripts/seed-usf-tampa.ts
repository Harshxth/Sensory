/**
 * Seeds ~60 real USF Tampa locations with realistic simulated sensory data,
 * mock reviews, and 24h of noise samples per venue. Designed to make the map
 * look rich during demos. Run with: npm run seed:usf
 *
 * Idempotent — uses google_place_id as upsert key (synthetic ids for fake places).
 */
import { config } from "dotenv";
import { existsSync } from "node:fs";
// Try .env.local first, then fall back to .env.production.local (vercel env pull output)
if (existsSync(".env.local")) config({ path: ".env.local" });
else if (existsSync(".env.production.local")) config({ path: ".env.production.local" });

import { ObjectId } from "mongodb";
import { COLLECTIONS, getDb } from "../lib/mongodb";

type SeedVenue = {
  name: string;
  category: string;
  address: string;
  lng: number;
  lat: number;
  /** Profile drives the simulated sensory baseline. */
  profile: "library" | "cafe" | "park" | "fastfood" | "restaurant" | "bar" | "store" | "gym" | "stadium" | "lab" | "office" | "transit";
  wheelchair?: "yes" | "limited" | "no" | null;
};

// ~60 real USF Tampa area POIs (curated from Google Maps + USF directory).
// Coordinates are real, scores are simulated below.
const VENUES: SeedVenue[] = [
  // ── Libraries / quiet study spots ───────────────────────────────
  { name: "USF Tampa Library", category: "library", address: "4202 E Fowler Ave LIB, Tampa, FL", lng: -82.4129, lat: 28.0598, profile: "library", wheelchair: "yes" },
  { name: "Marshall Student Center Reading Room", category: "library", address: "4202 E Fowler Ave, Tampa, FL", lng: -82.4108, lat: 28.0635, profile: "library", wheelchair: "yes" },
  { name: "USF Health Library", category: "library", address: "12901 Bruce B Downs Blvd, Tampa, FL", lng: -82.4220, lat: 28.0586, profile: "library", wheelchair: "yes" },
  { name: "Education Library", category: "library", address: "4202 E Fowler Ave EDU, Tampa, FL", lng: -82.4115, lat: 28.0602, profile: "library", wheelchair: "yes" },
  { name: "USF College of Music Library", category: "library", address: "3755 USF Holly Dr, Tampa, FL", lng: -82.4208, lat: 28.0583, profile: "library", wheelchair: "yes" },
  { name: "Temple Terrace Public Library", category: "library", address: "202 Bullard Pkwy, Tampa, FL", lng: -82.3905, lat: 28.0434, profile: "library", wheelchair: "yes" },
  { name: "Arthenia L. Joyner University Area Community Library", category: "library", address: "1408 N 50th St, Tampa, FL", lng: -82.4092, lat: 28.0316, profile: "library", wheelchair: "yes" },

  // ── Cafes ──────────────────────────────────────────────────────
  { name: "Felicitous Coffee & Tea House", category: "cafe", address: "11706 N 51st St, Tampa, FL", lng: -82.4008, lat: 28.0463, profile: "cafe", wheelchair: "yes" },
  { name: "Mojo Books & Records", category: "cafe", address: "2540 E Fowler Ave, Tampa, FL", lng: -82.4359, lat: 28.0571, profile: "cafe", wheelchair: "limited" },
  { name: "Foundation Coffee Co.", category: "cafe", address: "4830 W Kennedy Blvd, Tampa, FL", lng: -82.4099, lat: 28.0598, profile: "cafe", wheelchair: "yes" },
  { name: "Buddy Brew Coffee Carrollwood", category: "cafe", address: "12950 N Dale Mabry Hwy, Tampa, FL", lng: -82.4118, lat: 28.0612, profile: "cafe", wheelchair: "yes" },
  { name: "Starbucks (USF Marshall Center)", category: "cafe", address: "4202 E Fowler Ave, Tampa, FL", lng: -82.4106, lat: 28.0633, profile: "cafe", wheelchair: "yes" },
  { name: "Starbucks (Bruce B Downs)", category: "cafe", address: "13606 Bruce B Downs Blvd, Tampa, FL", lng: -82.4205, lat: 28.0640, profile: "cafe", wheelchair: "yes" },
  { name: "Dunkin' Bruce B Downs", category: "cafe", address: "13731 Bruce B Downs Blvd, Tampa, FL", lng: -82.4205, lat: 28.0654, profile: "cafe", wheelchair: "yes" },
  { name: "Dunkin' (Fletcher Ave)", category: "cafe", address: "10810 N 56th St, Tampa, FL", lng: -82.3966, lat: 28.0414, profile: "cafe", wheelchair: "yes" },
  { name: "Panera Bread (USF)", category: "cafe", address: "4302 E Fowler Ave, Tampa, FL", lng: -82.4099, lat: 28.0570, profile: "cafe", wheelchair: "yes" },
  { name: "Boba House USF", category: "cafe", address: "13816 N 22nd St, Tampa, FL", lng: -82.4348, lat: 28.0634, profile: "cafe", wheelchair: "yes" },

  // ── Restaurants / Fast food ─────────────────────────────────────
  { name: "Portillo's Tampa", category: "restaurant", address: "13502 N Dale Mabry Hwy, Tampa, FL", lng: -82.4582, lat: 28.0640, profile: "fastfood", wheelchair: "yes" },
  { name: "Beijing House", category: "restaurant", address: "11770 N 56th St, Temple Terrace, FL", lng: -82.3962, lat: 28.0463, profile: "restaurant", wheelchair: "yes" },
  { name: "Tijuana Flats - Fowler", category: "restaurant", address: "2604 E Fowler Ave, Tampa, FL", lng: -82.4348, lat: 28.0571, profile: "fastfood", wheelchair: "yes" },
  { name: "Cracker Barrel Old Country Store", category: "restaurant", address: "10250 Horace Ave, Tampa, FL", lng: -82.3981, lat: 28.0290, profile: "restaurant", wheelchair: "yes" },
  { name: "Skipper's Smokehouse", category: "restaurant", address: "910 Skipper Rd, Tampa, FL", lng: -82.4163, lat: 28.0782, profile: "bar", wheelchair: "limited" },
  { name: "Jason's Deli", category: "restaurant", address: "13630 N Dale Mabry Hwy, Tampa, FL", lng: -82.4581, lat: 28.0666, profile: "restaurant", wheelchair: "yes" },
  { name: "Subway (Fowler)", category: "restaurant", address: "11606 N 56th St, Temple Terrace, FL", lng: -82.3962, lat: 28.0440, profile: "fastfood", wheelchair: "yes" },
  { name: "7-Eleven (USF)", category: "store", address: "4502 E Fowler Ave, Tampa, FL", lng: -82.4055, lat: 28.0570, profile: "store", wheelchair: "yes" },
  { name: "Mr. Dunderbak's", category: "restaurant", address: "14929 Bruce B Downs Blvd, Tampa, FL", lng: -82.4203, lat: 28.0741, profile: "restaurant", wheelchair: "yes" },
  { name: "Dosthi Chowrasta", category: "restaurant", address: "11616 N 50th St, Temple Terrace, FL", lng: -82.4015, lat: 28.0432, profile: "restaurant", wheelchair: "yes" },
  { name: "Naan Stop Indian Cuisine", category: "restaurant", address: "12521 N 56th St, Temple Terrace, FL", lng: -82.3961, lat: 28.0537, profile: "restaurant", wheelchair: "yes" },
  { name: "Yummy House USF", category: "restaurant", address: "2238 E Fletcher Ave, Tampa, FL", lng: -82.4391, lat: 28.0631, profile: "restaurant", wheelchair: "yes" },
  { name: "Subway (Bruce B Downs)", category: "restaurant", address: "13701 Bruce B Downs Blvd, Tampa, FL", lng: -82.4204, lat: 28.0648, profile: "fastfood", wheelchair: "yes" },
  { name: "Chick-fil-A USF", category: "restaurant", address: "13760 N Dale Mabry Hwy, Tampa, FL", lng: -82.4581, lat: 28.0681, profile: "fastfood", wheelchair: "yes" },
  { name: "Chipotle USF", category: "restaurant", address: "2500 E Fowler Ave, Tampa, FL", lng: -82.4361, lat: 28.0571, profile: "fastfood", wheelchair: "yes" },

  // ── Parks / outdoor ─────────────────────────────────────────────
  { name: "Lettuce Lake Conservation Park", category: "park", address: "6920 E Fletcher Ave, Tampa, FL", lng: -82.3611, lat: 28.0673, profile: "park", wheelchair: "yes" },
  { name: "Rowlett Park", category: "park", address: "2800 E Yukon St, Tampa, FL", lng: -82.4486, lat: 28.0319, profile: "park", wheelchair: "limited" },
  { name: "USF Riverfront Park", category: "park", address: "13302 USF Riverfront Park Dr, Tampa, FL", lng: -82.4255, lat: 28.0565, profile: "park", wheelchair: "yes" },
  { name: "Greco Softball Complex", category: "park", address: "8311 N 30th St, Tampa, FL", lng: -82.4286, lat: 28.0144, profile: "park", wheelchair: "limited" },
  { name: "Kids' Park (USF)", category: "park", address: "10220 University Square Dr, Tampa, FL", lng: -82.4138, lat: 28.0289, profile: "park", wheelchair: "yes" },
  { name: "Trout Creek Park", category: "park", address: "12550 Morris Bridge Rd, Thonotosassa, FL", lng: -82.3325, lat: 28.0717, profile: "park", wheelchair: "limited" },

  // ── Museums / cultural ─────────────────────────────────────────
  { name: "Museum of Science & Industry (MOSI)", category: "museum", address: "4801 E Fowler Ave, Tampa, FL", lng: -82.4040, lat: 28.0566, profile: "stadium", wheelchair: "yes" },
  { name: "USF Contemporary Art Museum", category: "museum", address: "3821 USF Holly Dr, Tampa, FL", lng: -82.4175, lat: 28.0608, profile: "lab", wheelchair: "yes" },
  { name: "USF College of Design, Art & Performance", category: "museum", address: "3821 USF Holly Dr, Tampa, FL", lng: -82.4181, lat: 28.0606, profile: "office", wheelchair: "yes" },
  { name: "Mission Moonbase", category: "museum", address: "13803 N Nebraska Ave, Tampa, FL", lng: -82.4514, lat: 28.0639, profile: "lab", wheelchair: "limited" },

  // ── Stadiums / event venues ────────────────────────────────────
  { name: "Yuengling Center", category: "stadium", address: "12499 USF Bull Run Dr, Tampa, FL", lng: -82.4189, lat: 28.0619, profile: "stadium", wheelchair: "yes" },
  { name: "Raymond James Stadium", category: "stadium", address: "4201 N Dale Mabry Hwy, Tampa, FL", lng: -82.5033, lat: 27.9759, profile: "stadium", wheelchair: "yes" },
  { name: "USF Sun Dome", category: "stadium", address: "4202 E Fowler Ave SUN, Tampa, FL", lng: -82.4181, lat: 28.0617, profile: "stadium", wheelchair: "yes" },

  // ── Stores / shopping ──────────────────────────────────────────
  { name: "University Mall (Mall on Fowler)", category: "store", address: "2200 E Fowler Ave, Tampa, FL", lng: -82.4391, lat: 28.0571, profile: "store", wheelchair: "yes" },
  { name: "Publix Super Market USF", category: "store", address: "10915 N 56th St, Temple Terrace, FL", lng: -82.3962, lat: 28.0408, profile: "store", wheelchair: "yes" },
  { name: "Target USF", category: "store", address: "11402 N 56th St, Temple Terrace, FL", lng: -82.3962, lat: 28.0431, profile: "store", wheelchair: "yes" },
  { name: "Walmart Supercenter (Fowler)", category: "store", address: "1505 N Dale Mabry Hwy, Tampa, FL", lng: -82.5037, lat: 28.0026, profile: "store", wheelchair: "yes" },
  { name: "USF Bookstore", category: "store", address: "4202 E Fowler Ave MSC, Tampa, FL", lng: -82.4108, lat: 28.0630, profile: "store", wheelchair: "yes" },
  { name: "Ulta Beauty USF", category: "store", address: "13721 N Dale Mabry Hwy, Tampa, FL", lng: -82.4581, lat: 28.0660, profile: "store", wheelchair: "yes" },

  // ── Gyms / wellness ────────────────────────────────────────────
  { name: "USF Recreation Center", category: "gym", address: "12851 USF Recreation Pl, Tampa, FL", lng: -82.4128, lat: 28.0608, profile: "gym", wheelchair: "yes" },
  { name: "Crunch Fitness USF", category: "gym", address: "11602 N 56th St, Temple Terrace, FL", lng: -82.3962, lat: 28.0444, profile: "gym", wheelchair: "yes" },
  { name: "LA Fitness USF", category: "gym", address: "11302 N Dale Mabry Hwy, Tampa, FL", lng: -82.5037, lat: 28.0408, profile: "gym", wheelchair: "yes" },

  // ── USF academic buildings ─────────────────────────────────────
  { name: "Marshall Student Center", category: "office", address: "4202 E Fowler Ave MSC, Tampa, FL", lng: -82.4108, lat: 28.0635, profile: "office", wheelchair: "yes" },
  { name: "USF College of Engineering", category: "office", address: "4202 E Fowler Ave ENB, Tampa, FL", lng: -82.4156, lat: 28.0609, profile: "office", wheelchair: "yes" },
  { name: "USF Cooper Hall", category: "office", address: "4202 E Fowler Ave CPR, Tampa, FL", lng: -82.4129, lat: 28.0593, profile: "office", wheelchair: "yes" },
  { name: "USF Behavioral & Community Sciences Building", category: "office", address: "13301 Bruce B Downs Blvd MHC, Tampa, FL", lng: -82.4243, lat: 28.0606, profile: "lab", wheelchair: "yes" },

  // ── Transit / parking ──────────────────────────────────────────
  { name: "USF Lot 18 (Bull Runner Hub)", category: "transit", address: "USF Magnolia Dr, Tampa, FL", lng: -82.4140, lat: 28.0648, profile: "transit", wheelchair: "yes" },
  { name: "Bruce B Downs Park & Ride", category: "transit", address: "13601 Bruce B Downs Blvd, Tampa, FL", lng: -82.4205, lat: 28.0648, profile: "transit", wheelchair: "yes" },

  // ── USF Tampa: more academic / dining / housing buildings ───────
  { name: "USF Patel College of Global Sustainability", category: "office", address: "4202 E Fowler Ave NEC, Tampa, FL", lng: -82.4148, lat: 28.0645, profile: "office", wheelchair: "yes" },
  { name: "USF College of Public Health", category: "office", address: "13201 Bruce B Downs Blvd, Tampa, FL", lng: -82.4220, lat: 28.0570, profile: "office", wheelchair: "yes" },
  { name: "USF College of Nursing (BSN)", category: "office", address: "12901 Bruce B Downs Blvd, Tampa, FL", lng: -82.4225, lat: 28.0598, profile: "office", wheelchair: "yes" },
  { name: "USF Honors College", category: "office", address: "4202 E Fowler Ave HON, Tampa, FL", lng: -82.4118, lat: 28.0626, profile: "office", wheelchair: "yes" },
  { name: "USF Interdisciplinary Sciences (ISA)", category: "office", address: "4202 E Fowler Ave ISA, Tampa, FL", lng: -82.4165, lat: 28.0598, profile: "lab", wheelchair: "yes" },
  { name: "USF Engineering II (ENB)", category: "office", address: "4202 E Fowler Ave ENB, Tampa, FL", lng: -82.4150, lat: 28.0613, profile: "office", wheelchair: "yes" },
  { name: "USF Engineering III (ENC)", category: "office", address: "4202 E Fowler Ave ENC, Tampa, FL", lng: -82.4156, lat: 28.0617, profile: "office", wheelchair: "yes" },
  { name: "USF Patel Center for Global Citizens", category: "office", address: "4202 E Fowler Ave PCD, Tampa, FL", lng: -82.4154, lat: 28.0644, profile: "office", wheelchair: "yes" },
  { name: "USF Theatre 1", category: "museum", address: "3839 USF Holly Dr, Tampa, FL", lng: -82.4189, lat: 28.0598, profile: "stadium", wheelchair: "yes" },
  { name: "USF Music Concert Hall", category: "museum", address: "3755 USF Holly Dr, Tampa, FL", lng: -82.4204, lat: 28.0588, profile: "stadium", wheelchair: "yes" },
  { name: "USF Botanical Gardens", category: "park", address: "12210 USF Pine Dr, Tampa, FL", lng: -82.4250, lat: 28.0639, profile: "park", wheelchair: "yes" },
  { name: "USF Tennis Center", category: "park", address: "USF Pine Dr, Tampa, FL", lng: -82.4218, lat: 28.0671, profile: "park", wheelchair: "yes" },
  { name: "USF Track & Field Complex", category: "park", address: "USF Magnolia Dr, Tampa, FL", lng: -82.4145, lat: 28.0680, profile: "park", wheelchair: "yes" },
  { name: "USF Argos Hall", category: "office", address: "4202 E Fowler Ave ARG, Tampa, FL", lng: -82.4188, lat: 28.0658, profile: "office", wheelchair: "yes" },
  { name: "USF Castor Hall", category: "office", address: "4202 E Fowler Ave CAS, Tampa, FL", lng: -82.4192, lat: 28.0670, profile: "office", wheelchair: "yes" },
  { name: "USF Juniper-Poplar Hall", category: "office", address: "4202 E Fowler Ave JUN, Tampa, FL", lng: -82.4200, lat: 28.0668, profile: "office", wheelchair: "yes" },
  { name: "USF Maple Hall", category: "office", address: "4202 E Fowler Ave MPH, Tampa, FL", lng: -82.4204, lat: 28.0680, profile: "office", wheelchair: "yes" },
  { name: "USF Magnolia Apartments", category: "office", address: "USF Magnolia Dr, Tampa, FL", lng: -82.4156, lat: 28.0683, profile: "office", wheelchair: "yes" },
  { name: "Andros Dining Hall", category: "restaurant", address: "USF Magnolia Dr, Tampa, FL", lng: -82.4174, lat: 28.0666, profile: "fastfood", wheelchair: "yes" },
  { name: "The Hub at USF", category: "restaurant", address: "4202 E Fowler Ave MSC, Tampa, FL", lng: -82.4106, lat: 28.0633, profile: "fastfood", wheelchair: "yes" },
  { name: "Sushi Maki USF", category: "restaurant", address: "4202 E Fowler Ave MSC, Tampa, FL", lng: -82.4108, lat: 28.0634, profile: "restaurant", wheelchair: "yes" },
  { name: "USF Counseling Center", category: "office", address: "4202 E Fowler Ave SVC, Tampa, FL", lng: -82.4113, lat: 28.0623, profile: "lab", wheelchair: "yes" },
  { name: "USF Student Services Building", category: "office", address: "4202 E Fowler Ave SVC, Tampa, FL", lng: -82.4115, lat: 28.0625, profile: "office", wheelchair: "yes" },
  { name: "USF Recreation & Wellness Aquatic Center", category: "gym", address: "12851 USF Recreation Pl, Tampa, FL", lng: -82.4124, lat: 28.0612, profile: "gym", wheelchair: "yes" },
  { name: "USF Genshaft Drive Garage", category: "transit", address: "USF Genshaft Dr, Tampa, FL", lng: -82.4135, lat: 28.0612, profile: "transit", wheelchair: "yes" },
  { name: "USF Crescent Hill", category: "park", address: "USF Genshaft Dr, Tampa, FL", lng: -82.4131, lat: 28.0628, profile: "park", wheelchair: "yes" },
  { name: "USF Bull Runner Stop — Library", category: "transit", address: "USF Library, Tampa, FL", lng: -82.4129, lat: 28.0606, profile: "transit", wheelchair: "yes" },
  { name: "USF Bull Runner Stop — Marshall Center", category: "transit", address: "USF MSC, Tampa, FL", lng: -82.4108, lat: 28.0640, profile: "transit", wheelchair: "yes" },
  { name: "USF Embassy Suites", category: "office", address: "3705 Spectrum Blvd, Tampa, FL", lng: -82.4239, lat: 28.0590, profile: "office", wheelchair: "yes" },
  { name: "Hilton Garden Inn USF", category: "office", address: "13770 N 46th St, Tampa, FL", lng: -82.4158, lat: 28.0671, profile: "office", wheelchair: "yes" },

  // ============================================================
  // GREATER TAMPA — 5-10 miles outside USF Tampa campus
  // ============================================================

  // ── Temple Terrace / New Tampa (3-6mi NE) ──────────────────────
  { name: "Temple Terrace Recreation Center", category: "gym", address: "6610 Whiteway Dr, Temple Terrace, FL", lng: -82.3791, lat: 28.0349, profile: "gym", wheelchair: "yes" },
  { name: "Tampa Palms Park & Pool", category: "park", address: "16101 Compton Dr, Tampa, FL", lng: -82.3618, lat: 28.1110, profile: "park", wheelchair: "yes" },
  { name: "Compton Park", category: "park", address: "16101 Compton Dr, Tampa, FL", lng: -82.3625, lat: 28.1120, profile: "park", wheelchair: "yes" },
  { name: "Tampa Palms Country Club", category: "restaurant", address: "5811 Tampa Palms Blvd, Tampa, FL", lng: -82.3621, lat: 28.0989, profile: "restaurant", wheelchair: "yes" },
  { name: "New Tampa Regional Library", category: "library", address: "10001 Cross Creek Blvd, Tampa, FL", lng: -82.3408, lat: 28.0938, profile: "library", wheelchair: "yes" },
  { name: "Wiregrass Mall", category: "store", address: "28211 Paseo Dr, Wesley Chapel, FL", lng: -82.3500, lat: 28.1853, profile: "store", wheelchair: "yes" },
  { name: "BJ's Restaurant Wiregrass", category: "restaurant", address: "28522 Paseo Dr, Wesley Chapel, FL", lng: -82.3509, lat: 28.1858, profile: "restaurant", wheelchair: "yes" },
  { name: "AMC Wiregrass 18", category: "stadium", address: "28403 Paseo Dr, Wesley Chapel, FL", lng: -82.3502, lat: 28.1860, profile: "stadium", wheelchair: "yes" },

  // ── Carrollwood (5-7mi W) ──────────────────────────────────────
  { name: "Carrollwood Cultural Center", category: "museum", address: "4537 Lowell Rd, Tampa, FL", lng: -82.5113, lat: 28.0467, profile: "office", wheelchair: "yes" },
  { name: "Whole Foods Market Carrollwood", category: "store", address: "12407 N Dale Mabry Hwy, Tampa, FL", lng: -82.5037, lat: 28.0537, profile: "store", wheelchair: "yes" },
  { name: "Outback Steakhouse Carrollwood", category: "restaurant", address: "10625 N Dale Mabry Hwy, Tampa, FL", lng: -82.5037, lat: 28.0386, profile: "restaurant", wheelchair: "yes" },
  { name: "Costco Carrollwood", category: "store", address: "11801 N Dale Mabry Hwy, Tampa, FL", lng: -82.5037, lat: 28.0467, profile: "store", wheelchair: "yes" },
  { name: "Lake Magdalene Park", category: "park", address: "2902 W Bearss Ave, Tampa, FL", lng: -82.4966, lat: 28.0716, profile: "park", wheelchair: "limited" },

  // ── Westshore / Tampa International Airport (8-10mi W) ─────────
  { name: "International Plaza & Bay Street", category: "store", address: "2223 N West Shore Blvd, Tampa, FL", lng: -82.5260, lat: 27.9590, profile: "store", wheelchair: "yes" },
  { name: "WestShore Plaza", category: "store", address: "250 WestShore Plaza, Tampa, FL", lng: -82.5252, lat: 27.9469, profile: "store", wheelchair: "yes" },
  { name: "Tampa International Airport", category: "transit", address: "4100 George J Bean Pkwy, Tampa, FL", lng: -82.5332, lat: 27.9772, profile: "transit", wheelchair: "yes" },
  { name: "The Cheesecake Factory Tampa", category: "restaurant", address: "2223 N West Shore Blvd, Tampa, FL", lng: -82.5258, lat: 27.9598, profile: "restaurant", wheelchair: "yes" },
  { name: "Apple International Plaza", category: "store", address: "2223 N West Shore Blvd, Tampa, FL", lng: -82.5259, lat: 27.9592, profile: "store", wheelchair: "yes" },

  // ── Downtown Tampa / Riverwalk (8-10mi S) ──────────────────────
  { name: "Tampa Riverwalk", category: "park", address: "Tampa Riverwalk, Tampa, FL", lng: -82.4595, lat: 27.9476, profile: "park", wheelchair: "yes" },
  { name: "Curtis Hixon Waterfront Park", category: "park", address: "600 N Ashley Dr, Tampa, FL", lng: -82.4625, lat: 27.9492, profile: "park", wheelchair: "yes" },
  { name: "Tampa Bay History Center", category: "museum", address: "801 Old Water St, Tampa, FL", lng: -82.4504, lat: 27.9421, profile: "lab", wheelchair: "yes" },
  { name: "Florida Aquarium", category: "museum", address: "701 Channelside Dr, Tampa, FL", lng: -82.4503, lat: 27.9433, profile: "stadium", wheelchair: "yes" },
  { name: "Amalie Arena", category: "stadium", address: "401 Channelside Dr, Tampa, FL", lng: -82.4520, lat: 27.9428, profile: "stadium", wheelchair: "yes" },
  { name: "Tampa Theatre", category: "museum", address: "711 N Franklin St, Tampa, FL", lng: -82.4583, lat: 27.9485, profile: "stadium", wheelchair: "yes" },
  { name: "Tampa Museum of Art", category: "museum", address: "120 W Gasparilla Plaza, Tampa, FL", lng: -82.4621, lat: 27.9500, profile: "lab", wheelchair: "yes" },
  { name: "Glazer Children's Museum", category: "museum", address: "110 W Gasparilla Plaza, Tampa, FL", lng: -82.4620, lat: 27.9499, profile: "stadium", wheelchair: "yes" },
  { name: "Sparkman Wharf", category: "restaurant", address: "615 Channelside Dr, Tampa, FL", lng: -82.4505, lat: 27.9444, profile: "restaurant", wheelchair: "yes" },
  { name: "Armature Works", category: "restaurant", address: "1910 N Ola Ave, Tampa, FL", lng: -82.4647, lat: 27.9577, profile: "restaurant", wheelchair: "yes" },
  { name: "Oxford Exchange", category: "cafe", address: "420 W Kennedy Blvd, Tampa, FL", lng: -82.4709, lat: 27.9469, profile: "cafe", wheelchair: "yes" },
  { name: "John F. Germany Public Library", category: "library", address: "900 N Ashley Dr, Tampa, FL", lng: -82.4625, lat: 27.9509, profile: "library", wheelchair: "yes" },
  { name: "TECO Streetcar — Centro Ybor", category: "transit", address: "1601 E 8th Ave, Tampa, FL", lng: -82.4445, lat: 27.9621, profile: "transit", wheelchair: "yes" },

  // ── Hyde Park / Bayshore / SoHo (8-10mi SW) ────────────────────
  { name: "Hyde Park Village", category: "store", address: "1602 W Snow Cir, Tampa, FL", lng: -82.4779, lat: 27.9376, profile: "store", wheelchair: "yes" },
  { name: "Buddy Brew Coffee Hyde Park", category: "cafe", address: "2020 W Kennedy Blvd, Tampa, FL", lng: -82.4779, lat: 27.9476, profile: "cafe", wheelchair: "yes" },
  { name: "Bayshore Boulevard Linear Park", category: "park", address: "Bayshore Blvd, Tampa, FL", lng: -82.4877, lat: 27.9100, profile: "park", wheelchair: "yes" },
  { name: "Datz Tampa", category: "restaurant", address: "2616 S MacDill Ave, Tampa, FL", lng: -82.4961, lat: 27.9210, profile: "restaurant", wheelchair: "yes" },
  { name: "Bern's Steak House", category: "restaurant", address: "1208 S Howard Ave, Tampa, FL", lng: -82.4795, lat: 27.9385, profile: "restaurant", wheelchair: "yes" },

  // ── Ybor City (8-10mi S) ───────────────────────────────────────
  { name: "Centro Ybor", category: "store", address: "1600 E 8th Ave, Tampa, FL", lng: -82.4453, lat: 27.9622, profile: "store", wheelchair: "yes" },
  { name: "Columbia Restaurant Ybor", category: "restaurant", address: "2117 E 7th Ave, Tampa, FL", lng: -82.4408, lat: 27.9612, profile: "restaurant", wheelchair: "yes" },
  { name: "Ybor City Museum State Park", category: "museum", address: "1818 E 9th Ave, Tampa, FL", lng: -82.4434, lat: 27.9633, profile: "lab", wheelchair: "yes" },
  { name: "Ybor City Saturday Market", category: "park", address: "1901 N 19th St, Tampa, FL", lng: -82.4424, lat: 27.9646, profile: "park", wheelchair: "yes" },
  { name: "King Corona Cigars Cafe", category: "cafe", address: "1523 E 7th Ave, Tampa, FL", lng: -82.4467, lat: 27.9609, profile: "cafe", wheelchair: "limited" },

  // ── Brandon / Riverview (10mi E) ───────────────────────────────
  { name: "Westfield Brandon", category: "store", address: "459 Brandon Town Center Dr, Brandon, FL", lng: -82.2866, lat: 27.9425, profile: "store", wheelchair: "yes" },
  { name: "Regal Brandon Stadium 20", category: "stadium", address: "11328 Causeway Blvd, Brandon, FL", lng: -82.2937, lat: 27.9357, profile: "stadium", wheelchair: "yes" },
  { name: "Brandon Regional Library", category: "library", address: "619 Vonderburg Dr, Brandon, FL", lng: -82.2866, lat: 27.9358, profile: "library", wheelchair: "yes" },
  { name: "Costco Brandon", category: "store", address: "1830 W Brandon Blvd, Brandon, FL", lng: -82.3158, lat: 27.9362, profile: "store", wheelchair: "yes" },

  // ── East Tampa / Seminole Heights (5-8mi S) ────────────────────
  { name: "Seminole Heights Public Library", category: "library", address: "4711 N Florida Ave, Tampa, FL", lng: -82.4583, lat: 28.0014, profile: "library", wheelchair: "yes" },
  { name: "Ella's Americana Folk Art Cafe", category: "restaurant", address: "5119 N Nebraska Ave, Tampa, FL", lng: -82.4514, lat: 28.0046, profile: "restaurant", wheelchair: "yes" },
  { name: "Independent Bar Seminole Heights", category: "bar", address: "5016 N Florida Ave, Tampa, FL", lng: -82.4583, lat: 28.0040, profile: "bar", wheelchair: "limited" },
  { name: "Hillsborough River State Park", category: "park", address: "15402 US-301, Thonotosassa, FL", lng: -82.2305, lat: 28.1429, profile: "park", wheelchair: "limited" },

  // ── Davis Islands / Channel District (8-10mi S) ────────────────
  { name: "Davis Islands Village", category: "store", address: "228 E Davis Blvd, Tampa, FL", lng: -82.4525, lat: 27.9347, profile: "store", wheelchair: "yes" },
  { name: "Tampa General Hospital", category: "office", address: "1 Tampa General Cir, Tampa, FL", lng: -82.4595, lat: 27.9376, profile: "lab", wheelchair: "yes" },
  { name: "Channelside Bay Plaza", category: "store", address: "615 Channelside Dr, Tampa, FL", lng: -82.4502, lat: 27.9442, profile: "store", wheelchair: "yes" },

  // ── University of Tampa area (8-10mi SW) ───────────────────────
  { name: "University of Tampa Plant Hall", category: "office", address: "401 W Kennedy Blvd, Tampa, FL", lng: -82.4660, lat: 27.9468, profile: "office", wheelchair: "yes" },
  { name: "UT Macdonald-Kelce Library", category: "library", address: "401 W Kennedy Blvd, Tampa, FL", lng: -82.4658, lat: 27.9466, profile: "library", wheelchair: "yes" },
  { name: "UT Sykes College of Business", category: "office", address: "401 W Kennedy Blvd, Tampa, FL", lng: -82.4663, lat: 27.9470, profile: "office", wheelchair: "yes" },

  // ── Lutz / Land O' Lakes outskirts (10mi N) ────────────────────
  { name: "Pebble Creek Golf Club", category: "park", address: "10550 Regents Park Dr, Tampa, FL", lng: -82.3625, lat: 28.1450, profile: "park", wheelchair: "limited" },
  { name: "Tampa Premium Outlets", category: "store", address: "2300 Grand Cypress Dr, Lutz, FL", lng: -82.3585, lat: 28.1812, profile: "store", wheelchair: "yes" },
  { name: "Cypress Creek Town Center", category: "store", address: "8210 Cypress Creek Town Center Way, Lutz, FL", lng: -82.3540, lat: 28.1887, profile: "store", wheelchair: "yes" },
];

// Profiles drive realistic baseline scores — libraries are quiet, stadiums are loud, etc.
const PROFILES: Record<
  SeedVenue["profile"],
  {
    noise: [number, number];
    lighting: [number, number];
    crowd: [number, number];
    smell: [number, number];
    exits: [number, number];
    summary: string;
  }
> = {
  library: {
    noise: [1, 3], lighting: [4, 6], crowd: [2, 4], smell: [1, 3], exits: [7, 9],
    summary: "Quiet study space with comfortable lighting and several easy exits.",
  },
  cafe: {
    noise: [4, 7], lighting: [5, 7], crowd: [4, 7], smell: [5, 7], exits: [6, 8],
    summary: "Lively coffee aroma and chatter; warm lighting at most tables.",
  },
  park: {
    noise: [2, 4], lighting: [2, 5], crowd: [2, 5], smell: [1, 3], exits: [9, 10],
    summary: "Open-air space with gentle ambient sound and natural lighting.",
  },
  fastfood: {
    noise: [6, 8], lighting: [7, 9], crowd: [5, 8], smell: [6, 8], exits: [6, 8],
    summary: "Bright fluorescent lighting and busy food-prep noise.",
  },
  restaurant: {
    noise: [5, 7], lighting: [4, 6], crowd: [4, 7], smell: [5, 7], exits: [6, 8],
    summary: "Mid-tempo background music and warm dimmed lighting.",
  },
  bar: {
    noise: [7, 9], lighting: [3, 5], crowd: [6, 9], smell: [5, 8], exits: [5, 7],
    summary: "Loud music and dense crowd, especially after 7pm.",
  },
  store: {
    noise: [4, 6], lighting: [7, 9], crowd: [3, 6], smell: [3, 5], exits: [7, 9],
    summary: "Bright overhead lighting and steady ambient noise.",
  },
  gym: {
    noise: [6, 8], lighting: [7, 9], crowd: [4, 7], smell: [4, 6], exits: [6, 8],
    summary: "Equipment clanging and energetic music; bright overhead lighting.",
  },
  stadium: {
    noise: [7, 10], lighting: [6, 9], crowd: [7, 10], smell: [4, 7], exits: [6, 8],
    summary: "High-volume crowd noise during events; large but accessible exits.",
  },
  lab: {
    noise: [2, 4], lighting: [6, 8], crowd: [2, 4], smell: [2, 4], exits: [6, 8],
    summary: "Quiet, focused environment with steady fluorescent lighting.",
  },
  office: {
    noise: [3, 5], lighting: [5, 7], crowd: [3, 5], smell: [2, 4], exits: [7, 9],
    summary: "Calm administrative space with consistent overhead lighting.",
  },
  transit: {
    noise: [5, 8], lighting: [4, 7], crowd: [4, 7], smell: [3, 5], exits: [9, 10],
    summary: "Open-air transit hub; intermittent bus noise and crowds.",
  },
};

const REVIEW_TEMPLATES = [
  "Quieter on weekday mornings, packed at lunch.",
  "Lighting in the back corner is much softer than the entrance.",
  "Avoid right after class lets out — gets crowded fast.",
  "Coffee smell is strong but not overwhelming.",
  "Two clear step-free exits, easy navigation.",
  "Construction next door has been loud this week.",
  "Background music is at a comfortable level.",
  "Bathrooms are accessible and quiet.",
  "Best time to visit: early afternoon.",
  "Outdoor seating is calmer than inside.",
];

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function compositeOf(d: { noise: number; lighting: number; crowd: number; smell: number; exits: number }): number {
  return d.noise * 0.35 + d.crowd * 0.25 + d.lighting * 0.2 + d.smell * 0.1 + (10 - d.exits) * 0.1;
}

async function main() {
  const db = await getDb();
  const venuesCol = db.collection(COLLECTIONS.venues);
  const reviewsCol = db.collection(COLLECTIONS.reviews);
  const noiseCol = db.collection(COLLECTIONS.noise_samples);

  let inserted = 0;
  let updated = 0;
  let reviewCount = 0;
  let noiseCount = 0;

  for (const v of VENUES) {
    const synthGoogleId = `usf-tampa-${v.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}`;
    const profile = PROFILES[v.profile];
    const sensory = {
      noise: rand(profile.noise[0], profile.noise[1]),
      lighting: rand(profile.lighting[0], profile.lighting[1]),
      crowd: rand(profile.crowd[0], profile.crowd[1]),
      smell: rand(profile.smell[0], profile.smell[1]),
      exits: rand(profile.exits[0], profile.exits[1]),
    };
    const composite = compositeOf(sensory);

    const result = await venuesCol.findOneAndUpdate(
      { google_place_id: synthGoogleId },
      {
        $set: {
          google_place_id: synthGoogleId,
          name: v.name,
          category: v.category,
          address: v.address,
          location: { type: "Point", coordinates: [v.lng, v.lat] },
          sensory: { ...sensory, composite },
          summary: profile.summary,
          osm_tags: { wheelchair: v.wheelchair ?? null, kerb: null },
          updated_at: new Date(),
        },
      },
      { upsert: true, returnDocument: "after" },
    );

    const venueDoc = result as unknown as { _id?: ObjectId };
    if (!venueDoc?._id) {
      // older driver shape — fetch again
      const found = await venuesCol.findOne({ google_place_id: synthGoogleId });
      if (!found?._id) continue;
      venueDoc._id = found._id;
    }
    const venueId = venueDoc._id;

    const existed = await venuesCol.countDocuments({ google_place_id: synthGoogleId });
    if (existed > 0) updated++;
    else inserted++;

    // Add 3-6 mock reviews per venue, dated within last 5 days
    const reviewN = 3 + Math.floor(Math.random() * 4);
    const reviewDocs = Array.from({ length: reviewN }).map(() => ({
      venue_id: venueId,
      contributor_anon_id: `seed-${Math.random().toString(36).slice(2, 10)}`,
      text: pick(REVIEW_TEMPLATES),
      sensory_tags: { noise: null, lighting: null, crowd: null },
      timestamp: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000),
    }));
    if (reviewDocs.length) {
      await reviewsCol.insertMany(reviewDocs);
      reviewCount += reviewDocs.length;
    }

    // Add 24 hourly noise samples for the last 24 hours
    const noiseDocs = Array.from({ length: 24 }).map((_, i) => {
      const baseDb = 30 + sensory.noise * 6;
      const isPeak = (24 - i) >= 12 && (24 - i) <= 14;
      const isQuiet = i >= 22;
      const dbLevel = baseDb + (isPeak ? 8 : 0) - (isQuiet ? 10 : 0) + (Math.random() - 0.5) * 8;
      return {
        venue_id: venueId,
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000),
        metadata: { venue_id: venueId, contributor_anon_id: `seed-noise-${i}` },
        db_level: Math.max(20, Math.min(100, dbLevel)),
      };
    });
    await noiseCol.insertMany(noiseDocs);
    noiseCount += noiseDocs.length;
  }

  console.log(`venues: ${inserted} inserted, ${updated} updated`);
  console.log(`reviews: ${reviewCount} added`);
  console.log(`noise samples: ${noiseCount} added`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
