/* ============================================================
   Mallorca Camp 2026 — data layer
   Hard stats (date, distance, elevation, est. time, difficulty,
   climb count, climb list): the camp spreadsheet
   "Mallorca camp oct 16-24 2026 (Sa Calobra).xlsx".
   Descriptions, segment tables, TSS, feed zones, images:
   extracted from the official sacalobra.cc stage pages
   (the workbook's own hyperlinks).
   ============================================================ */

const CAMP = {
  title: "Mallorca 2026",
  club: "Sa Calobra Cycling Club",
  dates: "October 17 – 24, 2026",
  location: "Pollença · Serra de Tramuntana · Mallorca",
  officialUrl: "https://www.sacalobra.cc/cycling-camp/138/",
  // Totals computed from the spreadsheet's per-stage values
  totals: {
    rides: 6,
    km: 555,          // 82+99+123+79+83+89
    ele: 8795,        // 1024+1290+2349+620+1962+1550
    hours: 24.75,     // sheet TOTAL row: 24h45
    climbs: 17,       // sheet TOTAL row
    tss: 1250         // official camp page / sum of stage pages
  },
  notes: [
    { icon: "🏠", text: "Villa base near Pollença — pool, private chef, all-inclusive" },
    { icon: "🚐", text: "Support vehicle on all 6 rides · max 12 riders" },
    { icon: "💆", text: "6 massages, compression boots & Compex recovery" },
    { icon: "🌡️", text: "October riding temps: 10–22 °C" },
    { icon: "🚴", text: "Carbon bike hire with Stages power meter & Wahoo computer" },
    { icon: "🎥", text: "4K video + drone footage of the week, edited" }
  ]
};

/* The eight camp days, in order. rideId links to RIDES (official stage number). */
const SCHEDULE = [
  { date: "Sat 17 Oct", day: 1, label: "Arrival",        detail: "Palma airport pickup, bike setup & welcome dinner", rideId: null },
  { date: "Sun 18 Oct", day: 2, label: "FTP Test",       detail: "Sa Batalla — lactate-tested FTP effort",            rideId: 1 },
  { date: "Mon 19 Oct", day: 3, label: "Endurance",      detail: "Randa & Felanitx — southern backroads",             rideId: 2 },
  { date: "Tue 20 Oct", day: 4, label: "Queen Stage",    detail: "Five climbs, finishing on Puig Major (HC)",         rideId: 3 },
  { date: "Wed 21 Oct", day: 5, label: "Café Ride",      detail: "Recovery spin to Cycling Planet, Alaró",            rideId: 4 },
  { date: "Thu 22 Oct", day: 6, label: "KOM Challenge",  detail: "Sa Calobra handicap hill-climb race",               rideId: 6 },
  { date: "Fri 23 Oct", day: 7, label: "Formentor",      detail: "Cap de Formentor lighthouse & Puig Maria",          rideId: 5 },
  { date: "Sat 24 Oct", day: 8, label: "Departure",      detail: "Equipment return & transfer to Palma airport",      rideId: null }
];

/* Rides keyed by OFFICIAL stage number (note: the camp rides
   stage 6 on Thursday and stage 5 on Friday — links preserved
   exactly as they appear in the spreadsheet). */
const RIDES = [
  {
    id: 1,
    name: "Sa Batalla",
    theme: "FTP Test",
    date: "Sunday 18 October",
    shortDate: "Sun 18 Oct",
    campDay: 2,
    url: "https://www.sacalobra.cc/stage/1/",
    km: 82, ele: 1024, hours: 3.5,
    difficulty: "Intermediate",
    nClimbs: 2, tss: 190, feedZones: 2,
    sheetClimbs: [
      { name: "Santa Magdalena", cat: "3" },
      { name: "Sa Batalla", cat: "2" }
    ],
    intro: "For our first ride together, we will go climbing the Puig (summit in English) of Santa Magdalena (2.6km at 7%) and the Coll de Sa Batalla. A first climb to warm up, and a second one to test the legs with an all-in effort up to Coll de Sa Batalla (7.8km at 5%).",
    description: [
      "The first stage of our Mallorca camp is the perfect blend of warm-up, testing, and scenery. We roll out from our base and spend the first hour riding along the spectacular coastline of Port d’Alcudia Bay, an easy spin to loosen the legs, get used to the bike, and take in the sea views. From here, we cross the Albufera Nature Reserve, a peaceful stretch of flat roads lined with reeds and wildlife, before tackling our first climb of the week: Santa Magdalena. This short but punchy ascent will remind you to pace yourself early in the week. The descent is deceptively tricky — the surface can be slippery even on dry days, so we’ll take it with care.",
      "After this opener, we head towards the main challenge: Sa Batalla, a second-category climb (7.8km at 5% gradient average) that will serve as our FTP test. The goal here is simple — go all-in. At the summit, near the small gas station, our team will take a quick blood sample to measure lactate levels, giving you an accurate, data-driven FTP result. This will help us tailor pacing and training for the rest of the camp.",
      "From the top, we plunge into the Tramuntana mountains, enjoying rolling terrain and sweeping views before the grand finale: the descent of Coll de Femenia. Fast, flowing, and framed by rugged cliffs, it’s one of Mallorca’s most beautiful ways to finish a ride. By the time we reach Pollença, you’ll have ticked off your first climb, your first test, and your first taste of the island’s magic."
    ],
    segments: [
      { name: "Santa Magdalena", cat: "3", length: "5.49 km", grade: "6%", kom: "07:04", qom: "10:08", strava: "https://www.strava.com/segments/17911492" },
      { name: "Sa Batalla",      cat: "2", length: "7.83 km", grade: "5%", kom: "17:50", qom: "26:41", strava: "https://www.strava.com/segments/686221" }
    ],
    profileImg: "assets/profile-1.png",
    mapImg: "assets/map-1.jpg",
    profileImgOfficial: "https://www.sacalobra.cc/img/live-event/routes/mallorca/stage-1-2024.png",
    mapImgOfficial: "https://www.sacalobra.cc/stages/map/stage-1.jpg"
  },
  {
    id: 2,
    name: "Randa & Felanitx",
    theme: "Endurance",
    date: "Monday 19 October",
    shortDate: "Mon 19 Oct",
    campDay: 3,
    url: "https://www.sacalobra.cc/stage/2/",
    km: 99, ele: 1290, hours: 4.0,
    difficulty: "Intermediate",
    nClimbs: 2, tss: 200, feedZones: 3,
    sheetClimbs: [
      { name: "Randa", cat: "3" },
      { name: "Sant Salvador", cat: "3" }
    ],
    intro: "Let's explore the southern part of the island, where we will take small roads through the Mallorcan countryside to avoid traffic. Our destination? The Puig de Randa and Sant Salvador in Felanitx, which offer spectacular views over the south of the island.",
    description: [
      "Stage 2 marks our first true endurance ride of the week — more than four hours in the saddle, combining steady pace work on the plains with two challenging climbs. We roll out from base and head south across Mallorca’s gently undulating farmland, linking quiet backroads and passing through picturesque towns such as Sineu and Porreres. The goal on these flatter sections will be to keep a smooth but purposeful pace, working together as a group while saving energy for the climbs ahead.",
      "Our first challenge, Randa, is a long and steady ascent that rewards patience and discipline. The target effort will be close to threshold — high enough to make it a serious test, but still leaving something in reserve for the finale. From the top, sweeping views stretch across the island before we descend back to the plains and aim for Felanitx, where the day’s decisive battle awaits.",
      "San Salvador, the final climb, may be classed as third category, but it is steep, irregular, and exposed — a climb that can hurt if you push too soon. Today, it’s a summit finish, just like a Tour de France mountain stage: once you crest the top, the ride is over. The team will load the bikes and return to Pollença by shuttle, so you can truly give everything on this last ascent. Push to your limit, empty the tank, and enjoy the satisfaction of finishing the day at the very top, with panoramic views as your reward."
    ],
    segments: [
      { name: "Randa",    cat: "3", length: "4.75 km", grade: "5%", kom: "11:05", qom: "15:43", strava: "https://www.strava.com/segments/1098418" },
      { name: "Felanitx", cat: "2", length: "4.73 km", grade: "7%", kom: "14:19", qom: "20:09", strava: "https://www.strava.com/segments/17577693" }
    ],
    segmentNote: "The official segment table lists the final climb as “Felanitx” (cat 2) — this is the Sant Salvador sanctuary climb above Felanitx, listed in the camp spreadsheet as Sant Salvador (cat 3).",
    profileImg: "assets/profile-2.png",
    mapImg: "assets/map-2.jpg",
    profileImgOfficial: "https://www.sacalobra.cc/img/live-event/routes/mallorca/randa-felanitx-van.png",
    mapImgOfficial: "https://www.sacalobra.cc/stages/map/stage-2.jpg"
  },
  {
    id: 3,
    name: "Queen Stage",
    theme: "Queen Stage",
    date: "Tuesday 20 October",
    shortDate: "Tue 20 Oct",
    campDay: 4,
    url: "https://www.sacalobra.cc/stage/3/",
    km: 123, ele: 2349, hours: 5.5,
    difficulty: "Difficult",
    nClimbs: 5, tss: 280, feedZones: 4,
    sheetClimbs: [
      { name: "Tofla", cat: "4" },
      { name: "Orient", cat: "3" },
      { name: "Honor", cat: "4" },
      { name: "Sóller", cat: "3" },
      { name: "Puig Major", cat: "HC" }
    ],
    intro: "This is one the most difficult rides we've ever done in Mallorca, with 6 climbs on the menu, passing through magnificent villages! Make sure to save some energy because to end the week in style, we will tackle Puig Major (14km at 6%).",
    description: [
      "At the Tour de France, the Queen Stage is the hardest, most prestigious, and often the most spectacular day of the race. For our Mallorca camp, Stage 3 earns that title. At 123 km, with more than 2,300 metres of climbing and no fewer than five climbs, it is the ultimate test of strength and endurance.",
      "The day begins with a relentless series of warm-up climbs — Coll de Tofla, Coll d’Honor, Coll d’Orient, and Coll de Sóller — each adding to the cumulative fatigue while offering spectacular views of the island. These are merely the prelude to the day’s true challenge: the only hors-catégorie climb of the week, the mighty Puig Major. Puig Major is not brutally steep, but its sheer length makes it a grind. We’ll challenge every rider to give their absolute best on this final ascent, pushing deep into the reserves. The reward at the top is both the satisfaction of conquering Mallorca’s highest road and sweeping views over the Tramuntana mountains.",
      "For those with enough energy left, there’s a bonus: an optional 37 km return to Pollença, almost entirely downhill. This extended route flows through the heart of the Tramuntana, past the striking blue waters of the Gorg Blau reservoir, and finishes with one of the island’s most beautiful and safest descents — Coll de Femenia. Stage 3 is the day that will define your week: long, demanding, and unforgettable."
    ],
    segments: [
      { name: "Tofla",      cat: "4",  length: "1.50 km", grade: "7%", kom: "03:33", qom: "06:43", strava: "https://www.strava.com/segments/684281" },
      { name: "Orient",     cat: "3",  length: "5.07 km", grade: "5%", kom: "11:48", qom: "22:21", strava: "https://www.strava.com/segments/654280" },
      { name: "Honor",      cat: "4",  length: "1.55 km", grade: "7%", kom: "03:58", qom: "04:40", strava: "https://www.strava.com/segments/10929855" },
      { name: "Sóller",     cat: "3",  length: "5.03 km", grade: "5%", kom: "11:56", qom: "18:40", strava: "https://www.strava.com/segments/8107312" },
      { name: "Puig Major", cat: "HC", length: "14.2 km", grade: "6%", kom: "36:03", qom: "53:36", strava: "https://www.strava.com/segments/649635" }
    ],
    profileImg: "assets/profile-3.png",
    mapImg: "assets/map-3.jpg",
    profileImgOfficial: "https://www.sacalobra.cc/img/live-event/routes/mallorca/queen-stage-2024.png",
    mapImgOfficial: "https://www.sacalobra.cc/stages/map/stage-3.jpg"
  },
  {
    id: 4,
    name: "Caffeine Ride",
    theme: "Café Ride",
    date: "Wednesday 21 October",
    shortDate: "Wed 21 Oct",
    campDay: 5,
    url: "https://www.sacalobra.cc/stage/4/",
    km: 79, ele: 620, hours: 2.75,
    difficulty: "Easy",
    nClimbs: 0, tss: 140, feedZones: 2,
    sheetClimbs: [],
    coffeeStop: "Cycling Planet, Alaró",
    intro: "For this caffeine ride, we will take you to Cycling Planet, in Alaró, one of the most famous cycling cafés on the island. No climb on the menu today, but a warm coffee and a delicious piece of cake are waiting for you at Cycling Planet. Enjoy!",
    description: [
      "Stage 4 is the lightest day of the week, but don’t be fooled — it’s far from a rest day. With no major climbs on the menu, we’ll still spend around two hours in the saddle, keeping the legs moving and the group rolling. After setting off from Pollença, we head towards Sa Pobla and follow the service road alongside the highway. This stretch offers smooth tarmac, low traffic, and the chance to ride two abreast — perfect for chatting, spinning, and enjoying the scenery.",
      "We pass through the town of Inca before turning towards Alaró, where our reward awaits: Cycling Planet, one of Mallorca’s best cycling cafés. Inside, you’ll find great coffee, homemade cakes, and walls adorned with cycling memorabilia — the perfect backdrop for a well-earned break during this intense training week.",
      "The return leg may be caffeine-fuelled, but it’s no free ride. The rolling roads back to Pollença encourage a steady tempo, keeping everyone engaged without overloading the legs ahead of the days to come. Stage 4 is about active recovery, camaraderie, and making the most of Mallorca — proof that even an “easy” day here is still a day worth riding."
    ],
    segments: [],
    profileImg: "assets/profile-4.png",
    mapImg: "assets/map-4.jpg",
    profileImgOfficial: "https://www.sacalobra.cc/img/live-event/routes/mallorca/alaro-coffee-ride.png",
    mapImgOfficial: "https://www.sacalobra.cc/stages/map/stage-4.jpg"
  },
  {
    id: 5,
    name: "Cap de Formentor",
    theme: "Formentor",
    date: "Friday 23 October",
    shortDate: "Fri 23 Oct",
    campDay: 7,
    url: "https://www.sacalobra.cc/stage/5/",
    km: 89, ele: 1550, hours: 4.5,
    difficulty: "Intermediate",
    nClimbs: 4, tss: 220, feedZones: 3,
    sheetClimbs: [
      { name: "Albertcutx", cat: "2" },
      { name: "Sa Crueta", cat: "3" },
      { name: "Victoria", cat: "4" },
      { name: "Puig Maria", cat: "4" }
    ],
    intro: "Located at the northern end of the island, Formentor and its famous lighthouse have established themselves over the years as must-sees. Despite the rather modest distance, don't expect an easy ride. The two climbs and a route that's never flat should seriously challenge you.",
    description: [
      "Welcome to Cycling Disneyland. This stage takes us along one of the most beautiful roads you will ever ride: the road to the Cap de Formentor and its famous lighthouse. But before we reach the lighthouse, the day begins with a climb many cyclists unknowingly pass by. After just 3 km of the first ascent, we slip past the car park and take a small road to the right — the hidden route to the Mirador d’Albercutx. The tarmac may be (very) worn, but at the summit you are rewarded with a panoramic view over the Bay of Alcúdia that is simply breathtaking.",
      "From there, the road to Formentor unfolds in all its glory: twisting along cliffs, skirting turquoise waters, and offering postcard-perfect vistas with every turn, all culminating at the iconic lighthouse. But the ride doesn’t end at the lighthouse. On the way back, if the weather is kind and the road not too slippery, the group will have another challenge: a 20-second, all-out sprint to decide who will wear the camp’s green jersey — the sprinter’s prize. One explosive effort to see who can deliver the fastest kick of the week.",
      "After that, we head towards Alcúdia to tackle a hidden gem of a climb: the Mirador de la Victoria. Just 2 km long, with narrow ramps and pitches over 10%, it’s a short but demanding ascent that rewards you with stunning views over the bay before dropping back to the coast. From there, we follow the shoreline along the Bay of Alcúdia, the sea sparkling beside us, before turning inland towards Pollença.",
      "Finally, for the bravest, comes the sting in the tail: the climb of Puig Maria. It may not be as famous as Sa Calobra or Formentor, but its savage gradients — with ramps exceeding 20% — make it one of the most brutal climbs on the island. For the fastest, it’s seven minutes of pure intensity; for the rest, closer to ten, or more… Short, vicious, and unforgettable — the perfect way to end the week with a final battle and legs of stone."
    ],
    segments: [
      { name: "Mirador d’Albertcutx",   cat: "2", length: "5.46 km", grade: "6%",  kom: "14:09", qom: "22:43", strava: "https://www.strava.com/segments/654790" },
      { name: "Sa Creueta",             cat: "3", length: "3.45 km", grade: "5%",  kom: "08:08", qom: "13:47", strava: "https://www.strava.com/segments/5978202" },
      { name: "Mirador de la Victoria", cat: "4", length: "1.32 km", grade: "8%",  kom: "03:50", qom: "05:44", strava: "https://www.strava.com/segments/24955066" },
      { name: "Puig Maria",             cat: "4", length: "1.38 km", grade: "10%", kom: "06:07", qom: "07:39", strava: "https://www.strava.com/segments/3774388" }
    ],
    profileImg: "assets/profile-5.png",
    mapImg: "assets/map-5.jpg",
    profileImgOfficial: "https://www.sacalobra.cc/img/live-event/routes/mallorca/formentor.png",
    mapImgOfficial: "https://www.sacalobra.cc/stages/map/stage-5.jpg"
  },
  {
    id: 6,
    name: "Sa Calobra",
    theme: "KOM Challenge",
    date: "Thursday 22 October",
    shortDate: "Thu 22 Oct",
    campDay: 6,
    url: "https://www.sacalobra.cc/stage/6/",
    km: 83, ele: 1962, hours: 4.5,
    difficulty: "Difficult",
    nClimbs: 4, tss: 220, feedZones: 3,
    sheetClimbs: [
      { name: "Femenia", cat: "2" },
      { name: "Lluc", cat: "3" },
      { name: "Coll dels Reis", cat: "4" },
      { name: "Sa Calobra", cat: "1" }
    ],
    intro: "With the Sa Calobra Cycling Club jersey on your back, you have to take on the challenge of climbing the famous Coll dels Reis (category 1 climb), better known as Sa Calobra in the cycling world. Get ready for a truly unforgettable experience.",
    description: [
      "The final stage of our Mallorca camp is all about one thing: the Sa Calobra time trial. But before we reach this legendary climb, we’ll spend around two hours weaving through the heart of the Tramuntana mountains. The warm-up is anything but flat — three ascents await: Coll de Femenia, Lluc, and Coll del Reis, the gateway to Sa Calobra. We’ll take the shorter approach, but it still delivers enough climbing to prime the legs for what’s ahead.",
      "From the top of Coll del Reis, we descend the iconic 9.5 km road down to the Port de Sa Calobra — a spectacular series of hairpins carved into the rock. This is where our camp’s handicap race begins, one of the highlights of the week. Riders will start at staggered intervals, chasing or being chased, with one simple goal: give absolutely everything on the way back up.",
      "Sa Calobra may not be the steepest climb on the island, but its steady gradients and relentless switchbacks make it a true test of pacing, power, and determination. Empty the tank, push beyond your limits, and try to set your personal best in front of your fellow riders. It’s the perfect finale — a race to the top, a celebration of the week’s efforts, and a fitting way to close our time together in Mallorca’s cycling paradise."
    ],
    segments: [
      { name: "Femenia",        cat: "2", length: "7.57 km", grade: "6%", kom: "18:52", qom: "27:54", strava: "https://www.strava.com/segments/3620345" },
      { name: "Lluc",           cat: "3", length: "3.22 km", grade: "5%", kom: "08:09", qom: "11:58", strava: "https://www.strava.com/segments/626341" },
      { name: "Coll dels Reis", cat: "4", length: "2.37 km", grade: "7%", kom: "06:10", qom: "11:04", strava: "https://www.strava.com/segments/626340" },
      { name: "Sa Calobra",     cat: "1", length: "9.44 km", grade: "7%", kom: "26:25", qom: "36:13", strava: "https://www.strava.com/segments/653262" }
    ],
    profileImg: "assets/profile-6.png",
    mapImg: "assets/map-6.jpg",
    profileImgOfficial: "https://www.sacalobra.cc/img/live-event/routes/mallorca/sa-calobra.png",
    mapImgOfficial: "https://www.sacalobra.cc/stages/map/stage-6.jpg"
  }
];

/* Chronological ride order for the camp week (official stage ids) */
const RIDE_ORDER = [1, 2, 3, 4, 6, 5];
