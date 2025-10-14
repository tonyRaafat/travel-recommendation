document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const clearBtn = document.getElementById('clearBtn');
    const resultsContainer = document.getElementById('results');
    const resultsOverlay = document.getElementById('results-overlay');
    const closeResultsBtn = document.getElementById('closeResults');

    let travelData = null;

    const imageMap = {
        'enter_your_image_for_sydney.jpg': 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?q=80&w=1600&auto=format&fit=crop',
        'enter_your_image_for_melbourne.jpg': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=1600&auto=format&fit=crop',
        'enter_your_image_for_tokyo.jpg': 'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?q=80&w=1600&auto=format&fit=crop',
        'enter_your_image_for_kyoto.jpg': 'https://images.unsplash.com/photo-1554797589-7241bb691973?q=80&w=1600&auto=format&fit=crop',
        'enter_your_image_for_rio.jpg': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1600&auto=format&fit=crop',
    'enter_your_image_for_sao-paulo.jpg': 'https://images.unsplash.com/photo-1530031672926-4832b57694f6?q=80&w=1600&auto=format&fit=crop',
        'enter_your_image_for_angkor-wat.jpg': 'https://images.unsplash.com/photo-1505839673365-e3971f8d9184?q=80&w=1600&auto=format&fit=crop',
        'enter_your_image_for_taj-mahal.jpg': 'https://images.unsplash.com/photo-1588613253519-a72fde0360f4?q=80&w=1600&auto=format&fit=crop',
        'enter_your_image_for_bora-bora.jpg': 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1600&auto=format&fit=crop',
        'enter_your_image_for_copacabana.jpg': 'https://images.unsplash.com/photo-1544986581-efac024faf62?q=80&w=1600&auto=format&fit=crop'
    };

    fetch('travel_recommendation_api.json')
        .then(res => {
            if(!res.ok) throw new Error('HTTP '+res.status);
            return res.json();
        })
        .then(data => {
            // Inject keyword arrays and map images
            data.countries.forEach(country => {
                country.cities.forEach(city => {
                    city.imageUrl = imageMap[city.imageUrl] || city.imageUrl;
                    city.keywords = buildKeywords([city.name, country.name]);
                });
            });
            data.temples.forEach(t => { t.imageUrl = imageMap[t.imageUrl] || t.imageUrl; t.keywords = buildKeywords([t.name,'temple']); });
            data.beaches.forEach(b => { b.imageUrl = imageMap[b.imageUrl] || b.imageUrl; b.keywords = buildKeywords([b.name,'beach']); });
            travelData = data;
            console.log('Travel data loaded:', travelData);
            console.log('Beaches available:', travelData.beaches);
            console.log('Temples available:', travelData.temples);
            console.log('Countries available:', travelData.countries);
        })
        .catch(err => {
            console.error('Failed to load travel_recommendation.json', err);
            // Fallback inline data (minimal) so site still works when fetch blocked (e.g., file://)
            travelData = {
                countries:[{
                    name:'Australia',cities:[
                        {name:'Sydney, Australia',imageUrl:imageMap['enter_your_image_for_sydney.jpg'],description:'A vibrant city known for its iconic landmarks like the Opera House & Harbour Bridge.',keywords:['sydney','australia','city']},
                        {name:'Melbourne, Australia',imageUrl:imageMap['enter_your_image_for_melbourne.jpg'],description:'Cultural hub famous for art, food & neighborhoods.',keywords:['melbourne','australia','city']}
                    ]
                }],
                temples:[{name:'Taj Mahal, India',imageUrl:imageMap['enter_your_image_for_taj-mahal.jpg'],description:'Iconic symbol of love; Mughal architecture masterpiece.',keywords:['taj','mahal','india','temple']}],
                beaches:[{name:'Bora Bora, French Polynesia',imageUrl:imageMap['enter_your_image_for_bora-bora.jpg'],description:'Turquoise waters & overwater bungalows.',keywords:['bora','bora','beach']}]
            };
            console.log('Using fallback travel data');
        });

    function buildKeywords(arr){
        return arr.join(' ').toLowerCase().split(/[^a-z]+/).filter(Boolean);
    }

    function performSearch() {
        console.log('Search button clicked');
        if(!travelData){
            resultsContainer.innerHTML = '<h2 style="margin-top:0;color:#fff;">Loading...</h2><p style="color:#fff;">Data is still loading. Please try again in a second.</p>';
            resultsOverlay.classList.add('active');
            return;
        }
        const query = searchInput.value.toLowerCase().trim();
        console.log('User query:', query);
    resultsContainer.innerHTML = '';
    resultsOverlay.classList.remove('active');

        if (!query) {
            resultsContainer.innerHTML = '<h2 style="margin-top:0;color:#fff;">Search Required</h2><p style="color: #fff;">Please enter a valid search query (e.g., beach, temples, Japan).</p>';
            resultsOverlay.classList.add('active');
            return;
        }

        let found = false;
    const searchKeywords = ['country', 'countries', 'temple', 'temples', 'beach', 'beaches'];

        if (searchKeywords.some(keyword => query.includes(keyword))) {
             if (query.includes('countr')) { // for country or countries
                travelData.countries.forEach(country => {
                    country.cities.forEach(city => {
                        displayResult(city);
                        found = true;
                    });
                });
            }
            if (query.includes('temple')) {
                travelData.temples.forEach(temple => {
                    displayResult(temple);
                    found = true;
                });
            }
            if (query.includes('beach')) {
                travelData.beaches.forEach(beach => {
                    displayResult(beach);
                    found = true;
                });
                console.log('Beach results added:', travelData.beaches.length);
            }
        } else {
             // Search countries and cities by name or keyword
            travelData.countries.forEach(country => {
                if (country.name.toLowerCase().includes(query)) {
                    country.cities.forEach(city => {
                        displayResult(city);
                        found = true;
                    });
                } else {
                    country.cities.forEach(city => {
                        if (city.name.toLowerCase().includes(query) || city.keywords.some(k => k.includes(query))) {
                            displayResult(city);
                            found = true;
                        }
                    });
                }
            });
        }


        if (!found) {
            console.log('No matches found for', query);
            resultsContainer.innerHTML = '<h2 style="margin-top:0;color:#fff;">No Results</h2><p style="color:#fff;">Nothing matched "'+query+'". Try: beach, temples, or a country like Japan.</p>';
        } else {
            // Prepend heading
            const heading = document.createElement('h2');
            heading.textContent = 'Recommendations';
            heading.style.marginTop = '0';
            heading.style.color = '#fff';
            resultsContainer.prepend(heading);
            console.log('Total results added:', resultsContainer.children.length - 1); // -1 for heading
        }
        resultsOverlay.classList.add('active');
        console.log('Overlay activated, results container HTML:', resultsContainer.innerHTML.substring(0, 200));
    }

    function displayResult(item) {
        const resultItem = document.createElement('div');
        resultItem.classList.add('result-item');
        resultItem.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.name}">
            <div class="info">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <button class="visit-btn" onclick="alert('Booking feature coming soon!')">Visit</button>
            </div>
        `;
        resultsContainer.appendChild(resultItem);
        console.log('Added result:', item.name);
    }

    function clearResults() {
        searchInput.value = '';
        resultsContainer.innerHTML = '';
        resultsOverlay.classList.remove('active');
    }

    searchBtn.addEventListener('click', performSearch);
    clearBtn.addEventListener('click', clearResults);
    if (closeResultsBtn) closeResultsBtn.addEventListener('click', clearResults);
    // Removed Enter key trigger to enforce click-only search per task requirement
});