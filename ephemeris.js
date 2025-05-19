/**
 * Ephemeris.js - Planetary position calculation library
 * This file contains the ephemeris data and algorithms to calculate
 * precise planetary positions based on date, time and location.
 */

// Planetary base data
const planets = {
  sun: { name: "Sun", symbol: "☉", color: "#FFD700", orbSpeed: 1 },
  moon: { name: "Moon", symbol: "☽", color: "#SILVER", orbSpeed: 13.2 },
  mercury: { name: "Mercury", symbol: "☿", color: "#B5B8B1", orbSpeed: 4.1 },
  venus: { name: "Venus", symbol: "♀", color: "#FFCC99", orbSpeed: 1.6 },
  mars: { name: "Mars", symbol: "♂", color: "#FF4500", orbSpeed: 0.5 },
  jupiter: { name: "Jupiter", symbol: "♃", color: "#F0E68C", orbSpeed: 0.08 },
  saturn: { name: "Saturn", symbol: "♄", color: "#696969", orbSpeed: 0.03 },
  uranus: { name: "Uranus", symbol: "♅", color: "#40E0D0", orbSpeed: 0.01 },
  neptune: { name: "Neptune", symbol: "♆", color: "#5D8AA8", orbSpeed: 0.006 },
  pluto: { name: "Pluto", symbol: "♇", color: "#A0522D", orbSpeed: 0.004 }
};

// House systems
const houseSystems = {
  placidus: "Placidus",
  koch: "Koch",
  campanus: "Campanus",
  regiomontanus: "Regiomontanus",
  equal: "Equal",
  whole: "Whole Sign"
};

// Natal chart calculation
function calculateNatalChart(birthdate, birthtime, latitude, longitude, houseSystem = "placidus") {
  const date = new Date(`${birthdate}T${birthtime}`);
  
  // Calculate Julian day number - essential for astronomical calculations
  const JD = calculateJulianDay(date);
  
  // Get planetary positions
  const planetPositions = calculatePlanetaryPositions(JD, latitude, longitude);
  
  // Calculate houses based on selected system
  const houses = calculateHouses(JD, latitude, longitude, houseSystem);
  
  // Calculate aspects between planets
  const aspects = calculateAspects(planetPositions);
  
  return {
    planets: planetPositions,
    houses: houses,
    aspects: aspects,
    ascendant: houses[0].cusp,
    midheaven: houses[9].cusp,
    julianDay: JD
  };
}

// Calculate Julian Day number from date
function calculateJulianDay(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours() + date.getMinutes()/60 + date.getSeconds()/3600;
  
  let y, m;
  if (month > 2) {
    y = year;
    m = month;
  } else {
    y = year - 1;
    m = month + 12;
  }
  
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + hour/24 + b - 1524.5;
  
  return jd;
}

// Calculate planetary positions based on Julian day and location
function calculatePlanetaryPositions(jd, latitude, longitude) {
  // This is a simplified version - in a real application, this would use
  // complex astronomical algorithms or an ephemeris API
  
  // For this demo, we'll use an algorithm that approximates planetary positions
  // These are not accurate astronomical calculations but will demonstrate the concept
  
  const positions = {};
  const baseDate = new Date("2000-01-01T12:00:00Z");
  const baseJD = calculateJulianDay(baseDate);
  const daysSinceJ2000 = jd - baseJD;
  
  // Simplified orbital calculations (not astronomically accurate)
  for (const planet in planets) {
    // Base position calculation
    const speed = planets[planet].orbSpeed;
    const orbitalPeriod = 360 / speed; // days for full orbit
    const position = (daysSinceJ2000 * speed) % 360;
    
    // Add some randomization for the demo to create diversity
    const randomOffset = Math.sin(daysSinceJ2000 * (0.1 + Math.random() * 0.05)) * 15;
    
    // Calculate the sign
    const degreeInZodiac = (position + randomOffset + 360) % 360;
    const signIndex = Math.floor(degreeInZodiac / 30);
    const degreeInSign = degreeInZodiac % 30;
    
    // Calculate retrograde status (simplified)
    const isRetrograde = Math.sin(daysSinceJ2000 * 0.05 + planet.charCodeAt(0)) > 0.7;
    
    positions[planet] = {
      longitude: degreeInZodiac,
      latitude: Math.sin(daysSinceJ2000 * 0.1 + planet.length) * 5, // -5 to +5 degrees from ecliptic
      sign: signIndex,
      degree: degreeInSign.toFixed(2),
      isRetrograde: isRetrograde,
      ...planets[planet]
    };
  }
  
  return positions;
}

// Calculate house cusps based on system
function calculateHouses(jd, latitude, longitude, system) {
  // This is a simplified version - in a real application, this would use 
  // proper astronomical math or an API
  
  const houses = [];
  const LMST = calculateLocalSiderealTime(jd, longitude);
  
  // Different house systems would have different algorithms here
  // This is a simplified approximation
  let ascendant;
  
  if (system === "equal") {
    // Equal house system - each house is exactly 30 degrees
    ascendant = calculateAscendant(jd, latitude, longitude);
    for (let i = 0; i < 12; i++) {
      houses.push({
        number: i + 1,
        cusp: (ascendant + i * 30) % 360,
        system: "Equal"
      });
    }
  } else {
    // Default to Placidus (simplified)
    ascendant = calculateAscendant(jd, latitude, longitude);
    const mc = calculateMidheaven(LMST);
    
    // This is not an accurate Placidus calculation, just a demonstration
    houses.push({ number: 1, cusp: ascendant, system: "Placidus" });
    houses.push({ number: 10, cusp: mc, system: "Placidus" });
    
    // Generate remaining cusps with some variation
    houses.push({ number: 2, cusp: (ascendant + 30 + Math.sin(latitude * 0.1) * 5) % 360, system: "Placidus" });
    houses.push({ number: 3, cusp: (ascendant + 60 + Math.sin(latitude * 0.2) * 7) % 360, system: "Placidus" });
    houses.push({ number: 4, cusp: (mc + 180) % 360, system: "Placidus" });
    houses.push({ number: 5, cusp: (houses[3].cusp + 180) % 360, system: "Placidus" });
    houses.push({ number: 6, cusp: (houses[2].cusp + 180) % 360, system: "Placidus" });
    houses.push({ number: 7, cusp: (ascendant + 180) % 360, system: "Placidus" });
    houses.push({ number: 8, cusp: (houses[6].cusp + 30 + Math.sin(latitude * 0.1) * 5) % 360, system: "Placidus" });
    houses.push({ number: 9, cusp: (houses[6].cusp + 60 + Math.sin(latitude * 0.2) * 7) % 360, system: "Placidus" });
    houses.push({ number: 11, cusp: (mc + 30 + Math.sin(latitude * 0.1) * 5) % 360, system: "Placidus" });
    houses.push({ number: 12, cusp: (mc + 60 + Math.sin(latitude * 0.2) * 7) % 360, system: "Placidus" });
    
    // Sort by house number
    houses.sort((a, b) => a.number - b.number);
  }
  
  return houses;
}

// Calculate Local Mean Sidereal Time
function calculateLocalSiderealTime(jd, longitude) {
  const T = (jd - 2451545.0) / 36525;
  const θ = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000;
  return (θ + longitude) % 360;
}

// Calculate Ascendant (Rising Sign)
function calculateAscendant(jd, latitude, longitude) {
  const LMST = calculateLocalSiderealTime(jd, longitude);
  const latRad = latitude * Math.PI / 180;
  const lstRad = LMST * Math.PI / 180;
  
  // Simplified formula for demonstration
  const tanAsc = -Math.cos(lstRad) / (Math.sin(lstRad) * Math.cos(latRad) - Math.tan(0) * Math.sin(latRad));
  let ascendant = Math.atan(tanAsc) * 180 / Math.PI;
  
  if (Math.cos(lstRad) > 0) {
    ascendant += 180;
  }
  
  return (ascendant + 360) % 360;
}

// Calculate Midheaven (MC)
function calculateMidheaven(LMST) {
  return LMST % 360;
}

// Calculate aspects between planets
function calculateAspects(planetPositions) {
  const aspects = [];
  const aspectTypes = {
    conjunction: { angle: 0, orb: 8, symbol: "☌", name: "Conjunction", influence: "Strong" },
    opposition: { angle: 180, orb: 8, symbol: "☍", name: "Opposition", influence: "Strong" },
    trine: { angle: 120, orb: 8, symbol: "△", name: "Trine", influence: "Harmonious" },
    square: { angle: 90, orb: 7, symbol: "□", name: "Square", influence: "Challenging" },
    sextile: { angle: 60, orb: 6, symbol: "⚹", name: "Sextile", influence: "Harmonious" },
    semisextile: { angle: 30, orb: 3, symbol: "⚺", name: "Semi-sextile", influence: "Mild" },
    semisquare: { angle: 45, orb: 3, symbol: "⚼", name: "Semi-square", influence: "Challenging" },
    sesquiquadrate: { angle: 135, orb: 3, symbol: "⚿", name: "Sesquiquadrate", influence: "Challenging" },
    quincunx: { angle: 150, orb: 5, symbol: "⚻", name: "Quincunx", influence: "Adjustment" },
    quintile: { angle: 72, orb: 2, symbol: "Q", name: "Quintile", influence: "Creative" },
    biquintile: { angle: 144, orb: 2, symbol: "bQ", name: "Biquintile", influence: "Creative" }
  };
  
  const planetKeys = Object.keys(planetPositions);
  
  // Check each planetary pair
  for (let i = 0; i < planetKeys.length; i++) {
    const planet1 = planetKeys[i];
    
    for (let j = i + 1; j < planetKeys.length; j++) {
      const planet2 = planetKeys[j];
      
      const pos1 = planetPositions[planet1].longitude;
      const pos2 = planetPositions[planet2].longitude;
      
      // Calculate the angle between the planets
      let angle = Math.abs(pos1 - pos2);
      if (angle > 180) angle = 360 - angle;
      
      // Check all aspect types
      for (const aspectType in aspectTypes) {
        const aspect = aspectTypes[aspectType];
        const orb = Math.abs(angle - aspect.angle);
        
        if (orb <= aspect.orb) {
          aspects.push({
            planet1: planet1,
            planet2: planet2,
            type: aspectType,
            angle: angle.toFixed(2),
            orb: orb.toFixed(2),
            symbol: aspect.symbol,
            name: aspect.name,
            influence: aspect.influence,
            applying: (pos1 < pos2) ? ((planetPositions[planet1].isRetrograde === planetPositions[planet2].isRetrograde) ? false : true) : 
                                      ((planetPositions[planet1].isRetrograde === planetPositions[planet2].isRetrograde) ? true : false)
          });
          break; // Only record the strongest aspect between any two planets
        }
      }
    }
  }
  
  return aspects;
}

// Determine which house a planet is in
function determinePlanetHouse(planetPosition, houses) {
  const planetLongitude = planetPosition.longitude;
  
  for (let i = 0; i < 12; i++) {
    const houseStart = houses[i].cusp;
    const houseEnd = houses[(i + 1) % 12].cusp;
    
    // Handle houses that cross the 0° Aries point
    if (houseEnd < houseStart) {
      if (planetLongitude >= houseStart || planetLongitude < houseEnd) {
        return i + 1;
      }
    } else {
      if (planetLongitude >= houseStart && planetLongitude < houseEnd) {
        return i + 1;
      }
    }
  }
  
  return 1; // Default to house 1 if something goes wrong
}

// Calculate the sign name from degree
function getZodiacSign(degree) {
  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer", 
    "Leo", "Virgo", "Libra", "Scorpio", 
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];
  
  const signIndex = Math.floor(degree / 30) % 12;
  return signs[signIndex];
}

// Calculate the exact degree in a sign
function getZodiacDegree(degree) {
  return degree % 30;
}

// Format degrees to display friendly format with sign, degree, minute, second
function formatDegree(degree) {
  const totalDegrees = degree % 360;
  const sign = getZodiacSign(totalDegrees);
  const degreesInSign = Math.floor(totalDegrees % 30);
  const minutes = Math.floor((totalDegrees % 1) * 60);
  const seconds = Math.floor(((totalDegrees % 1) * 60 % 1) * 60);
  
  return `${sign} ${degreesInSign}° ${minutes}' ${seconds}"`;
}

// Get planet dignity status (essential dignities)
function getPlanetDignity(planet, signIndex) {
  const dignities = {
    sun: { rulership: 4, exaltation: 0, detriment: 10, fall: 6 },
    moon: { rulership: 3, exaltation: 1, detriment: 9, fall: 7 },
    mercury: { rulership: [2, 5], exaltation: null, detriment: [8, 11], fall: null },
    venus: { rulership: [1, 6], exaltation: 11, detriment: [7, 0], fall: 5 },
    mars: { rulership: [0, 7], exaltation: 9, detriment: [1, 6], fall: 3 },
    jupiter: { rulership: [8, 11], exaltation: 3, detriment: [2, 5], fall: 9 },
    saturn: { rulership: [9, 10], exaltation: 6, detriment: [3, 4], fall: 0 },
    uranus: { rulership: 10, exaltation: null, detriment: 4, fall: null },
    neptune: { rulership: 11, exaltation: null, detriment: 5, fall: null },
    pluto: { rulership: 7, exaltation: null, detriment: 1, fall: null }
  };
  
  if (!dignities[planet]) return "Neutral";
  
  const planetDignity = dignities[planet];
  
  // Check rulership
  if (planetDignity.rulership === signIndex || 
      (Array.isArray(planetDignity.rulership) && planetDignity.rulership.includes(signIndex))) {
    return "Rulership";
  }
  
  // Check exaltation
  if (planetDignity.exaltation === signIndex) {
    return "Exaltation";
  }
  
  // Check detriment
  if (planetDignity.detriment === signIndex || 
      (Array.isArray(planetDignity.detriment) && planetDignity.detriment.includes(signIndex))) {
    return "Detriment";
  }
  
  // Check fall
  if (planetDignity.fall === signIndex) {
    return "Fall";
  }
  
  return "Neutral";
}

// Export functions for use in other files
window.astroCalculator = {
  calculateNatalChart,
  calculateJulianDay,
  calculatePlanetaryPositions,
  calculateHouses,
  calculateAspects,
  determinePlanetHouse,
  getZodiacSign,
  getZodiacDegree,
  formatDegree,
  getPlanetDignity,
  planets,
  houseSystems
};
