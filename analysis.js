/**
 * Analysis.js - Professional Astrological Chart Analysis
 * Provides detailed interpretations of natal charts with degrees, houses, and aspects
 */

// Main chart analyzer class
class ChartAnalyzer {
  constructor(chartData) {
    this.chartData = chartData;
    this.interpretations = astroInterpretations;  // Reference to global interpretations
  }
  
  // Generate complete chart analysis with all sections
  generateFullAnalysis() {
    const analysis = {
      planetPositions: this.analyzePlanetPositions(),
      houseCusps: this.analyzeHouseCusps(),
      aspects: this.analyzeAspects(),
      elementBalance: this.analyzeElementBalance(),
      modalityBalance: this.analyzeModalityBalance(),
      dominantPlanets: this.findDominantPlanets(),
      specialPatterns: this.findSpecialPatterns()
    };
    
    return analysis;
  }
  
  // Analyze each planet's position, sign, house, and dignity
  analyzePlanetPositions() {
    const planets = this.chartData.planets;
    const houses = this.chartData.houses;
    const analysis = [];
    
    for (const planetKey in planets) {
      const planet = planets[planetKey];
      const sign = window.astroCalculator.getZodiacSign(planet.longitude);
      const signIndex = Math.floor(planet.longitude / 30);
      const degreeInSign = planet.degree;
      const houseNum = window.astroCalculator.determinePlanetHouse(planet, houses);
      const dignity = window.astroCalculator.getPlanetDignity(planetKey, signIndex);
      
      const positionAnalysis = {
        planet: planet.name,
        symbol: planet.symbol,
        sign,
        degree: degreeInSign,
        longitude: planet.longitude.toFixed(2),
        formattedPosition: window.astroCalculator.formatDegree(planet.longitude),
        retrograde: planet.isRetrograde,
        house: houseNum,
        dignity,
        interpretation: this.interpretPlanetInSign(planetKey, signIndex),
        houseInterpretation: this.interpretPlanetInHouse(planetKey, houseNum),
        dignityEffect: this.interpretDignity(planetKey, dignity)
      };
      
      analysis.push(positionAnalysis);
    }
    
    return analysis;
  }
  
  // Analyze house cusps and their significance
  analyzeHouseCusps() {
    const houses = this.chartData.houses;
    const analysis = [];
    
    houses.forEach(house => {
      const sign = window.astroCalculator.getZodiacSign(house.cusp);
      const signIndex = Math.floor(house.cusp / 30);
      const degreeInSign = window.astroCalculator.getZodiacDegree(house.cusp).toFixed(2);
      
      analysis.push({
        house: house.number,
        sign,
        degree: degreeInSign,
        longitude: house.cusp.toFixed(2),
        formattedPosition: window.astroCalculator.formatDegree(house.cusp),
        interpretation: this.interpretHouseCusp(house.number, signIndex)
      });
    });
    
    return analysis;
  }
  
  // Analyze all aspects in the chart
  analyzeAspects() {
    const aspects = this.chartData.aspects;
    const planets = this.chartData.planets;
    const analysis = [];
    
    aspects.forEach(aspect => {
      const planet1 = planets[aspect.planet1];
      const planet2 = planets[aspect.planet2];
      
      if (!planet1 || !planet2) return;
      
      analysis.push({
        aspect: aspect.name,
        symbol: aspect.symbol,
        planets: `${planet1.name} - ${planet2.name}`,
        angle: aspect.angle,
        orb: aspect.orb,
        influence: aspect.influence,
        applying: aspect.applying,
        interpretation: this.interpretAspect(aspect.planet1, aspect.planet2, aspect.type)
      });
    });
    
    // Sort by influence strength
    analysis.sort((a, b) => {
      const strengthOrder = { "Strong": 3, "Harmonious": 2, "Challenging": 2, "Mild": 1, "Adjustment": 1, "Creative": 1 };
      return strengthOrder[b.influence] - strengthOrder[a.influence];
    });
    
    return analysis;
  }
  
  // Analyze distribution of elements (fire, earth, air, water)
  analyzeElementBalance() {
    const planets = this.chartData.planets;
    const elements = { "Fire": 0, "Earth": 0, "Air": 0, "Water": 0 };
    const elementalPlanets = { "Fire": [], "Earth": [], "Air": [], "Water": [] };
    
    // Count planets in each element
    for (const planetKey in planets) {
      const planet = planets[planetKey];
      const signIndex = Math.floor(planet.longitude / 30);
      const element = this.getSignElement(signIndex);
      
      elements[element]++;
      elementalPlanets[element].push(planet.name);
    }
    
    // Determine dominant and lacking elements
    let dominant = Object.keys(elements).reduce((a, b) => elements[a] > elements[b] ? a : b);
    let lacking = Object.keys(elements).reduce((a, b) => elements[a] < elements[b] ? a : b);
    
    if (elements[dominant] === elements[lacking]) {
      dominant = "Balanced";
      lacking = "None";
    }
    
    return {
      elements,
      elementalPlanets,
      dominant,
      lacking,
      interpretation: this.interpretElementBalance(elements, dominant, lacking)
    };
  }
  
  // Analyze distribution of modalities (cardinal, fixed, mutable)
  analyzeModalityBalance() {
    const planets = this.chartData.planets;
    const modalities = { "Cardinal": 0, "Fixed": 0, "Mutable": 0 };
    const modalityPlanets = { "Cardinal": [], "Fixed": [], "Mutable": [] };
    
    // Count planets in each modality
    for (const planetKey in planets) {
      const planet = planets[planetKey];
      const signIndex = Math.floor(planet.longitude / 30);
      const modality = this.getSignModality(signIndex);
      
      modalities[modality]++;
      modalityPlanets[modality].push(planet.name);
    }
    
    // Determine dominant and lacking modalities
    let dominant = Object.keys(modalities).reduce((a, b) => modalities[a] > modalities[b] ? a : b);
    let lacking = Object.keys(modalities).reduce((a, b) => modalities[a] < modalities[b] ? a : b);
    
    if (modalities[dominant] === modalities[lacking]) {
      dominant = "Balanced";
      lacking = "None";
    }
    
    return {
      modalities,
      modalityPlanets,
      dominant,
      lacking,
      interpretation: this.interpretModalityBalance(modalities, dominant, lacking)
    };
  }
  
  // Find dominant planets in the chart
  findDominantPlanets() {
    const planets = this.chartData.planets;
    const aspects = this.chartData.aspects;
    const houses = this.chartData.houses;
    
    const planetScores = {};
    
    // Initialize scores
    for (const planetKey in planets) {
      planetScores[planetKey] = 0;
    }
    
    // Score based on aspects
    aspects.forEach(aspect => {
      // More points for major aspects
      let aspectPoints = 0;
      switch (aspect.type) {
        case 'conjunction': aspectPoints = 5; break;
        case 'opposition': aspectPoints = 4; break;
        case 'trine': aspectPoints = 3; break;
        case 'square': aspectPoints = 3; break;
        case 'sextile': aspectPoints = 2; break;
        default: aspectPoints = 1;
      }
      
      planetScores[aspect.planet1] += aspectPoints;
      planetScores[aspect.planet2] += aspectPoints;
    });
    
    // Score based on house placement
    for (const planetKey in planets) {
      const planet = planets[planetKey];
      const houseNum = window.astroCalculator.determinePlanetHouse(planet, houses);
      
      // Angular houses (1, 4, 7, 10) get more points
      if ([1, 4, 7, 10].includes(houseNum)) {
        planetScores[planetKey] += 5;
      } else if ([2, 5, 8, 11].includes(houseNum)) { // Succedent houses
        planetScores[planetKey] += 3;
      } else { // Cadent houses
        planetScores[planetKey] += 1;
      }
      
      // Check dignity
      const signIndex = Math.floor(planet.longitude / 30);
      const dignity = window.astroCalculator.getPlanetDignity(planetKey, signIndex);
      
      switch (dignity) {
        case "Rulership": planetScores[planetKey] += 5; break;
        case "Exaltation": planetScores[planetKey] += 4; break;
        case "Detriment": planetScores[planetKey] -= 3; break;
        case "Fall": planetScores[planetKey] -= 4; break;
      }
    }
    
    // Get top 3 dominant planets
    const sortedPlanets = Object.keys(planetScores).sort((a, b) => planetScores[b] - planetScores[a]);
    const dominantPlanets = sortedPlanets.slice(0, 3).map(key => ({
      planet: planets[key].name,
      score: planetScores[key],
      interpretation: this.interpretDominantPlanet(key)
    }));
    
    return dominantPlanets;
  }
  
  // Find special patterns in the chart
  findSpecialPatterns() {
    const patterns = [];
    const planets = this.chartData.planets;
    const aspects = this.chartData.aspects;
    
    // Check for Grand Trine (3 planets in trine with each other)
    const trines = aspects.filter(a => a.type === 'trine');
    const trineGroups = {};
    
    trines.forEach(trine => {
      const p1 = trine.planet1;
      const p2 = trine.planet2;
      
      if (!trineGroups[p1]) trineGroups[p1] = new Set();
      if (!trineGroups[p2]) trineGroups[p2] = new Set();
      
      trineGroups[p1].add(p2);
      trineGroups[p2].add(p1);
    });
    
    // Find triads of planets that all trine each other
    for (const p1 in trineGroups) {
      for (const p2 of trineGroups[p1]) {
        for (const p3 of trineGroups[p1]) {
          if (p2 !== p3 && trineGroups[p2].has(p3)) {
            // Found a Grand Trine
            const pattern = [p1, p2, p3].sort().join('-');
            
            // Check if this pattern is already added
            if (!patterns.some(p => p.planets === pattern)) {
              // Get the element of the trine
              const signIndex1 = Math.floor(planets[p1].longitude / 30);
              const element = this.getSignElement(signIndex1);
              
              patterns.push({
                type: 'Grand Trine',
                planets: pattern,
                element: element,
                interpretation: this.interpretGrandTrine(element)
              });
            }
          }
        }
      }
    }
    
    // Check for Grand Cross (4 planets in square with each other)
    const squares = aspects.filter(a => a.type === 'square');
    const oppositions = aspects.filter(a => a.type === 'opposition');
    
    // TODO: Add Grand Cross detection logic
    
    // Check for T-Square (3 planets where 2 are in opposition and both square to the 3rd)
    for (const opposition of oppositions) {
      const p1 = opposition.planet1;
      const p2 = opposition.planet2;
      
      for (const square of squares) {
        if ((square.planet1 === p1 && square.planet2 !== p2) || 
            (square.planet1 === p2 && square.planet2 !== p1)) {
          
          const p3 = square.planet1 === p1 || square.planet1 === p2 ? square.planet2 : square.planet1;
          
          // Check if p3 squares the other opposition planet
          const hasOtherSquare = squares.some(sq => 
            (sq.planet1 === p3 && (sq.planet2 === p1 || sq.planet2 === p2)) ||
            (sq.planet2 === p3 && (sq.planet1 === p1 || sq.planet1 === p2))
          );
          
          if (hasOtherSquare) {
            const pattern = [p1, p2, p3].sort().join('-');
            
            // Check if this pattern is already added
            if (!patterns.some(p => p.planets === pattern)) {
              patterns.push({
                type: 'T-Square',
                planets: pattern,
                focus: p3,
                interpretation: this.interpretTSquare(p3)
              });
            }
          }
        }
      }
    }
    
    return patterns;
  }
  
  // Helper method to get sign element
  getSignElement(signIndex) {
    const elements = ["Fire", "Earth", "Air", "Water"];
    return elements[signIndex % 4];
  }
  
  // Helper method to get sign modality
  getSignModality(signIndex) {
    const modalities = ["Cardinal", "Fixed", "Mutable"];
    return modalities[signIndex % 3];
  }
  
  // Interpretation methods
  interpretPlanetInSign(planet, signIndex) {
    const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    const sign = signs[signIndex];
    
    if (this.interpretations?.planetInSign?.[planet]?.[sign]) {
      return this.interpretations.planetInSign[planet][sign];
    }
    
    return `${planet} in ${sign} shows unique characteristics that blend the energy of the planet with the qualities of the sign.`;
  }
  
  interpretPlanetInHouse(planet, houseNum) {
    if (this.interpretations?.planetInHouse?.[planet]?.[houseNum]) {
      return this.interpretations.planetInHouse[planet][houseNum];
    }
    
    return `${planet} in House ${houseNum} shows how this planetary energy manifests in this area of life.`;
  }
  
  interpretDignity(planet, dignity) {
    const dignityEffects = {
      "Rulership": `${planet} is in its rulership, expressing its energy in its purest form and at full strength.`,
      "Exaltation": `${planet} is exalted, functioning at its highest potential with enhanced positive qualities.`,
      "Detriment": `${planet} is in detriment, facing challenges in expressing its natural qualities.`,
      "Fall": `${planet} is in fall, indicating potential difficulties or weaknesses in its expression.`,
      "Neutral": `${planet} is in a neutral dignity, expressing its qualities in a balanced manner.`
    };
    
    return dignityEffects[dignity] || dignityEffects["Neutral"];
  }
  
  interpretHouseCusp(houseNum, signIndex) {
    const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    const sign = signs[signIndex];
    
    const houseThemes = {
      1: "self-image, appearance, and approach to life",
      2: "values, possessions, and personal resources",
      3: "communication, learning, and immediate environment",
      4: "home, family, and emotional foundations",
      5: "creativity, self-expression, and pleasure",
      6: "work, health, and daily routines",
      7: "partnerships, relationships, and open enemies",
      8: "transformation, shared resources, and the occult",
      9: "higher learning, travel, and belief systems",
      10: "career, reputation, and public image",
      11: "friendships, groups, and aspirations",
      12: "subconscious, hidden matters, and self-undoing"
    };
    
    return `With ${sign} on the ${houseNum}${this.getOrdinalSuffix(houseNum)} house cusp, you approach ${houseThemes[houseNum]} with ${sign} energy.`;
  }
  
  interpretAspect(planet1, planet2, aspectType) {
    if (this.interpretations?.aspects?.[aspectType]?.[`${planet1}-${planet2}`]) {
      return this.interpretations.aspects[aspectType][`${planet1}-${planet2}`];
    }
    
    if (this.interpretations?.aspects?.[aspectType]?.[`${planet2}-${planet1}`]) {
      return this.interpretations.aspects[aspectType][`${planet2}-${planet1}`];
    }
    
    const aspectEffects = {
      "conjunction": "strong blending of energies, creating a powerful focus",
      "opposition": "tension and awareness between opposing forces",
      "trine": "harmonious flow of complementary energies",
      "square": "challenging interaction that stimulates growth through friction",
      "sextile": "opportunity for collaboration and mutual enhancement",
      "semisextile": "subtle adjustment and minor growth opportunities",
      "semisquare": "minor tension that requires small adjustments",
      "sesquiquadrate": "irritation that demands conscious integration",
      "quincunx": "awkward connection requiring significant adjustment",
      "quintile": "creative and inspired interaction",
      "biquintile": "unique talents and innovative interaction"
    };
    
    return `The ${aspectType} between ${planet1} and ${planet2} creates a ${aspectEffects[aspectType] || "connection"} between these planetary energies.`;
  }
  
  interpretElementBalance(elements, dominant, lacking) {
    if (dominant === "Balanced") {
      return "Your chart shows a balanced distribution of elements, suggesting versatility and adaptability across different modes of expression.";
    }
    
    const dominantTraits = {
      "Fire": "enthusiasm, passion, and self-expression",
      "Earth": "practicality, stability, and reliability",
      "Air": "intellect, communication, and social connection",
      "Water": "emotion, intuition, and sensitivity"
    };
    
    const lackingTraits = {
      "Fire": "may struggle with motivation and self-assertion",
      "Earth": "may find it challenging to be practical and grounded",
      "Air": "might have difficulty with objectivity and communication",
      "Water": "could find emotional expression and empathy challenging"
    };
    
    let interpretation = `Your chart emphasizes ${dominant} element energy, suggesting strong ${dominantTraits[dominant]}.`;
    
    if (lacking !== "None" && elements[lacking] === 0) {
      interpretation += ` With no planets in ${lacking} signs, you ${lackingTraits[lacking]}.`;
    } else if (lacking !== "None" && elements[lacking] <= 1) {
      interpretation += ` With minimal ${lacking} influence, you sometimes ${lackingTraits[lacking]}.`;
    }
    
    return interpretation;
  }
  
  interpretModalityBalance(modalities, dominant, lacking) {
    if (dominant === "Balanced") {
      return "Your chart shows a balanced distribution of modalities, suggesting you can initiate, maintain, and adapt with equal facility.";
    }
    
    const dominantTraits = {
      "Cardinal": "initiating action and taking leadership",
      "Fixed": "maintaining stability and seeing things through",
      "Mutable": "adapting to change and being flexible"
    };
    
    const lackingTraits = {
      "Cardinal": "may hesitate to start new ventures",
      "Fixed": "might struggle with consistency and follow-through",
      "Mutable": "could find it difficult to adapt to changing circumstances"
    };
    
    let interpretation = `Your chart emphasizes ${dominant} mode energy, suggesting a natural talent for ${dominantTraits[dominant]}.`;
    
    if (lacking !== "None" && modalities[lacking] === 0) {
      interpretation += ` With no planets in ${lacking} signs, you ${lackingTraits[lacking]}.`;
    } else if (lacking !== "None" && modalities[lacking] <= 1) {
      interpretation += ` With minimal ${lacking} influence, you sometimes ${lackingTraits[lacking]}.`;
    }
    
    return interpretation;
  }
  
  interpretDominantPlanet(planet) {
    const dominantTraits = {
      "sun": "self-expression, identity, and creative power",
      "moon": "emotional responses, instincts, and nurturing qualities",
      "mercury": "communication, thinking, and information processing",
      "venus": "relationships, values, and aesthetic appreciation",
      "mars": "action, drive, and assertiveness",
      "jupiter": "expansion, growth, and optimism",
      "saturn": "structure, responsibility, and discipline",
      "uranus": "innovation, rebellion, and sudden change",
      "neptune": "imagination, spirituality, and dissolution of boundaries",
      "pluto": "transformation, power, and deep psychological dynamics"
    };
    
    return `As a dominant influence in your chart, ${planet} strongly shapes your ${dominantTraits[planet] || "personality"}. This amplifies these qualities in your life and gives them particular importance in your personal expression.`;
  }
  
  interpretGrandTrine(element) {
    const elementTraits = {
      "Fire": "creativity, enthusiasm, and self-expression",
      "Earth": "practicality, reliability, and material success",
      "Air": "intellectual brilliance, communication, and social connection",
      "Water": "emotional depth, intuition, and spiritual connection"
    };
    
    return `The Grand Trine in ${element} provides a powerful harmonious flow of ${elementTraits[element] || "energy"} that comes naturally to you. While this creates ease and talent, there may be a tendency to rely too much on these natural gifts without pushing for growth.`;
  }
  
  interpretTSquare(focusPlanet) {
    return `This T-Square creates dynamic tension with ${focusPlanet} as the focal point, pushing you toward significant growth and achievement through overcoming challenges. The area of life ruled by this planet requires conscious development.`;
  }
  
  // Helper method for getting ordinal suffix
  getOrdinalSuffix(num) {
    const j = num % 10;
    const k = num % 100;
    
    if (j === 1 && k !== 11) {
      return "st";
    }
    if (j === 2 && k !== 12) {
      return "nd";
    }
    if (j === 3 && k !== 13) {
      return "rd";
    }
    
    return "th";
  }
}

// Sample interpretations object (in a real application, this would be much more extensive)
const astroInterpretations = {
  planetInSign: {
    sun: {
      "Aries": "Sun in Aries gives a bold, pioneering spirit with strong leadership qualities and a direct approach to life.",
      "Taurus": "Sun in Taurus provides stability, determination, and a practical approach with an appreciation for comfort and beauty."
      // Add more interpretations as needed
    },
    moon: {
      "Cancer": "Moon in Cancer creates strong emotional sensitivity, nurturing instincts, and deep connection to home and family.",
      "Leo": "Moon in Leo expresses emotions dramatically and needs recognition, with a warm-hearted and generous emotional nature."
      // Add more interpretations as needed
    }
    // Add interpretations for other planets
  },
  planetInHouse: {
    sun: {
      1: "Sun in the 1st house creates a strong self-identity and makes personal expression a central life theme.",
      10: "Sun in the 10th house focuses energy on career ambitions, public image, and achievement of status."
      // Add more interpretations as needed
    },
    moon: {
      4: "Moon in the 4th house deepens emotional connection to home and family, with strong nurturing instincts.",
      7: "Moon in the 7th house seeks emotional fulfillment through partnerships and responds sensitively to others."
      // Add more interpretations as needed
    }
    // Add interpretations for other planets
  },
  aspects: {
    conjunction: {
      "sun-moon": "Sun conjunct Moon blends conscious will with emotional needs, creating integrated self-expression.",
      "mercury-venus": "Mercury conjunct Venus brings charm to communication and aesthetic appreciation to thinking."
      // Add more interpretations as needed
    },
    trine: {
      "jupiter-saturn": "Jupiter trine Saturn balances expansion with structure, creating sustainable growth and realistic optimism."
      // Add more interpretations as needed
    }
    // Add interpretations for other aspects
  }
};

// Expose to global scope
window.ChartAnalyzer = ChartAnalyzer;
window.astroInterpretations = astroInterpretations;
