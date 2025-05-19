/**
 * Chart.js - Astrological Chart Visualization
 * This file contains the functions to render a professional astrological chart
 * with planets, houses, aspects, and detailed calculations
 */

// Main chart renderer
class AstroChart {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.radius = Math.min(this.centerX, this.centerY) * 0.85;
    
    // Default options
    this.options = {
      showAspects: true,
      showDegrees: true,
      showMinutes: true,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      wheelColor: 'rgba(255, 255, 255, 0.1)',
      signColor: 'rgba(255, 204, 0, 0.8)',
      houseColor: 'rgba(0, 204, 255, 0.8)',
      aspectLineWidth: 1,
      ...options
    };
    
    // Define zodiac signs with symbols
    this.zodiacSigns = [
      { name: "Aries", symbol: "♈", element: "Fire", ruling: "Mars" },
      { name: "Taurus", symbol: "♉", element: "Earth", ruling: "Venus" },
      { name: "Gemini", symbol: "♊", element: "Air", ruling: "Mercury" },
      { name: "Cancer", symbol: "♋", element: "Water", ruling: "Moon" },
      { name: "Leo", symbol: "♌", element: "Fire", ruling: "Sun" },
      { name: "Virgo", symbol: "♍", element: "Earth", ruling: "Mercury" },
      { name: "Libra", symbol: "♎", element: "Air", ruling: "Venus" },
      { name: "Scorpio", symbol: "♏", element: "Water", ruling: "Pluto/Mars" },
      { name: "Sagittarius", symbol: "♐", element: "Fire", ruling: "Jupiter" },
      { name: "Capricorn", symbol: "♑", element: "Earth", ruling: "Saturn" },
      { name: "Aquarius", symbol: "♒", element: "Air", ruling: "Uranus/Saturn" },
      { name: "Pisces", symbol: "♓", element: "Water", ruling: "Neptune/Jupiter" }
    ];
    
    // Aspect colors
    this.aspectColors = {
      conjunction: 'rgba(255, 255, 0, 0.6)',      // Yellow
      opposition: 'rgba(255, 0, 0, 0.6)',         // Red
      trine: 'rgba(0, 255, 0, 0.6)',              // Green
      square: 'rgba(255, 0, 0, 0.6)',             // Red
      sextile: 'rgba(0, 255, 255, 0.6)',          // Cyan
      semisextile: 'rgba(150, 150, 255, 0.5)',    // Light Blue
      semisquare: 'rgba(255, 150, 150, 0.5)',     // Light Red
      sesquiquadrate: 'rgba(255, 100, 100, 0.5)', // Red-Orange
      quincunx: 'rgba(150, 150, 150, 0.5)',       // Gray
      quintile: 'rgba(255, 150, 255, 0.5)',       // Pink
      biquintile: 'rgba(200, 100, 200, 0.5)'      // Purple
    };
    
    // Element colors
    this.elementColors = {
      "Fire": "rgba(255, 50, 0, 0.4)",
      "Earth": "rgba(76, 153, 0, 0.4)",
      "Air": "rgba(255, 255, 0, 0.4)",
      "Water": "rgba(0, 100, 255, 0.4)"
    };
  }
  
  // Main draw function
  drawChart(chartData) {
    this.clear();
    this.chartData = chartData;
    
    // Draw the chart elements in specific order
    this.drawBackground();
    this.drawWheelStructure();
    this.drawZodiacWheel();
    this.drawHouseCusps();
    
    if (this.options.showAspects) {
      this.drawAspects();
    }
    
    this.drawPlanets();
    this.drawChartCenter();
    
    return this;
  }
  
  // Clear the canvas
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    return this;
  }
  
  // Draw cosmic background
  drawBackground() {
    // Create radial gradient for cosmic background
    const gradient = this.ctx.createRadialGradient(
      this.centerX, this.centerY, 0,
      this.centerX, this.centerY, this.radius * 1.5
    );
    
    gradient.addColorStop(0, 'rgba(20, 0, 50, 1)');
    gradient.addColorStop(0.5, 'rgba(40, 0, 80, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 0, 20, 0.9)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Add some stars
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      const size = Math.random() * 2;
      const opacity = Math.random() * 0.8 + 0.2;
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      this.ctx.fill();
    }
    
    return this;
  }
  
  // Draw the basic wheel structure
  drawWheelStructure() {
    // Draw outer wheel border
    this.ctx.strokeStyle = 'rgba(255, 204, 0, 0.6)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
    this.ctx.stroke();
    
    // Draw inner wheel (for houses)
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.radius * 0.85, 0, Math.PI * 2);
    this.ctx.stroke();
    
    // Draw innermost wheel (for planets)
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.radius * 0.7, 0, Math.PI * 2);
    this.ctx.stroke();
    
    // Draw center circle
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.radius * 0.2, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(0, 204, 255, 0.6)';
    this.ctx.stroke();
    
    return this;
  }
  
  // Draw the zodiac signs wheel
  drawZodiacWheel() {
    const radius = this.radius;
    const outerRadius = radius;
    const innerRadius = radius * 0.85;
    
    // Draw the 12 zodiac segments
    for (let i = 0; i < 12; i++) {
      const startAngle = (i * 30 - 90) * Math.PI / 180;
      const endAngle = ((i + 1) * 30 - 90) * Math.PI / 180;
      const sign = this.zodiacSigns[i];
      
      // Fill segment with element color
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, outerRadius, startAngle, endAngle);
      this.ctx.arc(this.centerX, this.centerY, innerRadius, endAngle, startAngle, true);
      this.ctx.closePath();
      this.ctx.fillStyle = this.elementColors[sign.element];
      this.ctx.fill();
      
      // Draw segment border
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, outerRadius, startAngle, endAngle);
      this.ctx.arc(this.centerX, this.centerY, innerRadius, endAngle, startAngle, true);
      this.ctx.closePath();
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
      
      // Draw zodiac symbol
      const midAngle = (startAngle + endAngle) / 2;
      const textRadius = (outerRadius + innerRadius) / 2;
      const x = this.centerX + Math.cos(midAngle) * textRadius;
      const y = this.centerY + Math.sin(midAngle) * textRadius;
      
      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.rotate(midAngle + Math.PI / 2);
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      this.ctx.font = 'bold 18px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(sign.symbol, 0, 0);
      this.ctx.restore();
      
      // Draw degree markers (every 5 degrees)
      for (let deg = 0; deg < 30; deg += 5) {
        const degAngle = (i * 30 + deg - 90) * Math.PI / 180;
        const markerLength = deg % 10 === 0 ? 10 : 5;
        
        this.ctx.beginPath();
        this.ctx.moveTo(
          this.centerX + Math.cos(degAngle) * outerRadius,
          this.centerY + Math.sin(degAngle) * outerRadius
        );
        this.ctx.lineTo(
          this.centerX + Math.cos(degAngle) * (outerRadius - markerLength),
          this.centerY + Math.sin(degAngle) * (outerRadius - markerLength)
        );
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // Add degree number for every 10 degrees
        if (deg % 10 === 0 && this.options.showDegrees) {
          const textRadius = outerRadius - 15;
          const x = this.centerX + Math.cos(degAngle) * textRadius;
          const y = this.centerY + Math.sin(degAngle) * textRadius;
          
          this.ctx.save();
          this.ctx.translate(x, y);
          this.ctx.rotate(degAngle + Math.PI / 2);
          this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          this.ctx.font = '10px Arial';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText(deg.toString(), 0, 0);
          this.ctx.restore();
        }
      }
    }
    
    return this;
  }
  
  // Draw house cusps
  drawHouseCusps() {
    if (!this.chartData || !this.chartData.houses) return this;
    
    const houses = this.chartData.houses;
    const innerRadius = this.radius * 0.7;
    
    // Draw house lines
    for (let i = 0; i < houses.length; i++) {
      const house = houses[i];
      const angle = (house.cusp - 90) * Math.PI / 180;
      
      // Draw house cusp line
      this.ctx.beginPath();
      this.ctx.moveTo(this.centerX, this.centerY);
      this.ctx.lineTo(
        this.centerX + Math.cos(angle) * this.radius,
        this.centerY + Math.sin(angle) * this.radius
      );
      this.ctx.strokeStyle = 'rgba(0, 204, 255, 0.7)';
      this.ctx.lineWidth = i % 3 === 0 ? 2 : 1; // Emphasize angular houses (1, 4, 7, 10)
      this.ctx.stroke();
      
      // Draw house number
      const textRadius = this.radius * 0.78;
      const x = this.centerX + Math.cos(angle) * textRadius;
      const y = this.centerY + Math.sin(angle) * textRadius;
      
      this.ctx.fillStyle = 'rgba(0, 204, 255, 0.9)';
      this.ctx.font = 'bold 14px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(house.number.toString(), x, y);
    }
    
    return this;
  }
  
  // Draw planets
  drawPlanets() {
    if (!this.chartData || !this.chartData.planets) return this;
    
    const planetPositions = this.chartData.planets;
    const planetKeys = Object.keys(planetPositions);
    
    // Calculate planet placements to avoid overlaps
    const placedPlanets = [];
    
    planetKeys.forEach(planetKey => {
      const planet = planetPositions[planetKey];
      const angle = (planet.longitude - 90) * Math.PI / 180;
      
      // Default placement radius
      let placementRadius = this.radius * 0.6;
      
      // Check for planet clustering and adjust radius if needed
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 5) {
        placed = true;
        
        for (const placedPlanet of placedPlanets) {
          const distance = Math.abs(planet.longitude - placedPlanet.longitude) % 360;
          const minDistance = 5; // Minimum 5 degrees separation
          
          if (distance < minDistance) {
            placed = false;
            placementRadius -= this.radius * 0.05;
            break;
          }
        }
        
        attempts++;
      }
      
      // Add to placed planets
      placedPlanets.push({
        ...planet,
        placementRadius
      });
      
      // Draw the planet
      const x = this.centerX + Math.cos(angle) * placementRadius;
      const y = this.centerY + Math.sin(angle) * placementRadius;
      
      // Draw planet symbol
      this.ctx.fillStyle = planet.color || 'white';
      this.ctx.font = 'bold 20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(planet.symbol, x, y);
      
      // Draw planet degree
      if (this.options.showDegrees) {
        const degreeText = `${planet.degree}°${planet.isRetrograde ? ' ℞' : ''}`;
        this.ctx.font = '10px Arial';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.fillText(degreeText, x, y + 15);
      }
      
      // Draw line to exact position on wheel
      const exactAngle = (planet.longitude - 90) * Math.PI / 180;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(
        this.centerX + Math.cos(exactAngle) * this.radius,
        this.centerY + Math.sin(exactAngle) * this.radius
      );
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    });
    
    return this;
  }
  
  // Draw aspects between planets
  drawAspects() {
    if (!this.chartData || !this.chartData.aspects) return this;
    
    const aspects = this.chartData.aspects;
    const planetPositions = this.chartData.planets;
    
    // Draw each aspect line
    aspects.forEach(aspect => {
      const planet1 = planetPositions[aspect.planet1];
      const planet2 = planetPositions[aspect.planet2];
      
      if (!planet1 || !planet2) return;
      
      // Calculate positions
      const angle1 = (planet1.longitude - 90) * Math.PI / 180;
      const angle2 = (planet2.longitude - 90) * Math.PI / 180;
      
      // Use inner circle for aspect lines
      const aspectRadius = this.radius * 0.3;
      const x1 = this.centerX + Math.cos(angle1) * aspectRadius;
      const y1 = this.centerY + Math.sin(angle1) * aspectRadius;
      const x2 = this.centerX + Math.cos(angle2) * aspectRadius;
      const y2 = this.centerY + Math.sin(angle2) * aspectRadius;
      
      // Draw the aspect line
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      
      // Set line style based on aspect type
      const color = this.aspectColors[aspect.type] || 'rgba(255, 255, 255, 0.3)';
      this.ctx.strokeStyle = color;
      
      // Adjust line width based on orb
      const maxLineWidth = 2;
      const orb = parseFloat(aspect.orb);
      const lineWidth = maxLineWidth * (1 - orb / 8); // Assuming 8 is max orb
      
      this.ctx.lineWidth = Math.max(0.5, lineWidth);
      
      // Different line patterns for different aspects
      if (aspect.type === 'opposition' || aspect.type === 'square' || 
          aspect.type === 'semisquare' || aspect.type === 'sesquiquadrate') {
        this.ctx.setLineDash([5, 3]);
      } else {
        this.ctx.setLineDash([]);
      }
      
      this.ctx.stroke();
      this.ctx.setLineDash([]); // Reset line dash
    });
    
    return this;
  }
  
  // Draw special effects in the chart center
  drawChartCenter() {
    // Create central glow effect
    const gradient = this.ctx.createRadialGradient(
      this.centerX, this.centerY, 0,
      this.centerX, this.centerY, this.radius * 0.2
    );
    
    gradient.addColorStop(0, 'rgba(0, 150, 255, 0.3)');
    gradient.addColorStop(0.5, 'rgba(0, 100, 200, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 50, 150, 0)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.radius * 0.2, 0, Math.PI * 2);
    this.ctx.fill();
    
    return this;
  }
  
  // Generate chart info summary text
  generateSummaryText() {
    if (!this.chartData) return '';
    
    const planetPositions = this.chartData.planets;
    const houses = this.chartData.houses;
    const aspects = this.chartData.aspects;
    
    let summary = '';
    
    // Add planet positions
    summary += '⚝ PLANETARY POSITIONS ⚝\n';
    Object.keys(planetPositions).forEach(planetKey => {
      const planet = planetPositions[planetKey];
      const sign = window.astroCalculator.getZodiacSign(planet.longitude);
      const degreeInSign = planet.degree;
      const houseNum = window.astroCalculator.determinePlanetHouse(planet, houses);
      const dignity = window.astroCalculator.getPlanetDignity(planetKey, planet.sign);
      
      summary += `${planet.symbol} ${planet.name}: ${sign} ${degreeInSign}° ${planet.isRetrograde ? '℞' : ''} (House ${houseNum})`;
      if (dignity !== 'Neutral') {
        summary += ` [${dignity}]`;
      }
      summary += '\n';
    });
    
    // Add house cusps
    summary += '\n⚝ HOUSE CUSPS ⚝\n';
    houses.forEach(house => {
      const sign = window.astroCalculator.getZodiacSign(house.cusp);
      const degreeInSign = window.astroCalculator.getZodiacDegree(house.cusp).toFixed(2);
      summary += `House ${house.number}: ${sign} ${degreeInSign}°\n`;
    });
    
    // Add aspects
    summary += '\n⚝ MAJOR ASPECTS ⚝\n';
    aspects.forEach(aspect => {
      if (['conjunction', 'opposition', 'trine', 'square', 'sextile'].includes(aspect.type)) {
        const planet1 = planetPositions[aspect.planet1].name;
        const planet2 = planetPositions[aspect.planet2].name;
        summary += `${planet1} ${aspect.symbol} ${planet2} (${aspect.angle}° orb: ${aspect.orb}°)\n`;
      }
    });
    
    // Add important points
    const ascendant = houses.find(h => h.number === 1)?.cusp || 0;
    const midheaven = houses.find(h => h.number === 10)?.cusp || 0;
    
    summary += '\n⚝ IMPORTANT POINTS ⚝\n';
    summary += `Ascendant: ${window.astroCalculator.getZodiacSign(ascendant)} ${window.astroCalculator.getZodiacDegree(ascendant).toFixed(2)}°\n`;
    summary += `Midheaven: ${window.astroCalculator.getZodiacSign(midheaven)} ${window.astroCalculator.getZodiacDegree(midheaven).toFixed(2)}°\n`;
    
    return summary;
  }
}

// Initialize chart and expose to global scope
window.AstroChart = AstroChart;
