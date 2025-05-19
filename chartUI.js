/**
 * ChartUI.js - UI Integration for Astrological Charts
 * Connects the advanced chart functionality to the Horonum application
 */

// Chart UI Controller
class ChartUIController {
  constructor() {
    this.chartData = null;
    this.chart = null;
    this.analyzer = null;
    this.chartMode = 'basic'; // Options: basic, detailed, professional
    this.initialized = false;
    
    // Chart canvas element
    this.canvas = null;
    
    // House system
    this.houseSystem = 'placidus';
  }
  
  // Initialize the chart UI
  initialize() {
    if (this.initialized) return;
    
    // Create UI elements
    this.createChartUI();
    
    // Add event listeners
    this.addEventListeners();
    
    this.initialized = true;
  }
  
  // Create chart UI elements
  createChartUI() {
    // Add natal chart mode to star selector
    const starSelector = document.querySelector('.star-selector');
    if (starSelector) {
      const natalChartBtn = document.createElement('div');
      natalChartBtn.className = 'star-btn';
      natalChartBtn.textContent = 'Natal Chart';
      natalChartBtn.onclick = function() { selectMode('natalchart'); };
      starSelector.appendChild(natalChartBtn);
      
      // Force initialization
      setTimeout(() => {
        this.initialize();
      }, 500);
    }
    
    // Create chart container
    const chartContainer = document.createElement('div');
    chartContainer.id = 'chart-container';
    chartContainer.className = 'input-constellation';
    chartContainer.style.display = 'none';
    
    // Create chart inputs
    chartContainer.innerHTML = `
      <h3>Birth Information</h3>
      <input type="text" id="chart-name" placeholder="Your Name">
      <input type="date" id="chart-birthdate" placeholder="Birth Date">
      <input type="time" id="chart-birthtime" placeholder="Birth Time">
      <input type="text" id="chart-birthplace" placeholder="Birth Place (City, Country)">
      
      <div class="chart-options">
        <h3>Chart Options</h3>
        <div class="option-group">
          <label>House System:</label>
          <select id="house-system">
            <option value="placidus">Placidus</option>
            <option value="koch">Koch</option>
            <option value="equal">Equal House</option>
            <option value="whole">Whole Sign</option>
          </select>
        </div>
        
        <div class="option-group">
          <label>Chart Detail Level:</label>
          <select id="chart-detail">
            <option value="basic">Basic</option>
            <option value="detailed">Detailed</option>
            <option value="professional">Professional</option>
          </select>
        </div>
      </div>
      
      <div class="button-group">
        <button class="generate-btn" id="generate-chart">Generate Chart</button>
        <button class="clear-btn" id="clear-chart">Clear</button>
      </div>
    `;
    
    // Create chart canvas element
    const chartCanvas = document.createElement('div');
    chartCanvas.className = 'chart-display';
    chartCanvas.innerHTML = `
      <canvas id="natal-chart" width="600" height="600">Your browser does not support canvas</canvas>
      <div id="chart-info" class="chart-info"></div>
    `;
    
    // Create chart analysis section
    const analysisSection = document.createElement('div');
    analysisSection.id = 'chart-analysis';
    analysisSection.className = 'output-sphere';
    analysisSection.style.display = 'none';
    analysisSection.innerHTML = `
      <div class="analysis-tabs">
        <div class="analysis-tab active" data-tab="planets">Planets</div>
        <div class="analysis-tab" data-tab="houses">Houses</div>
        <div class="analysis-tab" data-tab="aspects">Aspects</div>
        <div class="analysis-tab" data-tab="patterns">Patterns</div>
      </div>
      <div class="analysis-content" id="analysis-content">
        <div class="loading-message">Generate your chart to see the analysis</div>
      </div>
      <button class="save-btn" id="save-chart">Save Chart Image</button>
    `;
    
    // Append all elements to main page
    const celestialInterface = document.querySelector('.celestial-interface');
    if (celestialInterface) {
      celestialInterface.appendChild(chartContainer);
      celestialInterface.appendChild(chartCanvas);
      celestialInterface.appendChild(analysisSection);
    }
    
    // Add styles
    this.addStyles();
  }
  
  // Add custom styles for chart UI
  addStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .chart-display {
        display: none;
        margin-top: 20px;
        text-align: center;
      }
      
      #natal-chart {
        max-width: 100%;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 10px;
        box-shadow: 0 0 20px rgba(0, 204, 255, 0.3);
      }
      
      .chart-info {
        margin-top: 10px;
        white-space: pre-line;
        text-align: left;
        font-family: monospace;
        font-size: 0.8rem;
        max-height: 200px;
        overflow-y: auto;
        padding: 10px;
        border-radius: 5px;
        background: rgba(0, 0, 0, 0.3);
      }
      
      .analysis-tabs {
        display: flex;
        margin-bottom: 15px;
        border-bottom: 1px solid rgba(255, 204, 0, 0.3);
      }
      
      .analysis-tab {
        padding: 8px 15px;
        cursor: pointer;
        transition: all 0.3s;
        border-bottom: 2px solid transparent;
      }
      
      .analysis-tab.active {
        color: #ffcc00;
        border-bottom: 2px solid #ffcc00;
      }
      
      .analysis-content {
        padding: 10px 0;
      }
      
      .planet-item, .house-item, .aspect-item, .pattern-item {
        margin-bottom: 15px;
        padding-bottom: 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .planet-header, .house-header, .aspect-header, .pattern-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
        font-weight: bold;
      }
      
      .planet-description, .house-description, .aspect-description, .pattern-description {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.8);
      }
      
      .save-btn {
        display: block;
        margin: 15px auto 0;
        padding: 8px 20px;
        background: #ffcc00;
        border: none;
        border-radius: 20px;
        color: #2b0a5a;
        cursor: pointer;
        transition: transform 0.3s;
      }
      
      .save-btn:hover {
        transform: scale(1.05);
      }
      
      .option-group {
        margin-bottom: 10px;
        display: flex;
        align-items: center;
      }
      
      .option-group label {
        margin-right: 10px;
        min-width: 120px;
      }
      
      .option-group select {
        flex: 1;
        padding: 8px;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 204, 0, 0.5);
        border-radius: 5px;
        color: white;
      }
      
      @media (max-width: 600px) {
        #natal-chart {
          width: 100%;
          height: auto;
        }
        
        .option-group {
          flex-direction: column;
          align-items: flex-start;
        }
        
        .option-group label {
          margin-bottom: 5px;
        }
      }
    `;
    
    document.head.appendChild(styleElement);
  }
  
  // Add event listeners for chart UI
  addEventListeners() {
    // Generate chart button
    const generateBtn = document.getElementById('generate-chart');
    if (generateBtn) {
      generateBtn.addEventListener('click', () => this.generateChart());
    }
    
    // Clear chart button
    const clearBtn = document.getElementById('clear-chart');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearChart());
    }
    
    // House system select
    const houseSystemSelect = document.getElementById('house-system');
    if (houseSystemSelect) {
      houseSystemSelect.addEventListener('change', (e) => {
        this.houseSystem = e.target.value;
        if (this.chartData) {
          this.generateChart();
        }
      });
    }
    
    // Chart detail level select
    const chartDetailSelect = document.getElementById('chart-detail');
    if (chartDetailSelect) {
      chartDetailSelect.addEventListener('change', (e) => {
        this.chartMode = e.target.value;
        if (this.chartData) {
          this.updateChartDisplay();
        }
      });
    }
    
    // Save chart button
    const saveBtn = document.getElementById('save-chart');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveChartImage());
    }
    
    // Analysis tabs
    const analysisTabs = document.querySelectorAll('.analysis-tab');
    analysisTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        // Remove active class from all tabs
        analysisTabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        e.target.classList.add('active');
        
        // Show corresponding content
        const tabName = e.target.getAttribute('data-tab');
        this.showAnalysisTab(tabName);
      });
    });
  }
  
  // Generate natal chart
  generateChart() {
    const name = document.getElementById('chart-name').value;
    const birthdate = document.getElementById('chart-birthdate').value;
    const birthtime = document.getElementById('chart-birthtime').value || '12:00';
    const birthplace = document.getElementById('chart-birthplace').value || 'New York, USA';
    
    if (!name || !birthdate) {
      alert('Please enter your name and birth date');
      return;
    }
    
    // Default coordinates (would be calculated from birthplace in a full implementation)
    const latitude = 40.7128;  // New York latitude
    const longitude = -74.0060; // New York longitude
    
    // Calculate natal chart
    this.chartData = window.astroCalculator.calculateNatalChart(
      birthdate, 
      birthtime, 
      latitude, 
      longitude,
      this.houseSystem
    );
    
    // Create chart and analyzer
    this.chart = new window.AstroChart('natal-chart');
    this.analyzer = new window.ChartAnalyzer(this.chartData);
    
    // Show chart display
    document.querySelector('.chart-display').style.display = 'block';
    document.getElementById('chart-analysis').style.display = 'block';
    
    // Display the chart
    this.updateChartDisplay();
    
    // Generate and show analysis
    this.generateAnalysis();
  }
  
  // Update chart display based on selected mode
  updateChartDisplay() {
    if (!this.chart || !this.chartData) return;
    
    // Set options based on chart mode
    const options = {
      showAspects: true,
      showDegrees: this.chartMode !== 'basic',
      showMinutes: this.chartMode === 'professional'
    };
    
    // Draw the chart
    this.chart.options = { ...this.chart.options, ...options };
    this.chart.drawChart(this.chartData);
    
    // Update chart info
    const chartInfo = document.getElementById('chart-info');
    if (chartInfo) {
      chartInfo.textContent = this.chart.generateSummaryText();
    }
  }
  
  // Generate chart analysis
  generateAnalysis() {
    if (!this.analyzer) return;
    
    const analysis = this.analyzer.generateFullAnalysis();
    
    // Show planets tab by default
    this.showAnalysisTab('planets', analysis);
  }
  
  // Show specific analysis tab
  showAnalysisTab(tabName, analysis = null) {
    if (!this.analyzer && !analysis) return;
    
    const content = document.getElementById('analysis-content');
    if (!content) return;
    
    // If analysis not provided, use the one from the analyzer
    const data = analysis || this.analyzer.generateFullAnalysis();
    
    let html = '';
    
    switch (tabName) {
      case 'planets':
        // Planet positions tab
        html = this.generatePlanetsTabHTML(data.planetPositions);
        break;
        
      case 'houses':
        // House cusps tab
        html = this.generateHousesTabHTML(data.houseCusps);
        break;
        
      case 'aspects':
        // Aspects tab
        html = this.generateAspectsTabHTML(data.aspects);
        break;
        
      case 'patterns':
        // Patterns tab (combines element/modality balance and special patterns)
        html = this.generatePatternsTabHTML(data);
        break;
    }
    
    content.innerHTML = html;
  }
  
  // Generate HTML for planets tab
  generatePlanetsTabHTML(planets) {
    if (!planets || planets.length === 0) {
      return '<div class="loading-message">No planetary data available</div>';
    }
    
    let html = '<div class="planets-container">';
    
    planets.forEach(planet => {
      html += `
        <div class="planet-item">
          <div class="planet-header">
            <span>${planet.symbol} ${planet.planet}</span>
            <span>${planet.formattedPosition} ${planet.retrograde ? '℞' : ''}</span>
          </div>
          <div class="planet-location">
            <span>House ${planet.house}</span>
            <span>${planet.dignity !== 'Neutral' ? planet.dignity : ''}</span>
          </div>
          <div class="planet-description">
            ${planet.interpretation}
          </div>
          <div class="planet-description">
            ${planet.houseInterpretation}
          </div>
          ${planet.dignity !== 'Neutral' ? `
            <div class="planet-description">
              ${planet.dignityEffect}
            </div>
          ` : ''}
        </div>
      `;
    });
    
    html += '</div>';
    return html;
  }
  
  // Generate HTML for houses tab
  generateHousesTabHTML(houses) {
    if (!houses || houses.length === 0) {
      return '<div class="loading-message">No house data available</div>';
    }
    
    let html = '<div class="houses-container">';
    
    houses.forEach(house => {
      html += `
        <div class="house-item">
          <div class="house-header">
            <span>House ${house.house}</span>
            <span>${house.sign} ${house.degree}°</span>
          </div>
          <div class="house-description">
            ${house.interpretation}
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    return html;
  }
  
  // Generate HTML for aspects tab
  generateAspectsTabHTML(aspects) {
    if (!aspects || aspects.length === 0) {
      return '<div class="loading-message">No aspect data available</div>';
    }
    
    let html = '<div class="aspects-container">';
    
    // Major aspects first
    const majorAspects = aspects.filter(a => 
      ['conjunction', 'opposition', 'trine', 'square', 'sextile'].includes(a.aspect.toLowerCase())
    );
    
    if (majorAspects.length > 0) {
      html += '<h3>Major Aspects</h3>';
      
      majorAspects.forEach(aspect => {
        html += `
          <div class="aspect-item">
            <div class="aspect-header">
              <span>${aspect.planets} (${aspect.symbol})</span>
              <span>${aspect.angle}° (orb: ${aspect.orb}°)</span>
            </div>
            <div class="aspect-description">
              ${aspect.interpretation}
            </div>
          </div>
        `;
      });
    }
    
    // Minor aspects
    const minorAspects = aspects.filter(a => 
      !['conjunction', 'opposition', 'trine', 'square', 'sextile'].includes(a.aspect.toLowerCase())
    );
    
    if (minorAspects.length > 0) {
      html += '<h3>Minor Aspects</h3>';
      
      minorAspects.forEach(aspect => {
        html += `
          <div class="aspect-item">
            <div class="aspect-header">
              <span>${aspect.planets} (${aspect.symbol})</span>
              <span>${aspect.angle}° (orb: ${aspect.orb}°)</span>
            </div>
            <div class="aspect-description">
              ${aspect.interpretation}
            </div>
          </div>
        `;
      });
    }
    
    html += '</div>';
    return html;
  }
  
  // Generate HTML for patterns tab
  generatePatternsTabHTML(data) {
    let html = '<div class="patterns-container">';
    
    // Element balance
    if (data.elementBalance) {
      html += `
        <div class="pattern-item">
          <div class="pattern-header">
            <span>Element Balance</span>
          </div>
          <div class="element-distribution">
            Fire: ${data.elementBalance.elements.Fire} | 
            Earth: ${data.elementBalance.elements.Earth} | 
            Air: ${data.elementBalance.elements.Air} | 
            Water: ${data.elementBalance.elements.Water}
          </div>
          <div class="pattern-description">
            ${data.elementBalance.interpretation}
          </div>
        </div>
      `;
    }
    
    // Modality balance
    if (data.modalityBalance) {
      html += `
        <div class="pattern-item">
          <div class="pattern-header">
            <span>Modality Balance</span>
          </div>
          <div class="modality-distribution">
            Cardinal: ${data.modalityBalance.modalities.Cardinal} | 
            Fixed: ${data.modalityBalance.modalities.Fixed} | 
            Mutable: ${data.modalityBalance.modalities.Mutable}
          </div>
          <div class="pattern-description">
            ${data.modalityBalance.interpretation}
          </div>
        </div>
      `;
    }
    
    // Dominant planets
    if (data.dominantPlanets && data.dominantPlanets.length > 0) {
      html += `
        <div class="pattern-item">
          <div class="pattern-header">
            <span>Dominant Planets</span>
          </div>
          <div class="dominant-planets">
      `;
      
      data.dominantPlanets.forEach(planet => {
        html += `
          <div class="dominant-planet">
            <strong>${planet.planet}</strong>
            <div class="pattern-description">
              ${planet.interpretation}
            </div>
          </div>
        `;
      });
      
      html += `
          </div>
        </div>
      `;
    }
    
    // Special patterns
    if (data.specialPatterns && data.specialPatterns.length > 0) {
      html += `
        <div class="pattern-item">
          <div class="pattern-header">
            <span>Special Patterns</span>
          </div>
      `;
      
      data.specialPatterns.forEach(pattern => {
        html += `
          <div class="special-pattern">
            <strong>${pattern.type}</strong> (${pattern.planets})
            <div class="pattern-description">
              ${pattern.interpretation}
            </div>
          </div>
        `;
      });
      
      html += `
        </div>
      `;
    }
    
    html += '</div>';
    return html;
  }
  
  // Clear chart data and UI
  clearChart() {
    // Clear input fields
    document.getElementById('chart-name').value = '';
    document.getElementById('chart-birthdate').value = '';
    document.getElementById('chart-birthtime').value = '';
    document.getElementById('chart-birthplace').value = '';
    
    // Hide chart display
    document.querySelector('.chart-display').style.display = 'none';
    document.getElementById('chart-analysis').style.display = 'none';
    
    // Clear chart data
    this.chartData = null;
    this.chart = null;
    this.analyzer = null;
    
    // Clear canvas
    const canvas = document.getElementById('natal-chart');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // Clear chart info
    const chartInfo = document.getElementById('chart-info');
    if (chartInfo) {
      chartInfo.textContent = '';
    }
    
    // Clear analysis content
    const analysisContent = document.getElementById('analysis-content');
    if (analysisContent) {
      analysisContent.innerHTML = '<div class="loading-message">Generate your chart to see the analysis</div>';
    }
  }
  
  // Save chart as image
  saveChartImage() {
    const canvas = document.getElementById('natal-chart');
    if (!canvas) return;
    
    // Create a temporary link
    const link = document.createElement('a');
    link.download = 'natal-chart.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}

// Global UI controller instance
window.chartUIController = new ChartUIController();

// Extend the existing selectMode function
const originalSelectMode = window.selectMode;
window.selectMode = function(mode) {
  // Call the original function
  if (typeof originalSelectMode === 'function') {
    originalSelectMode(mode);
  } else {
    // Fallback if original function doesn't exist
    // Set active state
    document.querySelectorAll('.star-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`.star-btn[onclick="selectMode('${mode}')"]`).classList.add('active');
  }
  
  // Create chart container if it doesn't exist
  if (mode === 'natalchart') {
    if (!document.getElementById('chart-container')) {
      window.chartUIController = new ChartUIController();
      window.chartUIController.initialize();
    }
  }
  
  // Show/hide the appropriate containers
  document.querySelector('.input-constellation').style.display = (mode === 'natalchart') ? 'none' : 'block';
  if (document.getElementById('chart-container')) {
    document.getElementById('chart-container').style.display = (mode === 'natalchart') ? 'block' : 'none';
  }
  document.querySelector('.output-sphere').style.display = (mode !== 'natalchart') ? 'block' : 'none';
  if (document.getElementById('chart-analysis')) {
    document.getElementById('chart-analysis').style.display = 'none';
  }
  if (document.querySelector('.chart-display')) {
    document.querySelector('.chart-display').style.display = 'none';
  }
  document.querySelector('.spin-info').style.display = (mode === 'natalchart') ? 'none' : 'block';
  
  // Initialize chart UI when natal chart mode is selected
  if (mode === 'natalchart' && window.chartUIController) {
    window.chartUIController.initialize();
  }
};
